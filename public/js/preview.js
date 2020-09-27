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
               <td><button type="button" class="btn btn-primary btn-sm" id="${
                 data[i].item
               }-edit-${
        data[i].previewId
      }">Edit</button></td><td><button type="button" class="btn btn-danger btn-sm" id="${
        data[i].item
      }-dele-${data[i].previewId}">Delete </button></td>
            </tr>`;
      const table = document.getElementById("table");
      table.insertAdjacentHTML("afterbegin", element);
    }
  });

table.addEventListener("click", (e) => {
  let id = e.target.id.split("-");
  let item = id[0];
  let option = id[1];
  id = eval(id[2]);

  if (option == "edit") {
    document.getElementById("openUpdate").click();
    document.getElementById("form").action = `/api/updatepreview-${id}`;
    document.getElementById("form").method = "POST";
  } else if (option == "dele") {
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
    await fetch(`/api/delpreview-${p[p.length - 1]}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          document.getElementById("delete").click();
          let message = document.createTextNode(data.success);
          document.getElementById("successMessage").innerHTML = "";
          document.getElementById("successMessage").appendChild(message);
          document.getElementById("openSuccess").click();
          document.getElementById("okSuccess").addEventListener("click", () => {
            window.location.href = "/preview";
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