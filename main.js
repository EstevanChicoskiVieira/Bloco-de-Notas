const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const fs = require('fs')
const path = require('path')

//Janela Principal
var mainWindow = null;
async function creatWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    await mainWindow.loadFile('Src/Pages/Editor/index.html');
    //mainWindow.webContents.openDevTools();
    createNewFile();

    ipcMain.on('update-content', (event, data) => {
        file.content = data;
    })
}

//arquivo
var file = {};

//criar novo arquivo
function createNewFile(){
    file = {
        name: 'novo-arquivo.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '\\novo-arquivo.txt'
    };
    mainWindow.webContents.send('set-file', file);
}

function writeFile(filePath){
    try{
        fs.writeFile(filePath, file.content, function(error){
            if(error) throw error;

            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);

            mainWindow.webContents.send('set-file', file)
        })
    } catch(e) {
        console.log(e)
    }
}

//salvar como
async function saveFileAs(){
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    });

    if(dialogFile.canceled === true){
        return false;
    }

    writeFile(dialogFile.filePath)
}

//salvar arquivo
function saveFile(){
    if(file.saved === true){
        return writeFile(file.path);
    }

    return saveFileAs();
}

//ler arquivo
function readFile(filePath){
    try{
        return fs.readFileSync(filePath, 'utf-8');
    } catch(e){
        console.log(e);
        return '';
    }
}

//abrir arquivo
async function openFile(){
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });

    if(dialogFile.canceled === true) return false;

    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }
    mainWindow.webContents.send('set-file', file);
}

//Template Menu
const templateMenu = [
    {
        label:'Arquivo',
        submenu: [
            {
                label:'Novo',
                accelerator: 'CmdOrCtrl+N',
                click(){
                    createNewFile({
                        defaultPath: file.path
                    });
                }
            },
            {
                label:'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click(){
                    openFile()
                }
            },
            {
                label:'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click(){
                    saveFile();
                }
            },
            {
                label:'Salvar Como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click(){
                    saveFileAs();
                }
            },
            {
                label:'Fechar',
                accelerator: 'CmdOrCtrl+Q',
                role:process.platform === 'darwin' ? 'close' : 'quit'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Colar',
                role: 'paste'
            }
        ]
    }
];

//Menu
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

//Quando for iniciado
app.whenReady().then(creatWindow);

//Activate
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
        creatWindow();
    }
});