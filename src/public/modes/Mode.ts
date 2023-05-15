export default class Mode {
  textarea: HTMLTextAreaElement
  keymaps: Map<string, Keymap>

  constructor(textarea: HTMLTextAreaElement) {
    this.textarea = textarea
    this.keymaps = new Map()
  }

  addKeymap(key: string, keymap: Keymap): void {
    this.keymaps.set(key, keymap)
  }

  execKeymap(key: string, motionCount: number): boolean {
    const km = this.keymaps.get(key)
    if (!km) return false
    km(motionCount)
    return true
  }
}

// class Keymap {
//   protected handler: KeymapHandler

//   constructor(handler: KeymapHandler) {
//     this.handler = handler
//   }

//   exec(motionCount: number) {
//     this.handler(motionCount)
//   }
// }

type Keymap = (motionCount: number) => void
