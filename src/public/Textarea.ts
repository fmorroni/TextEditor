import MyDocument from './Document.js'

class Textarea {
  private textarea: HTMLTextAreaElement
  cursor: Cursor
  document: MyDocument

  constructor(textarea: HTMLTextAreaElement) {
    this.textarea = textarea
    this.cursor = new Cursor()
  }

  moveCursorTail(row: number, col: number) {
    if (row < 0) row = 0
    else if (row >= this.document.length) row = this.document.length - 1
    if (col < 0) row = 0
    else if (col >= this.document[row].length) col = this.document[row].length - 1

    this.cursor.tail.move(row, col)
    if (this.cursor.selectionDir === SelectionDirection.Forward) {
      this.textarea.selectionEnd = this.document.absolutePos(row, col)
    } else if (this.cursor.selectionDir === SelectionDirection.Backward) {
      this.textarea.selectionStart = this.document.absolutePos(row, col)
    }
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
