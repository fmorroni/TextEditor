const lsEntry = 'my-shitty-text-editor-saves'

function setup() {
  const filenameInput = document.getElementById('filename')
  const renameButton = document.querySelector('.rename-button')

  const newDocButton = document.querySelector('.newdoc-button')
  const deleteButton = document.querySelector('.delete-button')

  const savesMenu = document.querySelector('.saves-menu')
  const savingSpinner = document.getElementById('saving-spinner')

  const textarea = document.getElementById('editor')

  const themeToggleButton = document.querySelector('.theme-button')
  const exportDocumentsButton = document.querySelector('.export-button')

  const savedDocuments = getSavedDocuments()

  let currentDocName =
    Object.keys(savedDocuments)[Object.keys(savedDocuments).length - 1] || null
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

  filenameInput.addEventListener('keyup', function (event) {
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
      savedDocuments[filenameInput.value] = textarea.value
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
    clearTimeout(iid)
    iid = setTimeout(saveDocuments, interval)
    savingSpinner.classList.remove('saved')
    savingSpinner.classList.add('saving')
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
    savesMenu.selectedOptions[0].value =
      savesMenu.selectedOptions[0].textContent = currentDocName
    saveCurrentDocument()
  }

  function deleteDocument() {
    if (
      !window.confirm(`Are you sure you want to delelte "${currentDocName}""?`)
    )
      return
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

  function exportDocuments() {
    const jsonStr = JSON.stringify(savedDocuments)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    exportDocumentsButton.href = url
  }
}

setup()
