const MAX_HISTORY = 80

export function createHistory(initialState) {
  return {
    past: [],
    present: structuredClone(initialState),
    future: [],
  }
}

export function pushHistory(history, nextState) {
  const snapshot = structuredClone(nextState)
  if (JSON.stringify(snapshot) === JSON.stringify(history.present)) return history
  return {
    past: [...history.past.slice(-MAX_HISTORY), history.present],
    present: snapshot,
    future: [],
  }
}

export function undoHistory(history) {
  if (!history.past.length) return history
  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redoHistory(history) {
  if (!history.future.length) return history
  const next = history.future[0]
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  }
}

export function canUndo(history) {
  return history.past.length > 0
}

export function canRedo(history) {
  return history.future.length > 0
}
