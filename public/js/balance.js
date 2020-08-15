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

        const element = `<tr title="${data[i].des}"> <td>${
          data.length - i
        }</td><td>${item}</td><td>${amount}</td><td>${unit}</td><td>${product}</td><td>${price}kd</td><td>${company}</td><td><button type="button" class="btn btn-primary btn-sm" id="edit${balanceId}">Edit</button><button type="button" class="btn btn-danger btn-sm" id="dele${balanceId}">Delete </button></td></tr>`;
        $("#tbody").prepend(element);
      }
    });
  //end of add item button

  $("#tbody").on("click", "button", (e) => {
    let id = e.target.id.split("");
    let option = "";
    for (let i = 0; i < 4; i++) {
      option += id[i];
    }
    id = id.splice(4);
    id = id.reduce((a, b) => a + b);
    if (option == "edit") {
      let element = $(`#edit${id}`).siblings().parent().siblings().eq(1).html();
      if (window.confirm(`Do you want to Edit ${element}`)) {
        fetch(`/api/updatebal${id}`);
      }
    } else if (option == "dele") {
      deleteItem(eval(id));
    }
  });

  function deleteItem(id) {
    let element = $(`#dele${id}`).siblings().parent().siblings().eq(1).html();
    if (window.confirm(`Do you want to delete ${element}`)) {
      fetch(`/api/delbal${id}`, { method: "DELETE" });
    }
  }
});
