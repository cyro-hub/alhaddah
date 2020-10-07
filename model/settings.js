const express = require("express");
const settings = express.Router();
const con = require("../config/database");
const excel = require("exceljs");
const fs = require("fs");

settings.use(express.static("public"));

settings.get("/export:id", (req, res) => {
  var items = [];
  var expenditure = [];
  var amount = 0;
  let exportId = req.params.id;
  let [table, id, fromDate, toDate, exportType] = exportId.split(" ");

  if (exportType == "expenditure") {
    let sql = `SELECT * FROM ${table} where farms = "${id}" and issueDate between "${fromDate}" and "${toDate}" order by issueDate`;

    con.query(sql, (err, result) => {
      if (err) return;
      let selectResult = result;
      con.query(`select * from balance`, async (err, result) => {
        if (err) return;
        for (let i = 0; i < result.length; i++) {
          items[i] = result[i].item;
          amount = 0;
          for (let j = 0; j < selectResult.length; j++) {
            if (items[i] == selectResult[j].item) {
              amount += selectResult[j].expenditure;
            }
          }
          expenditure[i] = amount;
        }

        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("expenditure");
        worksheet.columns = [
          {
            header: "items",
            key: "items",
          },
          {
            header: "expenditure",
            key: "expenditure",
          },
        ];

        for (let i = 0; i < items.length; i++) {
          worksheet.addRow({ items: items[i], expenditure: expenditure[i] });
        }

        await workbook.xlsx
          .writeFile("farm-expenditure.xlsx")
          .then(() => {
            // console.log("file written successfully");
            res.download(
              "./farm-expenditure.xlsx",
              "farm-expenditure.xlsx",
              () => {
                try {
                  fs.unlinkSync("./export.xlsx");
                } catch {
                  return;
                }
              }
            );
          })
          .catch((err) => {
            res.json({
              warning: "Could not write file",
            });
          });
      });
    });
  } else if (exportType == "content") {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("content");
    worksheet.columns = [
      {
        header: "Item",
        key: "Item",
      },
      {
        header: "Amount",
        key: "Amount",
      },
      {
        header: "Unit",
        key: "Unit",
      },
      {
        header: "Item_Type",
        key: "Item_Type",
      },
      {
        header: "Item_Date",
        key: "Item_Date",
      },
      {
        header: "Item_Expenditure",
        key: "Item_Expenditure",
      },
      {
        header: "Item_Use",
        key: "Item_Use",
      },
    ];

    con.query("select * from outcome", async (err, result) => {
      if (err) return;
      for (let i = 0; i < result.length; i++) {
        let { item, amount, unit, type, date, f, expense, use } = result[i];
        if (
          result[i].farms == id &&
          result[i].issueDate >= fromDate &&
          result[i].issueDate <= toDate
        ) {
          worksheet.addRow({
            Item: item,
            Amount: amount,
            Unit: unit,
            Item_Type: result[i].issueType,
            Item_Date: result[i].issueDate,
            Item_Expenditure: result[i].expenditure,
            Item_Use: result[i].uses,
          });
        }
      }

      await workbook.xlsx
        .writeFile("farm-content.xlsx")
        .then(() => {
          // console.log("file written successfully");
          res.download("./farm-content.xlsx", "farm-content.xlsx", () => {
            try {
              fs.unlinkSync("./farm-content.xlsx");
            } catch {
              return;
            }
          });
        })
        .catch((err) => {
          res.json({
            warning: "Could not write file",
          });
        });
    });
  }
});

module.exports = settings;
