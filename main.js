const electron = require('electron');
const { ipcRenderer } = electron;

document.querySelector('.schedule-upload-form').addEventListener('submit', (function (e) {
    e.preventDefault();
    const { path } = document.querySelector('.select-file-input').files[0];
    ipcRenderer.send('file:submit', path);
}));

ipcRenderer.send('check-file-status')

ipcRenderer.on('file-not-found', (event) => {
    const element = document.querySelector('#file-not-found');
    element.classList.toggle('hidden');
    document.querySelector('#file-not-found').innerHTML = `Error: No schedule found. Please upload a schedule`
})

ipcRenderer.on('file upload success', (event, success) => {
    document.querySelector('#result').innerHTML = `<span class="icon icon-check green"></span> ${success}`;
});

document.querySelector('.add-file-btn').addEventListener('click', e => {
    document.querySelector('.sidebar').classList.toggle('hidden');
})

document.querySelector('.icon-close-tab').addEventListener('click', e => {
    document.querySelector('.sidebar').classList.add('hidden');
    ipcRenderer.send('reload');
})

document.querySelector('.btn-reload').addEventListener('click', e => {
    ipcRenderer.send('reload');
})

document.querySelector('.chart-btn').addEventListener('click', e => {
    ipcRenderer.send('display-charts');
})