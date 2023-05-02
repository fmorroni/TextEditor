// function setup() {
const lsEntry = 'my-shitty-text-editor-saves'

const filenameInput = document.getElementById('filename')
const renameButton = document.querySelector('.rename-button')

const newDocButton = document.querySelector('.newdoc-button')
const deleteButton = document.querySelector('.delete-button')

const savesMenu = document.querySelector('.saves-menu')
const savingSpinner = document.getElementById('saving-spinner')

const textarea = document.getElementById('editor')

const themeToggleButton = document.querySelector('.theme-button')
const exportDocumentsButton = document.querySelector('.export-button')

const documents = getSavedDocuments()

let currentDocName =
  Object.keys(documents)[Object.keys(documents).length - 1] || null
if (currentDocName) {
  filenameInput.disabled = true
  changeDocument(currentDocName)

  for (const docName of Object.keys(documents)) {
    addDropdownOption(docName)
  }
} else {
  newDocument()
}

filenameInput.addEventListener('keyup', function(event) {
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
  if (event.code === 'Tab') {
    event.preventDefault()
    event.shiftKey ? indentSelection(-1) : indentSelection(1)
  } else if (event.code === 'Enter') {
    event.preventDefault()
    document.execCommand('insertText', false, '\n')
    const lineIdx = getLineIdx(textarea.selectionStart)
    documents[currentDocName][lineIdx].tabs = documents[currentDocName][lineIdx - 1].tabs
    document.execCommand(
      'insertText',
      false,
      '\t'.repeat(documents[currentDocName][lineIdx - 1].tabs)
    )
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function saveDocuments() {
  localStorage.setItem(lsEntry, JSON.stringify(documents))
  savingSpinner.classList.remove('saving')
  savingSpinner.classList.add('saved')
}

function updateCurrentDocument() {
  documents[currentDocName] = textarea.value.split('\n').map((line) => {
    const match = line.match(/(^\t*)(.*)/)
    return { value: match[2], tabs: match[1].length }
  })
}

function updateTextarea() {
  textarea.value = documents[currentDocName]
    .map((line) => '\t'.repeat(line.tabs) + line.value)
    .join('\n')
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
  if (documents[name] != null || !name) return false
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
  updateCurrentDocument()
  addDropdownOption(currentDocName)
  filenameInput.value = ''
  filenameInput.disabled = false
  // filenameInput.focus()
}

function updateName() {
  filenameInput.value = currentDocName
  filenameInput.disabled = true
}

function addDropdownOption(name) {
  const newDocEntry = document.createElement('option')
  newDocEntry.value = name
  newDocEntry.textContent = name
  newDocEntry.selected = true
  savesMenu.prepend(newDocEntry)
}

function rename() {
  const newName = filenameInput.value

  documents[newName] = documents[currentDocName]
  delete documents[currentDocName]

  savesMenu.selectedOptions[0].value = newName
  savesMenu.selectedOptions[0].textContent = newName

  currentDocName = newName
}

function deleteDocument() {
  if (!window.confirm(`Are you sure you want to delelte "${currentDocName}""?`))
    return
  delete documents[currentDocName]
  saveDocuments()
  savesMenu.selectedOptions[0].remove()
  if (!savesMenu.selectedOptions[0]) newDocument()
  else changeDocument(savesMenu.selectedOptions[0].value)
}

function changeDocument(docName) {
  currentDocName = docName
  updateTextarea()
  updateName()
}

function exportDocuments() {
  const jsonStr = JSON.stringify(documents)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  exportDocumentsButton.href = url
}

// function insertAtStrIdx(src, idx, insertStr) {
//   return src.slice(0, idx) + insertStr + src.slice(idx)
// }

function getLineIdx(cursorPos) {
  const currentDoc = documents[currentDocName]
  let lineIdx = 0
  let totLen = currentDoc[lineIdx].value.length + currentDoc[lineIdx].tabs
  while (cursorPos > totLen) {
    lineIdx++
    totLen += currentDoc[lineIdx].value.length + currentDoc[lineIdx].tabs + 1
  }
  return lineIdx
}

function getStartOfLinePos(lineIdx) {
  const currentDoc = documents[currentDocName]
  let pos = 0
  for (let i = 0; i < lineIdx; ++i) {
    pos += currentDoc[i].value.length + currentDoc[i].tabs + 1
  }
  return pos
}

function getEndOfLinePos(lineIdx) {
  return getStartOfLinePos(lineIdx + 1) - 1
}

function indentLine(lineIdx, tabCount) {
  const line = documents[currentDocName][lineIdx]
  line.tabs += tabCount
  if (line.tabs < 0) {
    tabCount -= line.tabs
    line.tabs = 0
  }
  return tabCount
}

function indentSelection(tabCount) {
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const startIdx = getLineIdx(startPos)
  const endIdx = getLineIdx(endPos)

  textarea.setSelectionRange(
    getStartOfLinePos(startIdx),
    getEndOfLinePos(endIdx)
  )

  let firstLineTabs = indentLine(startIdx,tabCount), totTabs = firstLineTabs
  for (let i = startIdx + 1; i <= endIdx; ++i) {
    totTabs += indentLine(i, tabCount)
  }

  document.execCommand(
    'insertText',
    false,
    documents[currentDocName]
      .slice(startIdx, endIdx + 1)
      .map((line) => '\t'.repeat(line.tabs) + line.value)
      .join('\n')
  )
  textarea.setSelectionRange(startPos + firstLineTabs, endPos + totTabs)
  saveDocuments()
}

// }

// setup()
