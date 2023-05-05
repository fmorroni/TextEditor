import Texteditor from './Texteditor.js'

const editor = new Texteditor({
  textarea: document.getElementById('editor') as HTMLTextAreaElement,
  localStorageKey: 'my-shitty-text-editor-saves',
  filenameInput: document.getElementById('filename') as HTMLInputElement,
  renameButton: document.querySelector('.export-button') as HTMLButtonElement,
  newDocButton: document.querySelector('.theme-button') as HTMLButtonElement,
  deleteButton: document.querySelector('.rename-button') as HTMLButtonElement,
  modeButton: document.querySelector('.newdoc-button') as HTMLButtonElement,
  themeToggleButton: document.querySelector('.delete-button') as HTMLButtonElement,
  exportDocumentsButton: document.querySelector('.mode-button') as HTMLButtonElement,
  docsDropdown: document.querySelector('.saves-menu') as HTMLSelectElement,
  savingSpinner: document.getElementById('saving-spinner') as HTMLDivElement,
})

editor.newDocument('file1')
editor.currentDoc.addLine('Hola carola {')
editor.currentDoc.addLine('chau chau butterfly', 2)
editor.currentDoc.addLine('}')
editor.write()

declare global {
  interface Window {
    editor: Texteditor
  }
}
window.editor = editor
