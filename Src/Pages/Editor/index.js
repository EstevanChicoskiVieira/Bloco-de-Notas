const { ipcRenderer } = require('electron');

//elementos
const textarea = document.getElementById("textarea")
var title = document.getElementById("title")

//setfile
ipcRenderer.on('set-file', (event,data) => {
    textarea.value = data.content;
    title.innerHTML = "Jeall Notes | " + data.name;
});

//update textarea
function handleChangeText(){
    ipcRenderer.send('update-content', textarea.value)
}