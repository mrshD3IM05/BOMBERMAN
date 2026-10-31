# Assets

- `textures/`: map, bomb, heart and power-up images.
- `characters/<folder>/`: one folder per character (see `data/characters.js`), with
  `player.webp` (the picture) and `intro.mp3` (played when the character is picked).
  Add `death.mp3` for life loss and `win.mp3` for the winner announcement.

The roster derives every asset URL from the character folder. Switching a
character stops its old intro, even if the new recording is missing. Decoded
recordings are cached, simultaneous deaths can overlap, and mute controls all
recordings. Initial snapshots, forfeits and draws stay silent.
