require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = {
  admin: (req, res, next) => {
    try {
      let token = req.cookies["user"];
      token = jwt.verify(token, process.env.secret);
      if (token.sector == "Administrator") {
        next();
      } else {
        res.render("home");
      }
    } catch {
      return res.render("home");
    }
  },

  secretary: (req, res, next) => {
    try {
      let token = req.cookies["user"];
      token = jwt.verify(token, process.env.secret);
      if (token.sector == "Secretary" || token.sector == "Administrator") {
        next();
      } else {
        res.render("home");
      }
    } catch {
      return res.render("home");
    }
  },
  other: (req, res, next) => {
    try {
      let token = req.cookies["user"];
      token = jwt.verify(token, process.env.secret);
      if (
        token.sector == "Secretary" ||
        token.sector == "Administrator" ||
        token.sector == "Others"
      ) {
        next();
      } else {
        res.render("home");
      }
    } catch {
      return res.render("home");
    }
  },
};
