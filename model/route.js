const express = require("express");
const router = express.Router();
const con = require("../config/database");
const pages = require("./pages");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
router.use(express.static("public"));

const cookieParser = require("cookie-parser");
router.use(cookieParser());

const auth = require("../config/auth");
require("dotenv").config();

router.get("/income:table", auth.secretary, (req, res) => {
  if (req.params.table == "balance") {
    let sql = `SELECT * FROM balance order by item`;
    con.query(sql, (err, result, field) => {
      if (err) {
        return res.render("admin");
      }
      res.json(result);
    });
  } else if (req.params.table == "preview") {
    let sql = `SELECT * FROM preview order by issueDate`;
    con.query(sql, (err, result, field) => {
      if (err) {
        return res.render("admin");
      } else {
        res.json(result);
      }
    });
  } else if (req.params.table == "outcome") {
    let sql = `SELECT * FROM outcome order by issueDate`;
    con.query(sql, (err, result, field) => {
      if (err) {
        return res.render("admin");
      }
      res.json(result);
    });
  }
});

router.post("/user:id", (req, res) => {
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
          return res.render("account/login", {
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

router.get("/user:id", (req, res) => {
  if (req.params.id == "logout") {
    res.clearCookie("user");
    res.render("home");
  }
});

router.post("/income:table", (req, res) => {
  if (req.params.table == "balance") {
    let { item, unit, price, type, company, description } = req.body;
    let values = {
      item: item,
      amount: 0,
      unit: unit,
      price: price,
      product: type,
      company: company,
      des: description,
    };
    //creating a table in the database
    let sqlCreateTable = `CREATE TABLE if not exists balance(
        balanceId int NOT NULL AUTO_INCREMENT,
        item varchar(255),
        amount decimal(10,2) not null,
        unit varchar(255),
        price decimal(10,2) not null,
        product varchar(100),
        company varchar(255),
        des varchar(1000),
        PRIMARY KEY (balanceId),
        check(amount>=0),
        check(price>=0)
    )`;
    con.query(sqlCreateTable, (err, result) => {
      if (err) return;
    });

    //checking the existence of an item in the database

    let sqlCheckItem = `select * from balance where item = ?`;

    con.query(sqlCheckItem, [item], (err, result) => {
      if (err) return;
      if (result.length > 0) {
        return res.render("income/income", {
          message: "This item already exist in the store",
          alert: "warning",
        });
      } else {
        con.query(`INSERT INTO balance SET ?`, values, (err, result) => {
          if (err) {
            return res.render("income/income", {
              message: "Couldn't add item into the database",
              alert: "warning",
            });
          }
          return res.render("income/balance", {
            message: "Successfully added a stock",
            alert: "success",
          });
        });
      }
    });
  } else if (req.params.table == "addincome") {
    let { date, item, amount, free } = req.body;

    con.query(`select * from balance where item = ?`, [item], (err, result) => {
      if (err) return;
      selectResult = result[0];
      let total = eval(amount) + eval(free);
      con.query(
        `update balance set amount = amount + ? where item = ?`,
        [total, item],
        (err, result, field) => {
          if (err) return;
          ///creating a table for income details

          sqlCreateTable = `CREATE TABLE if not exists preview (
	           previewId int NOT NULL AUTO_INCREMENT,
             issueDate varchar(255),
             item varchar(255),
             itemType varchar(255),
             amount decimal(10,2) not null,
             free decimal(10,2) not null,
             balance decimal(10,2) not null,
             primary key(previewId),
             check(amount>=0),
             check(free>=0),
             check(balance>=0))`;

          con.query(sqlCreateTable, (err, result) => {
            if (err) return;

            //inserting items into the preview table
            sqlInsert = `insert into preview set ?`;
            con.query(
              sqlInsert,
              {
                issueDate: date,
                item: item,
                itemType: selectResult.product,
                amount: amount,
                free: free,
                balance: total + selectResult.amount,
              },
              (err, result) => {
                if (err) return;
                return res.render("income/preview", {
                  message: "Stock successfully added",
                  alert: "success",
                });
              }
            );
          });
        }
      );
    });
  } else if (req.params.table == "outcome") {
    let { item, amount, date, farm, uses } = req.body;

    //creating table for outcome
    sqlCreateTable = ` CREATE TABLE if not exists store.outcome (
	                  outcomeId int NOT NULL AUTO_INCREMENT,
                    item varchar(255) not null,
                    amount decimal(10,2) not null,
                    unit varchar(255),
                    issueType varchar(255),
                    issueDate varchar(255) ,
                    farms varchar(255),
                    expenditure decimal (10,2) not null,
                    uses varchar(255),
                    primary key(outcomeId),
                    check(amount>=0),
	                check(expenditure>=0)
                 )`;
    con.query(sqlCreateTable, (err, result) => {
      if (err) return;
    });

    // checking whether the amount of item present is enough for outcome

    let sqlSelect = `select * from balance where item = ?`;
    con.query(sqlSelect, [item], (err, selectResult) => {
      if (err) return;
      if (selectResult[0].amount < amount) {
        return res.render("outcome/out", {
          message: `The Amount of ${item} is Not enough you need ${
            amount - selectResult[0].amount
          } more `,
          alert: "danger",
        });
      }

      //adding items to the outcome table
      else if (Array.isArray(farm)) {
        for (let i = 0; i < farm.length; i++) {
          const outcome = {
            item: item,
            amount: amount / farm.length,
            unit: selectResult[0].unit,
            issueType: selectResult[0].product,
            issueDate: date,
            farms: farm[i],
            expenditure: (amount / farm.length) * selectResult[0].price,
            uses: uses,
          };

          sqlInsert = `insert into outcome set ?`;

          con.query(sqlInsert, outcome, (err, result) => {
            if (err) {
              return res.render("outcome/out", {
                message: "Unable to send out Stock",
                alert: "danger",
              });
            }
            // updating income values
          });
        }
        con.query(
          `update balance set amount = amount - ?`,
          [amount],
          (err, result) => {
            if (err) return;
            return res.render("outcome/out", {
              message: `Stock given out successfully`,
              alert: "success",
            });
          }
        );
      } else {
        const outcome = {
          item: item,
          amount: amount,
          unit: selectResult[0].unit,
          issueType: selectResult[0].product,
          issueDate: date,
          farms: farm,
          expenditure: amount * selectResult[0].price,
          uses: uses,
        };

        sqlInsert = `insert into outcome set ?`;

        con.query(sqlInsert, outcome, (err, result) => {
          if (err) {
            con.query(sqlUpdate, [amount, item], (err, result) => {
              if (err) return;
              return res.render("outcome/out", {
                message: `Unable to send outcome`,
                alert: "danger",
              });
            });
          }
          res.render("outcome/out", {
            message: `Stock given out successfully`,
            alert: "success",
          });
        });
      }

      // updating amount in income table

      con.query(
        `update balance set ? where item = ?`,
        [
          {
            amount: selectResult[0].amount - amount,
          },
          item,
        ],
        (err, result) => {
          if (err) return;
        }
      );
    });
  }
});

router.delete("/del:id", (req, res) => {
  // let updateId = req.params.id;
  // updateId = updateId.split("");
  // let checker = "";
  // for (let i = 0; i < 3; i++) {
  //   checker += updateId[i];
  // }
  // updateId = updateId.slice(3);
  // updateId = updateId.reduce((a, b) => a + b);

  // if (checker == "pre") {
  //   sqlSelect = `select * from preview where previewId = ?`;
  //   con.query(sqlSelect, [updateId], (err, result) => {
  //     if (err) return;
  //     selectResult = result[0];

  //     sqlUpdate = `update preview set balance = balance - ? where item = ? and issueDate >= ?`;

  //     con.query(
  //       sqlUpdate,
  //       [
  //         selectResult.amount + selectResult.free,
  //         selectResult.item,
  //         selectResult.issueDate,
  //       ],
  //       (err, result) => {
  //         if (err) return;

  //         sqlUpdate = `update balance set amount = amount - ? where item = ?`;
  //         con.query(
  //           sqlUpdate,
  //           [selectResult.amount + selectResult.free, selectResult.item],
  //           (err, result) => {
  //             if (err) return;

  //             let sqlDelete = `delete from preview where previewId = ?`;
  //             con.query(sqlDelete, [updateId], (err, result) => {
  //               if (err) return;
  //               res.render("income/preview", {
  //                 message: "Item successfully deleted",
  //                 alert: "success",
  //               });
  //             });
  //           }
  //         );
  //       }
  //     );
  //   });
  // }
  // else if (checker == "bal") {
  //   con.query(
  //     `select * from balance where balanceId = ?`,
  //     [updateId],
  //     (err, result) => {
  //       if (err) return;
  //       selectResult = result[0];
  //       con.query(
  //         `delete from balance where balanceId = ?`,
  //         [updateId],
  //         (err, result) => {
  //           if (err) return;

  //           con.query(
  //             `delete from preview where item = ?`,
  //             [selectResult.item],
  //             (err, result) => {
  //               if (err) return;
  //               res.render("income/balance", {
  //                 message: "Item deleted successfully",
  //                 alert: "success",
  //               });
  //             }
  //           );
  //         }
  //       );
  //     }
  //   );
  // } else if (checker == "out") {
  //   // console.log(updateId);
  //   con.query(
  //     `select * from outcome where ?`,
  //     { outcomeId: updateId },
  //     (err, result) => {
  //       if (err) return;
  //       selectResult = result[0];
  //       // console.log(selectResult);
  //       con.query(
  //         `update balance set amount = amount + ? where item=?`,
  //         [selectResult.amount, selectResult.item],
  //         (err, result) => {
  //           if (err) return;
  //           con.query(
  //             `DELETE FROM outcome WHERE ?`,
  //             { outcomeId: updateId },
  //             (err, result) => {
  //               if (err) {
  //                 con.query(
  //                   "update balance set amount = amount - ? where item = ?",
  //                   [selectResult.amount, selectResult.item],
  //                   (err, result) => {
  //                     if (err) return;
  //                   }
  //                 );
  //               }
  //               res.render("income/balance", {
  //                 message: "item deleted successfully",
  //                 alert: "success",
  //               });
  //             }
  //           );
  //         }
  //       );
  //     }
  //   );
  // }
});

// router.get("/update:id", (req, res) => {
//   let updateId = req.params.id;
//   updateId = updateId.split("");
//   let checker = "";
//   for (let i = 0; i < 3; i++) {
//     checker += updateId[i];
//   }
//   updateId = updateId.slice(3);
//   updateId = updateId.reduce((a, b) => a + b);

//   if (checker == "bal") {
//     sqlSelect = "select * from balance where balanceId = ?";
//     con.query(sqlSelect, [updateId], (err, result) => {
//       if (err) return;
//       // res.render(
//       //   "income/balance",
//       //    {
//       //     item: result[0].item,
//       //     unit: result[0].unit,
//       //     price: result[0].price,
//       //     type: result[0].product,
//       //     company: result[0].company,
//       //     description: result[0].des,
//       //   }
//       // );
//       res.send("updated");
//     });
//   } else if (checker == "pre") {
//   }
// });

module.exports = router;
