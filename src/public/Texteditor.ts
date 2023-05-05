import MyDocument from './Document.js'

export default class Texteditor {
  cursor: Cursor
  documents: Map<string, MyDocument>
  /* private  */ textarea: HTMLTextAreaElement
  /* private  */ currentDoc: MyDocument
  /* private  */ localStorageKey: string
  /* private  */ filenameInput: HTMLInputElement
  /* private  */ renameButton: HTMLButtonElement
  /* private  */ newDocButton: HTMLButtonElement
  /* private  */ deleteButton: HTMLButtonElement
  /* private  */ modeButton: HTMLButtonElement
  /* private  */ themeToggleButton: HTMLButtonElement
  /* private  */ exportDocumentsButton: HTMLButtonElement
  /* private  */ docsDropdown: HTMLSelectElement
  /* private  */ savingSpinner: HTMLDivElement

  constructor({
    textarea,
    localStorageKey,
    filenameInput,
    renameButton,
    newDocButton,
    deleteButton,
    modeButton,
    themeToggleButton,
    exportDocumentsButton,
    docsDropdown,
    savingSpinner,
  }: {
    textarea: HTMLTextAreaElement
    localStorageKey: string
    filenameInput: HTMLInputElement
    renameButton: HTMLButtonElement
    newDocButton: HTMLButtonElement
    deleteButton: HTMLButtonElement
    modeButton: HTMLButtonElement
    themeToggleButton: HTMLButtonElement
    exportDocumentsButton: HTMLButtonElement
    docsDropdown: HTMLSelectElement
    savingSpinner: HTMLDivElement
  }) {
    this.textarea = textarea
    this.cursor = new Cursor()
    this.localStorageKey = localStorageKey
    this.filenameInput = filenameInput
    this.renameButton = renameButton
    this.newDocButton = newDocButton
    this.deleteButton = deleteButton
    this.modeButton = modeButton
    this.themeToggleButton = themeToggleButton
    this.exportDocumentsButton = exportDocumentsButton
    this.docsDropdown = docsDropdown
    this.savingSpinner = savingSpinner

    const saveFile: [string, MyDocument][] = JSON.parse(localStorage.getItem(localStorageKey))
    this.documents = new Map(saveFile)
  }

  moveCursorTail(row: number, col: number) {
    if (row < 0) row = 0
    else if (row >= this.currentDoc.rows) row = this.currentDoc.rows - 1
    if (col < 0) row = 0
    else if (col >= this.currentDoc.cols(row)) col = this.currentDoc.cols(row) - 1

    this.cursor.tail.move(row, col)
    if (this.cursor.selectionDir === SelectionDirection.Forward) {
      this.textarea.selectionEnd = this.currentDoc.absolutePos(row, col)
    } else if (this.cursor.selectionDir === SelectionDirection.Backward) {
      this.textarea.selectionStart = this.currentDoc.absolutePos(row, col)
    }
  }

  newDocument(name: string): boolean {
    if (this.documents.has(name)) return false
    this.currentDoc = new MyDocument(name)
    this.documents.set(name, this.currentDoc)
    this.setFilenameInput(name)
    this.addFileToDropdown(name)
    return true
  }

  setFilenameInput(name: string) {
    this.filenameInput.value = name
  }

  addFileToDropdown(name: string) {
    const newDocEntry = document.createElement('option')
    newDocEntry.value = name
    newDocEntry.textContent = name
    newDocEntry.selected = true
    this.docsDropdown.prepend(newDocEntry)
  }

  write() {
    this.textarea.value = this.currentDoc.text
  }

  saveToLocalStorage() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(Array.from(this.documents)))
  }
}

class Cursor {
  head: Position
  tail: Position

  constructor() {
    this.head = new Position(0, 0)
    this.tail = new Position(0, 0)
  }

  get selectionDir(): SelectionDirection {
    return SelectionDirection.fromInt(this.tail.compare(this.head))
  }

  move(row: number, col: number) {
    this.tail.move(row, col)
    this.head.move(row, col)
  }
}

class Position {
  row: number
  col: number

  constructor(row: number, col: number) {
    this.row = row
    this.col = col
  }

  move(row: number, col: number) {
    this.row = row
    this.col = col
  }

  compare(p: Position) {
    let cmp = this.row - p.row
    if (cmp === 0) cmp = this.col - p.col
    return cmp
  }
}

enum SelectionDirection {
  Forward = 1,
  NoSelection = 0,
  Backward = -1,
}
namespace SelectionDirection {
  export function fromInt(i: number): SelectionDirection {
    let dir: SelectionDirection = SelectionDirection.NoSelection
    if (i > 0) dir = SelectionDirection.Forward
    else if (i < 0) dir = SelectionDirection.Backward
    return dir
  }
}
