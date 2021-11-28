// Modules
const { app, BrowserWindow } = require("electron");
const colors = require("colors");
const { ipcMain } = require("electron");
const fs = require("fs");
var http = require("http");
var request = require("request");
var unzipper = require("unzipper");
const createDesktopShortcut = require("create-desktop-shortcuts");

let mainWindow;
let secondaryWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createSecondaryWindow() {
  secondaryWindow = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    parent: mainWindow,
    modal: true,
  });
  secondaryWindow.loadFile("warning.html");
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", checkFolder);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

function checkFolder() {
  const folderName = "C:/note65";

  try {
    if (!fs.existsSync(folderName)) {
      console.log("Folder not exists");
      fs.createReadStream("./note65.zip")
        .pipe(unzipper.Extract({ path: "C:/" }))
        .on("finish", function (resolve) {
          console.log("Unzip complete", resolve);
        });
    } else {
      console.log("Folder already exists");
      const shortcutsCreated = createDesktopShortcut({
        windows: {
          filePath: "c:\\note65\\upload\\",
          icon: "c:\\note65\\bin\\Generica_25576.ico",
        },
        linux: { filePath: "/home/path/to/executable" },
        osx: { filePath: "/home/path/to/executable" },
      });

      if (shortcutsCreated) {
        console.log("Everything worked correctly!");

        checkUser();
      } else {
        console.log(
          'Could not create the icon or set its permissions (in Linux if "chmod" is set to true, or not set)'
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function checkUser() {
  createWindow();

  try {
    var data = fs.readFileSync("auth.json", "utf8");
    console.log(data);
    var json = JSON.parse(data);
    console.log(json.identifier);
    console.log(json.password);
    request.post(
      "http://127.0.0.1:5000/userAuth/login",
      {
        json: {
          identifier: json.identifier,
          password: json.password,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(error);
        }
        console.log(body);

        if (body.success == true) {
          fs.writeFile("token.txt", body.data, function (err) {
            if (err) throw err;
            console.log("token.txt");
            mainWindow.loadFile("inventory.html");
          });
        } else {
          mainWindow.loadFile("index.html");
        }
      }
    );
  } catch (e) {
    console.log("Error:", e.stack);
  }
}

ipcMain.on("asynchronous-message", (event, arg) => {
  try {
    var json = arg;
    console.log(json.identifier);
    console.log(json.password);

    request.post(
      "http://127.0.0.1:5000/userAuth/login",
      {
        json: {
          identifier: json.identifier,
          password: json.password,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(error);
        }
        console.log(body);

        if (body.success == true) {
          fs.writeFile("auth.json", JSON.stringify(json), function (err) {
            if (err) throw err;
            console.log("updated json file");

            fs.writeFile("token.txt", body.data, function (err) {
              if (err) throw err;
              console.log("updated token.txt");
              mainWindow.loadFile("inventory.html");
            });
          });
        } else {
          console.log(
            "else show the sencoondary window saying that the user is not found"
          );
          createSecondaryWindow();
        }
      }
    );
  } catch (e) {
    console.log("Error:", e.stack);
  }
});
