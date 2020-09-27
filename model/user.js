const express = require("express");
const user = express.Router();
const con = require("../config/database");
const pages = require("./pages");
user.use(express.static("public"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
user.use(cookieParser());

const auth = require("../config/auth");
require("dotenv").config();

 user.get("/user:id", (req, res) => {
    if (req.params.id == "logout") {
        res.clearCookie("user");
        return res.render("home");
    }
});

 user.post("/user:id", (req, res) => {
    if (req.params.id == "register") {
        let { userName, email, password, passwordc, sector } = req.body;
        // create table of users in mysql database

        let sqlCreateTable = ` CREATE TABLE IF NOT EXISTS Users(userId int NOT NULL AUTO_INCREMENT,
     userName varchar(255) not null,
     userEmail varchar(255) not null,
     password varchar(255) not null,
     sector varchar(255) not null,
     primary key(userId))`;

        con.query(sqlCreateTable, (err, result) => {
            if (err) {
                return res.render("account/register");
            }
        });

        //checking the existence of an email in the database table

        let sqlEmailCheck = `SELECT userEmail FROM Users WHERE userEmail = ?`;

        con.query(sqlEmailCheck, [email], (err, result) => {
            if (err) {
                return res.render("account/register");
            }
            if (result.length > 0) {
                return res.render("account/register", {
                    message: "Email already Exist",
                    alert: "warning",
                });
            }
        });

        //checking the existence of an admin in the database table

        let sqlSectorCheck = `SELECT * FROM Users WHERE sector = ?`;

        con.query(sqlSectorCheck, [sector], async (err, result) => {
            if (err) {
                return res.render("account/register");
            }
            if (result.length > 0 && result[0].sector == "Administrator") {
                return res.render("account/register");
            }
            // inserting item into the database
            else {
                let sqlInsert = `INSERT INTO Users SET ?`;
                password = await bcrypt.hash(password, 10);
                let user = {
                    userName: userName,
                    userEmail: email,
                    password: password,
                    sector: sector,
                };
                con.query(sqlInsert, user, (err, result) => {
                    if (err) {
                        return res.render("account/register", {
                            message: "User could not be add",
                            alert: "warning",
                        });
                    }
                   res.render("account/login", {
                        message: "User successfully added",
                        alert: "success",
                    });
                });
            }
        });
    } else if (req.params.id == "login") {
        let { email, password } = req.body;
        let sqlCheckUser = `select * from users where userEmail = ?`;

        con.query(sqlCheckUser, [email], async (err, result) => {
            if (err) {
                return res.render("account/login");
            }
            if (result.length > 0) {
                if (bcrypt.compareSync(password, result[0].password)) {
                    let { userId, userName, userEmail, password, sector } = result[0];
                    let user = {
                        id: userId,
                        name: userName,
                        email: userEmail,
                        password: password,
                        sector: sector,
                    };
                    let token = jwt.sign(user, process.env.secret, {
                        expiresIn: "2592000s",
                    });
                    res.cookie("user", token);
                    res.render("home");
                } else {
                    return res.render("account/login");
                }
            }
        });
    }
});

module.exports = user;