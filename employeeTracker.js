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
    inquirer.prompt([
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
  inquirer
    .prompt([
      {
        name: 'first_name',
        type: 'input',
        message: `What is the employee's first name?`,
      },
      {
        name: 'last_name',
        type: 'input',
        message: `What is the employee's last name?`,
      },
      {
        name: 'role_id',
        type: 'rawlist',
        message: `What is the employee's role?`,
        // TODO: Something similar to addRole() to populate these choices ...
        choices: [
          'Sales Lead',
          'Sales Person',
          'Lead Engineer',
          'Software Engineer',
          'Account Manager',
          'Accountant',
          'Legal Team Lead',
          'Lawyer',
        ],
      }
    ])
    .then(answers => {
      const choices = 'SELECT first_name, last_name, role_id FROM employee FULL JOIN role on employee.id = role.id';
      connection.query(choices, [answer.first_name, answer.last_name, answer.role_id, answer.title, answer.salary], (err,res) => {
        if (err) throw err;
        res.forEach(({ 

        }))
      } )
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
        
      
    
