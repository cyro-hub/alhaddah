fetch("/api/incomebalance")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      const element = `<option>${data[i].item}</option>`;
      let select = document.getElementById("item");
      select.insertAdjacentHTML("afterbegin", element);
    }
  });
