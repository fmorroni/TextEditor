class Mode {
  textarea: HTMLTextAreaElement
  keymaps: Map<string, MotionedKeymap | UnmotionedKeymap>

  constructor(textarea: HTMLTextAreaElement) {
    this.textarea = textarea
    this.keymaps = new Map()
  }

  addKeymap(key: string, keymap: Keymap): void {
    this.keymaps.set(key, keymap)
  }

  getKeymap(key: string): Keymap {
    return this.keymaps.get(key)
  }

  execKeymap(key: string, motionCount: string): boolean {
    const km = this.keymaps.get(key)
    if (!km) return false
    km(motionCount)
    return true
  }
}

type MotionedKeymap = (motionCount: number) => void
type UnmotionedKeymap = (a: string) => void
type Keymap = MotionedKeymap | UnmotionedKeymap


function keymapType(k: UnmotionedKeymap): string
function keymapType(k: MotionedKeymap): string
function keymapType(k: MotionedKeymap | UnmotionedKeymap): string {

}
