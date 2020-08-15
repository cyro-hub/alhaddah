const express = require("express");
const app = express();
require("dotenv").config();

const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(express.static("public"));
// app.use(express.json({ limit: "1mb" }));

app.set("view engine", "hbs");

const route = require("./model/route");
app.use("/api", route);

const pages = require("./model/pages");
app.use("/", pages);

const port = process.env.port;
app.listen(port, console.log(`server running on port ${port}`));
