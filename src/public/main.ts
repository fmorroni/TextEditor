import TextEditor from './TextEditor.js'

const editor = new TextEditor({
  textareaMode: {
    normie: document.getElementById('normie') as HTMLTextAreaElement,
    normal: document.getElementById('normal') as HTMLTextAreaElement,
    insert: document.getElementById('insert') as HTMLTextAreaElement,
    visual: document.getElementById('visual') as HTMLTextAreaElement,
  },
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

// editor.newDocument('file1')
// editor.currentDoc.addLine('Hola carola {')
// editor.currentDoc.addLine('chau chau butterfly', 2)
// editor.currentDoc.addLine('}')
// editor.write()

// import { Line } from './Document.js'
// editor.currentDoc.undoHistory.push([{ row: 0, line: new Line('Hola caro', 0) }, { row: 1, line: new Line('chau', 1) }])

declare global {
  interface Window {
    editor: TextEditor
  }
}
window.editor = editor
