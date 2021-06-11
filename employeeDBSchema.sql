DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
  PRIMARY KEY (id)
);

CREATE TABLE `role`(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL (10,2),
  department_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY fk_department (department_id) REFERENCES department(id)
);

CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL, 
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY fk_role (role_id) REFERENCES `role`(id),
  FOREIGN KEY fk_manager (manager_id) REFERENCES employee(id)
);

INSERT INTO department (name) VALUE ("Executive");

INSERT INTO `role` (title, salary, department_id) VALUES ("CEO", 80000, 1);

INSERT INTO `role` (title, salary, department_id) VALUES ("Manager", 60000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("John", "Smith", 1, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Sally", "Taylor", 2, 2);

USE employeeDB;

SELECT 
  employee.*, 
  employeeManager.first_name AS manager_first, 
  employeeManager.last_name AS manager_last,
  `role`.title AS role_title,
  `role`.salary AS role_salary,
  department.name AS department_name
FROM employee
INNER JOIN employee AS employeeManager ON employee.manager_id = employeeManager.id
INNER JOIN `role` ON employee.role_id = `role`.id
INNER JOIN department ON `role`.department_id = department.id