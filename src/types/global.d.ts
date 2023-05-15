import { DocumentHistory } from '../public/Document.js'

declare global {
  enum Modes {
    normie = 'normie',
    normal = 'normal',
    insert = 'insert',
    visual = 'visual',
  }

  enum CSS {
    active = 'active',
    invalid = 'invalid',
  }

  interface SavedLine {
    text: string
    _tabs: number
  }

  interface SaveFile {
    name: string
    lines: SavedLine[]
    undoHistory: DocumentHistory
    redoHistory: DocumentHistory
  }
}

export {}
