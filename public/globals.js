const lsEntry = 'my-shitty-text-editor-saves'

const filenameInput = document.getElementById('filename')
const renameButton = document.querySelector('.rename-button')

const newDocButton = document.querySelector('.newdoc-button')
const deleteButton = document.querySelector('.delete-button')

const savesMenu = document.querySelector('.saves-menu')
const savingSpinner = document.getElementById('saving-spinner')

const textarea = document.getElementById('editor')
const cmdLine = document.getElementById('command-line')
const cmdVis = document.getElementById('command-visualizer')

const themeToggleButton = document.querySelector('.theme-button')
const exportDocumentsButton = document.querySelector('.export-button')

const modeButton = document.querySelector('.mode-button')
const Mode = {
  normie: 'normie-mode',
  vi: 'vi-mode',
}
let mode = Mode.normie

const documents = getSavedDocuments()
let currentDocName = Object.keys(documents)[Object.keys(documents).length - 1] || null
let currentDoc = documents[currentDocName]

function getSavedDocuments() {
  let documents = {}
  try {
    documents = JSON.parse(localStorage.getItem(lsEntry)) || {}
  } finally {
    return documents
  }
}

let motionCount = 1

const ViMode = {
  normal: 'vi-normal',
  insert: 'vi-insert',
  visual: 'vi-visual',
}
let viMode = ViMode.insert

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
  currentDoc = documents[currentDocName]
}

function updateTextarea() {
  textarea.value = documents[currentDocName]
    .map((line) => '\t'.repeat(line.tabs) + line.value)
    .join('\n')
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

  documents[newName] = currentDoc
  delete documents[currentDocName]

  savesMenu.selectedOptions[0].value = newName
  savesMenu.selectedOptions[0].textContent = newName

  currentDocName = newName
}

function deleteDocument() {
  if (!window.confirm(`Are you sure you want to delelte "${currentDocName}""?`)) return
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
  let lineIdx = 0
  let totLen = currentDoc[lineIdx].value.length + currentDoc[lineIdx].tabs
  while (cursorPos > totLen) {
    lineIdx++
    totLen += currentDoc[lineIdx].value.length + currentDoc[lineIdx].tabs + 1
  }
  return lineIdx
}

function getStartOfLinePos(lineIdx) {
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
  const line = currentDoc[lineIdx]
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
  const startLineIdx = getLineIdx(startPos)
  const endLineIdx = getLineIdx(endPos)

  textarea.setSelectionRange(getStartOfLinePos(startLineIdx), getEndOfLinePos(endLineIdx))

  let firstLineTabs = indentLine(startLineIdx, tabCount)
  let totTabs = firstLineTabs
  for (let i = startLineIdx + 1; i <= endLineIdx; ++i) {
    totTabs += indentLine(i, tabCount)
  }

  document.execCommand(
    'insertText',
    false,
    currentDoc
      .slice(startLineIdx, endLineIdx + 1)
      .map((line) => '\t'.repeat(line.tabs) + line.value)
      .join('\n')
  )
  textarea.setSelectionRange(startPos + firstLineTabs, endPos + totTabs)
  saveDocuments()
}

