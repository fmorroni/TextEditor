export default class MyDocument {
  lines: Line[]

  constructor() {
    this.lines = []
  }

  get length() {
    return this.lines.length
  }

  absolutePos(row: number, col: number): number {
    let tot = 0
    for (let r = 0; r < row; ++r) {
      tot += this.lines[r].length
    }
    return tot + col
  }
}

class Line {
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

