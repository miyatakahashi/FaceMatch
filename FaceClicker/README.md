# FaceClicker

A colorful face-matching game built with [Phaser 3.80](https://phaser.io/). Click pairs of same-colored faces to make them happy!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Phaser](https://img.shields.io/badge/Phaser-3.80-blue)

## How to Play

1. **Click a frowning face** to select it — it will grow and glow.
2. **Click a second face** of the **same color** to make a match. Both faces will smile and burst with particles!
3. If the colors don't match, both faces shake and deselect.
4. Match all 5 pairs to win. Confetti ensues.

## Getting Started

### Prerequisites

- Any static HTTP server (e.g. VS Code [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, Python's `http.server`, Node's `http-server`)

> **Note:** Phaser loads assets over HTTP. Opening `index.html` directly as `file://` will cause loading failures.

### Running

1. Clone the repo
2. Serve the project root with your static server
3. Open `index.html` in a browser

```bash
# Python
python -m http.server 8000

# Node (npx)
npx http-server -p 8000
```

Then visit `http://localhost:8000`.

## Project Structure

```
FaceClicker/
├── index.html          # Entry point — loads Phaser, GameScene, then main.js
├── main.js             # Phaser.Game config (800×600, white background)
├── src/
│   └── GameScene.js    # All game logic (spawning, matching, animations, win state)
└── assets/
    ├── {color}_body_circle.png   # Body sprites (blue, green, pink, purple, red, yellow)
    └── face_{expression}_{eye_state}.png  # Face overlays
```

### Key Architecture Notes

- **No build step** — plain `<script>` tags, global classes.
- **Script order matters** — `src/GameScene.js` must load before `main.js` in `index.html` because `main.js` references the `GameScene` global.
- All game logic lives in `src/GameScene.js` as a single `Phaser.Scene` class.

## Credits

Art assets from the [Shape Characters](https://kenney.nl/assets/shape-characters) asset pack by [Kenney](https://kenney.nl/), with gratitude.

## License

This project is open source. See individual asset licenses at [kenney.nl](https://kenney.nl/).
