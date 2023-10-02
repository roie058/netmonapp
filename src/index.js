const { lookup } = require("dns/promises");
const {
  app,
  BrowserWindow,
  Tray,
  nativeImage,
  Menu,
  dialog,
  autoUpdater,
} = require("electron");
const { hostname } = require("os");
const path = require("path");
const { server, app: express } = require("./server");

if (app.isPackaged) {
  const server = "https://hazel-sigma-seven.vercel.app";
  const url = `${server}/update/${process.platform}/${app.getVersion()}`;
  autoUpdater.setFeedURL({ url });
}

const createTray = () => {
  const iconPath = path.join(__dirname, "./icons/logo.png");
  const trayIcon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: 24, height: 24 });
  const tray = new Tray(trayIcon);
  const menuTamplate = [
    {
      label: null,
      enabled: false,
    },
    {
      label: "Start Service",
      enabled: false,
      click: async () => {
        //const host = await lookup(hostname(), { family: 4 });
        server.listen(express.get("Port"), express.get("Host"), () => {
          menuTamplate[1].enabled = false;
          menuTamplate[2].enabled = true;
          buildTrayMenu(menuTamplate);
        });
      },
    },
    {
      label: "Stop Service",
      enabled: true,
      click: () => {
        server.close((e) => {
          console.log("E: " + e);
          menuTamplate[1].enabled = true;
          menuTamplate[2].enabled = false;
          buildTrayMenu(menuTamplate);
        });
      },
    },
    {
      label: "About",
      click: async () => {
        const host = await lookup(hostname(), { family: 4 });
        dialog.showMessageBox({
          type: "info",
          title: "Net-Monitor webService V1.0.7",
          message: `Flow Analyzer : V1.2.4(web)\n Host:${host.address} `,
        });
      },
    },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ];
  const buildTrayMenu = (menu) => {
    let lblStatus = "Inactive";
    let iconStatus = "./icons/redCircle.png";
    if (!menu[1].enabled) {
      iconStatus = "./icons/greenCircle.png";
      lblStatus = "Active";
    }
    const iconStatusPath = path.join(__dirname, iconStatus);
    menu[0].label = `Service Status ${lblStatus}`;
    menu[0].icon = nativeImage
      .createFromPath(iconStatusPath)
      .resize({ width: 24, height: 24 });
    const trayMenu = Menu.buildFromTemplate(menu);
    tray.setContextMenu(trayMenu);
  };
  buildTrayMenu(menuTamplate);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createTray();
  //const host = await lookup(hostname(), { family: 4 });
  server.listen(express.get("Port"), express.get("Host"));
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createTray;
  }
});

app.on("quit", () => {
  server.close();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
