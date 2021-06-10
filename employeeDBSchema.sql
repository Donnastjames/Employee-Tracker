DROP DATABASE IF EXISTS employeeDB;
CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department(
  id INT PRIMARY KEY (id) NOT NULL AUTO_INCREMENT,
  name VARCHAR(30),
);

CREATE TABLE role(
  id INT PRIMARY KEY (id) NOT NULL AUTO_INCREMENT,
  title VARCHAR(30),
  salary DECIMAL (6,2),
  department_id INT NOT NULL,
);

CREATE TABLE employee(
  id INT PRIMARY KEY (id) NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT NOT NULL,
  manager_id INT,
  
);