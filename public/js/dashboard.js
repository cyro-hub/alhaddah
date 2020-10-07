let items = [];
let amount = 0;
let quantity = [];
let expenditure = [];
let expenditureObj = {};
let farms = document.getElementById("farm");
let table = document.getElementById("table");
let download = document.getElementById("export");
document.getElementById("tableDisplay").style.display = "none";
document.getElementById("quantity").style.display = "none";
document.getElementById("expenditure").style.display = "none";
download.style.display = "none";
var farm = "";

function fetchItems() {
  fetch("/api/incomebalance")
    .then((res) => res.json())
    .then((item) => {
      for (let i = 0; i < item.length; i++) {
        items[i] = item[i].item;
      }
    });
}

document >
  addEventListener("load", () => {
    fetch("/api/incomebalance")
      .then((res) => res.json())
      .then((data) => {
        var balanceItem = [];
        var items = [];
        for (let i = 0; i < data.length; i++) {
          balanceItem[i] = data[i].amount;
          items[i] = data[i].item;
        }

        var ctx = document.getElementById("balance");
        var myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: items,
            datasets: [
              {
                label: `Balance Items in the store`,
                data: balanceItem,
                backgroundColor: "rgba(44, 58, 78, 0.9)",
                barThickness: 40,
              },
            ],
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
            legend: {
              display: true,
              labels: {
                fontColor: "black",
                fontSize: 20,
                fontFamily: "cursive",
              },
            },
          },
        });
      });
  });

farms.addEventListener("click", (e) => {
  document.getElementById("tableDisplay").style.display = "block";
  document.getElementById("quantity").style.display = "block";
  document.getElementById("balance").style.display = "none";
  document.getElementById("expenditure").style.display = "block";
  document.getElementById("expenditureId").style.display = "block";
  download.style.display = "block";
  farm = e.target.id;
  document.getElementById("quantity").innerHTML = "";
  document.getElementById("export").innerHTML = "";
  document.getElementById("expenditure").innerHTML = "";
  fetchItemQuantity(farm);
  fetchItemExpenditure(farm);
  fetchFarmDetails(farm);

  let exportContent = ` <button class="btn btn-primary btn-sm" title="Export content" id="exportExpenditure" onClick="exportExpenditure()"><i
          class="fa fa-download"></i>Download ${farm} Expenditure</button>
      <button class="btn btn-primary btn-sm" title="Export content" id="exportContent" onClick="exportContent()"><i
          class="fa fa-download"></i>Download ${farm} Content</button>`;
  document
    .getElementById("export")
    .insertAdjacentHTML("afterbegin", exportContent);
});

// fetching the quantity of items used
async function fetchItemQuantity(farmName) {
  let fromDate = document.getElementById("fromDate").value;
  let toDate = document.getElementById("toDate").value;
  await fetchItems();
  await fetch(`/api/incomeoutcome ${farmName} ${fromDate} ${toDate}`)
    .then((res) => res.json())
    .then((data) => {
      for (let i = 0; i < items.length; i++) {
        amount = 0;
        for (let j = 0; j < data.length; j++) {
          if (data[j].item == items[i]) {
            amount += data[j].amount;
          }
        }
        quantity[i] = amount;
      }
    });
  var ctx = document.getElementById("quantity");
  var myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: items,
      datasets: [
        {
          label: `Quantity of items used ${farmName}`,
          data: quantity,
          backgroundColor: "rgba(44, 58, 78, 0.9)",
          barThickness: 40,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      legend: {
        display: true,
        labels: {
          fontColor: "black",
          fontSize: 20,
          fontFamily: "cursive",
        },
      },
    },
  });
}

//fetching the expenditure of each item used
async function fetchItemExpenditure(farmName) {
  let fromDate = document.getElementById("fromDate").value;
  let toDate = document.getElementById("toDate").value;
  await fetchItems();
  await fetch(`/api/incomeoutcome ${farmName} ${fromDate} ${toDate}`)
    .then((res) => res.json())
    .then((data) => {
      for (let i = 0; i < items.length; i++) {
        amount = 0;
        for (let j = 0; j < data.length; j++) {
          if (data[j].item == items[i]) {
            amount += data[j].expenditure;
          }
        }
        expenditure[i] = amount;
        expenditureObj = {};
        expenditureObj.item = items;
        expenditureObj.expenditure = expenditure;
        document.getElementById("expenditureTable").innerHTML = "";
        let expenditureElement = `<tr>
        <td>${i + 1}</td>
        <td>${items[i]}</td>
        <td>${expenditure[i]} kd</td>
        </tr>`;
        document
          .getElementById("expenditureTable")
          .insertAdjacentHTML("afterbegin", expenditureElement);
      }
      var ctx = document.getElementById("expenditure");
      var myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: items,
          datasets: [
            {
              label: `Expenditure of each Item used in ${farmName} in KD`,
              data: expenditure,
              backgroundColor: "rgba(44, 58, 78, 0.9)",
              barThickness: 40,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
          legend: {
            display: true,
            labels: {
              fontColor: "black",
              fontSize: 20,
              fontFamily: "cursive",
            },
          },
        },
      });
    });
}

//fetch the preview to each farm
async function fetchFarmDetails(farmName) {
  let fromDate = document.getElementById("fromDate").value;
  let toDate = document.getElementById("toDate").value;
  await fetchItems();
  await fetch(`/api/incomeoutcome ${farmName} ${fromDate} ${toDate}`)
    .then((res) => res.json())
    .then((data) => {
      table.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        let element = `<tr title="${data[i].uses}"><td>${data.length - i}</td>
                    <td>${data[i].issueDate}</td>
                    <td>${data[i].item}</td>
                    <td>${data[i].amount}</td>
                    <td>${data[i].unit}</td>
                    <td>${data[i].issueType}</td>
                    <td>${data[i].expenditure} kd</td></tr>`;
        table.insertAdjacentHTML("afterbegin", element);
      }
    });
}

//exporting farm items
let exportExpenditure = () => {
  let fromDate = document.getElementById("fromDate").value.toString();
  let toDate = document.getElementById("toDate").value.toString();
  location.href = `/api/exportoutcome ${farm} ${fromDate} ${toDate} expenditure`;

  fetch(`/api/exportoutcome ${farm} ${fromDate} ${toDate} expenditure`)
    .then((res) => {
      res.json();
    })
    .then((data) => {
      let text = document.createTextNode(data.warning);
      document.getElementById("warningMessage").appendChild(text);
      document.getElementById("open").click();
    });
};

let exportContent = () => {
  let fromDate = document.getElementById("fromDate").value.toString();
  let toDate = document.getElementById("toDate").value.toString();

  location.href = `/api/exportoutcome ${farm} ${fromDate} ${toDate} content`;
  fetch(`/api/exportoutcome ${farm} ${fromDate} ${toDate} content`)
    .then((res) => {
      res.json();
    })
    .then((data) => {
      let text = document.createTextNode(data.warning);
      document.getElementById("warningMessage").appendChild(text);
      document.getElementById("open").click();
    });
};
