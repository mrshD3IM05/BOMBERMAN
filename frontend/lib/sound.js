// Decode each recording once. Only clips on the same channel replace each other.
let context = null
let output = null
let muted = false
const buffers = new Map()
const channels = new Map()

export async function unlockSounds() {
  const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext
  if (!AudioContext) return false
  try {
    if (!context) {
      context = new AudioContext()
      output = context.createGain()
      output.gain.value = muted ? 0 : 0.5
      output.connect(context.destination)
    }
    if (context.state !== 'running') await context.resume()
    return context.state === 'running'
  } catch {
    return false
  }
}

async function loadSound(url) {
  if (!buffers.has(url)) {
    const loading = (async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Recording unavailable')
      return context.decodeAudioData(await response.arrayBuffer())
    })()
    buffers.set(url, loading)
    loading.catch(() => buffers.delete(url))
  }
  return buffers.get(url)
}

export async function playSound(url, channel = null) {
  if (channel !== null) {
    const previous = channels.get(channel)
    channels.delete(channel)
    previous?.source?.stop()
  }
  if (!url || muted || context?.state !== 'running') return false
  const playback = channel !== null ? {} : null
  if (playback) channels.set(channel, playback)
  try {
    const buffer = await loadSound(url)
    // A character switch can arrive while its previous recording is loading.
    if (playback && channels.get(channel) !== playback) return false
    if (muted || context.state !== 'running') return false
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(output)
    source.onended = () => {
      source.disconnect()
      if (playback && channels.get(channel) === playback) channels.delete(channel)
    }
    source.start()
    if (playback) playback.source = source
    return true
  } catch {
    return false
  } finally {
    if (playback && !playback.source && channels.get(channel) === playback) channels.delete(channel)
  }
}

export function muteSounds(value) {
  muted = Boolean(value)
  if (output) output.gain.setValueAtTime(muted ? 0 : 0.5, context.currentTime)
}
