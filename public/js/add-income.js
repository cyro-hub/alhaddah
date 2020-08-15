fetch("/api/incomebalance")
  .then((res) => res.json())
  .then((data) => {
    let select = document.getElementById("item");
    for (let i = 0; i < data.length; i++) {
      const element = `<option>${data[i].item}</option>`;
      select.insertAdjacentHTML("afterbegin", element);
    }
  });
