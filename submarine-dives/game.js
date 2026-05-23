(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const depthMeter = document.getElementById("depthMeter");
  const hullMeter = document.getElementById("hullMeter");
  const fishMeter = document.getElementById("fishMeter");
  const notice = document.getElementById("notice");
  const noticeTitle = document.getElementById("noticeTitle");
  const restartButton = document.getElementById("restartButton");

  const W = canvas.width;
  const H = canvas.height;
  const WORLD_W = 880;
  const MAX_DEPTH = 2500;
  const FINISH_DEPTH = 2380;
  const GRAVITY = 0.028;
  const SIDE_THRUST = 0.042;
  const THRUST = 0.065;
  const BOOST = 0.095;
  const DIVE = 0.035;
  const MAX_STEER_SPEED = 1;
  const MAX_RISE_SPEED = 1.65;
  const MAX_SINK_SPEED = 1.05;
  const MAX_TRAVEL_SPEED = 1;

  ctx.imageSmoothingEnabled = false;

  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
    claw: false
  };

  const colors = {
    black: "#071013",
    deep: "#08131a",
    water0: "#1e6771",
    water1: "#114e5a",
    water2: "#0c2b3f",
    water3: "#0a1424",
    rockDark: "#182528",
    rock: "#2a3b37",
    rockHi: "#496258",
    moss: "#44c58b",
    coral: "#ff7b55",
    brass: "#f6d56a",
    glass: "#78e5ec",
    glassDark: "#246b75",
    hullGreen: "#35a852",
    hullGreenDark: "#1f703b",
    hullBlue: "#2d77c7",
    hullBlueDark: "#18508d",
    patch: "#485653",
    whale: "#243040",
    whaleHi: "#56606b",
    manta: "#31555d",
    mantaHi: "#6ca7a2",
    octo: "#c4688d",
    octoDark: "#7e385d",
    fish: "#ffd84f",
    fishGlow: "#fff4a5"
  };

  const platforms = [
    { x: 0, y: 174, w: 220, h: 34 },
    { x: 328, y: 204, w: 178, h: 22 },
    { x: 622, y: 246, w: 202, h: 24 },
    { x: 124, y: 296, w: 214, h: 22 },
    { x: 420, y: 360, w: 172, h: 22 },
    { x: 668, y: 424, w: 190, h: 26 },
    { x: 26, y: 464, w: 198, h: 24 },
    { x: 272, y: 536, w: 206, h: 24 },
    { x: 604, y: 604, w: 234, h: 26 },
    { x: 94, y: 660, w: 228, h: 24 },
    { x: 386, y: 726, w: 164, h: 22 },
    { x: 616, y: 806, w: 226, h: 26 },
    { x: 40, y: 856, w: 232, h: 24 },
    { x: 292, y: 932, w: 238, h: 24 },
    { x: 628, y: 1000, w: 210, h: 26 },
    { x: 130, y: 1072, w: 212, h: 24 },
    { x: 430, y: 1148, w: 198, h: 24 },
    { x: 688, y: 1218, w: 168, h: 26 },
    { x: 38, y: 1286, w: 228, h: 24 },
    { x: 326, y: 1370, w: 214, h: 24 },
    { x: 588, y: 1442, w: 250, h: 26 },
    { x: 108, y: 1518, w: 230, h: 24 },
    { x: 392, y: 1598, w: 200, h: 24 },
    { x: 656, y: 1676, w: 202, h: 26 },
    { x: 24, y: 1740, w: 214, h: 24 },
    { x: 284, y: 1820, w: 252, h: 24 },
    { x: 612, y: 1904, w: 226, h: 26 },
    { x: 82, y: 1980, w: 238, h: 24 },
    { x: 380, y: 2070, w: 220, h: 24 },
    { x: 658, y: 2160, w: 184, h: 26 },
    { x: 166, y: 2240, w: 210, h: 24 },
    { x: 470, y: 2320, w: 360, h: 32 },
    { x: 0, y: 2468, w: WORLD_W, h: 58 }
  ];

  const vents = [
    { x: 222, y: 520, w: 30, h: 185, lift: 0.18 },
    { x: 554, y: 960, w: 32, h: 210, lift: 0.19 },
    { x: 286, y: 1482, w: 34, h: 230, lift: 0.2 },
    { x: 620, y: 2030, w: 34, h: 245, lift: 0.21 }
  ];

  const animals = [
    { type: "manta", x: 610, y: 300, baseY: 300, vx: -0.24, amp: 14, phase: 0.2 },
    { type: "manta", x: 160, y: 1330, baseY: 1330, vx: 0.18, amp: 18, phase: 1.8 },
    { type: "manta", x: 356, y: 510, baseY: 510, vx: 0.2, amp: 15, phase: 2.9 },
    { type: "manta", x: 735, y: 790, baseY: 790, vx: -0.17, amp: 19, phase: 4.1 },
    { type: "manta", x: 78, y: 1128, baseY: 1128, vx: 0.22, amp: 17, phase: 5.7 },
    { type: "manta", x: 502, y: 1515, baseY: 1515, vx: -0.19, amp: 16, phase: 0.9 },
    { type: "manta", x: 300, y: 1885, baseY: 1885, vx: 0.16, amp: 20, phase: 2.2 },
    { type: "manta", x: 810, y: 2308, baseY: 2308, vx: -0.21, amp: 14, phase: 3.8 },
    { type: "octopus", x: 492, y: 655, baseY: 655, vx: 0.05, amp: 12, phase: 2.3 },
    { type: "octopus", x: 720, y: 1788, baseY: 1788, vx: -0.04, amp: 16, phase: 4.4 },
    { type: "octopus", x: 210, y: 355, baseY: 355, vx: 0.04, amp: 10, phase: 0.4 },
    { type: "octopus", x: 642, y: 890, baseY: 890, vx: -0.05, amp: 13, phase: 1.5 },
    { type: "octopus", x: 330, y: 1228, baseY: 1228, vx: 0.03, amp: 15, phase: 2.8 },
    { type: "octopus", x: 92, y: 1585, baseY: 1585, vx: 0.04, amp: 11, phase: 5.1 },
    { type: "octopus", x: 534, y: 1992, baseY: 1992, vx: -0.03, amp: 17, phase: 3.7 },
    { type: "octopus", x: 760, y: 2228, baseY: 2228, vx: -0.04, amp: 14, phase: 0.7 },
    { type: "whale", x: 760, y: 1040, baseY: 1040, vx: -0.09, amp: 20, phase: 1.2 },
    { type: "whale", x: 80, y: 2175, baseY: 2175, vx: 0.06, amp: 18, phase: 3.2 },
    { type: "whale", x: 150, y: 585, baseY: 585, vx: 0.07, amp: 14, phase: 4.5 },
    { type: "whale", x: 715, y: 812, baseY: 812, vx: -0.06, amp: 22, phase: 0.6 },
    { type: "whale", x: 420, y: 1325, baseY: 1325, vx: 0.055, amp: 19, phase: 2.6 },
    { type: "whale", x: 800, y: 1578, baseY: 1578, vx: -0.07, amp: 18, phase: 5.4 },
    { type: "whale", x: 260, y: 1908, baseY: 1908, vx: 0.065, amp: 16, phase: 1.9 },
    { type: "whale", x: 596, y: 2350, baseY: 2350, vx: -0.05, amp: 15, phase: 4.8 }
  ];

  const lanternSchools = [
    makeSchool(120, 175, 8),
    makeSchool(258, 236, 5),
    makeSchool(500, 306, 10),
    makeSchool(762, 388, 9),
    makeSchool(132, 488, 11),
    makeSchool(690, 555, 6),
    makeSchool(412, 612, 12),
    makeSchool(778, 735, 10),
    makeSchool(246, 820, 13),
    makeSchool(548, 905, 9),
    makeSchool(182, 1012, 6),
    makeSchool(772, 1115, 12),
    makeSchool(586, 1258, 7),
    makeSchool(324, 1348, 13),
    makeSchool(724, 1470, 11),
    makeSchool(284, 1658, 7),
    makeSchool(536, 1736, 12),
    makeSchool(104, 1845, 13),
    makeSchool(794, 1960, 11),
    makeSchool(422, 2078, 14),
    makeSchool(714, 2250, 8)
  ].flat();

  const grabItemStarts = [
    { x: 452, y: 348, w: 14, h: 12, color: "brass" },
    { x: 186, y: 648, w: 14, h: 12, color: "green" },
    { x: 646, y: 794, w: 14, h: 12, color: "blue" },
    { x: 490, y: 1136, w: 14, h: 12, color: "brass" },
    { x: 232, y: 1506, w: 14, h: 12, color: "blue" },
    { x: 700, y: 1892, w: 14, h: 12, color: "green" },
    { x: 222, y: 2228, w: 14, h: 12, color: "brass" }
  ];

  const ambientFish = Array.from({ length: 760 }, (_, index) => makeAmbientFish(index));

  const bubbles = Array.from({ length: 90 }, (_, index) => ({
    x: (index * 97) % WORLD_W,
    y: (index * 181) % MAX_DEPTH,
    s: 1 + (index % 3),
    speed: 0.24 + (index % 5) * 0.035,
    drift: (index % 2 ? 1 : -1) * (0.05 + (index % 4) * 0.015)
  }));

  let player;
  let camera;
  let time;
  let gameState;
  let lastFrame;
  let depthBest;
  let clawLatch;
  let grabItems;
  let clawTarget;

  function makeSchool(cx, cy, count) {
    return Array.from({ length: count }, (_, i) => ({
      x: cx + ((i * 31) % 72) - 36,
      y: cy + ((i * 17) % 38) - 18,
      taken: false,
      phase: i * 0.72
    }));
  }

  function makeAmbientFish(index) {
    return {
      x: pseudoRandom(index, 3) * WORLD_W,
      y: 24 + pseudoRandom(index, 17) * (MAX_DEPTH - 64),
      size: 0.75 + pseudoRandom(index, 29) * 0.85,
      phase: pseudoRandom(index, 43) * Math.PI * 2,
      dir: pseudoRandom(index, 61) > 0.5 ? 1 : -1,
      color: pseudoRandom(index, 71) > 0.64 ? "blue" : pseudoRandom(index, 83) > 0.42 ? "gold" : "green"
    };
  }

  function pseudoRandom(index, salt) {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function resetGame() {
    player = {
      x: 88,
      y: 118,
      w: 42,
      h: 20,
      vx: 0,
      vy: 0,
      facing: 1,
      hull: 100,
      fish: 8,
      collected: 0,
      invuln: 0,
      onGround: false,
      clawClosed: false,
      clawTimer: 0,
      clawAnim: 0,
      holding: null
    };
    camera = { x: 0, y: 52 };
    time = 0;
    lastFrame = performance.now();
    depthBest = 0;
    clawLatch = false;
    clawTarget = null;
    grabItems = grabItemStarts.map((item, index) => ({
      ...item,
      id: index,
      vx: 0,
      vy: 0,
      held: false
    }));
    gameState = "playing";
    lanternSchools.forEach((fish) => {
      fish.taken = false;
    });
    notice.hidden = true;
    restartButton.textContent = "Restart";
    canvas.focus({ preventScroll: true });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function strokeRect(x, y, w, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
  }

  function update(dt) {
    if (gameState !== "playing") {
      return;
    }

    time += dt;
    updatePlayer(dt);
    handleClawInput(dt);
    updateGrabItems(dt);
    updateAnimals(dt);
    updateBubbles(dt);
    collectLanternFish();

    const targetX = clamp(player.x + player.w * 0.5 - W * 0.45, 0, WORLD_W - W);
    const targetY = clamp(player.y + player.h * 0.5 - H * 0.52, 0, MAX_DEPTH - H);
    camera.x += (targetX - camera.x) * 0.11;
    camera.y += (targetY - camera.y) * 0.1;

    depthBest = Math.max(depthBest, Math.floor(player.y * 0.72));
    if (player.hull <= 0) {
      endGame("Hull Breach");
    } else if (player.y > FINISH_DEPTH) {
      endGame("Deepest Dive");
    }

    updateHud();
  }

  function updatePlayer(dt) {
    const oldX = player.x;
    const oldY = player.y;
    const dragX = player.onGround ? 0.72 : 0.84;
    const dragY = 0.94;

    if (keys.left) {
      player.vx -= SIDE_THRUST * dt;
      player.facing = -1;
    }
    if (keys.right) {
      player.vx += SIDE_THRUST * dt;
      player.facing = 1;
    }
    if (keys.up) {
      player.vy -= THRUST * dt;
    }
    if (keys.down) {
      player.vy += DIVE * dt;
    }
    if (keys.boost) {
      player.vy -= BOOST * dt;
    }

    player.vy += GRAVITY * dt;
    player.vx *= Math.pow(dragX, dt / 1.2);
    player.vy *= Math.pow(dragY, dt / 1.2);
    player.vx = clamp(player.vx, -MAX_STEER_SPEED, MAX_STEER_SPEED);
    player.vy = clamp(player.vy, -MAX_RISE_SPEED, MAX_SINK_SPEED);
    limitPlayerSpeed();

    player.x += player.vx * dt;
    collideX(oldX);
    player.y += player.vy * dt;
    collideY(oldY);

    player.x = clamp(player.x, 12, WORLD_W - player.w - 12);
    player.y = clamp(player.y, 16, MAX_DEPTH - player.h - 8);

    vents.forEach((vent) => {
      const columnX = vent.x - 18;
      const columnW = vent.w + 36;
      const inBubbleColumn = player.x + player.w > columnX &&
        player.x < columnX + columnW &&
        player.y + player.h > vent.y - vent.h &&
        player.y < vent.y + 12;

      if (inBubbleColumn) {
        player.vy -= vent.lift * dt;
        player.vx += Math.sin(time * 0.12 + vent.x) * 0.026 * dt;
        player.vy = Math.min(player.vy, -0.42);
      }
    });
    limitPlayerSpeed();

    if (player.invuln > 0) {
      player.invuln -= dt;
    }
  }

  function handleClawInput(dt) {
    const pressed = keys.claw;
    if (pressed && !clawLatch) {
      toggleClaw();
    }
    clawLatch = pressed;

    if (player.holding === null && player.clawTimer > 0) {
      player.clawTimer -= dt;
      if (player.clawTimer <= 0) {
        player.clawClosed = false;
      }
    }

    const targetAnim = player.clawClosed || player.holding !== null ? 1 : 0;
    player.clawAnim += (targetAnim - player.clawAnim) * Math.min(1, 0.28 * dt);
  }

  function toggleClaw() {
    if (player.holding !== null) {
      releaseHeldItem();
      return;
    }

    const target = findNearestGrabItem();
    player.clawClosed = true;
    player.clawTimer = target ? 0 : 18;

    if (!target) {
      return;
    }

    target.held = true;
    target.vx = 0;
    target.vy = 0;
    player.holding = target.id;
  }

  function findNearestGrabItem() {
    const tip = getClawTip();
    let best = null;
    let bestDistance = 24 * 24;

    grabItems.forEach((item) => {
      if (item.held) {
        return;
      }

      const itemX = item.x + item.w * 0.5;
      const itemY = item.y + item.h * 0.5;
      const dx = itemX - tip.x;
      const dy = itemY - tip.y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    });

    return best;
  }

  function releaseHeldItem() {
    const item = getHeldItem();
    if (!item) {
      player.holding = null;
      player.clawClosed = false;
      return;
    }

    item.held = false;
    item.vx = player.vx * 0.35;
    item.vy = player.vy * 0.25;
    snapItemToNearbyLedge(item);
    player.holding = null;
    player.clawClosed = false;
    player.clawTimer = 0;
  }

  function getHeldItem() {
    return grabItems.find((item) => item.id === player.holding);
  }

  function getClawTip() {
    const aim = getClawAim();
    return {
      x: aim.base.x + aim.ux * aim.length,
      y: aim.base.y + aim.uy * aim.length
    };
  }

  function getClawBase() {
    return {
      x: player.x + player.w * 0.5,
      y: player.y + player.h * 0.5 + 7
    };
  }

  function getClawAim() {
    const base = getClawBase();
    const target = clawTarget || {
      x: base.x + player.facing * 44,
      y: base.y + 18
    };
    const dx = target.x - base.x;
    const dy = target.y - base.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    return {
      base,
      ux: dx / distance,
      uy: dy / distance,
      angle: Math.atan2(dy, dx),
      length: clamp(distance, 24, 54)
    };
  }

  function updateGrabItems(dt) {
    grabItems.forEach((item) => {
      if (item.held) {
        positionHeldItem(item);
        return;
      }

      const oldX = item.x;
      const oldY = item.y;
      item.vy += GRAVITY * 0.72 * dt;
      item.vx *= Math.pow(0.86, dt / 1.2);
      item.vy *= Math.pow(0.96, dt / 1.2);
      item.vx = clamp(item.vx, -0.9, 0.9);
      item.vy = clamp(item.vy, -0.7, 1.1);

      item.x += item.vx * dt;
      collideGrabItemX(item, oldX);
      item.y += item.vy * dt;
      collideGrabItemY(item, oldY);

      item.x = clamp(item.x, 10, WORLD_W - item.w - 10);
      item.y = clamp(item.y, 8, MAX_DEPTH - item.h - 8);
    });
  }

  function positionHeldItem(item) {
    const tip = getClawTip();
    item.x = tip.x - item.w * 0.5 + player.facing * 2;
    item.y = tip.y - item.h * 0.5 + 4;
    item.vx = player.vx;
    item.vy = player.vy;
  }

  function collideGrabItemX(item, oldX) {
    for (const p of platforms) {
      if (!overlap(item, p)) {
        continue;
      }
      if (oldX + item.w <= p.x) {
        item.x = p.x - item.w;
      } else if (oldX >= p.x + p.w) {
        item.x = p.x + p.w;
      }
      item.vx *= -0.1;
    }
  }

  function collideGrabItemY(item, oldY) {
    for (const p of platforms) {
      if (!overlap(item, p)) {
        continue;
      }
      if (oldY + item.h <= p.y) {
        item.y = p.y - item.h;
      } else if (oldY >= p.y + p.h) {
        item.y = p.y + p.h;
      }
      item.vy = 0;
    }
  }

  function snapItemToNearbyLedge(item) {
    const centerX = item.x + item.w * 0.5;
    const bottom = item.y + item.h;

    for (const p of platforms) {
      const onLedgeX = centerX > p.x - 4 && centerX < p.x + p.w + 4;
      const nearTop = bottom > p.y - 18 && bottom < p.y + 16;
      if (!onLedgeX || !nearTop) {
        continue;
      }

      item.x = clamp(item.x, p.x, p.x + p.w - item.w);
      item.y = p.y - item.h;
      item.vx = 0;
      item.vy = 0;
      return;
    }
  }

  function collideX(oldX) {
    for (const p of platforms) {
      if (!overlap(player, p)) {
        continue;
      }
      if (oldX + player.w <= p.x) {
        player.x = p.x - player.w;
      } else if (oldX >= p.x + p.w) {
        player.x = p.x + p.w;
      }
      scrapeHull();
      player.vx *= -0.16;
    }
  }

  function collideY(oldY) {
    player.onGround = false;
    for (const p of platforms) {
      if (!overlap(player, p)) {
        continue;
      }
      if (oldY + player.h <= p.y) {
        player.y = p.y - player.h;
        player.onGround = true;
      } else if (oldY >= p.y + p.h) {
        player.y = p.y + p.h;
      }
      scrapeHull();
      player.vy *= -0.12;
    }
  }

  function overlap(a, b) {
    return a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y;
  }

  function scrapeHull() {
    const speed = Math.abs(player.vx) + Math.abs(player.vy);
    if (speed > 1.7 && player.invuln <= 0) {
      player.hull = Math.max(0, player.hull - Math.ceil(speed * 2.4));
      player.invuln = 28;
    }
  }

  function limitPlayerSpeed() {
    const speed = Math.hypot(player.vx, player.vy);
    if (speed <= MAX_TRAVEL_SPEED) {
      return;
    }

    const scale = MAX_TRAVEL_SPEED / speed;
    player.vx *= scale;
    player.vy *= scale;
  }

  function updateAnimals(dt) {
    animals.forEach((animal) => {
      animal.x += animal.vx * dt;
      animal.phase += 0.018 * dt;
      animal.y = animal.baseY + Math.sin(animal.phase) * animal.amp;

      const margin = animal.type === "whale" ? 150 : 70;
      if (animal.vx < 0 && animal.x < -margin) {
        animal.x = WORLD_W + margin;
      } else if (animal.vx > 0 && animal.x > WORLD_W + margin) {
        animal.x = -margin;
      }
    });
  }

  function updateBubbles(dt) {
    bubbles.forEach((bubble) => {
      bubble.y -= bubble.speed * dt;
      bubble.x += bubble.drift * dt;
      if (bubble.y < camera.y - 40) {
        bubble.y = camera.y + H + ((bubble.x * 13) % 80);
        bubble.x = (bubble.x + 227) % WORLD_W;
      }
    });
  }

  function collectLanternFish() {
    lanternSchools.forEach((fish) => {
      if (fish.taken) {
        return;
      }

      const dx = fish.x - (player.x + player.w * 0.5);
      const dy = fish.y - (player.y + player.h * 0.5);
      if (dx * dx + dy * dy < 520) {
        fish.taken = true;
        player.collected += 1;
        player.fish = Math.min(24, player.fish + 1);
        player.hull = Math.min(100, player.hull + 3);
      }
    });
  }

  function updateHud() {
    depthMeter.textContent = `${Math.floor(player.y * 0.72)} m`;
    hullMeter.textContent = `Hull ${Math.ceil(player.hull)}%`;
    fishMeter.textContent = `Fish ${player.fish}`;
  }

  function endGame(title) {
    gameState = "ended";
    noticeTitle.textContent = title;
    restartButton.textContent = "Restart";
    notice.hidden = false;
  }

  function draw() {
    drawWater();
    drawFarWhales();
    drawBubbles();
    drawCaveWalls();
    drawVents();
    drawPlatforms();
    drawPlants();
    drawAmbientFish();
    drawLanternSchools();
    drawAnimals();
    drawGrabItems();
    drawSubmarine();
    drawClawWorld();
    drawDepthMarker();
  }

  function drawWater() {
    const depth = clamp(camera.y / MAX_DEPTH, 0, 1);
    const bandColors = [
      mixColor(colors.water0, colors.water1, depth),
      mixColor(colors.water1, colors.water2, depth),
      mixColor(colors.water2, colors.water3, depth),
      mixColor(colors.water3, colors.deep, depth)
    ];

    for (let i = 0; i < 4; i += 1) {
      rect(0, Math.floor((H / 4) * i), W, Math.ceil(H / 4), bandColors[i]);
    }

    const rayOffset = Math.floor((time * 0.12 + camera.y * 0.04) % 64);
    ctx.globalAlpha = 0.18 - depth * 0.12;
    for (let x = -80; x < W + 80; x += 80) {
      ctx.fillStyle = "#a9f1d1";
      ctx.beginPath();
      ctx.moveTo(x + rayOffset, 0);
      ctx.lineTo(x + 28 + rayOffset, 0);
      ctx.lineTo(x - 42 + rayOffset, H);
      ctx.lineTo(x - 66 + rayOffset, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.17;
    for (let y = -16; y < H + 16; y += 16) {
      for (let x = -16; x < W + 16; x += 16) {
        if (((x + y + Math.floor(camera.y)) / 16) % 3 === 0) {
          rect(x + Math.floor(camera.x * -0.08) % 16, y, 1, 1, "#d8ffda");
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function mixColor(a, b, amount) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    const r = Math.round(ca.r + (cb.r - ca.r) * amount);
    const g = Math.round(ca.g + (cb.g - ca.g) * amount);
    const bl = Math.round(ca.b + (cb.b - ca.b) * amount);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function hexToRgb(hex) {
    const raw = hex.replace("#", "");
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16)
    };
  }

  function drawCaveWalls() {
    const leftW = 10 + Math.sin(camera.y * 0.006) * 4;
    const rightW = 16 + Math.cos(camera.y * 0.005) * 5;
    rect(-camera.x - 6, 0, leftW + 10, H, colors.rockDark);
    rect(WORLD_W - camera.x - rightW, 0, rightW + 22, H, colors.rockDark);

    for (let y = Math.floor(camera.y / 14) * 14; y < camera.y + H + 14; y += 14) {
      const sy = y - camera.y;
      rect(-camera.x + 2 + (y % 28 ? 0 : 3), sy, 6, 3, colors.rockHi);
      rect(WORLD_W - camera.x - 14 + (y % 42 ? 0 : -4), sy + 4, 9, 3, colors.rockHi);
    }
  }

  function drawPlatforms() {
    platforms.forEach((p) => {
      const x = p.x - camera.x;
      const y = p.y - camera.y;
      if (x > W || x + p.w < 0 || y > H || y + p.h < 0) {
        return;
      }

      rect(x, y, p.w, p.h, colors.rock);
      rect(x, y, p.w, 4, colors.rockHi);
      rect(x, y + p.h - 4, p.w, 4, colors.rockDark);
      for (let tx = Math.floor(p.x / 12) * 12; tx < p.x + p.w; tx += 12) {
        const sx = tx - camera.x;
        const notch = ((tx + p.y) % 24) / 4;
        rect(sx, y + 3 + notch, 5, 2, colors.rockDark);
        if ((tx + p.y) % 36 === 0) {
          rect(sx + 4, y - 3, 8, 3, colors.moss);
        }
      }
    });
  }

  function drawPlants() {
    platforms.forEach((p, index) => {
      if (index % 2 === 0) {
        drawKelp(p.x + 18 + (index * 37) % Math.max(24, p.w - 36), p.y);
      }
      if (index % 3 === 0) {
        drawCoral(p.x + p.w - 38, p.y);
      }
    });
  }

  function drawKelp(x, y) {
    const sx = Math.round(x - camera.x);
    const sy = Math.round(y - camera.y);
    if (sx < -12 || sx > W + 12 || sy < -40 || sy > H + 10) {
      return;
    }
    const sway = Math.round(Math.sin(time * 0.05 + x) * 2);
    rect(sx, sy - 21, 3, 21, colors.hullGreenDark);
    rect(sx + sway, sy - 16, 7, 3, colors.moss);
    rect(sx - 5 + sway, sy - 10, 7, 3, colors.moss);
    rect(sx + 1 + sway, sy - 5, 8, 3, colors.moss);
  }

  function drawCoral(x, y) {
    const sx = Math.round(x - camera.x);
    const sy = Math.round(y - camera.y);
    if (sx < -20 || sx > W + 20 || sy < -32 || sy > H + 10) {
      return;
    }
    rect(sx, sy - 14, 4, 14, colors.coral);
    rect(sx - 6, sy - 9, 4, 9, colors.coral);
    rect(sx + 7, sy - 18, 4, 18, colors.coral);
    rect(sx - 9, sy - 12, 7, 3, colors.coral);
    rect(sx + 10, sy - 21, 6, 3, colors.coral);
    rect(sx + 2, sy - 18, 5, 3, "#ffa36e");
  }

  function drawVents() {
    vents.forEach((vent) => {
      const x = vent.x - camera.x;
      const y = vent.y - camera.y;
      if (x > W + 40 || x + vent.w < -40 || y < -80 || y - vent.h > H + 30) {
        return;
      }

      ctx.globalAlpha = 0.16;
      rect(x - 18, y - vent.h, vent.w + 36, vent.h + 8, "#d7ffe8");
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 18; i += 1) {
        const puffY = y - ((time * (0.88 + i * 0.04) + i * 17) % vent.h);
        const puffX = x - 14 + ((Math.sin(time * 0.08 + i * 1.7) + 1) * (vent.w + 22)) / 2;
        rect(puffX, puffY, 2 + (i % 3), 3 + (i % 4), "#d7ffe8");
        rect(puffX + 1, puffY, 1, 1, "#fff4a5");
      }
      ctx.globalAlpha = 1;

      rect(x - 8, y - 1, vent.w + 16, 10, colors.rockDark);
      rect(x - 3, y - 15, vent.w + 6, 15, colors.rock);
      rect(x + 4, y - 23, vent.w - 8, 12, colors.rockDark);
      rect(x + 9, y - 28, vent.w - 18, 7, "#ff7b55");
      rect(x + 10, y - 26, vent.w - 20, 3, "#f6d56a");
      rect(x - 4, y - 7, 8, 4, colors.rockHi);
      rect(x + vent.w - 4, y - 8, 8, 5, colors.rockHi);
    });
  }

  function drawBubbles() {
    ctx.globalAlpha = 0.58;
    bubbles.forEach((bubble) => {
      const x = bubble.x - camera.x;
      const y = bubble.y - camera.y;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) {
        return;
      }
      rect(x, y, bubble.s, bubble.s, "#d7fff1");
      if (bubble.s > 1) {
        rect(x + bubble.s - 1, y, 1, 1, "#7bb8b6");
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawLanternSchools() {
    lanternSchools.forEach((fish, i) => {
      if (fish.taken) {
        return;
      }
      const bob = Math.sin(time * 0.08 + fish.phase) * 2;
      drawLanternFish(fish.x - camera.x, fish.y + bob - camera.y, i % 2 ? -1 : 1, 1);
    });
  }

  function drawAmbientFish() {
    const clearX = player.x + player.w * 0.5;
    const clearY = player.y + player.h * 0.5;

    ambientFish.forEach((fish, index) => {
      const swim = Math.sin(time * 0.018 + fish.phase) * 5;
      const x = fish.x + swim - camera.x;
      const y = fish.y + Math.sin(time * 0.025 + fish.phase) * 3 - camera.y;
      if (x < -16 || x > W + 16 || y < -16 || y > H + 16) {
        return;
      }

      const dx = fish.x - clearX;
      const dy = fish.y - clearY;
      if ((dx * dx) / (62 * 62) + (dy * dy) / (38 * 38) < 1) {
        return;
      }

      const color = fish.color === "blue"
        ? colors.glass
        : fish.color === "green"
          ? colors.moss
          : colors.fish;
      drawTinyFish(x, y, index % 2 ? fish.dir : -fish.dir, fish.size, color);
    });
  }

  function drawTinyFish(x, y, dir, scale, color) {
    ctx.globalAlpha = 0.72;
    rect(x - 3 * scale, y - 1 * scale, 6 * scale, 3 * scale, color);
    rect(x - dir * 6 * scale, y, 3 * scale, 2 * scale, colors.coral);
    rect(x + dir * 2 * scale, y - 2 * scale, 1 * scale, 1 * scale, colors.black);
    ctx.globalAlpha = 1;
  }

  function drawCompanionFish() {
    const count = Math.min(player.fish, 24);
    const centerX = player.x + player.w * 0.5;
    const centerY = player.y + player.h * 0.5;

    for (let i = 0; i < count; i += 1) {
      const ring = i % 2;
      const angle = time * (0.035 + ring * 0.008) + i * (Math.PI * 2 / count);
      const radiusX = 22 + ring * 12 + (i % 3) * 2;
      const radiusY = 14 + ring * 8;
      const x = centerX + Math.cos(angle) * radiusX;
      const y = centerY + Math.sin(angle * 1.3) * radiusY;
      drawLanternFish(x - camera.x, y - camera.y, Math.cos(angle) > 0 ? 1 : -1, 0.84);
    }
  }

  function drawLanternFish(x, y, dir, scale) {
    if (x < -12 || x > W + 12 || y < -12 || y > H + 12) {
      return;
    }
    ctx.globalAlpha = 0.22;
    rect(x - 5 * scale, y - 5 * scale, 10 * scale, 10 * scale, colors.fishGlow);
    ctx.globalAlpha = 1;
    rect(x - 3 * scale, y - 1 * scale, 6 * scale, 3 * scale, colors.fish);
    rect(x - dir * 6 * scale, y, 3 * scale, 2 * scale, "#e99a31");
    rect(x + dir * 3 * scale, y - 3 * scale, 2 * scale, 2 * scale, colors.fishGlow);
    rect(x + dir * 5 * scale, y - 4 * scale, 1 * scale, 1 * scale, colors.fishGlow);
    rect(x + dir * 1 * scale, y, 1 * scale, 1 * scale, colors.black);
  }

  function drawAnimals() {
    animals.forEach((animal) => {
      const x = animal.x - camera.x;
      const y = animal.y - camera.y;
      if (x < -180 || x > W + 180 || y < -100 || y > H + 100) {
        return;
      }
      if (animal.type === "manta") {
        drawManta(x, y, animal.vx < 0 ? -1 : 1, animal.phase);
      } else if (animal.type === "octopus") {
        drawOctopus(x, y, animal.phase);
      }
    });
  }

  function drawFarWhales() {
    animals.forEach((animal) => {
      if (animal.type !== "whale") {
        return;
      }
      const x = animal.x - camera.x * 0.82;
      const y = animal.y - camera.y;
      if (x < -210 || x > W + 210 || y < -80 || y > H + 80) {
        return;
      }
      drawWhale(x, y, animal.vx < 0 ? -1 : 1);
    });
  }

  function drawManta(x, y, dir, phase) {
    const flap = Math.round(Math.sin(phase * 4) * 4);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(dir, 1);
    rect(-14, -3, 28, 7, colors.manta);
    rect(-8, -7, 16, 5, colors.mantaHi);
    rect(12, -2, 10, 3, colors.manta);
    rect(-36, -1 + flap, 24, 5, colors.manta);
    rect(12, -1 - flap, 24, 5, colors.manta);
    rect(-31, 4 + flap, 14, 3, colors.mantaHi);
    rect(17, 4 - flap, 14, 3, colors.mantaHi);
    rect(-3, 4, 6, 7, colors.manta);
    rect(6, -5, 2, 2, colors.black);
    ctx.restore();
  }

  function drawOctopus(x, y, phase) {
    const bob = Math.round(Math.sin(phase * 3) * 2);
    rect(x - 10, y - 14 + bob, 20, 15, colors.octoDark);
    rect(x - 8, y - 18 + bob, 16, 8, colors.octo);
    rect(x - 6, y - 10 + bob, 4, 3, colors.black);
    rect(x + 3, y - 10 + bob, 4, 3, colors.black);
    for (let i = -3; i <= 3; i += 1) {
      const tentacleX = x + i * 4;
      const tentacleY = y + 1 + bob;
      const sway = Math.round(Math.sin(phase * 4 + i) * 2);
      rect(tentacleX, tentacleY, 3, 8 + (i % 2 ? 3 : 0), colors.octo);
      rect(tentacleX + sway, tentacleY + 7, 5, 3, colors.octoDark);
    }
  }

  function drawWhale(x, y, dir) {
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(dir, 1);
    rect(-58, -15, 80, 28, colors.whale);
    rect(-70, -11, 18, 21, colors.whale);
    rect(18, -8, 18, 17, colors.whale);
    rect(34, -15, 14, 7, colors.whale);
    rect(34, 8, 14, 7, colors.whale);
    rect(-56, 6, 54, 5, colors.whaleHi);
    rect(-61, -7, 4, 4, colors.black);
    rect(-50, -14, 19, 3, colors.whaleHi);
    rect(-69, -15, 9, 4, colors.whaleHi);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawGrabItems() {
    grabItems.forEach((item) => {
      const x = item.x - camera.x;
      const y = item.y - camera.y;
      if (x < -24 || x > W + 24 || y < -24 || y > H + 24) {
        return;
      }

      const fill = item.color === "blue"
        ? colors.hullBlue
        : item.color === "green"
          ? colors.hullGreen
          : colors.brass;
      const shade = item.color === "blue"
        ? colors.hullBlueDark
        : item.color === "green"
          ? colors.hullGreenDark
          : "#8b6d2f";

      rect(x, y + 2, item.w, item.h - 2, colors.black);
      rect(x + 1, y + 1, item.w - 2, item.h - 2, fill);
      rect(x + 2, y + item.h - 4, item.w - 4, 3, shade);
      rect(x + 3, y - 1, item.w - 6, 3, colors.patch);
      rect(x + 5, y + 3, 4, 2, colors.glassDark);
    });
  }

  function drawSubmarine() {
    const flash = player.invuln > 0 && Math.floor(time * 0.32) % 2 === 0;
    const x = player.x - camera.x;
    const y = player.y - camera.y;

    ctx.save();
    ctx.translate(Math.round(x + player.w * 0.5), Math.round(y + player.h * 0.5));
    ctx.scale(player.facing, 1);

    if (flash) {
      ctx.globalAlpha = 0.55;
    }

    rect(-35, -6, 8, 12, colors.black);
    rect(-34, -4, 5, 8, colors.patch);
    rect(-39, -10, 10, 5, colors.black);
    rect(-38, -9, 8, 3, colors.hullGreenDark);
    rect(-39, 5, 10, 5, colors.black);
    rect(-38, 6, 8, 3, colors.hullGreenDark);

    const prop = Math.floor(time * 0.5) % 2;
    rect(-45, prop ? -7 : -2, 2, 14, colors.black);
    rect(-46, prop ? -2 : -7, 5, 2, colors.glass);
    rect(-45, prop ? 3 : 5, 4, 2, colors.brass);

    rect(-31, -10, 49, 21, colors.black);
    rect(-34, -7, 5, 15, colors.black);
    rect(16, -8, 7, 17, colors.black);
    rect(21, -5, 3, 11, colors.black);

    rect(-28, -9, 43, 6, colors.hullGreen);
    rect(-31, -3, 50, 8, colors.hullBlue);
    rect(-27, 5, 42, 5, colors.hullGreen);
    rect(-29, 8, 40, 3, colors.hullGreenDark);
    rect(-26, -3, 37, 2, "#53a7e6");
    rect(15, -6, 5, 4, colors.hullGreen);
    rect(18, -2, 4, 6, colors.hullBlueDark);
    rect(15, 4, 5, 4, colors.hullGreen);

    rect(-6, -16, 21, 6, colors.black);
    rect(-4, -15, 18, 4, colors.patch);
    rect(3, -22, 15, 8, colors.black);
    rect(5, -20, 11, 5, colors.glassDark);
    rect(8, -20, 6, 3, colors.glass);
    rect(10, -19, 2, 1, "#effffa");
    rect(15, -28, 3, 8, colors.black);
    rect(12, -29, 8, 3, colors.patch);

    rect(0, -12, 14, 8, colors.black);
    rect(2, -10, 10, 5, colors.glassDark);
    rect(5, -10, 5, 3, colors.glass);
    rect(7, -9, 2, 1, "#effffa");

    rect(-20, -5, 4, 4, colors.brass);
    rect(-10, -5, 4, 4, colors.brass);
    rect(-19, -4, 2, 2, colors.glassDark);
    rect(-9, -4, 2, 2, colors.glassDark);
    rect(-23, 6, 2, 2, colors.black);
    rect(-15, 7, 2, 2, colors.black);
    rect(-4, 6, 2, 2, colors.black);
    rect(7, 7, 2, 2, colors.black);
    rect(-23, -8, 7, 2, colors.hullGreenDark);
    rect(-4, 1, 9, 2, colors.hullBlueDark);
    rect(9, 4, 5, 2, colors.patch);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawClawWorld() {
    const aim = getClawAim();
    const x = aim.base.x - camera.x;
    const y = aim.base.y - camera.y;
    const closed = clamp(player.clawAnim, 0, 1);
    const jawGap = 9 - closed * 6;
    const jawBite = 4 + closed * 4;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(aim.angle);

    rect(-3, -3, 7, 6, colors.black);
    rect(-2, -1, 6, 2, colors.brass);
    rect(2, -2, aim.length - 4, 4, colors.black);
    rect(4, -1, aim.length - 8, 1, colors.brass);
    rect(aim.length - 4, -5, 7, 10, colors.black);
    rect(aim.length - 2, -3, 3, 6, colors.patch);

    rect(aim.length + 1, -jawGap - 5, 4, 11, colors.black);
    rect(aim.length + 2, -jawGap - 4, 1, 8, colors.brass);
    rect(aim.length + 2, jawGap - 5, 4, 11, colors.black);
    rect(aim.length + 3, jawGap - 3, 1, 8, colors.brass);
    rect(aim.length + 3, -jawGap - 5, jawBite, 3, colors.black);
    rect(aim.length + 3, jawGap + 2, jawBite, 3, colors.black);

    ctx.restore();
  }

  function drawDepthMarker() {
    const x = 648 - camera.x;
    const y = FINISH_DEPTH + 32 - camera.y;
    if (x < -80 || x > W + 80 || y < -80 || y > H + 60) {
      return;
    }

    rect(x - 45, y + 14, 90, 12, colors.rockDark);
    rect(x - 30, y - 1, 60, 15, "#2f7558");
    rect(x - 24, y - 16, 48, 16, "#17414b");
    rect(x - 18, y - 12, 36, 9, colors.glassDark);
    rect(x - 6, y - 10, 12, 5, colors.glass);
    rect(x - 34, y - 24, 7, 17, colors.brass);
    rect(x + 27, y - 24, 7, 17, colors.brass);
    rect(x - 38, y - 27, 76, 4, colors.brass);
  }

  function frame(now) {
    const dt = clamp((now - lastFrame) / 16.667, 0.2, 2.2);
    lastFrame = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  const keyMap = new Map([
    ["ArrowLeft", "left"],
    ["a", "left"],
    ["A", "left"],
    ["ArrowRight", "right"],
    ["d", "right"],
    ["D", "right"],
    ["ArrowUp", "up"],
    ["w", "up"],
    ["W", "up"],
    ["ArrowDown", "down"],
    ["s", "down"],
    ["S", "down"],
    [" ", "boost"],
    ["Shift", "boost"],
    ["b", "claw"],
    ["B", "claw"],
    ["c", "claw"],
    ["C", "claw"],
    ["e", "claw"],
    ["E", "claw"]
  ]);

  window.addEventListener("keydown", (event) => {
    const control = keyMap.get(event.key);
    if (control) {
      keys[control] = true;
      event.preventDefault();
    }
    if (event.key === "Enter" && gameState !== "playing") {
      resetGame();
    }
  });

  window.addEventListener("keyup", (event) => {
    const control = keyMap.get(event.key);
    if (control) {
      keys[control] = false;
      event.preventDefault();
    }
  });

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.getAttribute("data-control");

    const set = (value) => {
      keys[control] = value;
      button.classList.toggle("active", value);
      canvas.focus({ preventScroll: true });
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      set(true);
    });
    button.addEventListener("pointerup", () => set(false));
    button.addEventListener("pointercancel", () => set(false));
    button.addEventListener("pointerleave", () => set(false));
  });

  function aimClawAtPointer(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * W;
    const y = ((event.clientY - bounds.top) / bounds.height) * H;
    clawTarget = {
      x: camera.x + clamp(x, 0, W),
      y: camera.y + clamp(y, 0, H)
    };
  }

  restartButton.addEventListener("click", resetGame);
  canvas.addEventListener("pointermove", aimClawAtPointer);
  canvas.addEventListener("pointerdown", (event) => {
    aimClawAtPointer(event);
    canvas.focus({ preventScroll: true });
  });

  resetGame();
  requestAnimationFrame(frame);
})();
