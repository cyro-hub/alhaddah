const express = require("express");
const pages = express.Router();
pages.use(express.static("public"));

const auth = require("../config/auth");
const cookieParser = require("cookie-parser");
pages.use(cookieParser());

pages.get("/home", (req, res) => {
  res.render("home");
});

pages.get("/admin",auth.admin, (req, res) => {
  res.render("adminupdate");
});

pages.get("/dashboard",auth.secretary, (req, res) => {
  res.render("dashboard");
});

pages.get("/balance", auth.admin, (req, res) => {
  res.render("income/balance");
});

pages.get("/preview", auth.admin, (req, res) => {
  res.render("income/preview");
});

pages.get("/notify",auth.secretary, (req, res) => {
  res.render("notify");
});

pages.get("/register", (req, res) => {
  res.render("account/register");
});

pages.get("/login", (req, res) => {
  res.render("account/login");
});

pages.get("/farm:farmNumber",auth.secretary, (req, res) => {
  let farm = req.params.farmNumber;
  if (farm == "12") {
    res.render("farms/farm12");
  } else if (farm == "13") {
    res.render("farms/farm13");
  } else if (farm == "14") {
    res.render("farms/farm14");
  } else if (farm == "15") {
    res.render("farms/farm15");
  } else if (farm == "16") {
    res.render("farms/farm16");
  } else if (farm == "17") {
    res.render("farms/farm17");
  } else if (farm == "18") {
    res.render("farms/farm18");
  } else if (farm == "19") {
    res.render("farms/farm19");
  } else if (farm == "abdallah") {
    res.render("farms/abdallah");
  } else if (farm == "fesal") {
    res.render("farms/fesal");
  }
});
module.exports = pages;
