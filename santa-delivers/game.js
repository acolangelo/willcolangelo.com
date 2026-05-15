const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const comboEl = document.querySelector("#combo");
const messageEl = document.querySelector("#message");
const startButton = document.querySelector("#startButton");
const dropButton = document.querySelector("#dropButton");
const zoomOutButton = document.querySelector("#zoomOutButton");
const zoomInButton = document.querySelector("#zoomInButton");

const STORAGE_KEY = "santa-delivers-best";
const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;
const WORLD_WIDTH = 3200;
const WORLD_TOP = -1200;
const WORLD_BOTTOM = BASE_HEIGHT;
const WORLD_HEIGHT = WORLD_BOTTOM - WORLD_TOP;
const GROUND_Y = 430;
const SANTA_START_X = 190;
const SANTA_START_Y = 96;
const SANTA_SPEED = 250;
const BOOST_SPEED = 720;
const BOOST_KICK = 86;
const PRESENT_SIZE = 18;
const MAX_MISSES = 10;
const MIN_ZOOM = 0.82;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.14;
const SCENE_LEFT = 0;
const SCENE_WIDTH = WORLD_WIDTH;
const keys = new Set();

const state = {
  running: false,
  over: false,
  lastTime: 0,
  elapsed: 0,
  santaX: SANTA_START_X,
  santaY: SANTA_START_Y,
  santaVx: 0,
  santaVy: 0,
  boosting: false,
  boostFlash: 0,
  zoom: 1,
  score: 0,
  combo: 0,
  misses: 0,
  best: Number(localStorage.getItem(STORAGE_KEY) || 0),
  snow: [],
  houses: [],
  presents: [],
  sparkles: [],
  clouds: [],
  trees: [],
};

bestEl.textContent = state.best;

function fitCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(window.innerWidth));
  const height = Math.max(420, Math.floor(window.innerHeight));

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.scale(pixelRatio, pixelRatio);

  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  state.view = {
    width,
    height,
    scale,
    offsetX: (width - BASE_WIDTH * scale) / 2,
    offsetY: (height - BASE_HEIGHT * scale) / 2,
  };
}

function resetRun() {
  state.running = true;
  state.over = false;
  state.lastTime = performance.now();
  state.elapsed = 0;
  state.santaX = SANTA_START_X;
  state.santaY = SANTA_START_Y;
  state.santaVx = 0;
  state.santaVy = 0;
  state.boosting = false;
  state.boostFlash = 0;
  state.zoom = 1;
  state.score = 0;
  state.combo = 0;
  state.misses = 0;
  state.houses = [];
  state.presents = [];
  state.sparkles = [];
  state.snow = makeSnow();
  state.clouds = makeClouds();
  state.trees = makeTrees();
  messageEl.classList.remove("is-visible");
  spawnVillage();
  updateHud();
}

function makeSnow() {
  return Array.from({ length: 90 }, () => ({
    x: SCENE_LEFT + Math.random() * SCENE_WIDTH,
    y: WORLD_TOP + Math.random() * WORLD_HEIGHT,
    size: Math.random() > 0.75 ? 3 : 2,
    speed: 18 + Math.random() * 36,
    drift: -14 + Math.random() * 28,
  }));
}

function makeClouds() {
  return Array.from({ length: 38 }, (_, index) => ({
    x: (index * 260 + Math.random() * 150) % WORLD_WIDTH,
    y: WORLD_TOP + 90 + Math.random() * 1120,
    width: 120 + Math.random() * 60,
  }));
}

function makeTrees() {
  return Array.from({ length: 36 }, (_, index) => ({
    x: index * 92 + Math.random() * 42,
    y: GROUND_Y + 3 + Math.random() * 24,
    height: 40 + Math.random() * 34,
  }));
}

function spawnVillage() {
  let x = 90;
  while (x < WORLD_WIDTH - 180) {
    spawnHouse(x);
    x += randomInt(165, 245);
  }
}

function spawnHouse(x) {
  const width = randomInt(92, 144);
  const height = randomInt(72, 132);
  const roof = randomFrom(["red", "green", "blue", "plum"]);
  const body = randomFrom(["cream", "mint", "rose", "amber", "ice"]);
  const chimneyWidth = 24;
  const chimneyHeight = 48;
  const chimneySide = randomFrom(["left", "right"]);
  const chimneyX =
    chimneySide === "left"
      ? randomInt(16, Math.max(18, Math.floor(width * 0.3)))
      : randomInt(
          Math.min(width - chimneyWidth - 18, Math.floor(width * 0.66)),
          width - chimneyWidth - 14,
        );
  const chimneyY = GROUND_Y - height - 56;

  state.houses.push({
    x,
    y: GROUND_Y - height,
    width,
    height,
    roof,
    body,
    chimney: {
      x: chimneyX,
      y: chimneyY,
      width: chimneyWidth,
      height: chimneyHeight,
      scored: false,
      flash: 0,
    },
    lights: Math.random() > 0.45,
  });
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dropPresent() {
  if (!state.running) {
    resetRun();
    return;
  }

  if (state.presents.length > 5) return;

  state.presents.push({
    x: state.santaX + 96,
    y: state.santaY + 50,
    vx: state.santaVx * 0.12,
    vy: 44,
    spin: 0,
    hit: false,
  });
}

function endRun() {
  state.running = false;
  state.over = true;
  state.best = Math.max(state.best, state.score);
  localStorage.setItem(STORAGE_KEY, String(state.best));
  bestEl.textContent = state.best;
  messageEl.querySelector("h1").textContent = "Run Complete";
  messageEl.querySelector("p").textContent = `Score ${state.score}. Land presents cleanly to build the combo.`;
  startButton.textContent = "Play Again";
  messageEl.classList.add("is-visible");
}

function updateHud() {
  scoreEl.textContent = state.score;
  comboEl.textContent = state.combo;
  bestEl.textContent = state.best;
}

function update(delta) {
  if (!state.running) {
    updateIdle(delta);
    return;
  }

  state.elapsed += delta;
  updateSanta(delta);

  for (const house of state.houses) {
    if (house.chimney.flash > 0) house.chimney.flash -= delta;
  }

  updateSnow(delta);
  updatePresents(delta);
  updateSparkles(delta);
}

function updateSanta(delta) {
  const boosting = keys.has("KeyZ");
  const movement = getMovementVector(boosting);
  const speed = boosting ? BOOST_SPEED : SANTA_SPEED;

  state.boosting = boosting;
  state.boostFlash = Math.max(0, state.boostFlash - delta);
  state.santaVx = movement.x * speed;
  state.santaVy = movement.y * speed;
  moveSanta(state.santaVx * delta, state.santaVy * delta);
}

function getMovementVector(boosting = false) {
  let horizontal = Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
  let vertical = Number(keys.has("ArrowDown")) - Number(keys.has("ArrowUp"));

  if (boosting && horizontal === 0 && vertical === 0) horizontal = 1;

  const diagonal = horizontal !== 0 && vertical !== 0 ? Math.SQRT1_2 : 1;
  return {
    x: horizontal * diagonal,
    y: vertical * diagonal,
  };
}

function boostKick() {
  if (!state.running) return;

  const movement = getMovementVector(true);
  state.boostFlash = 0.48;
  moveSanta(movement.x * BOOST_KICK, movement.y * BOOST_KICK);
}

function nudgeSanta(code) {
  if (!state.running) return;

  const step = 18;
  const moves = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const move = moves[code];
  if (move) moveSanta(move[0], move[1]);
}

function moveSanta(dx, dy) {
  state.santaX = clamp(state.santaX + dx, 34, WORLD_WIDTH - 318);
  state.santaY = clamp(state.santaY + dy, WORLD_TOP + 78, 252);
}

function changeZoom(direction) {
  state.zoom = clamp(state.zoom + direction * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
}

function resetZoom() {
  state.zoom = 1;
}

function updateIdle(delta) {
  state.elapsed += delta;
  state.boosting = false;
  state.boostFlash = Math.max(0, state.boostFlash - delta);
  updateSnow(delta);
  updateSparkles(delta);
}

function updateSnow(delta) {
  for (const flake of state.snow) {
    flake.x += flake.drift * delta;
    flake.y += flake.speed * delta;

    if (flake.y > BASE_HEIGHT + 8) {
      flake.y = WORLD_TOP - 8;
      flake.x = SCENE_LEFT + Math.random() * SCENE_WIDTH;
    }
    if (flake.x < SCENE_LEFT - 8) flake.x = SCENE_LEFT + SCENE_WIDTH + 8;
    if (flake.x > SCENE_LEFT + SCENE_WIDTH + 8) flake.x = SCENE_LEFT - 8;
  }
}

function updatePresents(delta) {
  for (const present of state.presents) {
    present.x += present.vx * delta;
    present.y += present.vy * delta;
    present.vy += 410 * delta;
    present.spin += delta * 7;

    const hitHouse = findChimneyHit(present);
    if (hitHouse) {
      scoreHit(hitHouse, present);
    } else if (present.y > GROUND_Y + 36 && !present.hit) {
      present.hit = true;
      state.combo = 0;
      state.misses += 1;
      updateHud();
      burst(present.x, GROUND_Y + 20, "#dcefff", 8);
      if (state.misses >= MAX_MISSES) endRun();
    }
  }

  state.presents = state.presents.filter((present) => present.y < BASE_HEIGHT + 80 && !present.remove);
}

function findChimneyHit(present) {
  const giftLeft = present.x - PRESENT_SIZE / 2;
  const giftRight = present.x + PRESENT_SIZE / 2;
  const giftBottom = present.y + PRESENT_SIZE / 2;

  for (const house of state.houses) {
    const chimney = house.chimney;
    if (chimney.scored) continue;

    const left = house.x + chimney.x;
    const right = left + chimney.width;
    const top = chimney.y;
    const targetBottom = top + chimney.height + 10;

    const insideX = giftRight > left + 2 && giftLeft < right - 2;
    const insideY = giftBottom >= top + 4 && giftBottom <= targetBottom;
    const descending = present.vy > 0;

    if (insideX && insideY && descending) return house;
  }

  return null;
}

function scoreHit(house, present) {
  const chimney = house.chimney;
  chimney.scored = true;
  chimney.flash = 0.45;
  present.remove = true;
  present.hit = true;
  state.combo += 1;
  state.misses = 0;
  state.score += 10 + Math.min(50, state.combo * 5);
  burst(house.x + chimney.x + chimney.width / 2, chimney.y + 8, "#ffd56a", 16);
  burst(house.x + chimney.x + chimney.width / 2, chimney.y + 8, "#93e2c7", 10);
  updateHud();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    state.sparkles.push({
      x,
      y,
      vx: -80 + Math.random() * 160,
      vy: -120 + Math.random() * 70,
      size: randomFrom([3, 3, 6]),
      color,
      life: 0.55 + Math.random() * 0.28,
      maxLife: 0.83,
    });
  }
}

function updateSparkles(delta) {
  for (const sparkle of state.sparkles) {
    sparkle.x += sparkle.vx * delta;
    sparkle.y += sparkle.vy * delta;
    sparkle.vy += 240 * delta;
    sparkle.life -= delta;
  }
  state.sparkles = state.sparkles.filter((sparkle) => sparkle.life > 0);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const camera = getCamera();

  ctx.save();
  ctx.translate(state.view.offsetX, state.view.offsetY);
  ctx.scale(state.view.scale, state.view.scale);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  drawSky();
  drawClouds();
  drawMoon();
  drawDistantHills();
  drawTrees();
  drawHouses();
  drawGround();
  drawSanta();
  drawPresents();
  drawSparkles();
  drawSnow();
  drawMisses();

  ctx.restore();
}

function getCamera() {
  const zoom = state.zoom;
  const visibleWidth = BASE_WIDTH / zoom;
  const visibleHeight = BASE_HEIGHT / zoom;
  const focusX = state.santaX + 150;
  const focusY = state.santaY + 92;

  return {
    zoom,
    x: cameraAxis(focusX, visibleWidth, WORLD_WIDTH, 0.4),
    y: cameraAxis(focusY, visibleHeight, WORLD_HEIGHT, 0.38, WORLD_TOP),
  };
}

function cameraAxis(focus, visibleSize, worldSize, anchor, worldMin = 0) {
  if (visibleSize >= worldSize) return worldMin + (worldSize - visibleSize) / 2;
  return clamp(focus - visibleSize * anchor, worldMin, worldMin + worldSize - visibleSize);
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, WORLD_TOP, 0, BASE_HEIGHT);
  gradient.addColorStop(0, "#152448");
  gradient.addColorStop(0.48, "#22385f");
  gradient.addColorStop(0.78, "#4e809f");
  gradient.addColorStop(1, "#d9f1fb");
  ctx.fillStyle = gradient;
  ctx.fillRect(SCENE_LEFT, WORLD_TOP, SCENE_WIDTH, WORLD_HEIGHT + BASE_HEIGHT);

  ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
  for (let i = 0; i < 180; i += 1) {
    const x = SCENE_LEFT + ((i * 137 + 19) % SCENE_WIDTH);
    const y = WORLD_TOP + 42 + ((i * 83) % (WORLD_HEIGHT - 300));
    pixel(x, y, 3, 3);
  }
}

function drawClouds() {
  for (const cloud of state.clouds) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    pixel(cloud.x, cloud.y + 16, cloud.width, 18);
    pixel(cloud.x + 24, cloud.y, cloud.width * 0.34, 34);
    pixel(cloud.x + 58, cloud.y + 8, cloud.width * 0.42, 28);
    pixel(cloud.x + cloud.width - 28, cloud.y + 18, 36, 16);
  }
}

function drawMoon() {
  ctx.fillStyle = "#f7e8a3";
  pixel(802, 46, 42, 42);
  ctx.fillStyle = "#22385f";
  pixel(790, 39, 36, 42);
}

function drawDistantHills() {
  ctx.fillStyle = "#b5d6e6";
  pixel(SCENE_LEFT, 346, SCENE_WIDTH, 94);
  ctx.fillStyle = "#dff4fb";
  for (let x = SCENE_LEFT - 80; x < SCENE_LEFT + SCENE_WIDTH + 80; x += 160) {
    triangle(x, 350, x + 80, 250, x + 170, 350);
  }
  ctx.fillStyle = "#8fb8cd";
  pixel(SCENE_LEFT, 388, SCENE_WIDTH, 50);
}

function drawTrees() {
  for (const tree of state.trees) {
    ctx.fillStyle = "#315f58";
    triangle(tree.x, tree.y, tree.x + 20, tree.y - tree.height, tree.x + 42, tree.y);
    ctx.fillStyle = "#244942";
    triangle(tree.x + 4, tree.y - 18, tree.x + 21, tree.y - tree.height - 20, tree.x + 38, tree.y - 18);
    ctx.fillStyle = "#8d5a3c";
    pixel(tree.x + 17, tree.y - 4, 8, 18);
    ctx.fillStyle = "#f4fbff";
    pixel(tree.x + 13, tree.y - tree.height + 6, 15, 7);
  }
}

function drawHouses() {
  for (const house of state.houses) {
    drawHouse(house);
  }
}

function drawHouse(house) {
  const roofColors = {
    red: "#a73b43",
    green: "#2c7565",
    blue: "#386d9f",
    plum: "#735184",
  };
  const bodyColors = {
    cream: "#f3d8a6",
    mint: "#9dd8bb",
    rose: "#eab1b6",
    amber: "#e2b86b",
    ice: "#bddcea",
  };

  const x = Math.round(house.x);
  const y = house.y;
  const roofColor = roofColors[house.roof];
  const bodyColor = bodyColors[house.body];

  ctx.fillStyle = roofColor;
  triangle(x - 14, y + 4, x + house.width / 2, y - 55, x + house.width + 14, y + 4);
  ctx.fillStyle = "#fff8f2";
  pixel(x - 4, y - 4, house.width + 8, 12);

  ctx.fillStyle = bodyColor;
  pixel(x, y, house.width, house.height);
  ctx.fillStyle = "rgba(37, 35, 48, 0.18)";
  pixel(x, y + house.height - 10, house.width, 10);

  const doorW = 24;
  const doorH = 42;
  ctx.fillStyle = "#784838";
  pixel(x + house.width / 2 - doorW / 2, y + house.height - doorH, doorW, doorH);
  ctx.fillStyle = "#ffd56a";
  pixel(x + house.width / 2 + 5, y + house.height - 22, 4, 4);

  drawWindow(x + 20, y + 32, house.lights);
  drawWindow(x + house.width - 44, y + 32, true);

  ctx.fillStyle = "#f5fbff";
  pixel(x - 8, y + house.height - 4, house.width + 16, 12);

  if (house.chimney.scored) {
    ctx.fillStyle = "#ffd56a";
    pixel(x + house.chimney.x + 5, house.chimney.y + 8, 10, 10);
  }

  drawChimney(house, x);
}

function drawChimney(house, houseX) {
  const chimney = house.chimney;
  const x = houseX + chimney.x;
  const y = chimney.y;

  ctx.fillStyle = "#6b3f35";
  pixel(x, y, chimney.width, chimney.height);
  ctx.fillStyle = "#8f4b3d";
  pixel(x + 4, y + 7, chimney.width - 4, 7);
  pixel(x, y + 23, chimney.width - 5, 7);
  pixel(x + 5, y + 39, chimney.width - 5, 6);
  ctx.fillStyle = "#4d2927";
  pixel(x, y + 14, chimney.width, 3);
  pixel(x, y + 31, chimney.width, 3);
  pixel(x + 11, y, 3, chimney.height);

  ctx.fillStyle = "#4d2927";
  pixel(x - 4, y - 9, chimney.width + 8, 10);
  ctx.fillStyle = chimney.flash > 0 ? "#ffe18a" : "#f5fbff";
  pixel(x - 6, y - 14, chimney.width + 12, 7);
  pixel(x - 3, y - 9, chimney.width + 6, 4);
  ctx.fillStyle = chimney.flash > 0 ? "#ffb94e" : "#1d2230";
  pixel(x + 5, y - 7, chimney.width - 10, 5);

  if (chimney.scored) {
    ctx.fillStyle = "#ffd56a";
    pixel(x + 7, y + 6, 10, 10);
    ctx.fillStyle = "#d83935";
    pixel(x + 11, y + 6, 3, 10);
    pixel(x + 7, y + 10, 10, 3);
  }
}

function drawWindow(x, y, lit) {
  ctx.fillStyle = lit ? "#ffd56a" : "#5e7692";
  pixel(x, y, 24, 22);
  ctx.fillStyle = "#5d4739";
  pixel(x + 10, y, 4, 22);
  pixel(x, y + 9, 24, 4);
}

function drawGround() {
  ctx.fillStyle = "#f7fcff";
  pixel(SCENE_LEFT, GROUND_Y, SCENE_WIDTH, BASE_HEIGHT * 2 - GROUND_Y);
  ctx.fillStyle = "#d7edf7";
  for (let x = SCENE_LEFT - 48; x < SCENE_LEFT + SCENE_WIDTH + 48; x += 48) {
    pixel(x, GROUND_Y + 22, 28, 5);
    pixel(x + 16, GROUND_Y + 62, 22, 5);
  }
}

function drawSanta() {
  const bob = Math.sin(state.elapsed * 5.5) * 5;
  const x = state.santaX;
  const y = state.santaY + bob;

  drawReindeer(x + 148, y + 18, 0);
  drawReindeer(x + 205, y + 22, 0.35);

  ctx.strokeStyle = "#2d2431";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 126, y + 43);
  ctx.lineTo(x + 174, y + 55);
  ctx.moveTo(x + 126, y + 48);
  ctx.lineTo(x + 232, y + 59);
  ctx.stroke();

  ctx.fillStyle = "#7d302e";
  pixel(x + 16, y + 38, 114, 32);
  ctx.fillStyle = "#c73531";
  pixel(x + 32, y + 20, 72, 34);
  ctx.fillStyle = "#f9fbff";
  pixel(x + 24, y + 17, 88, 8);
  pixel(x + 104, y + 40, 20, 11);
  ctx.fillStyle = "#f0bd75";
  pixel(x + 52, y + 3, 22, 20);
  ctx.fillStyle = "#f8f8f8";
  pixel(x + 45, y + 18, 34, 16);
  ctx.fillStyle = "#c73531";
  pixel(x + 41, y - 10, 36, 14);
  pixel(x + 72, y - 4, 13, 13);
  ctx.fillStyle = "#f8f8f8";
  pixel(x + 37, y - 2, 43, 8);
  pixel(x + 82, y + 5, 8, 8);
  ctx.fillStyle = "#1d2230";
  pixel(x + 66, y + 8, 4, 4);

  ctx.strokeStyle = "#471b1f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 68);
  ctx.quadraticCurveTo(x + 66, y + 90, x + 142, y + 66);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 72);
  ctx.lineTo(x + 126, y + 72);
  ctx.stroke();

  drawBoosters(x, y);

  ctx.fillStyle = "#315f58";
  pixel(x + 100, y + 18, 24, 24);
  ctx.fillStyle = "#ffd56a";
  pixel(x + 110, y + 18, 4, 24);
  pixel(x + 100, y + 28, 24, 4);
}

function drawBoosters(x, y) {
  const firing = state.boosting || state.boostFlash > 0;

  ctx.fillStyle = "#384252";
  pixel(x + 34, y + 71, 30, 11);
  pixel(x + 80, y + 71, 30, 11);
  ctx.fillStyle = "#6b7280";
  pixel(x + 39, y + 66, 20, 10);
  pixel(x + 85, y + 66, 20, 10);
  ctx.fillStyle = "#9aa4b2";
  pixel(x + 43, y + 68, 11, 3);
  pixel(x + 89, y + 68, 11, 3);
  ctx.fillStyle = "#7d5238";
  pixel(x + 35, y + 74, 8, 5);
  pixel(x + 82, y + 75, 9, 4);
  ctx.fillStyle = "#4d2927";
  pixel(x + 31, y + 73, 6, 7);
  pixel(x + 77, y + 73, 6, 7);
  ctx.fillStyle = "#1d2230";
  pixel(x + 27, y + 74, 6, 5);
  pixel(x + 73, y + 74, 6, 5);

  if (!firing) return;

  const pulse = Math.sin(state.elapsed * 30) > 0 ? 4 : 0;
  ctx.fillStyle = "#6ee7ff";
  pixel(x - 8 - pulse, y + 72, 38 + pulse, 9);
  pixel(x + 38 - pulse, y + 72, 38 + pulse, 9);
  ctx.fillStyle = "#ffd56a";
  pixel(x - 31 - pulse, y + 74, 25 + pulse, 5);
  pixel(x + 15 - pulse, y + 74, 25 + pulse, 5);
  ctx.fillStyle = "#ff7a2f";
  pixel(x - 49 - pulse, y + 75, 20 + pulse, 3);
  pixel(x - 2 - pulse, y + 75, 19 + pulse, 3);
}

function drawReindeer(x, y, phase) {
  const leg = Math.sin(state.elapsed * 9 + phase) * 5;
  ctx.fillStyle = "#7d5238";
  pixel(x + 18, y + 18, 52, 24);
  pixel(x + 63, y + 7, 22, 20);
  ctx.fillStyle = "#a87149";
  pixel(x + 75, y + 12, 18, 11);
  ctx.fillStyle = "#ec3e3a";
  pixel(x + 91, y + 15, 7, 7);
  ctx.fillStyle = "#241b17";
  pixel(x + 28, y + 38, 8, 24 + leg);
  pixel(x + 58, y + 38, 8, 24 - leg);
  ctx.fillStyle = "#e6c28a";
  pixel(x + 66, y - 3, 5, 15);
  pixel(x + 80, y - 6, 5, 18);
  pixel(x + 58, y - 8, 12, 5);
  pixel(x + 80, y - 12, 13, 5);
}

function drawPresents() {
  for (const present of state.presents) {
    ctx.save();
    ctx.translate(Math.round(present.x), Math.round(present.y));
    ctx.rotate(Math.sin(present.spin) * 0.2);
    ctx.fillStyle = "#d83935";
    pixel(-9, -9, 18, 18);
    ctx.fillStyle = "#ffd56a";
    pixel(-2, -9, 4, 18);
    pixel(-9, -2, 18, 4);
    ctx.fillStyle = "#ffffff";
    pixel(-4, -14, 8, 6);
    ctx.restore();
  }
}

function drawSparkles() {
  for (const sparkle of state.sparkles) {
    const alpha = Math.max(0, sparkle.life / sparkle.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = sparkle.color;
    pixel(sparkle.x, sparkle.y, sparkle.size, sparkle.size);
    ctx.globalAlpha = 1;
  }
}

function drawSnow() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  for (const flake of state.snow) {
    pixel(flake.x, flake.y, flake.size, flake.size);
  }
}

function drawMisses() {
  const x = 28;
  const y = BASE_HEIGHT - 38;
  for (let i = 0; i < MAX_MISSES; i += 1) {
    ctx.fillStyle = i < state.misses ? "#d83935" : "rgba(255, 255, 255, 0.54)";
    pixel(x + i * 24, y, 16, 16);
  }
}

function pixel(x, y, width, height) {
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(Math.round(x1), Math.round(y1));
  ctx.lineTo(Math.round(x2), Math.round(y2));
  ctx.lineTo(Math.round(x3), Math.round(y3));
  ctx.closePath();
  ctx.fill();
}

function loop(time) {
  const delta = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

function handlePrimaryAction(event) {
  event?.preventDefault();
  dropPresent();
}

window.addEventListener("resize", fitCanvas);
window.addEventListener("keydown", (event) => {
  if (event.key === "+" || event.code === "Equal" || event.code === "NumpadAdd") {
    event.preventDefault();
    changeZoom(1);
    return;
  }

  if (event.key === "-" || event.code === "Minus" || event.code === "NumpadSubtract") {
    event.preventDefault();
    changeZoom(-1);
    return;
  }

  if (event.code === "Digit0" || event.code === "Numpad0") {
    event.preventDefault();
    resetZoom();
    return;
  }

  if (event.code === "KeyZ") {
    event.preventDefault();
    if (!event.repeat) boostKick();
    keys.add(event.code);
    return;
  }

  if (event.code.startsWith("Arrow")) {
    event.preventDefault();
    if (!event.repeat) nudgeSanta(event.code);
    keys.add(event.code);
    return;
  }

  if (event.code === "Space" || event.code === "Enter") {
    handlePrimaryAction(event);
  }
});
window.addEventListener("keyup", (event) => {
  if (event.code === "KeyZ") {
    event.preventDefault();
    keys.delete(event.code);
    state.boosting = false;
    return;
  }

  if (event.code.startsWith("Arrow")) {
    event.preventDefault();
    keys.delete(event.code);
  }
});
window.addEventListener("blur", () => {
  keys.clear();
  state.boosting = false;
});

canvas.addEventListener("pointerdown", handlePrimaryAction);
dropButton.addEventListener("click", handlePrimaryAction);
zoomOutButton.addEventListener("click", () => changeZoom(-1));
zoomInButton.addEventListener("click", () => changeZoom(1));
startButton.addEventListener("click", () => resetRun());

fitCanvas();
state.snow = makeSnow();
state.clouds = makeClouds();
state.trees = makeTrees();
spawnVillage();
state.lastTime = performance.now();
requestAnimationFrame(loop);
