function setup() {
  const lsStorageKey = 'storage'

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

  let currentDocName = Object.keys(documents)[Object.keys(documents).length - 1] || null
  if (currentDocName) {
    filenameInput.disabled = true
    changeDocument(currentDocName)

    for (const docName of Object.keys(documents)) {
      addDropdownOption(docName)
    }
  } else {
    newDocument()
  }

  // This keeps tab instances syncronized
  const docModChannel = new BroadcastChannel('tab-modification-channel')
  docModChannel.addEventListener('message', (event) => {
    const otherTabData = event.data
    if (!documents[otherTabData.name]) {
      addDropdownOption(otherTabData.name, false)
    }
    documents[otherTabData.name] = otherTabData.lines
    if (otherTabData.name === currentDocName) {
      updateTextarea()
    }
  })
  const docRenameChannel = new BroadcastChannel('tab-rename-channel')
  docRenameChannel.addEventListener('message', (event) => {
    const { oldName, newName } = event.data
    if (oldName === currentDocName) filenameInput.value = newName
    renameDocTo(oldName, newName)
  })
  const docDeleteChannel = new BroadcastChannel('tab-delete-channel')
  docDeleteChannel.addEventListener('message', (event) => {
    const { deletedDocName } = event.data
    deleteDocument(deletedDocName)
  })

  filenameInput.addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
      textarea.focus()
    }
  })

  filenameInput.addEventListener('blur', () => {
    if (filenameInput.value !== currentDocName) {
      filenameInput.value = uniqueName(filenameInput.value)
      if (!validName(filenameInput.value)) {
        window.alert('File name invalid')
        return
      }

      renameCurrentDocTo(filenameInput.value)
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
    deleteCurrentDocument()
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

  function saveDocuments(
    tabChannel = docModChannel,
    data = { name: currentDocName, lines: documents[currentDocName] }
  ) {
    // Send the document modifications through the tab-communications-channel so that other tabs can update the changes.
    tabChannel.postMessage(data)

    localStorage.setItem(lsStorageKey, JSON.stringify(documents))
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
    const storage = JSON.parse(localStorage.getItem(lsStorageKey)) || {}
    return storage
  }

  function validName(name) {
    if (documents[name] != null || !name) return false
    else return true
  }

  function uniqueName(name) {
    let newName = name,
      i = 1
    while (documents[newName] != null) {
      newName = `${name}(${i++})`
    }
    return newName
  }

  function newDocument() {
    const newDocName = uniqueName('New file')
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

  function addDropdownOption(name, selected = true) {
    const newDocEntry = document.createElement('option')
    newDocEntry.value = name
    newDocEntry.textContent = name
    newDocEntry.selected = selected
    savesMenu.prepend(newDocEntry)
  }

  function selectDropdownOption(name) {
    return savesMenu.querySelector(`option[value="${name}"]`)
  }

  function renameDocTo(docName, newName) {
    documents[newName] = documents[docName]
    delete documents[docName]

    const option = selectDropdownOption(docName)
    option.value = newName
    option.textContent = newName
    if (docName === currentDocName) currentDocName = newName
  }

  function renameCurrentDocTo(newName) {
    const tabData = { oldName: currentDocName, newName: newName }
    renameDocTo(currentDocName, newName)
    saveDocuments(docRenameChannel, tabData)
  }

  function deleteDocument(docName) {
    delete documents[docName]
    selectDropdownOption(docName).remove()
    if (docName === currentDocName) {
      if (!savesMenu.selectedOptions[0]) newDocument()
      else changeDocument(savesMenu.selectedOptions[0].value)
    }
  }

  function deleteCurrentDocument() {
    if (!window.confirm(`Are you sure you want to delelte "${currentDocName}""?`)) return
    const tabData = { deletedDocName: currentDocName }
    deleteDocument(currentDocName)
    saveDocuments(docDeleteChannel, tabData)
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

    const startOfLine = getStartOfLinePos(startIdx)
    textarea.setSelectionRange(startOfLine, getEndOfLinePos(endIdx))

    let firstLineTabs = indentLine(startIdx, tabCount)
    let totTabs = firstLineTabs
    for (let i = startIdx + 1; i <= endIdx; ++i) {
      totTabs += indentLine(i, tabCount)
    }

    // This was needed to take into account a very specific bug I found that happens when doing
    // an 'insertText' execCommand with '' as value while the last line of a textarea is highlighted.
    if (
      startIdx === documents[currentDocName].length - 1 &&
      documents[currentDocName][startIdx].value === '' &&
      documents[currentDocName][startIdx].tabs === 0 &&
      tabCount < 0
    ) {
      document.execCommand('delete', false, null)
    } else {
      document.execCommand(
        'insertText',
        false,
        documents[currentDocName]
          .slice(startIdx, endIdx + 1)
          .map((line) => '\t'.repeat(line.tabs) + line.value)
          .join('\n')
      )
    }
    const selStart = (startPos + firstLineTabs >= startOfLine) ? startPos + firstLineTabs : startOfLine
    const startOfNextLine = getStartOfLinePos(endIdx)
    const selEnd = (endPos + totTabs >= startOfNextLine) ? endPos + totTabs : startOfNextLine;
    textarea.setSelectionRange(selStart, selEnd)
  }
}

setup()
