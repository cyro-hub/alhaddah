fetch("/api/incomebalance")
  .then((res) => res.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      const element = `<option>${data[i].item}</option>`;
      document.getElementById("item").insertAdjacentHTML("afterbegin", element);
      document.getElementById("add").insertAdjacentHTML("afterbegin", element);
    }
  });

document.getElementById("open").click();
