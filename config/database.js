const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  multipleStatements: true,
});

con.connect((error) => {
  if (error) {
    return error.message;
  }
});

module.exports = con;
