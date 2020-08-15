fetch("/api/incomepreview")
  .then((res) => res.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      const element = `<tr>
                <td>${data.length - i}</td>
                <td>${data[i].issueDate}</td>
                <td>${data[i].item}</td>
                <td>${data[i].itemType}</td>
                <td>${data[i].amount}</td>
                <td>${data[i].free}</td>
                <td>${data[i].balance}</td>
               <td><button type="button" class="btn btn-primary btn-sm" id="edit${
                 data[i].previewId
               }">Edit</button><button type="button" class="btn btn-danger btn-sm" id="dele${
        data[i].previewId
      }">Delete </button></td>
            </tr>`;
      const table = document.getElementById("table");
      table.insertAdjacentHTML("afterbegin", element);
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
    .childNodes[4].nextElementSibling.textContent;

  if (checker == "edit") {
    if (window.confirm(`Are you sure you want to Edit ${item}`)) {
      location.assign(`http://localhost:3000/updatebal${id}`);
    }
  } else if (checker == "dele") {
    if (window.confirm(`Are you sure you want to Delete ${item}`)) {
      fetch(`/api/delpre${id}`, { method: "DELETE" });
    }
  }
});
