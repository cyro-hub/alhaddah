let table = document.getElementById("farm17");
fetch("/api/incomeoutcome-Farm17")
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
    if (window.confirm(`Are you sure you want to Delete ${item}`)) {
      fetch(`/api/deloutcome-${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          window.location.href = `/farm17`;
        });
    }
  }
});
