const { app, BrowserWindow } = require('electron')
console.log('app:', typeof app)
if (app) {
  app.whenReady().then(() => {
    console.log('Electron ready!')
    app.quit()
  })
} else {
  console.log('app is undefined - not running in main process')
  process.exit(1)
}
