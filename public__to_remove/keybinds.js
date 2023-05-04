export const keybinds = {
  motion: (newMotionCount) => motionCount = newMotionCount,
  Tab: (motionCount) => indentSelection(motionCount),
  shiftTab: (motionCount) => indentSelection(-motionCount),
  Enter: () => {
    document.execCommand('insertText', false, '\n')
    const lineIdx = getLineIdx(textarea.selectionStart)
    currentDoc[lineIdx].tabs = currentDoc[lineIdx - 1].tabs
    document.execCommand('insertText', false, '\t'.repeat(currentDoc[lineIdx - 1].tabs))
  },
  Escape: () => switchViMode(ViMode.normal),
  l: () => moveCursorHorizontal(motionCount),
  h: () => moveCursorHorizontal(-motionCount),
  j: () => moveCursorVertical(motionCount),
  k: () => moveCursorVertical(-motionCount),
  n: () => switchViMode(ViMode.normal),
  v: () => switchViMode(ViMode.visual),
  i: () => switchViMode(ViMode.insert),
}
