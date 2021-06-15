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
        'View All Employees By Manager',
        'Add Employee',
        'Remove Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View All Roles',
        'Add Role',
        'Remove Role',
        'View All Departments',
        'Add Department',
        'Remove Department',
        'Exit',
      ],
    })
  .then(answer => {
    switch (answer.action) {
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'View All Employees By Department':
        viewAllEmployeesByDepartment();
        break;
      case 'View All Employees By Manager':
        viewAllEmployeesByManager();
        break;
      case 'Add Employee':
        addEmployee();
        break;
      case 'Remove Employee':
        removeEmployee();
        break;
      case 'Update Employee Role':
        updateEmployeeRole();
        break;
      case 'Update Employee Manager':
        updateEmployeeManager();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'Add Role':
        addRole();
        break;
      case 'Remove Role':
        removeRole();
        break; 
      case 'View All Departments':
        viewAllDepartments();
        break;
      case 'Add Department':
        addDepartment();
        break;
      case 'Remove Department':
        removeDepartment();
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
    "SELECT title, salary, department_id " +
    "FROM `role` " +
      "INNER JOIN department ON role.department_id = department.id " +
    "ORDER BY `title`;"
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
};

const removeRole = () => {
  const query = 
    'Select id, title FROM role';
  connection.query(query, (err, roles) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'role',
        type: 'rawlist',
        message: 'Which role would you like to remove?',
        choices: roles.map(role => role.title),
      }])
    .then(choice => {
      const index = roles.findIndex(role => role.title === choice.role);
      if (index < 0) throw new Error(`No roles matched: "${choice.role}"`);
      const roleId = roles[index].id;
      const roleTitle = roles[index].title;
      removeRoleIfNoEmployeesHaveRole(roleId, roleTitle);
    });
  });
};

const removeRoleIfNoEmployeesHaveRole = (roleId, roleTitle) => {
  let query = 
    "SELECT " +
    "CONCAT(`first_name`, ' ', `last_name`) AS full_name " +
    "FROM employee " +
    "INNER JOIN `role` ON employee.role_id = `role`.id " +
    `WHERE \`role\`.id = ${roleId}`;
  connection.query(query, (err, employeesWithRole) => {
    if (err) throw err;
    if (employeesWithRole.length > 0) {
      console.log(
        `Cannot remove because these employees have this role: "${roleTitle}"`
      );
      console.table(employeesWithRole);
    } else {
      query = 
        `DELETE FROM \`role\` WHERE id = ${roleId}`;
      connection.query(query, err => {
        if (err) throw err;
      });
    }
    runQuery();
  });
};

const viewAllDepartments = () => {
  const query =
    `SELECT name FROM department ORDER BY name`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  })
};

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
};

const removeDepartment = () => {
  const query = 
    'Select id, name FROM department';
  connection.query(query, (err, departments) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'department',
        type: 'rawlist',
        message: 'Which department would you like to remove?',
        choices: departments.map(department => department.name),
      }])
    .then(choice => {
      const index = departments.findIndex(
        department => department.name === choice.department
      );
      if (index < 0) {
        throw new Error(
          `No departments matched: "${choice.department}"`
        );
      }
      const deptId = departments[index].id;
      const deptName = departments[index].name;
      removeDeptIfNoRolesHaveDept(deptId, deptName);
    });
  });
};

const removeDeptIfNoRolesHaveDept = (deptId, deptName) => {
  let query = 
    `SELECT title FROM \`role\` WHERE \`role\`.department_id = ${deptId};`
  connection.query(query, (err, rolesWithDept) => {
    if (err) throw err;
    if (rolesWithDept.length > 0) {
      console.log(
        `Cannot remove because these roles have this department: "${deptName}"`
      );
      console.table(rolesWithDept);
    } else {
      query = 
        `DELETE FROM department WHERE id = ${deptId}`;
      connection.query(query, err => {
        if (err) throw err;
      });
    }
    runQuery();
  });
};

const viewAllEmployees = () => {
  const query =
    "SELECT " +
      "e.first_name, " +
      "e.last_name, " +
      "r.title AS `role`, " +
      "r.salary, " +
      "d.name AS `department`, " +
      "CONCAT(m.first_name, ' ', m.last_name) as manager " +
    "FROM employee AS e " +
      // Had to use LEFT OUTER JOIN to also show employees with no managers ...
      "LEFT OUTER JOIN employee AS m ON e.manager_id = m.id " +
      "INNER JOIN `role` AS r ON e.role_id = r.id " +
      "INNER JOIN department AS d ON r.department_id = d.id " +
    "ORDER BY e.last_name, e.first_name;"
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  })
}

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
};

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
};

const removeEmployee = () => {
  const query =
    "SELECT id, CONCAT(`first_name`, ' ', `last_name`) AS full_name FROM employee;";
  connection.query(query, (err, employees) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'employee',
        type: 'rawlist',
        message: 'Select the employee you would like to remove: ',
        choices: employees.map(employee => employee.full_name),
      }])
    .then(choice => {
      const index = employees.findIndex(employee => employee.full_name === choice.employee);
      if (index < 0) throw new Error(`No employees matched: "${choice.employee}"`);
      const employeeId = employees[index].id;
      const employeeFullName = employees[index].full_name;
      removeEmployeeIfNotManager(employeeId, employeeFullName);
    });
  });
};

const removeEmployeeIfNotManager = (employeeId, employeeFullName) => {
  let query =
    "SELECT " +
      "CONCAT(`first_name`, ' ', `last_name`) AS full_name " +
      "FROM employee " +
      `WHERE manager_id = ${employeeId}`;
  connection.query(query, (err, directReports) => {
    if (err) throw err;
    if (directReports.length > 0) {
      console.log(
        `Cannot remove because "${employeeFullName}" ` +
        `is a manager of these other employees:`);
      console.table(directReports);
    } else {
      query =
        `DELETE FROM employee WHERE id = ${employeeId}`;
      connection.query(query, err => {
        if (err) throw err;
      });
    }
    runQuery();
  });
};

const viewAllEmployeesByDepartment = () => {
  const query = 
    "SELECT " +
      "d.name AS `department`, " +
      "e.first_name, " +
      "e.last_name, " +
      "r.title AS `role`, " +
      "r.salary, " + 
      "CONCAT(m.first_name, ' ', m.last_name) AS manager " +
    "FROM employee AS e " + 
      "LEFT OUTER JOIN employee AS m ON e.manager_id = m.id " +
      "INNER JOIN `role` AS r ON e.role_id = r.id " +
      "INNER JOIN department AS d ON r.department_id = d.id " +
    "ORDER BY `department`, e.last_name, e.first_name;"
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  });
};

const viewAllEmployeesByManager = () => {
  const query = 
    "SELECT " +
      "CONCAT(m.first_name, ' ', m.last_name) as manager, " +
      "e.first_name, " +
      "e.last_name, " +
      "r.title AS `role`, " +
      "r.salary, " +
      "d.name AS `department` " +
    "FROM employee AS e " +
      // Had to use LEFT OUTER JOIN to also show employees with no managers ...
      "LEFT OUTER JOIN employee AS m ON e.manager_id = m.id " +
      "INNER JOIN `role` AS r ON e.role_id = r.id " +
      "INNER JOIN department AS d ON r.department_id = d.id " +
    "ORDER BY manager;"
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    runQuery();
  });
};


const updateEmployeeRole = () => {
  let query =
    "SELECT id, CONCAT(`first_name`, ' ', `last_name`) as full_name FROM employee;"
  connection.query(query, (err, employees) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'employee',
        type: 'rawlist',
        message: 'Select the employee you would like to update: ',
        choices: employees.map(employee => employee.full_name),
      }])
    .then(answer => {
      const index = employees.findIndex(employee => employee.full_name === answer.employee);
      if (index < 0) throw new Error(`No employees matched: "${answer.employee}"`);
      const employeeId = employees[index].id;
      updateEmployeeRoleWithId(employeeId);
    });
  });
};

const updateEmployeeRoleWithId = employeeId => {
  // Consolidate code that gets available roles ...
  let query =
    'SELECT id, title FROM `role`';
  connection.query(query, (err, roles) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'role',
        type: 'rawlist',
        message: `What is the employee's new role?`,
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
      query =
        `UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`;
      connection.query(query, err => {
        if (err) throw err;
        runQuery();
      })
    });
  });
};

const updateEmployeeManager = () => {
  const query =
    "SELECT id, CONCAT(`first_name`, ' ', `last_name`) as full_name FROM employee;"
  connection.query(query, (err, employees) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'employee',
        type: 'rawlist',
        message: 'Select the employee you would like to update: ',
        choices: employees.map(employee => employee.full_name),
      }])
    .then(answer => {
      const index = employees.findIndex(employee => employee.full_name === answer.employee);
      if (index < 0) throw new Error(`No employees matched: "${answer.employee}"`);
      const employeeId = employees[index].id;
      updateEmployeeManagerWithId(employeeId);
    });
  });
};

const updateEmployeeManagerWithId = employeeId => {
  let query = 
    "SELECT id, CONCAT(`first_name`, ' ', `last_name`) as full_name FROM employee;";
  connection.query(query, (err, managers) => {
    if (err) throw err;
    // Don't allow setting an employee to be one's own manager, because that's weird ...
    managers = managers.filter(manager => manager.id !== employeeId);
    // Do allow setting an employee's manager to null / None ...
    managers.unshift({ id: null, full_name: 'None'});
    inquirer.prompt([
      {
        name: 'manager',
        type: 'rawlist',
        message: `Who is the employee's new manager?`,
        choices: managers.map(manager => manager.full_name),
      }])
    .then(answer => {
      // Get the manager id from the manager's full name ...
      const index = managers.findIndex(manager => manager.full_name === answer.manager);
      if (index < 0) throw new Error(`No managers matched: "${answer.manager}"`);
      const managerId = managers[index].id;
      query =
        `Update employee SET manager_id = ${managerId} WHERE id = ${employeeId}`;
      connection.query(query, err => {
        if (err) throw err;
        runQuery();
      });
    });
  });
};
    
