const express = require("express");
const app = express();
require("dotenv").config();

const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const auth = require("./config/auth");

app.use(express.static("public"));
// app.use(express.json({ limit: "1mb" }));

app.set("view engine", "hbs");

const admin = require("./model/admin");
app.use("/api", admin);

const user = require("./model/user");
app.use("/api", user);

const settings = require("./model/settings");
app.use("/api", settings);

const pages = require("./model/pages");
app.use("/", pages);

const port = process.env.port;
app.listen(port, console.log(`server running on port ${port}`));
