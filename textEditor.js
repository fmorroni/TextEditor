function prepareSite() {
  document.head.replaceChildren()
  document.body.replaceChildren()
  const style = document.createElement('style')
  style.textContent = `
    * {
      background: inherit;
      color: inherit;
      box-sizing: border-box;
    }
    
    body {
      background: white;
      font-family: Arial, sans-serif;
      width: 100vw;
      height: 100vh;
      margin: 0;
      transition: background-color 1.5s ease, color 1.5s ease;
    }

    #container {
      width: 70vw;
      margin-inline: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #editor {
      height: 80vh;
      width: 100%;
      margin-top: 1rem;
      font-size: 14px;
      padding: 10px;
      resize: horizontal;
      border-radius: 4px;
    }

    #toolbar {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      margin-top: 20px;
    }

    #filename {
      width: 300px;
      padding: 5px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      text-align: center;
    }

    .buttons-container {
      display: flex;
      gap: .5rem;
    }

    .sub-container {
      display: flex;
      gap: .3rem;
      align-items: center;
    }

    .button {
      padding: 10px 20px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .button:hover {
      filter: brightness(0.8);
    }

    .rename-button {
      padding: 5px;
      font-size: 1rem;
      line-height: 1rem;
    }

    .theme-button {
      position: absolute;
      top: 5px;
      left: 5px;
      padding: 3px;
      font-size: 1.5rem;
      line-height: 1.5rem;
    }

    .newdoc-button, .delete-button {
      color: white;
    }

    .newdoc-button {
      background-color: #4CAF50;
    }

    .delete-button {
      background-color: #dc3545;
    }
    
    .icon {
      margin-right: 10px;
      color: #fff;
    }

    .saves-menu {
      padding: 5px;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 10rem;
    }

    .saving {
      animation: 1.5s linear infinite spin;
      animation-play-state: inherit;
      border: solid 3px #cfd0d1;
      border-bottom-color: #1c87c9;
      border-radius: 50%;
      height: .8rem;
      aspect-ratio: 1;
    }

    .saved::after {
      content: "✓";
      color: #4CAF50;
      font-size: 1.5rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .dark-theme {
      background-color: #1E1E1E;
      color: #D4D4D4;
    }
    
    
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px grey; 
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: gray; 
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3a3a3a; 
    }  
  `
  document.head.appendChild(style)
}

prepareSite()

const container = document.createElement('div')
container.id = 'container'


const toolbar = document.createElement('div')
toolbar.id = 'toolbar'


const filenameInput = document.createElement('input')
filenameInput.type = 'text'
filenameInput.id = 'filename'
filenameInput.placeholder = 'Enter file name'

const renameButton = document.createElement('button')
renameButton.classList.add('button', 'rename-button');
renameButton.textContent = '🖉';

const inputContainer = document.createElement('div')
inputContainer.classList.add('sub-container')
inputContainer.appendChild(filenameInput)
inputContainer.appendChild(renameButton)


const newDocButton = document.createElement('button')
newDocButton.classList.add('button', 'newdoc-button');
newDocButton.textContent = 'New document'

const deleteButton = document.createElement('button');
deleteButton.classList.add('button', 'delete-button');
deleteButton.textContent = 'Delete';

const buttonsContainer = document.createElement('div')
buttonsContainer.classList.add('buttons-container')
buttonsContainer.appendChild(newDocButton)
buttonsContainer.appendChild(deleteButton)


const savesMenu = document.createElement('select')
savesMenu.classList.add('saves-menu')

const savingSpinner = document.createElement('div')
savingSpinner.classList.add('saved')

const menuContainer = document.createElement('div')
menuContainer.classList.add('sub-container')
menuContainer.appendChild(savesMenu)
menuContainer.appendChild(savingSpinner)


toolbar.appendChild(menuContainer)
toolbar.appendChild(inputContainer)
toolbar.appendChild(buttonsContainer)

container.appendChild(toolbar)


const textarea = document.createElement('textarea')
textarea.id = 'editor'
textarea.spellcheck = false
container.appendChild(textarea)

document.body.appendChild(container)


const themeToggleButton = document.createElement('button');
themeToggleButton.classList.add('button', 'theme-button');
themeToggleButton.textContent = '🌣';
document.body.classList.add('dark-theme')

document.body.appendChild(themeToggleButton);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const lsEntry = 'my-shitty-text-editor-saves'
const savedDocuments = getSavedDocuments()

let currentDocName = Object.keys(savedDocuments)[Object.keys(savedDocuments).length - 1] || null
if (currentDocName) {
  updateName()
  filenameInput.disabled = true
  textarea.value = savedDocuments[currentDocName]

  for (const docName of Object.keys(savedDocuments)) {
    addDropdownOption(docName)
  }
} else {
  newDocument()
}

filenameInput.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    // Enter key was pressed
    textarea.focus()
  }
})

filenameInput.addEventListener('blur', event => {
  if (filenameInput.value !== currentDocName) {
    if (!validName(filenameInput.value)) {
      window.alert('File name invalid')
      return
    }
    
    rename()
    savedDocuments[filenameInput.value] = textarea.value
    saveDocuments()
  }
  filenameInput.disabled = true
})

renameButton.addEventListener('click', event => {
  filenameInput.disabled = false
  filenameInput.focus()
  filenameInput.select()
})

savesMenu.addEventListener('change', event => {
  saveDocuments()
  changeDocument(savesMenu.selectedOptions[0].value)
})

let iid = null
const interval = 600
textarea.addEventListener('input', event => {
  clearTimeout(iid)
  iid = setTimeout(saveDocuments, interval)
  savingSpinner.classList.remove('saved')
  savingSpinner.classList.add('saving')
})

newDocButton.addEventListener('click', event => {
  saveDocuments()
  newDocument()
})

deleteButton.addEventListener('click', event => {
  deleteDocument()
})

themeToggleButton.addEventListener('click', event => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme')
    themeToggleButton.textContent = '🌔'
  } else {
    document.body.classList.add('dark-theme')
    themeToggleButton.textContent = '🌣';
  }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function saveDocuments() {
  saveCurrentDocument()
  localStorage.setItem(lsEntry, JSON.stringify(savedDocuments))
  savingSpinner.classList.remove('saving')
  savingSpinner.classList.add('saved')
}

function getSavedDocuments() {
  let documents = {}
  try {
    documents = JSON.parse(localStorage.getItem(lsEntry)) || {}
  } finally {
    return documents
  }
}

function validName(name) {
  if (savedDocuments[name] != null || !name) return false
  else return true
}

function newDocument() {
  const newDocName = 'New file'
  if (!validName(newDocName)) {
    window.alert('Change name to existing new file')
    return
  }
  currentDocName = newDocName
  textarea.value = ''
  saveCurrentDocument()
  addDropdownOption(currentDocName)
  filenameInput.value = ''
  filenameInput.disabled = false
  // filenameInput.focus()
}

function updateName() {
  filenameInput.value = currentDocName
  filenameInput.disabled = true
}

function saveCurrentDocument() {
  savedDocuments[currentDocName] = textarea.value
}

function addDropdownOption(name) {
  const newDocEntry = document.createElement('option')
  newDocEntry.value = name
  newDocEntry.textContent = name
  newDocEntry.selected = true
  savesMenu.prepend(newDocEntry)
}

function rename() {
  delete savedDocuments[currentDocName]
  currentDocName = filenameInput.value
  savesMenu.selectedOptions[0].value = savesMenu.selectedOptions[0].textContent = currentDocName
  saveCurrentDocument()
}

function deleteDocument() {
  if (!window.confirm(`Are you sure you want to delelte "${currentDocName}""?`)) return
  delete savedDocuments[currentDocName]
  localStorage.setItem(lsEntry, JSON.stringify(savedDocuments))
  savesMenu.selectedOptions[0].remove()
  if (!savesMenu.selectedOptions[0]) newDocument()
  else changeDocument(savesMenu.selectedOptions[0].value)
}

function changeDocument(docName) {
  currentDocName = docName
  textarea.value = savedDocuments[docName]
  updateName()
}
