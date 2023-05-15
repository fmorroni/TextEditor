import TextEditor from './TextEditor.js'

const editor = new TextEditor({
  textareas: {
    [Modes.normie]: document.getElementById('normie') as HTMLTextAreaElement,
    [Modes.normal]: document.getElementById('normal') as HTMLTextAreaElement,
    [Modes.insert]: document.getElementById('insert') as HTMLTextAreaElement,
    [Modes.visual]: document.getElementById('visual') as HTMLTextAreaElement,
  },
  localStorageKey: 'my-text-editor-saves',
  filenameInput: document.getElementById('filename') as HTMLInputElement,
  exportDocumentsButton: document.querySelector('.export-button'),
  renameButton: document.querySelector('.rename-button'),
  newDocButton: document.querySelector('.newdoc-button'),
  deleteButton: document.querySelector('.delete-button'),
  themeToggleButton: document.querySelector('.theme-button'),
  modeButton: document.querySelector('.mode-button'),
  docsDropdown: document.querySelector('.saves-menu'),
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
