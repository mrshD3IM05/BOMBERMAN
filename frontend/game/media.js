import { on } from '../framework/index.js'
import { playSound, muteSounds, unlockSounds } from '../lib/sound.js'
import { CHARACTERS } from '../data/characters.js'
import { store } from '../store.js'

export function startSounds() {
  const unlock = () => { unlockSounds() }
  const stopPointer = on(document, 'pointerdown', unlock)
  const stopKeyboard = on(document, 'keydown', unlock)
  return () => {
    stopPointer()
    stopKeyboard()
  }
}

export function toggleSound() {
  const soundEnabled = !store.getState().soundEnabled
  muteSounds(!soundEnabled)
  store.setState({ soundEnabled })
}

// Every time my character is assigned or picked. A new pick cuts the old intro.
export function playIntro(id) {
  const character = CHARACTERS[id - 1]
  return playSound(character?.intro, 'intro')
}

// Compare network snapshots so renders and repeated states cannot replay damage.
export function playDeathSounds(previousGame, nextGame, play = playSound) {
  if (!previousGame) return
  for (const player of nextGame.players) {
    const previous = previousGame.players.find(other => other.id === player.id)
    const sound = CHARACTERS[player.character - 1]?.death
    if (previous && player.lives < previous.lives && !player.forfeited && sound) play(sound)
  }
}

export function playWinSound(game, winner, play = playSound) {
  const player = game?.players.find(player => player.name === winner)
  const sound = player && CHARACTERS[player.character - 1]?.win
  if (sound) play(sound)
}

// Decode every character image before allowing entry to the lobby.
// Kept in a variable so the browser does not drop the decoded images.
let images = []

export async function loadCharacters() {
  store.setState({ charactersStatus: 'loading' })
  try {
    images = CHARACTERS.map(({ image }) => Object.assign(new Image(), { src: image }))
    await Promise.all(images.map(image => image.decode()))
    store.setState({ charactersStatus: 'ready' })
  } catch {
    store.setState({ charactersStatus: 'error' })
  }
}
