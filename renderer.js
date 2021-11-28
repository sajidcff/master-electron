// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require("electron");
const shell = require("electron").shell;

ipcRenderer.on("asynchronous-reply", (event, arg) => {
  console.log("From renderere reply", arg); // prints "pong"
});

document.querySelector("#btnEd").addEventListener("click", () => {
  //console.log("this is test");
  //  ipcRenderer.send('asynchronous-message', 'ping')

  let identifier = document.getElementById("identifier").value;
  let password = document.getElementById("password").value;

  if (identifier && password) {
    ipcRenderer.send("asynchronous-message", {
      identifier: identifier,
      password: password,
    });
  } else {
    console.log("Please enter your credentials");
  }
});

document.querySelector("#btnLink").addEventListener("click", () => {
  //console.log("check");
  shell.openExternal("http://www.note65.com");
});
