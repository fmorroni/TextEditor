export default class MyDocument {
  name: string
  lines: Line[]

  constructor(name: string) {
    this.name = name
    this.lines = []
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
