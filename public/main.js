// function setup() {
import keybinds from './keybinds.js'
window.keybindsJustForTesting = keybinds

if (currentDocName) {
  filenameInput.disabled = true
  changeDocument(currentDocName)

  for (const docName of Object.keys(documents)) {
    addDropdownOption(docName)
  }
} else {
  newDocument()
}

filenameInput.addEventListener('keyup', (event) => {
  if (event.code === 'Enter') {
    textarea.focus()
  }
})

filenameInput.addEventListener('blur', () => {
  if (filenameInput.value !== currentDocName) {
    if (!validName(filenameInput.value)) {
      window.alert('File name invalid')
      return
    }

    rename()
    saveDocuments()
  }
  filenameInput.disabled = true
})

renameButton.addEventListener('click', () => {
  filenameInput.disabled = false
  filenameInput.focus()
  filenameInput.select()
})

savesMenu.addEventListener('change', () => {
  saveDocuments()
  changeDocument(savesMenu.selectedOptions[0].value)
})

let iid = null
const interval = 600
textarea.addEventListener('input', () => {
  updateCurrentDocument()
  clearTimeout(iid)
  iid = setTimeout(saveDocuments, interval)
  savingSpinner.classList.remove('saved')
  savingSpinner.classList.add('saving')
})

textarea.addEventListener('keydown', (event) => {
  let key = event.key
  let args = [motionCount]

  if (key === 'Tab' && event.shiftKey) key = 'shiftTab'
  else if (viMode !== ViMode.insert) {
    let motion = parseInt(key)
    if (motion) {
      key = 'motion'
      args = [motion]
    }
  }

  let keybind = keybinds[viMode][key]
  if (keybind) {
    keybind(...args)
    event.preventDefault()
  } else if (viMode !== ViMode.insert) {
    event.preventDefault()
  }
})

newDocButton.addEventListener('click', () => {
  saveDocuments()
  newDocument()
})

deleteButton.addEventListener('click', () => {
  deleteDocument()
})

themeToggleButton.addEventListener('click', () => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme')
    themeToggleButton.textContent = '🌔'
  } else {
    document.body.classList.add('dark-theme')
    themeToggleButton.textContent = '🌣'
  }
})

exportDocumentsButton.addEventListener('click', () => {
  saveDocuments()
  exportDocuments()
})

modeButton.addEventListener('click', () => {
  if (mode === Mode.normie) {
    mode = Mode.vi
    modeButton.textContent = Mode.normie
    switchViMode(ViMode.normal)
    cmdLine.hidden = false
    cmdVis.hidden = false
  } else if (mode === Mode.vi) {
    mode = Mode.normie
    modeButton.textContent = Mode.vi
    switchViMode(null)
    cmdLine.hidden = true
    cmdVis.hidden = true
  }
  textarea.focus()
})

modeButton.click()

// }

// setup()
