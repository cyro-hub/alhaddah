$(function () {
  fetch("/api/incomebalance")
    .then((res) => res.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        const {
          balanceId,
          item,
          amount,
          unit,
          price,
          product,
          company,
          description,
        } = data[i];
        const element = `<tr title="Description : ${data[i].des}"> <td>${i}</td><td id="${item}">${item}</td><td>${amount}</td><td>${unit}</td><td>${product}</td><td>${price}kd</td><td>${company}</td><td><button type="button" class="btn btn-primary btn-sm" id="${item}-edit-${balanceId}">Edit</button><button type="button" class="btn btn-danger btn-sm" id="${item}-dele-${balanceId}">Delete </button></td></tr>`;
        $("#tbody").prepend(element);
      }
    });
  //end of add item button

  $("#tbody").on("click", "button", (e) => {
    let id = e.target.id.split("-");
    var element = id[0];
    var option = id[1];
    id = eval(id[2]);

    if (option == "edit") {
      document.getElementById("openUpdate").click();
      document.getElementById("form").action = `/api/updatebalance-${id}`;
      document.getElementById("form").method = "POST";
      document.getElementById("item").value = element;
    } else if (option == "dele") {
      document.getElementById("deleteMessage").innerHTML = "";
      let text = document.createTextNode(
        `Do you want to delete ${element} id ${id}`
      );
      document.getElementById("deleteMessage").appendChild(text);
      document.getElementById("openDelete").click();
    }
  });
});

let del = document.getElementById("delete");

del.addEventListener("click", async (e) => {
  let p = document.getElementById("deleteMessage").innerHTML;
  p = p.split(" ");
  let answer = e.target.innerHTML;

  if (answer == "Yes") {
    await fetch(`/api/delbalance-${p[p.length - 1]}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          document.getElementById("delete").click();
          let message = document.createTextNode(data.success);
          document.getElementById("successMessage").innerHTML = "";
          document.getElementById("successMessage").appendChild(message);
          document.getElementById("openSuccess").click();
          document.getElementById("okSuccess").addEventListener("click", () => {
            window.location.href = "/balance";
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
