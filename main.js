// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const handler = require("serve-handler");
const http = require("http");

/** @type {BrowserWindow} */
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const PORT = process.env.PORT || 5001;
  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
  const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/vercel/serve-handler#options
    return handler(request, response, {
      rewrites: [{ source: "/public/**", destination: "/static" }],
      public: path.join(__dirname, "source"),
      // cleanUrls: true,
    });
  });

  server.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
  });

  // if (process.env.ELECTRON_START_URL) {
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  mainWindow.maximize();
  // mainWindow.setMenu(null);
  // mainWindow.fullScreen = true;
  mainWindow.webContents.on("did-finish-load", () => {
    // add new element to dom
    mainWindow.webContents.mainFrame.executeJavaScript(`
      const backBtn = document.createElement('div');
      backBtn.id = 'backBtn';
      backBtn.innerHTML = 'back';
      backBtn.style.position = 'absolute';
      backBtn.style.bottom = '0';
      backBtn.style.right = '0';
      backBtn.style.padding = '10px';
      backBtn.style.backgroundColor = 'red';
      backBtn.style.color = 'white';
      backBtn.style.cursor = 'pointer';
      backBtn.style.borderRadius = '5px';
      function innerHTML() {
        if (window.history.length > 1) {
          backBtn.innerHTML = 'back';
        } else {
          backBtn.innerHTML = 'close';
        }
      }
      innerHTML();
      window.onhashchange = function() {
        innerHTML();
      }
      backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      })
      document.body.appendChild(backBtn);

    `);
  });
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
