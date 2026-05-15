# Santa Delivers

A browser-based pixel art delivery game. Santa flies over a fixed winter village, and the player steers the sleigh from house to house while dropping presents into chimneys to score points and build a combo.

## Play

Open `index.html` in a browser.

For a local HTTP preview:

```sh
python3 -m http.server 5173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5173/`.

Controls:

- Use the Arrow keys to steer Santa's sleigh.
- Hold `Z` to fire the worn rocket boosters and move faster. Arrow keys choose the boost direction; with no arrow held, `Z` boosts forward.
- Press Space, Enter, click, or tap to drop a present.
- Press `+` or `-` to zoom the camera, and `0` to reset zoom.
- Ten missed presents ends the run.

The game stores the best score in local browser storage.
