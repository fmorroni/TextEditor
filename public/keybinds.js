const Tab = (motionCount) => indentSelection(motionCount)
const shiftTab = (motionCount) => indentSelection(-motionCount)

const insert = {
  Tab,
  shiftTab,
  Enter: () => {
    document.execCommand('insertText', false, '\n')
    const lineIdx = getLineIdx(textarea.selectionStart)
    currentDoc[lineIdx].tabs = currentDoc[lineIdx - 1].tabs
    document.execCommand('insertText', false, '\t'.repeat(currentDoc[lineIdx - 1].tabs))
  },
}

const normal = {
  Tab,
  shiftTab,
  motion: (newMotionCount) => (motionCount = 10 * motionCount + newMotionCount),
  Escape: () => switchViMode(ViMode.normal),
  l: (motionCount) => moveCursorHorizontal(motionCount),
  h: (motionCount) => moveCursorHorizontal(-motionCount),
  j: (motionCount) => moveCursorVertical(motionCount),
  k: (motionCount) => moveCursorVertical(-motionCount),
  n: () => switchViMode(ViMode.normal),
  v: () => switchViMode(ViMode.visual),
  i: () => switchViMode(ViMode.insert),
}

const visual = {
  ...normal,
}

export default {
  [ViMode.insert]: insert,
  [ViMode.normal]: normal,
  [ViMode.visual]: visual,
}
