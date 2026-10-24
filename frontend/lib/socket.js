// One JSON WebSocket to the server that served the page.
// handlers: { onOpen, onClose, onMessage(message) }. Call connect() again to reconnect.
export function createSocket(handlers) {
  let ws = null

  function connect() {
    if (ws && ws.readyState !== WebSocket.CLOSED) return false
    let connection
    try {
      connection = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`)
    } catch {
      handlers.onClose?.()
      return false
    }
    ws = connection
    connection.onopen = () => { if (ws === connection) handlers.onOpen?.() }
    connection.onclose = () => { if (ws === connection) handlers.onClose?.() }
    connection.onmessage = event => {
      if (ws !== connection) return
      let message
      try { message = JSON.parse(event.data) } catch { return }
      handlers.onMessage?.(message)
    }
    return true
  }

  function send(message) {
    if (ws?.readyState !== WebSocket.OPEN) return false
    try {
      ws.send(JSON.stringify(message))
      return true
    } catch {
      return false
    }
  }

  return { connect, send }
}
