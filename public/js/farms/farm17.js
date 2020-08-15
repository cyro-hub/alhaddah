let table = document.getElementById("farm17");
fetch("/api/incomeoutcome")
  .then((res) => res.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].farms == "Farm17") {
        let element = `<tr><td>${data.length - i}</td>
                <td>${data[i].issueDate}</td>
                <td>${data[i].item}</td>
                <td>${data[i].issueType}</td>
                <td>${data[i].amount}</td>
                <td>${data[i].unit}</td>
                <td>${data[i].expenditure} kd</td>
                <td>${data[i].uses}</td>
                <td><button type="button" class="btn btn-primary btn-sm" id="edit${
                  data[i].outcomeId
                }">Edit</button><button type="button" class="btn btn-danger btn-sm" id="dele${
          data[i].outcomeId
        }">Delete </button></td></tr>`;

        
        table.insertAdjacentHTML("afterbegin", element);
      }
    }
  });

table.addEventListener("click", (e) => {
  let id = e.target.id.split("");

  let checker = "";
  for (let i = 0; i < 4; i++) {
    checker += id[i];
  }
  console.log(id);
  id = id.splice(4);
  id = id.reduce((a, b) => a + b);

  let item = document.getElementById(`edit${id}`).parentElement.parentElement
    .childNodes[3].nextElementSibling.textContent;

  if (checker == "edit") {
    if (window.confirm(`Are you sure you want to Edit ${item}`)) {
      location.assign(`/api/updateout${id}`);
    }
  } else if (checker == "dele") {
    if (window.confirm(`Are you sure you want to Delete ${item}`)) {
      fetch(`/api/delout${id}`, { method: "DELETE" });
    }
  }
});
