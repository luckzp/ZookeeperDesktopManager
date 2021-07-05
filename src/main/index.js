import { app, BrowserWindow, ipcMain,dialog } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`


  function createDownloadManager() {

    ipcMain.on('open-file-dialog', function (event) {
      dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
      }, function (files) {
        if (files) event.sender.send('selected-directory', files)
        event.returnValue = files;
      })
    })
  }

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minHeight: 600,
    useContentSize: true,
    minWidth: 1000,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)
  mainWindow.setTitle("Image-Download")
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  createDownloadManager()
}

app.on('ready', createWindow)
app.on('ready', () => {
  // ...
  if (process.env.NODE_ENV !== 'production') {
    require('vue-devtools').install()
  }
  const electron = require('electron')
  /*获取electron窗体的菜单栏*/
  const Menu = electron.Menu
  /*隐藏electron创听的菜单栏*/
  Menu.setApplicationMenu(null)
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
