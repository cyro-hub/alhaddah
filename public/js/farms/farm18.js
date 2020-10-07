let table = document.getElementById("farm18");
let fromDate = window.parent.document.getElementById("fromDate").value;
let toDate = window.parent.document.getElementById("toDate").value;
fetch(`/api/incomeoutcome Farm18 ${fromDate} ${toDate}`)
  .then((res) => res.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      let element = `<tr title="Use for ${data[i].uses}"><td>${
        data.length - i
      }</td>
                <td>${data[i].issueDate}</td>
                <td>${data[i].item}</td>
                <td>${data[i].issueType}</td>
                <td>${data[i].amount}</td>
                <td>${data[i].unit}</td>
                <td>${data[i].expenditure} kd</td>
                <td><button type="button" class="btn btn-danger btn-sm" id="${
                  data[i].item
                }-dele-${data[i].outcomeId}">Delete </button></td></tr>`;

      table.insertAdjacentHTML("afterbegin", element);
    }
  });

table.addEventListener("click", (e) => {
  let id = e.target.id.split("-");
  let option = id[1];
  let item = id[0];
  id = eval(id[2]);

  if (option == "dele") {
    document.getElementById("deleteMessage").innerHTML = "";
    let text = document.createTextNode(
      `Do you want to delete ${item} id ${id}`
    );
    document.getElementById("deleteMessage").appendChild(text);
    document.getElementById("openDelete").click();
  }
});
let del = document.getElementById("delete");

del.addEventListener("click", async (e) => {
  let p = document.getElementById("deleteMessage").innerHTML;
  p = p.split(" ");
  let answer = e.target.innerHTML;

  if (answer == "Yes") {
    await fetch(`/api/deloutcome-${p[p.length - 1]}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          document.getElementById("delete").click();
          let message = document.createTextNode(data.success);
          document.getElementById("successMessage").innerHTML = "";
          document.getElementById("successMessage").appendChild(message);
          document.getElementById("openSuccess").click();
          document.getElementById("okSuccess").addEventListener("click", () => {
            window.location.href = "/farm18";
          });
        } else if (data.warning) {
          document.getElementById("delete").click();
          let message = document.createTextNode(data.warning);
          document.getElementById("warningMessage").innerHTML = "";
          document.getElementById("warningMessage").appendChild(message);
          document.getElementById("openWarning").click();
        }
      });
  } else if (answer == "No") {
    document.getElementById("delete").click();
  }
});
document.getElementById("updateOpen").click();