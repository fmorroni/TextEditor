function switchViMode(newViMode) {
  textarea.classList.remove(ViMode.normal, ViMode.insert, ViMode.visual)
  viMode = newViMode
  if (viMode) textarea.classList.add(Mode.vi, viMode)
  else textarea.classList.remove(Mode.vi)
}

function moveCursorHorizontal(count) {
  if (viMode === ViMode.normal) {
    textarea.selectionStart += count
    textarea.selectionEnd = textarea.selectionStart + 1
  } else if (viMode === ViMode.visual) {
    textarea.selectionEnd += count
  }
}

function moveCursorVertical(count) {
  const cursorPos = count > 0 ? textarea.selectionEnd - 1 : textarea.selectionStart
  const startLineIdx = getLineIdx(cursorPos)
  const startLinePos = getStartOfLinePos(startLineIdx)
  const newPos = getStartOfLinePos(startLineIdx + count) + cursorPos - startLinePos

  if (viMode === ViMode.normal) {
    textarea.selectionStart = newPos
    textarea.selectionEnd = newPos + 1
  } else if (viMode === ViMode.visual) {
    if (count > 0) {
      textarea.selectionEnd = newPos
    } else {
      textarea.selectionStart = newPos
    }
  }
}
