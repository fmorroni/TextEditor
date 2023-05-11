import MyDocument, { History } from './Document.js'

export default class TextEditor {
  /* private  */ textareaMode: Map<Mode, HTMLTextAreaElement>
  /* private  */ textarea: HTMLTextAreaElement
  /* private  */ localStorageKey: string

  /* private  */ exportDocumentsButton: HTMLButtonElement
  /* private  */ themeToggleButton: HTMLButtonElement
  /* private  */ renameButton: HTMLButtonElement
  /* private  */ newDocButton: Button
  /* private  */ deleteButton: Button
  /* private  */ modeButton: HTMLButtonElement

  /* private  */ filenameInput: FilenameInput
  /* private  */ docsDropdown: DropdownElement
  /* private  */ savingSpinner: HTMLDivElement

  cursor: Cursor
  documents: Map<string, MyDocument>
  /* private  */ currentDoc: MyDocument
  mode: Mode

  constructor(args: EditorConstructor) {
    this.textareaMode = new Map(Object.entries(args.textareaMode) as [Mode, HTMLTextAreaElement][])
    this.localStorageKey = args.localStorageKey

    this.exportDocumentsButton = args.exportDocumentsButton
    this.themeToggleButton = args.themeToggleButton
    this.renameButton = args.renameButton
    this.newDocButton = setDisableable(args.newDocButton as Button)
    this.deleteButton = setDisableable(args.deleteButton as Button)
    this.modeButton = args.modeButton

    this.filenameInput = setDisableable(args.filenameInput as FilenameInput)

    this.docsDropdown = setDisableable(args.docsDropdown as DropdownElement)

    this.savingSpinner = args.savingSpinner

    this.cursor = new Cursor()

    // Set to the one I you want the initial mode to be.
    this.setMode(Mode.normal)

    this.filenameInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        this.textarea.focus()
      }
    })
    this.filenameInput.addEventListener('blur', () => {
      this.filenameInput.classList.remove(CSS.invalid)
      if (!this.validName(this.filenameInput.value)) {
        // Didn't work without a timeout for some reason.
        setTimeout(() => {
          this.filenameInput.classList.add(CSS.invalid)
        }, 100)
        this.filenameInput.focus()
      } else {
        this.rename(this.filenameInput.value)
        this.filenameInput.disable()
        this.textarea.focus()
        this.docsDropdown.enable()
        this.newDocButton.enable()
        this.deleteButton.enable()
      }
    })
    this.filenameInput.addEventListener('input', () => {
      this.filenameInput.classList.remove(CSS.invalid)
    })
    this.filenameInput.addEventListener('focus', () => {
      this.docsDropdown.disable()
      this.newDocButton.disable()
      this.deleteButton.disable()
    })

    this.newDocButton.addEventListener('click', () => {
      this.write('')
      this.initializeDoc()
      this.filenameInput.enable()
      this.filenameInput.focus()
    })
    this.renameButton.addEventListener('click', () => {
      this.filenameInput.enable()
      this.filenameInput.focus()
    })


    const saveFiles: [string, SaveFile][] = JSON.parse(localStorage.getItem(args.localStorageKey))
    this.documents = new Map(saveFiles?.map(([name, saveFile]) => [name, new MyDocument(saveFile)]))
    this.currentDoc = this.documents.values().next().value
    if (!this.currentDoc) {
      this.initializeDoc()
      this.renameButton.click()
    } else {
      for (const doc of this.documents.values()) {
        this.addFileToDropdown(doc.name)
      }
      this.setFilenameInput(this.currentDoc.name)
      this.writeCurrentDoc()
    }
  }

  setMode(mode: Mode) {
    this.textarea = this.textareaMode.get(mode)
    this.mode = mode
    for (const ta of this.textareaMode.values()) {
      ta.classList.remove(CSS.active)
    }
    this.textarea.classList.add(CSS.active)
    this.textarea.focus()
  }

  // private initializeCaret() {
  //   if (this.cursor.selectionDir === SelectionDirection.Forward) {
  //     this.textarea.selectionEnd = this.currentDoc.absolutePos(row, col) | 0
  //   } else if (this.cursor.selectionDir === SelectionDirection.Backward) {
  //     this.textarea.selectionStart = this.currentDoc.absolutePos(row, col) | 0
  //   }
  // }

  moveCursorTail(row: number, col: number) {
    if (row < 0) row = 0
    else if (row >= this.currentDoc.rows) row = this.currentDoc.rows - 1
    if (col < 0) row = 0
    else if (col >= this.currentDoc.cols(row)) col = this.currentDoc.cols(row) - 1

    this.cursor.tail.move(row, col)
    if (this.cursor.selectionDir === SelectionDirection.Forward) {
      this.textarea.selectionEnd = this.currentDoc.absolutePos(row, col) | 0
    } else if (this.cursor.selectionDir === SelectionDirection.Backward) {
      this.textarea.selectionStart = this.currentDoc.absolutePos(row, col) | 0
    }
  }

  private validName(name: string): boolean {
    return name.length > 0 && !this.documents.has(name)
  }

  rename(newName: string) {
    if (!this.validName(newName)) return false
    // const newName = this.filenameInput.value

    this.documents.delete(this.currentDoc.name)
    this.currentDoc.name = newName
    this.documents.set(newName, this.currentDoc)

    this.docsDropdown.selectedOptions[0].value = newName
    this.docsDropdown.selectedOptions[0].textContent = newName
    this.filenameInput.value = newName
  }

  private newDocUnverified(name: string) {
    this.currentDoc = new MyDocument(name)
    this.documents.set(name, this.currentDoc)
    this.setFilenameInput(name)
    this.addFileToDropdown(name)
  }

  initializeDoc() {
    this.newDocUnverified('')
  }

  newDocument(name: string): boolean {
    if (!this.validName(name)) return false
    this.newDocUnverified(name)
    return true
  }

  private setFilenameInput(name: string) {
    this.filenameInput.value = name
  }

  private addFileToDropdown(name: string) {
    const newDocEntry = document.createElement('option')
    newDocEntry.value = name
    newDocEntry.textContent = name
    newDocEntry.selected = true
    this.docsDropdown.prepend(newDocEntry)
  }

  write(text: string) {
    for (const ta of this.textareaMode.values()) {
      ta.value = text
    }
  }

  writeCurrentDoc() {
    this.write(this.currentDoc.text)
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
    return SelectionDirection.fromInt(this.tail.compareTo(this.head))
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

  compareTo(p: Position) {
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

interface EditorConstructor {
  textareaMode: TextareaMode
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
}

enum Mode {
  normie = 'normie',
  normal = 'normal',
  insert = 'insert',
  visual = 'visual',
}

type TextareaMode = {
  [M in Mode]: HTMLTextAreaElement
}

enum CSS {
  active = 'active',
  invalid = 'invalid',
}

export interface SaveFile {
  name: string
  lines: Line[]
  undoHistory: History
  redoHistory: History
}
interface Line {
  text: string
  _tabs: number
}

interface Disableable {
  disable(): void
  enable(): void
  disabled: boolean
}
interface FilenameInput extends HTMLInputElement, Disableable {}
type DropdownElement = HTMLSelectElement & Disableable
interface Button extends HTMLButtonElement, Disableable {}

function setDisableable<T extends Disableable>(obj: T) {
  obj.disable = () => (obj.disabled = true)
  obj.enable = () => (obj.disabled = false)
  return obj
}

// enum ViMode {
//   normal = 'vi-normal',
//   insert = 'vi-insert',
//   visual = 'vi-visual',
// }
