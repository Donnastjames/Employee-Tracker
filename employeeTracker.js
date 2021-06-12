const mysql = require('mysql');
const inquirer = require('inquirer');
const Employee = require('./lib/employee');
const Role = require('./lib/role');
const Department = require('./lib/department');

const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'UrPr3qu3l',
  database: 'employeeDB',
});

connection.connect((err) => {
  if (err) throw err;
  runQuery();
});

const runQuery = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        'View All Employees',
        'View All Employees By Department',
        // 'View All Employees By Manager',
        'Add Employee',
        // 'Remove Employee',
        'Update Employee Role',
        // 'Update Employee Manager',
        'View All Roles',
        'Add Role',
        // 'Remove Role',
        'View All Departments',
        'Add Department',
        // 'Remove Department',
        'Exit',
      ],
    })
    .then(answer => {
      switch (answer.action) {
        case 'Add Employee':
          addEmployee();
          break;
        case 'View All Roles':
          viewAllRoles();
          break;
        case 'Add Role':
          addRole();
          break; 
        case 'View All Departments':
          viewAllDepartments();
          break;
        case 'Add Department':
          addDepartment();
          break;
        case 'Exit':
          connection.end();
          break;
        default:
          console.error(`Invalid action: "${answer.action}"`);
      }
    });
}

const viewAllRoles = () => {
  const query =
    'SELECT * FROM `role`';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  })
}

const addRole = () => {
  let query =
    `SELECT id, name FROM department`;
  connection.query(query, (err, departments) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the title of this new role?',
        },
        {
          name: 'salary',
          type: 'number',
          message: 'What is the salary for this role?',
        },
        {
          name: 'department',
          type: 'rawlist',
          message: 'This role goes with which department?',
          choices: departments.map(department => department.name),
        }])
    .then(answer => {
      // Get the department id from the department name ...
      const index = departments.findIndex(department => department.name === answer.department);
      if (index < 0) throw new Error(`No departments matched: "${answer.department}"`);
      const departmentId = departments[index].id;

      query =
        `INSERT INTO \`role\` (title, salary, department_id) ` +
        `VALUES ("${answer.title}", ${answer.salary}, ${departmentId})`;
      connection.query(query, err => {
        if (err) throw err;
        runQuery();
      });
    });
  });
}

const viewAllDepartments = () => {
  const query =
    `SELECT * FROM department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  })
}

const addDepartment = () => {
  inquirer
    .prompt({
      name: 'department',
      type: 'input',
      message: 'What is the department name?',
    })
    .then(answer => {
      const query =
        `INSERT INTO department (name) VALUE ("${answer.department}");`
      connection.query(query, (err, res) => {
        if (err) throw err;
        runQuery();
      });
    });
}

// const managerSearch = () => {
//   const query = 
//     'SELECT * FROM employee WHERE manager_id IS NOT NULL';
//   connection.query(query, (err, res) => {
//     if (err) throw err;
//     res(employee) => {console.log }
//    
//   });
// }

const addEmployee = () => {
  let query = 
    'SELECT id, title FROM `role`';
  connection.query(query, (err, roles) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: `What is the employee's first name?`,
      },
      {
        name: 'lastName',
        type: 'input',
        message: `What is the employee's last name?`,
      },
      {
        name: 'role',
        type: 'rawlist',
        message: `What is the employee's role?`,
        choices: roles.map(role => role.title),
          // 'Sales Lead',
          // 'Sales Person',
          // 'Lead Engineer',
          // 'Software Engineer',
          // 'Account Manager',
          // 'Accountant',
          // 'Legal Team Lead',
          // 'Lawyer',
      }])
      .then(answer => {
        // Get the role id from the role name ...
        const index = roles.findIndex(role => role.title === answer.role);
        if (index < 0) throw new Error(`No roles matched: "${answer.role}"`);
        const roleId = roles[index].id;
        addEmployeeWithNameAndRoleId(answer.firstName, answer.lastName, roleId);
      });
    });
  }

const addEmployeeWithNameAndRoleId = (firstName, lastName, roleId) => {
  let query = 
    "SELECT id, CONCAT(`first_name`, ' ', `last_name`) as full_name FROM employee;";
  connection.query(query, (err, managers) => {
    if (err) throw err;
    managers.unshift({ id: null, full_name: 'None'});
    inquirer.prompt([
      {
        name: 'manager',
        type: 'rawlist',
        message: `Who is the employee's manager?`,
        choices: managers.map(manager => manager.full_name),
      }])
      .then(answer => {
        // Get the manager id from the manager's full name ...
        const index = managers.findIndex(manager => manager.full_name === answer.manager);
        if (index < 0) throw new Error(`No managers matched: "${answer.manager}"`);
        const managerId = managers[index].id;
        query =
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) ` +
          `VALUES ("${firstName}", "${lastName}", ${roleId}, ${managerId})`;
        connection.query(query, err => {
          if (err) throw err;
          runQuery();
        });
      });
    });
  }

const getManagers = () => {
  const choices = employeeDB.managerSearch();
  console.log(choices);
  return managerSearch((err,res) => {
    inquirer
      .prompt(
        {
        name: 'manager_id',
        type: 'rawlist',
        message: `Please select the employee's manager from the list: `,
        choices: choices,
        }
      ).then(({manager_id}) => {
        console.table(manager_id);
        res();
      });
      
      getManagers();
  });
}
    // .then(answer => {
    //   const insert = `INSERT INTO employee VALUES ("${answer.firstName}", "${answer}")`;
    //   connection.query(insert, (err, res) => {
    //     if (err) throw err;

    //   })
        
      
    
