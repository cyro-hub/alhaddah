const express = require("express");
const { Router } = require("express");
const settings = express.Router();
const con = require("../config/database");

settings.use(express.static("public"));

settings.get("/export:id", (req, res) => {
  let exportId = req.params.id;
  let [table, farm] = exportId.split("-");
  let sqlSelect = `select * from ${table} where farms = "${farm}" order by issueDate`;
  con.query(sqlSelect, (err, result) => {
    if (err) return;
    console.log(result);
    
  });
});

module.exports = settings;
