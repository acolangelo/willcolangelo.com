const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const targetImage = document.querySelector("#targetImage");
const targetName = document.querySelector("#targetName");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const toast = document.querySelector("#toast");
const dpadButtons = document.querySelectorAll(".dpad-button");

const preyTypes = [
  {
    id: "fish",
    name: "Fish",
    radius: 23,
    speed: 88,
    drawScale: 1.18,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="body" x1="12" y1="48" x2="85" y2="48" gradientUnits="userSpaceOnUse">
            <stop stop-color="#f2d66e"/>
            <stop offset=".45" stop-color="#55b9d4"/>
            <stop offset="1" stop-color="#1f5c7a"/>
          </linearGradient>
        </defs>
        <path fill="#d7a63f" d="M24 48L6 29c-3 12-3 26 0 38l18-19z"/>
        <path fill="#f0c853" d="M28 36c-7-6-14-8-22-7 7 5 11 11 14 19l8-12zM28 60c-7 6-14 8-22 7 7-5 11-11 14-19l8 12z"/>
        <path fill="url(#body)" d="M18 48c12-22 50-28 69-2-9 24-51 30-69 2z"/>
        <path fill="#f8efd2" opacity=".72" d="M31 58c15 7 36 6 51-5-11 15-38 18-51 5z"/>
        <path fill="#315466" d="M43 28c5 7 7 14 5 20l-8-1c2-8 0-14-5-18l8-1zM57 29c5 8 7 16 5 24l-8-2c2-8 0-15-5-21l8-1z"/>
        <path fill="#e6b84f" d="M47 25c10-5 20-4 31 2-11 2-21 7-30 14l-1-16z"/>
        <path fill="#a54535" d="M50 70c9 3 18 1 28-5-9-1-18-4-27-10l-1 15z"/>
        <circle cx="74" cy="43" r="4.4" fill="#07131a"/>
        <circle cx="75.5" cy="41.5" r="1.4" fill="#f8ffff"/>
        <path fill="none" stroke="#0d3446" stroke-linecap="round" stroke-width="2.5" d="M81 49c-4 3-8 4-12 3"/>
      </svg>
    `,
  },
  {
    id: "squid",
    name: "Squid",
    radius: 25,
    speed: 78,
    drawScale: 1.12,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="squidBody" x1="19" y1="48" x2="83" y2="48" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7c3a78"/>
            <stop offset=".5" stop-color="#e45c95"/>
            <stop offset="1" stop-color="#ffb7c8"/>
          </linearGradient>
        </defs>
        <path fill="url(#squidBody)" d="M84 48C69 24 43 18 20 28c4 14 4 26 0 40 24 10 49 4 64-20z"/>
        <path fill="#ffd3dd" opacity=".66" d="M68 39c-11-9-25-12-39-9 14 5 24 13 31 26 4-5 6-10 8-17z"/>
        <circle cx="70" cy="42" r="3.5" fill="#110916"/>
        <circle cx="70" cy="54" r="3.5" fill="#110916"/>
        <path fill="none" stroke="#e45c95" stroke-linecap="round" stroke-width="5" d="M25 34C14 30 7 31 3 38M24 43C13 42 6 46 3 54M24 53C13 55 7 61 5 69M26 62c-8 7-12 13-12 22M35 66c-4 7-5 13-2 20"/>
      </svg>
    `,
  },
  {
    id: "ammonite",
    name: "Ammonite",
    radius: 24,
    speed: 42,
    drawScale: 1.02,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <defs>
          <radialGradient id="shell" cx="43%" cy="42%" r="55%">
            <stop stop-color="#fff2b8"/>
            <stop offset=".58" stop-color="#d6a84f"/>
            <stop offset="1" stop-color="#7d5630"/>
          </radialGradient>
        </defs>
        <circle cx="48" cy="48" r="34" fill="url(#shell)"/>
        <path fill="none" stroke="#6b4528" stroke-linecap="round" stroke-width="6" d="M49 48c0-8-11-8-12 0-1 11 15 18 27 9 14-11 5-35-16-35-23 0-38 28-22 49 7 8 18 12 33 11"/>
        <path fill="none" stroke="#ffe8a0" stroke-linecap="round" stroke-width="4" d="M26 31c7-11 19-17 33-13"/>
        <path fill="#6b4528" opacity=".22" d="M74 64c-8 13-22 20-37 16 5 4 13 7 22 7 13 0 24-7 31-18l-16-5z"/>
      </svg>
    `,
  },
  {
    id: "crab",
    name: "Crab",
    radius: 24,
    speed: 56,
    drawScale: 1.06,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <path fill="none" stroke="#ff8c66" stroke-linecap="round" stroke-width="6" d="M26 57L10 67M70 57l16 10M29 67L17 79M67 67l12 12"/>
        <path fill="#fb604b" d="M24 18c-12 4-16 14-11 22 8 2 17-2 20-11l-9-11zM72 18c12 4 16 14 11 22-8 2-17-2-20-11l9-11z"/>
        <ellipse cx="48" cy="55" rx="29" ry="22" fill="#ef533f"/>
        <path fill="#ff9a72" d="M24 51c7-11 40-13 50 1-16-4-34-4-50-1z"/>
        <circle cx="39" cy="45" r="4" fill="#190d0d"/>
        <circle cx="57" cy="45" r="4" fill="#190d0d"/>
        <path fill="none" stroke="#9b2d31" stroke-linecap="round" stroke-width="4" d="M38 61c7 4 13 4 20 0"/>
      </svg>
    `,
  },
  {
    id: "turtle",
    name: "Turtle",
    radius: 26,
    speed: 62,
    drawScale: 1.2,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <path fill="#668f64" d="M76 44c9-1 15 3 18 9-5 6-13 7-22 1l4-10z"/>
        <path fill="#83b978" d="M23 35C12 29 6 30 2 38c7 8 16 9 27 2l-6-5zM25 61C13 66 8 74 10 84c11 0 18-6 23-19l-8-4zM61 30c3-12 10-19 20-20 4 11 0 20-12 27l-8-7zM62 67c6 10 14 15 25 13 1-11-5-18-19-22l-6 9z"/>
        <ellipse cx="48" cy="50" rx="31" ry="23" fill="#275d47"/>
        <ellipse cx="48" cy="49" rx="24" ry="18" fill="#8aa763"/>
        <path fill="#506a47" d="M29 47c6-10 15-15 27-15 9 2 16 8 22 17-7 9-16 15-29 17-10-2-17-8-20-19z"/>
        <path fill="none" stroke="#243f34" stroke-linecap="round" stroke-width="3" d="M48 32v34M29 48h49M37 36c6 8 16 9 25 1M36 61c7-8 19-8 27 0"/>
        <path fill="#83b978" d="M76 45c8-3 16 1 18 9-4 5-12 6-19 2l1-11z"/>
        <circle cx="82" cy="47" r="10" fill="#83b978"/>
        <circle cx="86" cy="44" r="2.4" fill="#07140f"/>
        <path fill="none" stroke="#4d7f58" stroke-linecap="round" stroke-width="2" d="M80 52c4 2 8 2 12 0"/>
      </svg>
    `,
  },
];

const mosasaurSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 112">
    <defs>
      <linearGradient id="mosaBody" x1="42" y1="24" x2="226" y2="76" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6c7f84"/>
        <stop offset=".48" stop-color="#43565c"/>
        <stop offset="1" stop-color="#26383f"/>
      </linearGradient>
      <linearGradient id="mosaBelly" x1="70" y1="65" x2="202" y2="86" gradientUnits="userSpaceOnUse">
        <stop stop-color="#9cafad"/>
        <stop offset=".65" stop-color="#6f8385"/>
        <stop offset="1" stop-color="#3a4a50"/>
      </linearGradient>
      <radialGradient id="mosaHighlight" cx="44%" cy="34%" r="55%">
        <stop stop-color="#9fb0b3" stop-opacity=".72"/>
        <stop offset=".55" stop-color="#72878a" stop-opacity=".22"/>
        <stop offset="1" stop-color="#26383f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <path fill="#34474e" d="M67 61C42 72 15 73 0 60c18-3 29-14 20-31 24 3 44 16 56 29l-9 3z"/>
    <path fill="#2a3d45" d="M11 59c18-5 25-14 25-25 12 8 23 17 36 24-20-5-38 1-61 1z"/>
    <path fill="url(#mosaBody)" d="M58 59c23-34 89-49 148-30 26 8 45 18 53 29-9 15-35 23-75 24-53 3-104-5-126-23z"/>
    <path fill="url(#mosaBelly)" d="M75 68c40 15 101 17 153-1-17 15-49 23-94 21-28-1-48-7-59-20z"/>
    <path fill="url(#mosaHighlight)" d="M73 54c29-25 89-35 134-20 7 3 14 6 19 10-43-9-93-5-153 10z"/>
    <path fill="#1f3037" d="M178 71c-9 18-24 29-45 33 4-17 17-32 43-43l2 10z"/>
    <path fill="#26383f" d="M111 78c-8 17-19 27-36 31 1-18 10-30 31-38l5 7z"/>
    <path fill="#1f3037" d="M158 34c-18-6-34-15-46-30 24 2 43 10 57 27l-11 3z"/>
    <path fill="#23343b" d="M197 30c24 0 49 7 62 21-20-1-39-1-61 2l-1-23z"/>
    <path fill="#273940" d="M197 61c20 4 39 3 60-3-10 12-32 19-61 17l1-14z"/>
    <path fill="#2b1718" d="M200 50c18-3 39 0 58 8-16 5-37 6-60 1l2-9z"/>
    <path fill="#d7e2e0" d="M216 47l5 7 4-7 5 8 4-8 5 8 4-7 5 8 4-6 4 6-2-10c-14-3-27-3-38 1z"/>
    <path fill="#edf4ef" d="M214 62l6-6 4 7 5-7 4 7 5-7 5 7 5-6 4 5c-14 4-27 4-38 0z"/>
    <path fill="#15242a" d="M198 34c13 2 25 5 36 10-13-3-26-4-39-2l3-8z"/>
    <circle cx="214" cy="36" r="3.2" fill="#071016"/>
    <circle cx="215" cy="35" r="1.1" fill="#eef8f7"/>
    <path fill="none" stroke="#1e2d34" stroke-linecap="round" stroke-width="3" d="M191 42c-5 6-4 13 2 20M152 31c-3 13-2 27 4 42M94 43c20-8 49-11 83-7"/>
    <path fill="#23343b" d="M73 40l5-10 4 9 5-11 5 10 5-11 5 10 5-9 5 8 5-8 5 8 5-7 5 7 5-6 5 6 4-5 5 6c-29-3-57-1-83 3z"/>
    <path fill="none" stroke="#819296" stroke-linecap="round" stroke-width="2" opacity=".45" d="M82 62c22 7 56 10 93 8M90 51c24-11 62-14 100-8"/>
  </svg>
`;

const assets = new Map();
const keysDown = new Set();
const TAU = Math.PI * 2;
const PREY_SIZE_MULTIPLIER = 1.26;
const SURFACE_RATIO = 0.17;
const MAX_PLAYER_GROWTH = 1;

const game = {
  width: 960,
  height: 540,
  worldWidth: 1440,
  worldHeight: 1080,
  cameraX: 0,
  cameraY: 0,
  dpr: 1,
  score: 0,
  streak: 0,
  target: null,
  targetIndex: -1,
  prey: [],
  ambientMosasaurs: [],
  swimmingDinosaurs: [],
  particles: [],
  lastTime: 0,
  currentToast: "",
  toastUntil: 0,
  player: {
    x: 480,
    y: 270,
    baseRadius: 52,
    baseBoundsRadius: 98,
    baseLength: 190,
    radius: 52,
    boundsRadius: 98,
    length: 190,
    growth: 0,
    dirX: 1,
    dirY: 0,
    angle: 0,
    moving: false,
    speed: 155,
  },
};

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function loadAssets() {
  const entries = [
    ["mosasaur", mosasaurSvg],
    ...preyTypes.map((type) => [type.id, type.svg]),
  ];

  await Promise.all(
    entries.map(async ([id, svg]) => {
      const src = svgToDataUri(svg);
      assets.set(id, {
        image: await loadImage(src),
        src,
      });
    }),
  );
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  game.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  game.width = Math.max(320, rect.width);
  game.height = Math.max(320, rect.height);
  updateWorldSize();
  canvas.width = Math.round(game.width * game.dpr);
  canvas.height = Math.round(game.height * game.dpr);
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  keepPlayerInside();
  updateCamera(1);

  if (game.ambientMosasaurs.length) {
    resetAmbientMosasaurs();
  }

  if (game.swimmingDinosaurs.length) {
    resetSwimmingDinosaurs();
  }
}

function updateWorldSize() {
  game.worldWidth = Math.max(game.width * 1.65, game.width + 520);
  game.worldHeight = Math.max(game.height * 2.15, game.height + 680);
}

function chooseTarget() {
  let next = Math.floor(Math.random() * preyTypes.length);
  if (preyTypes.length > 1 && next === game.targetIndex) {
    next = (next + 1 + Math.floor(Math.random() * (preyTypes.length - 1))) % preyTypes.length;
  }

  game.targetIndex = next;
  game.target = preyTypes[next];
  targetImage.src = assets.get(game.target.id).src;
  targetImage.alt = game.target.name;
  targetName.textContent = game.target.name;
}

function resetPreyField() {
  const count = game.width < 620 ? 5 : 8;
  const types = [game.target];

  while (types.length < count) {
    types.push(preyTypes[Math.floor(Math.random() * preyTypes.length)]);
  }

  const placed = [];

  game.prey = shuffle(types).map((type, index) => {
    const radius = type.radius * PREY_SIZE_MULTIPLIER;
    const position = findSpawnPosition(radius, placed);
    const angle = Math.random() * TAU;
    const prey = {
      id: `${type.id}-${Date.now()}-${index}`,
      type,
      x: position.x,
      y: position.y,
      radius,
      angle,
      desiredAngle: angle,
      speed: type.speed * (0.78 + Math.random() * 0.44),
      turnRate: 1.7 + Math.random() * 1.3,
      nextTurnAt: performance.now() + 500 + Math.random() * 1800,
      phase: Math.random() * Math.PI * 2,
      wobble: 4.2 + Math.random() * 2.4,
      eaten: false,
    };

    placed.push(prey);
    return prey;
  });
}

function resetAmbientMosasaurs() {
  const count = game.width < 620 ? 2 : 4;
  const top = getSurfaceY() + 54;
  const bottom = Math.max(top + 160, game.worldHeight * 0.78);

  game.ambientMosasaurs = Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * TAU;
    return {
      x: game.worldWidth * (0.14 + Math.random() * 0.72),
      y: top + Math.random() * Math.max(1, bottom - top),
      length: game.player.length * (0.56 + Math.random() * 0.22),
      angle,
      desiredAngle: angle,
      speed: 34 + Math.random() * 28,
      turnRate: 0.9 + Math.random() * 0.7,
      nextTurnAt: performance.now() + 700 + index * 380 + Math.random() * 1600,
      phase: Math.random() * TAU,
      alpha: 0.4 + Math.random() * 0.18,
    };
  });
}

function resetSwimmingDinosaurs() {
  const surfaceY = getSurfaceY();
  const count = game.width < 620 ? 2 : 3;

  game.swimmingDinosaurs = Array.from({ length: count }, (_, index) => {
    const type = index % 2 === 0 ? "spinosaur" : "hadrosaur";
    const angle = Math.random() > 0.5 ? 0 : Math.PI;
    return {
      type,
      x: game.worldWidth * (0.18 + Math.random() * 0.64),
      y: surfaceY + 54 + Math.random() * Math.max(70, game.height * 0.32),
      length: type === "spinosaur" ? 118 + Math.random() * 22 : 96 + Math.random() * 24,
      angle,
      desiredAngle: angle,
      speed: type === "spinosaur" ? 28 + Math.random() * 14 : 22 + Math.random() * 13,
      turnRate: 0.75 + Math.random() * 0.45,
      nextTurnAt: performance.now() + 1200 + Math.random() * 2400,
      phase: Math.random() * TAU,
      alpha: type === "spinosaur" ? 0.72 : 0.68,
    };
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function findSpawnPosition(radius, placed) {
  const margin = radius + 42;
  const minY = getSurfaceY() + margin;

  for (let tries = 0; tries < 120; tries += 1) {
    const point = {
      x: margin + Math.random() * Math.max(1, game.worldWidth - margin * 2),
      y: minY + Math.random() * Math.max(1, game.worldHeight - minY - margin),
    };

    const playerDistance = distance(point.x, point.y, game.player.x, game.player.y);
    const hasRoom = placed.every(
      (prey) => distance(point.x, point.y, prey.x, prey.y) > radius + prey.radius + 24,
    );

    if (playerDistance > 150 && hasRoom) {
      return point;
    }
  }

  return {
    x: margin + Math.random() * Math.max(1, game.worldWidth - margin * 2),
    y: minY + Math.random() * Math.max(1, game.worldHeight - minY - margin),
  };
}

function updateHud() {
  scoreEl.textContent = String(game.score);
  streakEl.textContent = String(game.streak);
}

function setDirection(dx, dy) {
  const length = Math.hypot(dx, dy);
  if (!length) {
    game.player.moving = false;
    return;
  }

  game.player.dirX = dx / length;
  game.player.dirY = dy / length;
  game.player.angle = Math.atan2(game.player.dirY, game.player.dirX);
  game.player.moving = true;
}

function updateDirectionFromKeys() {
  const dx = (keysDown.has("ArrowRight") ? 1 : 0) - (keysDown.has("ArrowLeft") ? 1 : 0);
  const dy = (keysDown.has("ArrowDown") ? 1 : 0) - (keysDown.has("ArrowUp") ? 1 : 0);
  setDirection(dx, dy);
}

function getSurfaceY() {
  return Math.max(72, game.height * SURFACE_RATIO);
}

function getPlayerScale() {
  return 1 + game.player.growth * 0.55;
}

function updatePlayerSize() {
  const scale = getPlayerScale();
  game.player.radius = game.player.baseRadius * scale;
  game.player.boundsRadius = game.player.baseBoundsRadius * scale;
  game.player.length = game.player.baseLength * scale;
}

function feedPlayer(prey) {
  const player = game.player;
  const bite = prey.radius > 30 ? 0.23 : 0.19;
  player.growth = clamp(player.growth + bite, 0, MAX_PLAYER_GROWTH);
  updatePlayerSize();
  keepPlayerInside();
}

function getPlayerBounds() {
  const sideMargin = game.player.boundsRadius;
  const surfaceMargin = game.player.length * 0.2;
  return {
    minX: sideMargin,
    maxX: game.worldWidth - sideMargin,
    minY: getSurfaceY() + surfaceMargin,
    maxY: game.worldHeight - game.player.boundsRadius,
  };
}

function keepPlayerInside() {
  const bounds = getPlayerBounds();
  game.player.x = clamp(game.player.x, bounds.minX, bounds.maxX);
  game.player.y = clamp(game.player.y, bounds.minY, bounds.maxY);
}

function movePlayer(delta) {
  const player = game.player;
  const { minX, maxX, minY, maxY } = getPlayerBounds();
  const nextX = player.x + player.dirX * player.speed * delta;
  const nextY = player.y + player.dirY * player.speed * delta;
  const hitX = nextX < minX || nextX > maxX;
  const hitY = nextY < minY || nextY > maxY;

  player.x = clamp(nextX, minX, maxX);
  player.y = clamp(nextY, minY, maxY);

  if (hitX || hitY) {
    const centerAngle = Math.atan2((minY + maxY) * 0.5 - player.y, (minX + maxX) * 0.5 - player.x);
    player.dirX = Math.cos(centerAngle);
    player.dirY = Math.sin(centerAngle);
    player.angle = centerAngle;

    const nudge = player.speed * delta;
    player.x = clamp(player.x + Math.cos(centerAngle) * nudge, minX, maxX);
    player.y = clamp(player.y + Math.sin(centerAngle) * nudge, minY, maxY);
  }
}

function updateCamera(delta) {
  const maxCameraX = Math.max(0, game.worldWidth - game.width);
  const maxCameraY = Math.max(0, game.worldHeight - game.height);
  const targetX = clamp(game.player.x - game.width * 0.5 + game.player.dirX * game.width * 0.1, 0, maxCameraX);
  const lookAhead = game.player.dirY * game.height * 0.12;
  const targetY = clamp(game.player.y - game.height * 0.52 + lookAhead, 0, maxCameraY);
  const follow = Math.min(1, delta * 4.4);
  game.cameraX += (targetX - game.cameraX) * follow;
  game.cameraY += (targetY - game.cameraY) * follow;
  game.cameraX = clamp(game.cameraX, 0, maxCameraX);
  game.cameraY = clamp(game.cameraY, 0, maxCameraY);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function shortestAngleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function update(delta, elapsed) {
  if (game.player.moving) {
    movePlayer(delta);
  }

  const now = performance.now();

  updateAmbientMosasaurs(delta, elapsed, now);
  updateSwimmingDinosaurs(delta, elapsed, now);

  for (const prey of game.prey) {
    if (now > prey.nextTurnAt) {
      prey.desiredAngle += (Math.random() - 0.5) * Math.PI * 1.45;
      prey.nextTurnAt = now + 850 + Math.random() * 2100;
    }

    const edgeMargin = prey.radius + 46;
    const minPreyY = getSurfaceY() + prey.radius;
    if (
      prey.x < edgeMargin ||
      prey.x > game.worldWidth - edgeMargin ||
      prey.y < minPreyY ||
      prey.y > game.worldHeight - edgeMargin
    ) {
      prey.desiredAngle = Math.atan2(
        game.cameraY + game.height * 0.5 - prey.y,
        game.cameraX + game.width * 0.5 - prey.x,
      );
    }

    const turn = shortestAngleDelta(prey.angle, prey.desiredAngle);
    prey.angle += clamp(turn, -prey.turnRate * delta, prey.turnRate * delta);

    const swimPulse = 0.84 + Math.sin(elapsed * prey.wobble + prey.phase) * 0.16;
    prey.x += Math.cos(prey.angle) * prey.speed * swimPulse * delta;
    prey.y += Math.sin(prey.angle) * prey.speed * swimPulse * delta;

    if (prey.x < prey.radius || prey.x > game.worldWidth - prey.radius) {
      prey.angle = Math.PI - prey.angle;
      prey.desiredAngle = prey.angle;
      prey.x = clamp(prey.x, prey.radius, game.worldWidth - prey.radius);
    }

    if (prey.y < minPreyY || prey.y > game.worldHeight - prey.radius) {
      prey.angle = -prey.angle;
      prey.desiredAngle = prey.angle;
      prey.y = clamp(prey.y, minPreyY, game.worldHeight - prey.radius);
    }
  }

  for (let i = game.prey.length - 1; i >= 0; i -= 1) {
    const prey = game.prey[i];
    if (prey.eaten) {
      continue;
    }

    const hitDistance = game.player.radius + prey.radius * 0.7;
    if (distance(game.player.x, game.player.y, prey.x, prey.y) <= hitDistance) {
      if (prey.type.id === game.target.id) {
        eatPrey(prey);
      } else {
        bumpPrey(prey);
      }
    }
  }

  for (let i = game.particles.length - 1; i >= 0; i -= 1) {
    const particle = game.particles[i];
    particle.life -= delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.size += 16 * delta;
    if (particle.life <= 0) {
      game.particles.splice(i, 1);
    }
  }

  if (game.currentToast && performance.now() > game.toastUntil) {
    hideToast();
  }

  updateCamera(delta);
}

function updateAmbientMosasaurs(delta, elapsed, now) {
  for (const mosasaur of game.ambientMosasaurs) {
    if (now > mosasaur.nextTurnAt) {
      mosasaur.desiredAngle += (Math.random() - 0.5) * Math.PI * 1.1;
      mosasaur.nextTurnAt = now + 1200 + Math.random() * 2600;
    }

    const margin = mosasaur.length * 0.56;
    const minY = getSurfaceY() + margin * 0.45;
    const reefTop = game.worldHeight * 0.82;
    if (
      mosasaur.x < margin ||
      mosasaur.x > game.worldWidth - margin ||
      mosasaur.y < minY ||
      mosasaur.y > reefTop
    ) {
      mosasaur.desiredAngle = Math.atan2(
        game.cameraY + game.height * 0.46 - mosasaur.y,
        game.cameraX + game.width * 0.5 - mosasaur.x,
      );
    }

    const playerDistance = distance(mosasaur.x, mosasaur.y, game.player.x, game.player.y);
    if (playerDistance < game.player.length * 1.45) {
      mosasaur.desiredAngle = Math.atan2(mosasaur.y - game.player.y, mosasaur.x - game.player.x);
    }

    const turn = shortestAngleDelta(mosasaur.angle, mosasaur.desiredAngle);
    mosasaur.angle += clamp(turn, -mosasaur.turnRate * delta, mosasaur.turnRate * delta);

    const pulse = 0.86 + Math.sin(elapsed * 3.1 + mosasaur.phase) * 0.14;
    mosasaur.x += Math.cos(mosasaur.angle) * mosasaur.speed * pulse * delta;
    mosasaur.y += Math.sin(mosasaur.angle) * mosasaur.speed * pulse * delta;
    mosasaur.x = clamp(mosasaur.x, margin, game.worldWidth - margin);
    mosasaur.y = clamp(mosasaur.y, minY, reefTop);
  }
}

function updateSwimmingDinosaurs(delta, elapsed, now) {
  const surfaceY = getSurfaceY();
  const maxY = surfaceY + game.height * 0.78;

  for (const dinosaur of game.swimmingDinosaurs) {
    if (now > dinosaur.nextTurnAt) {
      dinosaur.desiredAngle += (Math.random() - 0.5) * Math.PI * 0.7;
      dinosaur.nextTurnAt = now + 1500 + Math.random() * 2600;
    }

    const sideMargin = dinosaur.length * 0.55;
    if (
      dinosaur.x < sideMargin ||
      dinosaur.x > game.worldWidth - sideMargin ||
      dinosaur.y < surfaceY + 30 ||
      dinosaur.y > maxY
    ) {
      dinosaur.desiredAngle = Math.atan2(
        surfaceY + game.height * 0.28 - dinosaur.y,
        game.cameraX + game.width * 0.5 - dinosaur.x,
      );
    }

    const playerDistance = distance(dinosaur.x, dinosaur.y, game.player.x, game.player.y);
    if (playerDistance < game.player.length * 1.25) {
      dinosaur.desiredAngle = Math.atan2(dinosaur.y - game.player.y, dinosaur.x - game.player.x);
    }

    const turn = shortestAngleDelta(dinosaur.angle, dinosaur.desiredAngle);
    dinosaur.angle += clamp(turn, -dinosaur.turnRate * delta, dinosaur.turnRate * delta);

    const pulse = 0.86 + Math.sin(elapsed * 2.6 + dinosaur.phase) * 0.14;
    dinosaur.x += Math.cos(dinosaur.angle) * dinosaur.speed * pulse * delta;
    dinosaur.y += Math.sin(dinosaur.angle) * dinosaur.speed * pulse * delta;
    dinosaur.x = clamp(dinosaur.x, sideMargin, game.worldWidth - sideMargin);
    dinosaur.y = clamp(dinosaur.y, surfaceY + 30, maxY);
  }
}

function eatPrey(prey) {
  prey.eaten = true;
  feedPlayer(prey);
  game.score += 1;
  game.streak += 1;
  updateHud();
  burst(prey.x, prey.y, "#ffd166", 20);
  showToast(game.streak > 1 ? `Streak ${game.streak}` : "Hunt");

  chooseTarget();
  resetPreyField();
}

function bumpPrey(prey) {
  const angle = Math.atan2(prey.y - game.player.y, prey.x - game.player.x);
  const minPreyY = getSurfaceY() + prey.radius;
  prey.x = clamp(prey.x + Math.cos(angle) * 44, prey.radius, game.worldWidth - prey.radius);
  prey.y = clamp(prey.y + Math.sin(angle) * 44, minPreyY, game.worldHeight - prey.radius);
  prey.angle = angle;
  prey.desiredAngle = angle;
  prey.nextTurnAt = performance.now() + 450;
  game.streak = 0;
  updateHud();
  burst(prey.x, prey.y, "#ff7a66", 8);
  showToast("Not that one");
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 45 + Math.random() * 120;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      life: 0.35 + Math.random() * 0.4,
      color,
    });
  }
}

function showToast(message) {
  game.currentToast = message;
  game.toastUntil = performance.now() + 850;
  toast.textContent = message;
  toast.classList.add("is-visible");
}

function hideToast() {
  game.currentToast = "";
  toast.classList.remove("is-visible");
}

function draw(elapsed) {
  drawOcean(elapsed);

  ctx.save();
  ctx.translate(-game.cameraX, -game.cameraY);
  drawSwimmingDinosaurs(elapsed);
  drawAmbientMosasaurs(elapsed);
  drawPrey(elapsed);
  drawParticles();
  drawPlayer(elapsed);
  ctx.restore();
}

function drawOcean(elapsed) {
  const depth = game.cameraY / Math.max(1, game.worldHeight - game.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
  gradient.addColorStop(0, depth > 0.5 ? "#073b57" : "#17809b");
  gradient.addColorStop(0.34, depth > 0.5 ? "#062d47" : "#0b5d76");
  gradient.addColorStop(0.72, depth > 0.5 ? "#041f35" : "#0a3b55");
  gradient.addColorStop(1, depth > 0.5 ? "#031828" : "#09283f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.save();
  ctx.translate(-game.cameraX, -game.cameraY);
  drawPrehistoricSurface(elapsed);
  drawSunRays(elapsed);
  drawDistantReef(elapsed);
  drawReefFloor(elapsed);
  drawCoralReef(elapsed);
  drawWaterSpecks(elapsed);
  ctx.restore();
}

function drawPrehistoricSurface(elapsed) {
  const surfaceY = getSurfaceY();
  const sky = ctx.createLinearGradient(0, 0, 0, surfaceY);
  sky.addColorStop(0, "#d9c68b");
  sky.addColorStop(0.46, "#b9d2c0");
  sky.addColorStop(1, "#6fb0bd");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, game.worldWidth, surfaceY + 2);

  drawVolcanicShore(surfaceY, elapsed);
  drawLandDinosaurs(surfaceY, elapsed);

  ctx.save();
  const waterGlow = ctx.createLinearGradient(0, surfaceY - 10, 0, surfaceY + 34);
  waterGlow.addColorStop(0, "rgba(235, 250, 238, 0.46)");
  waterGlow.addColorStop(0.5, "rgba(86, 189, 196, 0.62)");
  waterGlow.addColorStop(1, "rgba(23, 128, 155, 0)");
  ctx.fillStyle = waterGlow;
  ctx.fillRect(0, surfaceY - 10, game.worldWidth, 46);

  ctx.strokeStyle = "rgba(244, 255, 240, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= game.worldWidth; x += 18) {
    const y = surfaceY + Math.sin(x * 0.032 + elapsed * 1.6) * 3;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(209, 245, 235, 0.36)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i += 1) {
    const y = surfaceY + 16 + i * 12;
    ctx.beginPath();
    for (let x = 0; x <= game.worldWidth; x += 30) {
      const waveY = y + Math.sin(x * 0.034 + elapsed * 1.2 + i) * 2.3;
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawVolcanicShore(surfaceY, elapsed) {
  ctx.save();

  ctx.fillStyle = "rgba(82, 91, 74, 0.44)";
  ctx.beginPath();
  ctx.moveTo(0, surfaceY - 16);
  ctx.lineTo(game.worldWidth * 0.14, surfaceY - 42);
  ctx.lineTo(game.worldWidth * 0.31, surfaceY - 18);
  ctx.lineTo(game.worldWidth * 0.46, surfaceY - 68);
  ctx.lineTo(game.worldWidth * 0.6, surfaceY - 21);
  ctx.lineTo(game.worldWidth * 0.82, surfaceY - 54);
  ctx.lineTo(game.worldWidth, surfaceY - 17);
  ctx.lineTo(game.worldWidth, surfaceY + 3);
  ctx.lineTo(0, surfaceY + 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a654a";
  ctx.beginPath();
  ctx.moveTo(0, surfaceY - 2);
  for (let x = 0; x <= game.worldWidth + 80; x += 80) {
    const y = surfaceY - 8 + Math.sin(x * 0.016 + elapsed * 0.15) * 4;
    ctx.quadraticCurveTo(x + 38, y - 12, x + 80, y);
  }
  ctx.lineTo(game.worldWidth, surfaceY + 6);
  ctx.lineTo(0, surfaceY + 6);
  ctx.closePath();
  ctx.fill();

  drawFernCluster(game.worldWidth * 0.08, surfaceY - 3, 0.8);
  drawFernCluster(game.worldWidth * 0.33, surfaceY - 4, 1.0);
  drawFernCluster(game.worldWidth * 0.69, surfaceY - 5, 0.9);
  drawFernCluster(game.worldWidth * 0.9, surfaceY - 3, 0.82);

  ctx.restore();
}

function drawFernCluster(x, y, scale) {
  ctx.save();
  ctx.strokeStyle = "#2f5d3f";
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";

  for (let i = -3; i <= 3; i += 1) {
    const angle = -Math.PI / 2 + i * 0.24;
    const length = (22 + Math.abs(i) * 4) * scale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();

    ctx.fillStyle = "#487b48";
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * length * 0.72,
      y + Math.sin(angle) * length * 0.72,
      5 * scale,
      2 * scale,
      angle,
      0,
      TAU,
    );
    ctx.fill();
  }

  ctx.restore();
}

function drawLandDinosaurs(surfaceY, elapsed) {
  drawSauropod(game.worldWidth * 0.2, surfaceY - 16, 0.58, elapsed);
  drawHoppingLandDinosaur("hadrosaur", game.worldWidth * 0.55, surfaceY, 0.62, elapsed, 0.12);
  drawHoppingLandDinosaur("spinosaur", game.worldWidth * 0.78, surfaceY, 0.55, elapsed, 0.62);
}

function drawHoppingLandDinosaur(type, baseX, surfaceY, scale, elapsed, offset) {
  const cycle = (elapsed * 0.16 + offset) % 1;
  const towardWater = cycle < 0.5;
  const phase = towardWater ? cycle / 0.5 : (cycle - 0.5) / 0.5;
  const smooth = phase * phase * (3 - 2 * phase);
  const direction = towardWater ? smooth : 1 - smooth;
  const hop = Math.sin(phase * Math.PI);
  const x = baseX + direction * 54 * scale;
  const y = surfaceY - 13 + direction * 35 * scale - hop * 34 * scale;
  const bodyAngle = (towardWater ? 0.08 : -0.1) * hop;

  drawJumpSplash(baseX + 52 * scale, surfaceY + 8, hop, direction);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyAngle);

  if (!towardWater) {
    ctx.scale(-1, 1);
  }

  if (type === "spinosaur") {
    drawSpinosaurOnShore(0, 0, scale, elapsed);
  } else {
    drawHadrosaurOnShore(0, 0, scale, elapsed);
  }

  ctx.restore();
}

function drawJumpSplash(x, y, hop, waterAmount) {
  if (waterAmount < 0.28 || waterAmount > 0.92) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = (0.22 + hop * 0.42) * Math.sin((waterAmount - 0.28) / 0.64 * Math.PI);
  ctx.strokeStyle = "rgba(226, 250, 242, 0.78)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 7, y);
    ctx.quadraticCurveTo(x + i * 10, y - 16 - hop * 12, x + i * 14, y - 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSauropod(x, y, scale, elapsed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(48, 64, 50, 0.9)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 17, -0.03, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(48, 64, 50, 0.9)";
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(30, -8);
  ctx.quadraticCurveTo(60, -44, 78 + Math.sin(elapsed) * 2, -34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-42, -3);
  ctx.quadraticCurveTo(-74, -18, -92, -9);
  ctx.stroke();
  ctx.lineWidth = 8;
  for (const legX of [-27, -8, 16, 34]) {
    ctx.beginPath();
    ctx.moveTo(legX, 12);
    ctx.lineTo(legX - 4, 34);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(86, -36, 9, 6, 0.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawHadrosaurOnShore(x, y, scale, elapsed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(73, 88, 52, 0.94)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 42, 18, 0.04, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-35, -2);
  ctx.quadraticCurveTo(-70, -20, -86, -11);
  ctx.lineTo(-36, 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(45, -13 + Math.sin(elapsed * 1.3) * 1.4, 18, 9, -0.2, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(73, 88, 52, 0.94)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const legX of [-18, 14]) {
    ctx.beginPath();
    ctx.moveTo(legX, 14);
    ctx.lineTo(legX - 5, 37);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpinosaurOnShore(x, y, scale, elapsed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(58, 70, 62, 0.94)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 17, 0.05, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(87, 96, 72, 0.95)";
  ctx.beginPath();
  ctx.moveTo(-28, -13);
  ctx.quadraticCurveTo(0, -48, 36, -13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(58, 70, 62, 0.94)";
  ctx.beginPath();
  ctx.moveTo(-38, -1);
  ctx.quadraticCurveTo(-74, -14, -92, -3);
  ctx.lineTo(-40, 9);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(55, -10 + Math.sin(elapsed) * 1.5, 23, 8, -0.12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(58, 70, 62, 0.94)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const legX of [-16, 16]) {
    ctx.beginPath();
    ctx.moveTo(legX, 13);
    ctx.lineTo(legX - 6, 36);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSunRays(elapsed) {
  const surfaceY = getSurfaceY();

  ctx.save();
  ctx.globalAlpha = Math.max(0.04, 0.16 - game.cameraY / game.worldHeight * 0.18);
  const rayCount = Math.ceil(game.worldWidth / 170) + 2;
  for (let i = -1; i < rayCount; i += 1) {
    const x = i * 170 + ((elapsed * 10) % 170);
    const rayGradient = ctx.createLinearGradient(x, surfaceY, x + 96, game.worldHeight);
    rayGradient.addColorStop(0, "rgba(255,255,255,0.42)");
    rayGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rayGradient;
    ctx.beginPath();
    ctx.moveTo(x, surfaceY);
    ctx.lineTo(x + 70, surfaceY);
    ctx.lineTo(x + 230, game.worldHeight);
    ctx.lineTo(x + 90, game.worldHeight);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawDistantReef(elapsed) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#113c47";
  ctx.beginPath();
  ctx.moveTo(0, game.worldHeight * 0.74);
  for (let x = 0; x <= game.worldWidth + 90; x += 90) {
    const y =
      game.worldHeight * 0.74 +
      Math.sin(x * 0.018 + elapsed * 0.28) * 10 +
      Math.cos(x * 0.011) * 18;
    ctx.quadraticCurveTo(x + 45, y - 28, x + 90, y);
  }
  ctx.lineTo(game.worldWidth, game.worldHeight);
  ctx.lineTo(0, game.worldHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawReefFloor(elapsed) {
  const floorTop = game.worldHeight * 0.86;
  const sand = ctx.createLinearGradient(0, floorTop, 0, game.worldHeight);
  sand.addColorStop(0, "#a7815c");
  sand.addColorStop(0.48, "#72583f");
  sand.addColorStop(1, "#3a342e");

  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.moveTo(0, floorTop + 18);
  for (let x = 0; x <= game.worldWidth + 70; x += 70) {
    const y = floorTop + Math.sin(x * 0.027 + elapsed * 0.12) * 7 + Math.cos(x * 0.013) * 11;
    ctx.quadraticCurveTo(x + 35, y - 12, x + 70, y);
  }
  ctx.lineTo(game.worldWidth, game.worldHeight);
  ctx.lineTo(0, game.worldHeight);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#ddc191";
  for (let i = 0; i < 34; i += 1) {
    const x = (i * 83) % game.worldWidth;
    const y = floorTop + 24 + ((i * 31) % Math.max(28, game.worldHeight - floorTop - 30));
    ctx.beginPath();
    ctx.ellipse(x, y, 2 + (i % 3), 1.2, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawCoralReef(elapsed) {
  const clusters = [
    { x: 0.05, scale: 0.95, hue: "#ef6f64" },
    { x: 0.18, scale: 1.2, hue: "#f1b35b" },
    { x: 0.31, scale: 1.05, hue: "#cb68a1" },
    { x: 0.45, scale: 0.85, hue: "#7ec070" },
    { x: 0.61, scale: 1.15, hue: "#e7687d" },
    { x: 0.78, scale: 1.0, hue: "#f0a55d" },
    { x: 0.92, scale: 1.25, hue: "#7cc5c3" },
  ];

  clusters.forEach((cluster, index) => {
    const baseX = cluster.x * game.worldWidth;
    const baseY = game.worldHeight - 22 - ((index * 9) % 28);
    const sway = Math.sin(elapsed * 1.4 + index) * 3;

    drawReefRock(baseX - 28 * cluster.scale, baseY + 8, 52 * cluster.scale, 24 * cluster.scale);
    drawBranchCoral(baseX + sway, baseY, cluster.scale, cluster.hue, elapsed + index);
    drawSeaFan(baseX + 32 * cluster.scale, baseY - 6, cluster.scale * 0.9, index % 2 ? "#a95db7" : "#e65d84");
    drawPlateCoral(baseX - 42 * cluster.scale, baseY - 7, cluster.scale, index % 2 ? "#c9a759" : "#d26464");
    drawSponge(baseX + 57 * cluster.scale, baseY - 3, cluster.scale, index % 2 ? "#f2a14a" : "#da6d50");
  });
}

function drawReefRock(x, y, width, height) {
  ctx.save();
  ctx.fillStyle = "#344448";
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, -0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(131, 154, 146, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - width * 0.25, y - height * 0.22, width * 0.42, height * 0.32, -0.15, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBranchCoral(x, y, scale, color, phase) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 5 * scale;

  for (let i = 0; i < 7; i += 1) {
    const angle = -Math.PI / 2 + (i - 3) * 0.22;
    const length = (42 + (i % 3) * 13) * scale;
    const bend = Math.sin(phase * 1.3 + i) * 6 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + Math.cos(angle) * length * 0.28 + bend,
      y + Math.sin(angle) * length * 0.28,
      x + Math.cos(angle) * length * 0.72 - bend,
      y + Math.sin(angle) * length * 0.72,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 229, 205, 0.48)";
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 8 * scale, y - 7 * scale);
  ctx.lineTo(x + 9 * scale, y - 38 * scale);
  ctx.stroke();
  ctx.restore();
}

function drawSeaFan(x, y, scale, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";

  for (let i = -4; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + i * 10 * scale,
      y - 34 * scale,
      x + i * 14 * scale,
      y - 58 * scale + Math.abs(i) * 4 * scale,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 218, 238, 0.42)";
  for (let j = 1; j <= 4; j += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 48 * scale + j * 8 * scale, y - 18 * scale - j * 8 * scale);
    ctx.quadraticCurveTo(x, y - 48 * scale, x + 48 * scale - j * 8 * scale, y - 18 * scale - j * 8 * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlateCoral(x, y, scale, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(
      x + i * 13 * scale,
      y - i * 7 * scale,
      (23 - i * 2) * scale,
      7 * scale,
      -0.22,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255, 239, 192, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x + 12 * scale, y - 13 * scale, 18 * scale, 4 * scale, -0.22, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSponge(x, y, scale, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 4; i += 1) {
    const height = (26 + i * 8) * scale;
    const width = (8 + i * 2) * scale;
    ctx.beginPath();
    ctx.roundRect(x + i * 10 * scale, y - height, width, height, width * 0.5);
    ctx.fill();
    ctx.fillStyle = i % 2 ? color : "#f5b26b";
  }
  ctx.fillStyle = "rgba(60, 37, 31, 0.45)";
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(x + (i * 7 + 4) * scale, y - (10 + (i % 3) * 10) * scale, 1.8 * scale, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawWaterSpecks(elapsed) {
  const surfaceY = getSurfaceY();
  ctx.save();
  ctx.fillStyle = "rgba(230, 250, 255, 0.16)";
  for (let i = 0; i < 70; i += 1) {
    const x = game.cameraX + ((i * 97 + elapsed * (8 + (i % 5) * 3)) % game.width);
    const waterDepth = Math.max(1, game.worldHeight - surfaceY);
    const rawY = i * 61 + Math.sin(elapsed * 0.8 + i) * 9;
    const y = surfaceY + ((rawY % waterDepth) + waterDepth) % waterDepth;
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + (i % 3) * 0.35, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawSwimmingDinosaurs(elapsed) {
  for (const dinosaur of game.swimmingDinosaurs) {
    drawDinosaurSwimTrail(dinosaur, elapsed);

    ctx.save();
    ctx.translate(dinosaur.x, dinosaur.y);
    ctx.rotate(dinosaur.angle + Math.sin(elapsed * 2.8 + dinosaur.phase) * 0.035);
    ctx.globalAlpha = dinosaur.alpha;

    if (dinosaur.type === "spinosaur") {
      drawSwimmingSpinosaur(dinosaur.length, elapsed + dinosaur.phase);
    } else {
      drawSwimmingHadrosaur(dinosaur.length, elapsed + dinosaur.phase);
    }

    ctx.restore();
  }
}

function drawDinosaurSwimTrail(dinosaur, elapsed) {
  const backAngle = dinosaur.angle + Math.PI;
  ctx.save();
  ctx.globalAlpha = 0.18 + Math.sin(elapsed * 4 + dinosaur.phase) * 0.05;
  ctx.strokeStyle = "rgba(215, 246, 239, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i += 1) {
    const x = dinosaur.x + Math.cos(backAngle) * (dinosaur.length * 0.38 + i * 12);
    const y = dinosaur.y + Math.sin(backAngle) * (dinosaur.length * 0.38 + i * 12) + (i - 1) * 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(backAngle) * 16, y + Math.sin(backAngle) * 16);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSwimmingSpinosaur(length, elapsed) {
  const scale = length / 130;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#566f66";
  ctx.beginPath();
  ctx.ellipse(0, 0, 47, 16, 0.04, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#7b865d";
  ctx.beginPath();
  ctx.moveTo(-28, -11);
  ctx.quadraticCurveTo(0, -43 - Math.sin(elapsed) * 3, 34, -10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#425a56";
  ctx.beginPath();
  ctx.moveTo(-40, -1);
  ctx.quadraticCurveTo(-78, -14, -96, -3);
  ctx.lineTo(-42, 10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(55, -8, 25, 8, -0.1, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#334846";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-15, 13);
  ctx.lineTo(-31, 30 + Math.sin(elapsed * 2) * 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, 12);
  ctx.lineTo(39, 24 + Math.cos(elapsed * 2) * 3);
  ctx.stroke();

  ctx.fillStyle = "#111d1e";
  ctx.beginPath();
  ctx.arc(65, -11, 2.2, 0, TAU);
  ctx.fill();
}

function drawSwimmingHadrosaur(length, elapsed) {
  const scale = length / 112;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#6f8b5d";
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 17, 0.02, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#506a4d";
  ctx.beginPath();
  ctx.moveTo(-36, -2);
  ctx.quadraticCurveTo(-76, -20, -94, -8);
  ctx.lineTo(-38, 9);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6f8b5d";
  ctx.beginPath();
  ctx.ellipse(48, -10, 19, 9, -0.18, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "#516c52";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-18, 13);
  ctx.lineTo(-36, 27 + Math.sin(elapsed * 2.2) * 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, 13);
  ctx.lineTo(33, 25 + Math.cos(elapsed * 2.2) * 3);
  ctx.stroke();

  ctx.fillStyle = "#101a13";
  ctx.beginPath();
  ctx.arc(56, -13, 2.1, 0, TAU);
  ctx.fill();
}

function drawAmbientMosasaurs(elapsed) {
  const asset = assets.get("mosasaur");

  for (const mosasaur of game.ambientMosasaurs) {
    const tailKick = Math.sin(elapsed * 5.2 + mosasaur.phase) * 0.055;
    const width = mosasaur.length;
    const height = mosasaur.length * 0.44;

    drawMosasaurTrail(mosasaur.x, mosasaur.y, mosasaur.angle, mosasaur.length, elapsed, mosasaur.phase, 0.18);

    ctx.save();
    ctx.translate(mosasaur.x, mosasaur.y);
    ctx.rotate(mosasaur.angle + tailKick);
    ctx.globalAlpha = mosasaur.alpha;
    ctx.shadowColor = "rgba(160, 193, 199, 0.22)";
    ctx.shadowBlur = 12;
    ctx.drawImage(asset.image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
}

function drawPrey(elapsed) {
  for (const prey of game.prey) {
    const asset = assets.get(prey.type.id);
    const size = prey.radius * 2.35 * (prey.type.drawScale || 1);
    const wobble = Math.sin(elapsed * prey.wobble + prey.phase) * 0.12;

    drawSwimTrail(prey, elapsed);

    if (prey.type.id === game.target.id) {
      drawTargetMarker(prey, elapsed);
    }

    ctx.save();
    ctx.translate(prey.x, prey.y);
    ctx.rotate(prey.angle + wobble);
    ctx.scale(1, 1 + Math.sin(elapsed * prey.wobble + prey.phase) * 0.035);
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.drawImage(asset.image, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

function drawSwimTrail(prey, elapsed) {
  const speedPulse = 0.45 + Math.sin(elapsed * prey.wobble + prey.phase) * 0.2;
  const backAngle = prey.angle + Math.PI;

  ctx.save();
  ctx.globalAlpha = clamp(speedPulse, 0.18, 0.46);
  ctx.strokeStyle = "rgba(207, 245, 248, 0.42)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";

  for (let i = 0; i < 3; i += 1) {
    const offset = prey.radius * 0.9 + i * 9;
    const side = (i - 1) * 5;
    const x = prey.x + Math.cos(backAngle) * offset + Math.cos(prey.angle + Math.PI / 2) * side;
    const y = prey.y + Math.sin(backAngle) * offset + Math.sin(prey.angle + Math.PI / 2) * side;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(backAngle) * 10, y + Math.sin(backAngle) * 10);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTargetMarker(prey, elapsed) {
  const radius = prey.radius * 1.45 + Math.sin(elapsed * 5) * 2;
  const corner = 10;

  ctx.save();
  ctx.translate(prey.x, prey.y);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const points = [
    [-radius, -radius, 1, 1],
    [radius, -radius, -1, 1],
    [radius, radius, -1, -1],
    [-radius, radius, 1, -1],
  ];

  for (const [x, y, sx, sy] of points) {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * corner, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPlayer(elapsed) {
  const asset = assets.get("mosasaur");
  const tailKick = game.player.moving ? Math.sin(elapsed * 9) * 0.05 : 0;
  const width = game.player.length;
  const height = game.player.length * 0.44;

  if (game.player.moving) {
    drawMosasaurTrail(
      game.player.x,
      game.player.y,
      game.player.angle,
      game.player.length,
      elapsed,
      0,
      0.28,
    );
  }

  ctx.save();
  ctx.translate(game.player.x, game.player.y);
  ctx.rotate(game.player.angle + tailKick);
  ctx.shadowColor = "rgba(190, 218, 222, 0.28)";
  ctx.shadowBlur = 20;
  ctx.drawImage(asset.image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawMosasaurTrail(x, y, angle, length, elapsed, phase, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * (0.78 + Math.sin(elapsed * 7 + phase) * 0.18);
  ctx.strokeStyle = "rgba(216, 246, 255, 0.54)";
  ctx.lineWidth = Math.max(1.5, length * 0.016);
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i += 1) {
    const side = (i - 1) * length * 0.095;
    const startX = x - Math.cos(angle) * (length * 0.38 + i * 8) + Math.cos(angle + Math.PI / 2) * side;
    const startY = y - Math.sin(angle) * (length * 0.38 + i * 8) + Math.sin(angle + Math.PI / 2) * side;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX - Math.cos(angle) * length * 0.16, startY - Math.sin(angle) * length * 0.16);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles() {
  for (const particle of game.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / 0.7);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function frame(now) {
  const elapsed = now / 1000;
  const delta = Math.min(0.034, game.lastTime ? (now - game.lastTime) / 1000 : 0);
  game.lastTime = now;

  update(delta, elapsed);
  draw(elapsed);
  requestAnimationFrame(frame);
}

function bootGame() {
  resizeCanvas();
  game.player.x = game.worldWidth * 0.5;
  game.player.y = getSurfaceY() + game.height * 0.38;
  updateCamera(1);
  resetAmbientMosasaurs();
  resetSwimmingDinosaurs();
  chooseTarget();
  resetPreyField();
  updateHud();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (!event.key.startsWith("Arrow")) {
    return;
  }

  event.preventDefault();
  keysDown.add(event.key);
  updateDirectionFromKeys();
});

window.addEventListener("keyup", (event) => {
  if (!event.key.startsWith("Arrow")) {
    return;
  }

  event.preventDefault();
  keysDown.delete(event.key);
  updateDirectionFromKeys();
});

window.addEventListener("resize", resizeCanvas);

const directionMap = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

dpadButtons.forEach((button) => {
  const direction = button.dataset.direction;
  const [dx, dy] = directionMap[direction];

  const activate = (event) => {
    event.preventDefault();
    setDirection(dx, dy);
    button.classList.add("is-active");
  };

  const deactivate = () => {
    button.classList.remove("is-active");
    game.player.moving = false;
  };

  button.addEventListener("pointerdown", activate);
  button.addEventListener("pointerup", deactivate);
  button.addEventListener("pointerleave", deactivate);
  button.addEventListener("blur", deactivate);
});

window.addEventListener("blur", () => {
  keysDown.clear();
  game.player.moving = false;
  dpadButtons.forEach((button) => button.classList.remove("is-active"));
});

loadAssets().then(bootGame).catch((error) => {
  console.error(error);
  targetName.textContent = "Could not load";
});
