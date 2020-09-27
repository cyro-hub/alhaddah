const express = require("express");
const router = express.Router();
const pages = require("./pages");
router.use(express.static("public"));
const con = require("../config/database");

// const auth = require("../config/auth");

router.get("/income:table", (req, res) => {
  let getId = req.params.table;
  let [table, id] = getId.split("-");
  if (table == "balance") {
    let sql = `SELECT * FROM balance order by item`;
    con.query(sql, (err, result, field) => {
      if (err) return;
      return res.json(result);
    });
  } else if (table == "preview") {
    let sql = `SELECT * FROM preview order by issueDate`;
    con.query(sql, (err, result, field) => {
      if (err) return;
      return res.json(result);
    });
  } else if (table == "outcome") {
    let sql = `SELECT * FROM outcome where farms = "${id}" order by issueDate`;
    con.query(sql, (err, result, field) => {
      if (err) return;
      return res.json(result);
    });
  } else if (req.params.table == "users") {
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
        des varchar(1000) NOT NULL,
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
        return res.render("adminupdate", {
          warning: "This item already exist in the store",
        });
      } else {
        con.query(`INSERT INTO balance SET ?`, values, (err, result) => {
          if (err) {
            return res.render("adminupdate", {
              warning: "Couldn't add item into the database",
            });
          }
          return res.render("adminupdate", {
            success: "You Successfully added a stock",
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
                if (err) {
                  return res.render("adminupdate", {
                    success: "could not add stock",
                  });
                }
                return res.render("adminupdate", {
                  success: "Stock successfully added",
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
        return res.render("adminupdate", {
          warning: `The Amount of ${item} is Not enough you need ${
            amount - selectResult[0].amount
          } more `,
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
              return res.render("adminupdate", {
                warning: "Unable to send out Stock",
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
          }
        );
        return res.render("adminupdate", {
          success: `Stock given out successfully`,
        });
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
              return res.render("adminupdate", {
                warning: `Unable to send outcome`,
              });
            });
          }
          res.render("adminupdate", {
            success: `Stock given out successfully`,
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
  let deleteId = req.params.id;
  let [table, id] = deleteId.split("-");
  id = parseInt(id);

  if (table == "preview") {
    sqlSelect = `select * from preview where previewId = ?`;
    con.query(sqlSelect, [id], (err, result) => {
      if (err) return;
      selectResult = result[0];
      sqlUpdate = `update preview set balance = balance - ? where item = ? and issueDate >= ?`;
      con.query(
        sqlUpdate,
        [
          selectResult.amount + selectResult.free,
          selectResult.item,
          selectResult.issueDate,
        ],
        (err, result) => {
          if (err) return;
          sqlUpdate = `update balance set amount = amount - ? where item = ?`;
          con.query(
            sqlUpdate,
            [selectResult.amount + selectResult.free, selectResult.item],
            (err, result) => {
              if (err) return;
              let sqlDelete = `delete from preview where previewId = ?`;
              con.query(sqlDelete, [id], (err, result) => {
                if (err) return;
                res.json({
                  success: "Item deleted successfully ",
                });
              });
            }
          );
        }
      );
    });
  } else if (table == "balance") {
    con.query(
      `select * from balance where balanceId = ?`,
      [id],
      (err, result) => {
        if (err) return;
        selectResult = result[0];
        con.query(
          `delete from balance where balanceId = ?`,
          [id],
          (err, result) => {
            if (err) return;
            con.query(
              `delete from preview where item = ?`,
              [selectResult.item],
              (err, result) => {
                if (err) return;
                res.json({
                  success: "Item deleted successfully ",
                });
              }
            );
          }
        );
      }
    );
  } else if (table == "outcome") {
    con.query(
      `select * from outcome where ?`,
      { outcomeId: id },
      (err, result) => {
        if (err) return;
        selectResult = result[0];
        con.query(
          `update balance set amount = amount + ? where item=?`,
          [selectResult.amount, selectResult.item],
          (err, result) => {
            if (err) return;
            con.query(
              `DELETE FROM outcome WHERE ?`,
              { outcomeId: id },
              (err, result) => {
                if (err) {
                  con.query(
                    "update balance set amount = amount - ? where item = ?",
                    [selectResult.amount, selectResult.item],
                    (err, result) => {
                      if (err) return;
                    }
                  );
                  res.json({
                    message: "Item deleted successfully ",
                    alert: "success",
                  });
                }
              }
            );
          }
        );
      }
    );
  }
});

router.post("/update:id", (req, res) => {
  let deleteId = req.params.id;
  let [table, id] = deleteId.split("-");
  id = parseInt(id);

  if (table == "balance") {
    let { item, unit, price, type, company, des } = req.body;
    let update = {
      item: item,
      unit: unit,
      price: price,
      product: type,
      company: company,
      des: req.body.description,
    };

    //updating the balance table record
    sqlUpdate = `update balance set ? where balanceId = ?`;
    con.query(sqlUpdate, [update, id], (err, result) => {
      if (err) {
        return res.render("income/balance", {
          balanceUpdate: `Could NOT update ${item}`,
          alert: "danger",
        });
      }
      return res.render("income/balance", {
        balanceUpdate: `Successfully updated ${item}`,
        alert: "success",
      });
    });
  } else if (table == "preview") {
    sqlSelect = `select * from preview where previewId = ?`;
    con.query(sqlSelect, [id], (err, result) => {
      if (err) return;
      selectResult = result[0];

      let { date, amount, free } = req.body;
      let oldBalance = selectResult.amount + selectResult.free;
      let newBalance = eval(amount) + eval(free);
      balance = oldBalance - newBalance;
      sqlUpdate = `update preview set ? where previewId = ?`;
      con.query(
        sqlUpdate,
        [{ issueDate: date, amount: amount, free: free }, id],
        (err, result) => {
          if (err) return;
          sqlUpdate = `update preview set balance = balance - ? where issueDate >= ?`;
          con.query(sqlUpdate, [balance, date], (err, result) => {
            if (err) {
              sqlUpdate = `update preview set ? where previewId = ?`;
              con.query(
                sqlUpdate,
                [
                  {
                    issueDate: selectResult.issueDate,
                    amount: selectResult.amount,
                    free: selectResult.free,
                  },
                  id,
                ],
                (err, result) => {
                  if (err) return;
                  return res.render("income/preview", {
                    previewUpdate: `${selectResult.item} could not be updated`,
                    alert: "warning",
                  });
                }
              );
            }
            return res.render("income/preview", {
              previewUpdate: `${selectResult.item} Successfully updated`,
              alert: "success",
            });
          });
        }
      );
    });
  }
});

module.exports = router;
