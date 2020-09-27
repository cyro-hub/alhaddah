let input = document.getElementsByTagName("input");
let name_error = document.getElementById("error-username");
let password_error = document.getElementById("error-password");
let passwordC_error = document.getElementById("error-passwordc");

name_error.style.display = "none";
password_error.style.display = "none";
passwordC_error.style.display = "none";

const nameTester = /^[\w]{6,10}$/;
const passTester = /^[\S\d]{8,}$/;

input >
  addEventListener("input", (e) => {
    let currentValue = e.target.value;
    let validName = nameTester.test(currentValue);
    let validpassword = passTester.test(currentValue);

    if (validName && e.target.id === "name") {
      name_error.style.display = "none";
    } else if (!validName && e.target.id === "name") {
      name_error.style.display = "block";
    }

    if (validpassword && e.target.id === "password") {
      password_error.style.display = "none";
    } else if (!validpassword && e.target.id === "password") {
      password_error.style.display = "block";
    }

    let password = document.getElementById("password").value;
    if (e.target.id === "passwordC" && password === currentValue) {
      passwordC_error.style.display = "none";
    } else if (e.target.id === "passwordC" && password != currentValue) {
      passwordC_error.style.display = "block";
    }
  });
