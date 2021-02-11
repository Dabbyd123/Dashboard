const electron = require('electron');
const xlsx = require("xlsx");
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = electron;
const nativeImage = require('electron').nativeImage;
var image = nativeImage.createFromPath(`${__dirname} + /Extrusion.png`);
// where public folder on the root dir

image.setTemplateImage(true);

let mainWindow;
let win2;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        icon: image
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.maximize();
    mainWindow.show();
    ipcMain.on('check-file-status', event => {
        if (!fs.existsSync('./schedule/Extrusion Schedule.html')) {
            event.sender.send('file-not-found')
        } else {
            null
        }
    })
})

ipcMain.on('print', event => {
    const options = { silent: false, printBackground: true }
    mainWindow.webContents.print(options, (success, errorType) => {
        if (!success) console.log(errorType)
    })
})

ipcMain.on('file:submit', function (event, path) {
    const getFiles = async () => {
        const wb = xlsx.readFile(path, { cellDates: true });
        const ws = wb.Sheets["Graphic"];
        const data = xlsx.utils.sheet_to_json(ws);
        const newWB = xlsx.utils.book_new();
        const newWS = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(newWB, newWS, "Extrusion Schedule");

        await xlsx.writeFile(newWB, "Extrusion Schedule.html");

        const today = new Date();
        const month = today.toLocaleString('default', { month: 'short' });
        const year = today.getFullYear()

        // Archive current schedule
        fs.rename('./schedule/Extrusion Schedule.html', `./schedule/schedule_archive/${month} ${year} Extrusion Schedule.html`, (err) => {
            if (err) throw err;
            console.log('file archived');
        });

        // Move uploaded schedule into the 'schedule'
        fs.rename('Extrusion Schedule.html', './schedule/Extrusion Schedule.html', (err) => {
            if (err) throw err;
            console.log('file moved');
        });
        event.sender.send('file upload success', 'File uploaded successfully');
    }
    getFiles();
});

ipcMain.on('reload', event => {
    mainWindow.reload();
})

ipcMain.on('print-charts', event => {
    const options = { silent: false, printBackground: false }
    win2.webContents.print(options, (success, errorType) => {
        if (!success) console.log(errorType)
    })
})

ipcMain.on('reload-dashboard', event => {
    win2.reload()
})

ipcMain.on('display-charts', event => {
    win2 = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
    });
    win2.loadURL(`file://${__dirname}/dashboard/dashboard.html`);
    win2.maximize();
    win2.show();
})