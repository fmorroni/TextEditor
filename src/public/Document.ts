import { SaveFile } from './TextEditor.js'

export default class MyDocument {
  name: string
  lines: Line[]
  undoHistory: History
  redoHistory: History

  constructor(name: string)
  constructor(saveFile: SaveFile)
  constructor(nameOrSaveFile: string | SaveFile) {
    if (typeof nameOrSaveFile === 'string') {
      this.name = nameOrSaveFile 
      this.lines = []
      this.undoHistory = []
      this.redoHistory = []
    } else {
      const saveFile = nameOrSaveFile
      this.name = saveFile.name
      this.lines = saveFile.lines.map(line => new Line(line.text, line._tabs))
      this.undoHistory = saveFile.undoHistory
      this.redoHistory = saveFile.redoHistory
    }
  }

  get rows() {
    return this.lines.length
  }

  cols(row: number) {
    return this.lines[row].length
  }

  get length(): number {
    return this.lines.reduce((acc, line) => acc + line.length, 0)
  }

  get text(): string {
    return this.lines.join('\n')
  }

  absolutePos(row: number, col: number): number {
    let tot = 0
    for (let r = 0; r < row; ++r) {
      tot += this.lines[r].length
    }
    return tot + col
  }

  addLine(text: string, tabs: number = 0) {
    this.lines.push(new Line(text, tabs))
  }

  private prevState(from: History, to: History) {
    if (!from.length) return false
    const prevState = from.pop()
    const currentState: DocumentSate = []
    for (const entry of prevState) {
      currentState.push({ row: entry.row, line: this.lines[entry.row] })
      this.lines[entry.row] = entry.line
    }
    to.push(currentState)
    return true
  }

  undo() {
    return this.prevState(this.undoHistory, this.redoHistory)
  }

  redo() {
    return this.prevState(this.redoHistory, this.undoHistory)
  }

  resetRedoHistory() {
    this.redoHistory.length = 0
  }
}

export class Line {
  static tabLenght: number = 2
  text: string
  private _tabs: number

  constructor(text: string, tabs: number) {
    this.text = text
    this._tabs = tabs
  }

  get tabs(): number {
    return this._tabs
  }

  set tabs(tabs: number) {
    if (tabs < 0) throw new RangeError()
    this._tabs = tabs
  }

  get length(): number {
    // +1 for the newline character
    return this.text.length + this.tabLength + 1
  }

  private get tabLength(): number {
    return this.tabs * Line.tabLenght
  }

  toString(): string {
    return ' '.repeat(this.tabLength) + this.text
  }
}

type DocumentSate = { row: number; line: Line }[]
export type History = DocumentSate[]
// Prolly better to make it a class and redefine push so that there is a max amount of saved states.
