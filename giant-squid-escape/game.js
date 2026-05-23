(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const animalCountEl = document.getElementById("animalCount");
  const pauseButton = document.getElementById("pauseButton");

  const ANIMAL_TARGET = 12;
  const TWO_PI = Math.PI * 2;

  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    score: 0,
    paused: false,
    lastTime: 0,
    animals: [],
    bubbles: [],
    reef: [],
    particles: [],
    keys: new Set(),
    squid: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: 58,
      bitePulse: 0,
      bob: 0,
    },
  };

  const animalTypes = [
    { kind: "fish", radius: 23, score: 10, speed: 78 },
    { kind: "jellyfish", radius: 27, score: 14, speed: 54 },
    { kind: "turtle", radius: 32, score: 22, speed: 46 },
  ];

  const rand = (min, max) => min + Math.random() * (max - min);
  const choose = (items) => items[Math.floor(Math.random() * items.length)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;

  function resize() {
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.pixelRatio);
    canvas.height = Math.floor(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);

    if (!state.squid.x || !state.squid.y) {
      state.squid.x = state.width * 0.48;
      state.squid.y = state.height * 0.52;
    }

    buildReef();
    buildBubbles();
    keepAnimalCount();
  }

  function buildReef() {
    const floor = state.height - 14;
    const coralColors = ["#ff6f61", "#ffb15f", "#ff477e", "#8fe388", "#68d6cf", "#d782ff"];
    state.reef = [];

    for (let i = 0; i < 44; i += 1) {
      const x = (i / 43) * state.width + rand(-32, 32);
      const height = rand(38, Math.max(72, state.height * 0.18));
      state.reef.push({
        x,
        y: floor + rand(-10, 18),
        height,
        width: rand(15, 38),
        color: choose(coralColors),
        lean: rand(-0.45, 0.45),
        branches: Math.floor(rand(2, 5)),
        phase: rand(0, TWO_PI),
      });
    }
  }

  function buildBubbles() {
    const count = Math.max(38, Math.floor((state.width * state.height) / 18000));
    state.bubbles = Array.from({ length: count }, () => ({
      x: rand(0, state.width),
      y: rand(0, state.height),
      radius: rand(1.5, 7),
      speed: rand(10, 42),
      wobble: rand(0, TWO_PI),
      alpha: rand(0.14, 0.45),
    }));
  }

  function spawnAnimal() {
    const template = choose(animalTypes);
    const side = Math.floor(rand(0, 4));
    const margin = 80;
    let x = rand(margin, state.width - margin);
    let y = rand(margin, state.height - margin);

    if (side === 0) x = -margin;
    if (side === 1) x = state.width + margin;
    if (side === 2) y = -margin;
    if (side === 3) y = state.height + margin;

    const targetX = rand(state.width * 0.18, state.width * 0.82);
    const targetY = rand(state.height * 0.18, state.height * 0.76);
    const angle = Math.atan2(targetY - y, targetX - x);
    const speed = template.speed * rand(0.72, 1.24);

    state.animals.push({
      ...template,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      phase: rand(0, TWO_PI),
      turnTimer: rand(1, 3.8),
      scale: rand(0.9, 1.18),
      eaten: false,
    });
  }

  function keepAnimalCount() {
    while (state.animals.length < ANIMAL_TARGET) {
      spawnAnimal();
    }

    animalCountEl.textContent = state.animals.length;
  }

  function update(dt) {
    if (state.paused) return;

    state.squid.bob += dt * 2.5;
    state.squid.bitePulse = Math.max(0, state.squid.bitePulse - dt * 4);

    updateSquid(dt);
    updateAnimals(dt);
    updateBubbles(dt);
    updateParticles(dt);
    checkEating();
  }

  function updateSquid(dt) {
    const squid = state.squid;
    const keyX =
      (state.keys.has("arrowright") ? 1 : 0) -
      (state.keys.has("arrowleft") ? 1 : 0);
    const keyY =
      (state.keys.has("arrowdown") ? 1 : 0) -
      (state.keys.has("arrowup") ? 1 : 0);
    const keyLength = Math.hypot(keyX, keyY);
    let desiredVx = 0;
    let desiredVy = 0;

    if (keyLength > 0) {
      const keySpeed = 435;
      desiredVx = (keyX / keyLength) * keySpeed;
      desiredVy = (keyY / keyLength) * keySpeed;
    }

    squid.vx = lerp(squid.vx, desiredVx, 1 - Math.pow(0.001, dt));
    squid.vy = lerp(squid.vy, desiredVy, 1 - Math.pow(0.001, dt));

    squid.x += squid.vx * dt;
    squid.y += squid.vy * dt;
    squid.x = clamp(squid.x, 52, state.width - 52);
    squid.y = clamp(squid.y, 62, state.height - 72);

    const moving = Math.hypot(squid.vx, squid.vy) > 8;
    const targetAngle = moving ? Math.atan2(squid.vy, squid.vx) : squid.angle;
    squid.angle = rotateToward(squid.angle, targetAngle, dt * 8);
  }

  function rotateToward(current, target, amount) {
    let delta = ((target - current + Math.PI) % TWO_PI) - Math.PI;
    if (delta < -Math.PI) delta += TWO_PI;
    return current + delta * clamp(amount, 0, 1);
  }

  function updateAnimals(dt) {
    for (const animal of state.animals) {
      animal.phase += dt * (animal.kind === "fish" ? 6 : 3.2);
      animal.turnTimer -= dt;

      if (animal.turnTimer <= 0) {
        animal.turnTimer = rand(1.2, 4.2);
        const drift = rand(-0.9, 0.9);
        const away = Math.atan2(animal.y - state.squid.y, animal.x - state.squid.x);
        const distance = Math.hypot(animal.x - state.squid.x, animal.y - state.squid.y);
        animal.angle = distance < 210 ? away + drift * 0.55 : animal.angle + drift;
        const speed = animal.speed * rand(0.72, 1.18);
        animal.vx = Math.cos(animal.angle) * speed;
        animal.vy = Math.sin(animal.angle) * speed;
      }

      animal.vx += Math.cos(animal.phase * 0.7) * dt * 8;
      animal.vy += Math.sin(animal.phase * 0.9) * dt * 8;
      animal.x += animal.vx * dt;
      animal.y += animal.vy * dt;
      animal.angle = Math.atan2(animal.vy, animal.vx);

      const margin = 96;
      if (animal.x < -margin) animal.x = state.width + margin;
      if (animal.x > state.width + margin) animal.x = -margin;
      if (animal.y < -margin) animal.y = state.height + margin;
      if (animal.y > state.height + margin) animal.y = -margin;
    }
  }

  function updateBubbles(dt) {
    for (const bubble of state.bubbles) {
      bubble.wobble += dt * 1.5;
      bubble.y -= bubble.speed * dt;
      bubble.x += Math.sin(bubble.wobble) * dt * 12;

      if (bubble.y < -12) {
        bubble.y = state.height + rand(8, 80);
        bubble.x = rand(0, state.width);
      }
    }
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 10 * dt;
      return particle.life > 0;
    });
  }

  function checkEating() {
    const squid = state.squid;
    const mouthX = squid.x + Math.cos(squid.angle) * 46;
    const mouthY = squid.y + Math.sin(squid.angle) * 46;

    for (let i = state.animals.length - 1; i >= 0; i -= 1) {
      const animal = state.animals[i];
      const biteDistance = Math.hypot(animal.x - mouthX, animal.y - mouthY);
      const bodyDistance = Math.hypot(animal.x - squid.x, animal.y - squid.y);

      if (biteDistance < animal.radius + 30 || bodyDistance < animal.radius + 33) {
        state.score += animal.score;
        scoreEl.textContent = state.score;
        squid.bitePulse = 1;
        burst(animal.x, animal.y, animal.kind);
        state.animals.splice(i, 1);
      }
    }

    keepAnimalCount();
  }

  function burst(x, y, kind) {
    const colors = {
      fish: ["#ffcd58", "#ff7c5c", "#f5f0ce"],
      jellyfish: ["#efa4ff", "#8bd7ff", "#ffffff"],
      turtle: ["#89e67d", "#f3d38a", "#4fb073"],
    }[kind];

    for (let i = 0; i < 16; i += 1) {
      const angle = rand(0, TWO_PI);
      const speed = rand(36, 150);
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: rand(2, 5),
        color: choose(colors),
        life: rand(0.36, 0.78),
        maxLife: 0.78,
      });
    }
  }

  function render(time) {
    drawWater(time);
    drawSunRays(time);
    drawBubbles();
    drawReef(time);

    const sortedAnimals = [...state.animals].sort((a, b) => a.y - b.y);
    for (const animal of sortedAnimals) {
      drawAnimal(animal);
    }

    drawSquid(state.squid, time);
    drawParticles();
    drawVignette();

    if (state.paused) {
      drawPauseOverlay();
    }
  }

  function drawWater(time) {
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    gradient.addColorStop(0, "#087d91");
    gradient.addColorStop(0.42, "#075f83");
    gradient.addColorStop(0.78, "#093966");
    gradient.addColorStop(1, "#081d3b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = "#9ee8ef";
    ctx.lineWidth = 2;
    for (let y = 32; y < state.height; y += 42) {
      ctx.beginPath();
      for (let x = -40; x <= state.width + 40; x += 18) {
        const wave = Math.sin(x * 0.018 + y * 0.035 + time * 0.0014) * 8;
        if (x === -40) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSunRays(time) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 7; i += 1) {
      const x = state.width * (0.08 + i * 0.15) + Math.sin(time * 0.0004 + i) * 28;
      const ray = ctx.createLinearGradient(x, 0, x + 80, state.height * 0.9);
      ray.addColorStop(0, "rgba(157, 244, 232, 0.18)");
      ray.addColorStop(1, "rgba(157, 244, 232, 0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(x - 26, 0);
      ctx.lineTo(x + 48, 0);
      ctx.lineTo(x + 170, state.height);
      ctx.lineTo(x - 120, state.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBubbles() {
    ctx.save();
    for (const bubble of state.bubbles) {
      ctx.globalAlpha = bubble.alpha;
      ctx.strokeStyle = "#ddffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, TWO_PI);
      ctx.stroke();
      ctx.globalAlpha = bubble.alpha * 0.75;
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.radius * 0.26, bubble.y - bubble.radius * 0.26, bubble.radius * 0.25, 0, TWO_PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    ctx.restore();
  }

  function drawReef(time) {
    const floorY = state.height - 54;

    ctx.save();
    ctx.fillStyle = "#102249";
    ctx.beginPath();
    ctx.moveTo(0, state.height);
    for (let x = 0; x <= state.width; x += 28) {
      const ridge = Math.sin(x * 0.02) * 12 + Math.sin(x * 0.051) * 7;
      ctx.lineTo(x, floorY + ridge);
    }
    ctx.lineTo(state.width, state.height);
    ctx.closePath();
    ctx.fill();

    for (const coral of state.reef) {
      drawCoral(coral, time);
    }

    drawSeaGrass(time);
    drawSandDots(floorY);
    ctx.restore();
  }

  function drawCoral(coral, time) {
    const sway = Math.sin(time * 0.0013 + coral.phase) * 4;
    const topX = coral.x + coral.lean * coral.height + sway;
    const topY = coral.y - coral.height;

    ctx.strokeStyle = coral.color;
    ctx.lineCap = "round";
    ctx.lineWidth = coral.width * 0.34;
    ctx.beginPath();
    ctx.moveTo(coral.x, coral.y);
    ctx.quadraticCurveTo(coral.x + coral.lean * coral.height * 0.5, coral.y - coral.height * 0.55, topX, topY);
    ctx.stroke();

    ctx.lineWidth = Math.max(4, coral.width * 0.18);
    for (let i = 0; i < coral.branches; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const branchY = coral.y - coral.height * randStable(coral.phase, i, 0.28, 0.82);
      const branchLength = coral.height * randStable(coral.phase + 4, i, 0.16, 0.34);
      ctx.beginPath();
      ctx.moveTo(coral.x + (branchY - coral.y) * coral.lean * 0.35, branchY);
      ctx.quadraticCurveTo(
        coral.x + side * branchLength * 0.48,
        branchY - branchLength * 0.2,
        coral.x + side * branchLength,
        branchY - branchLength * 0.38,
      );
      ctx.stroke();
    }
  }

  function randStable(seed, index, min, max) {
    const value = Math.sin(seed * 83.13 + index * 19.71) * 43758.5453;
    return min + (value - Math.floor(value)) * (max - min);
  }

  function drawSeaGrass(time) {
    ctx.save();
    ctx.strokeStyle = "#2ec785";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    for (let x = -10; x < state.width + 20; x += 18) {
      const baseY = state.height - randStable(x, 1, 8, 30);
      const length = randStable(x, 2, 26, 88);
      const sway = Math.sin(time * 0.0017 + x * 0.09) * 11;
      ctx.globalAlpha = randStable(x, 3, 0.26, 0.62);
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + sway * 0.4, baseY - length * 0.5, x + sway, baseY - length);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSandDots(floorY) {
    ctx.save();
    const sandColors = ["#f6d28b", "#f2a45e", "#6dc7b4", "#ff7772"];
    for (let i = 0; i < 120; i += 1) {
      const x = randStable(i, 7, 0, state.width);
      const y = randStable(i, 8, floorY, state.height);
      ctx.globalAlpha = randStable(i, 9, 0.16, 0.5);
      ctx.fillStyle = sandColors[Math.floor(randStable(i, 11, 0, sandColors.length))];
      ctx.beginPath();
      ctx.arc(x, y, randStable(i, 10, 1, 3.4), 0, TWO_PI);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAnimal(animal) {
    ctx.save();
    ctx.translate(animal.x, animal.y);
    ctx.rotate(animal.angle);
    ctx.scale(animal.scale, animal.scale);

    if (animal.kind === "fish") drawFish(animal);
    if (animal.kind === "jellyfish") drawJellyfish(animal);
    if (animal.kind === "turtle") drawTurtle(animal);

    ctx.restore();
  }

  function drawFish(animal) {
    const wiggle = Math.sin(animal.phase) * 4;
    ctx.fillStyle = "#ffb344";
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 13 + wiggle * 0.12, 0, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = "#ff6b4a";
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-42, -14 - wiggle);
    ctx.lineTo(-38, 0);
    ctx.lineTo(-42, 14 + wiggle);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffe8a8";
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(11, -25);
    ctx.lineTo(15, -6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#10233f";
    ctx.beginPath();
    ctx.arc(14, -4, 3.2, 0, TWO_PI);
    ctx.fill();
  }

  function drawJellyfish(animal) {
    ctx.rotate(Math.PI / 2);
    const pulse = Math.sin(animal.phase) * 0.08 + 1;

    ctx.fillStyle = "rgba(236, 143, 255, 0.84)";
    ctx.beginPath();
    ctx.ellipse(0, -2, 25 * pulse, 20, 0, Math.PI, 0);
    ctx.quadraticCurveTo(19, 18, 0, 17);
    ctx.quadraticCurveTo(-19, 18, -25 * pulse, -2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 241, 255, 0.38)";
    ctx.beginPath();
    ctx.ellipse(-8, -5, 8, 5, -0.3, 0, TWO_PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(185, 236, 255, 0.86)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 8, 14);
      ctx.bezierCurveTo(i * 9 + Math.sin(animal.phase + i) * 6, 28, i * 4, 38, i * 8 + Math.cos(animal.phase) * 8, 50);
      ctx.stroke();
    }
  }

  function drawTurtle(animal) {
    const flap = Math.sin(animal.phase) * 8;

    ctx.fillStyle = "#65c46f";
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 21, 0, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = "#377f58";
    ctx.beginPath();
    ctx.ellipse(0, 0, 21, 16, 0, 0, TWO_PI);
    ctx.fill();

    ctx.strokeStyle = "#a5e887";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 15);
    ctx.stroke();

    ctx.fillStyle = "#7bdc82";
    ctx.beginPath();
    ctx.ellipse(28, 0, 10, 8, 0, 0, TWO_PI);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-4, -24, 8, 15, flap * 0.02, 0, TWO_PI);
    ctx.ellipse(-4, 24, 8, 15, -flap * 0.02, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = "#12304c";
    ctx.beginPath();
    ctx.arc(31, -3, 1.8, 0, TWO_PI);
    ctx.fill();
  }

  function drawSquid(squid, time) {
    ctx.save();
    ctx.translate(squid.x, squid.y + Math.sin(squid.bob) * 3);
    ctx.rotate(squid.angle);

    drawTentacles(squid, time);
    drawSquidBody(squid);
    drawTeeth(squid);
    drawSquidEyes(squid);

    ctx.restore();
  }

  function drawTentacles(squid, time) {
    const tentacleCount = 8;
    for (let i = 0; i < tentacleCount; i += 1) {
      const t = i / (tentacleCount - 1);
      const offset = lerp(-36, 36, t);
      const sideBias = offset / 42;
      const length = 124 + Math.cos(time * 0.002 + i) * 16;
      const rootX = -22;
      const rootY = offset * 0.64;
      const wave = Math.sin(time * 0.004 + i * 0.9) * 24;
      const endX = -length;
      const endY = offset * 1.2 + wave + sideBias * 16;

      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "#be1f32";
      ctx.lineWidth = 15 - Math.abs(sideBias) * 4;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.bezierCurveTo(-58, rootY + sideBias * 26, -86, endY - wave * 0.2, endX, endY);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 121, 82, 0.42)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rootX - 4, rootY - 3);
      ctx.bezierCurveTo(-55, rootY + sideBias * 20, -92, endY - 8, endX - 3, endY - 4);
      ctx.stroke();

      ctx.translate(endX, endY);
      ctx.rotate(sideBias * 0.45 + Math.sin(time * 0.003 + i) * 0.18);
      ctx.fillStyle = "#ff9b37";
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 13, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 209, 118, 0.72)";
      ctx.beginPath();
      ctx.ellipse(5, -3, 9, 4, -0.2, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawSquidBody(squid) {
    const pulse = squid.bitePulse;
    const bodyGradient = ctx.createRadialGradient(16, -18, 12, 4, 0, 74);
    bodyGradient.addColorStop(0, "#ff4b52");
    bodyGradient.addColorStop(0.55, "#d92a38");
    bodyGradient.addColorStop(1, "#8f1328");

    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(60 + pulse * 8, 0);
    ctx.bezierCurveTo(39, -58, -35, -61, -58, -18);
    ctx.bezierCurveTo(-76, 17, -28, 59, 30, 44);
    ctx.bezierCurveTo(48, 38, 68 + pulse * 7, 18, 60 + pulse * 8, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 115, 91, 0.48)";
    ctx.beginPath();
    ctx.ellipse(-3, -20, 34, 18, -0.18, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = "#a9152c";
    ctx.beginPath();
    ctx.moveTo(-38, -44);
    ctx.quadraticCurveTo(-68, -66, -64, -25);
    ctx.quadraticCurveTo(-50, -37, -38, -44);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-35, 40);
    ctx.quadraticCurveTo(-70, 58, -63, 18);
    ctx.quadraticCurveTo(-49, 31, -35, 40);
    ctx.fill();
  }

  function drawTeeth(squid) {
    const pulse = squid.bitePulse;
    const toothCount = 7;
    ctx.fillStyle = "#ffad39";
    for (let i = 0; i < toothCount; i += 1) {
      const y = lerp(-20, 20, i / (toothCount - 1));
      const toothLength = 12 + pulse * 7 + (i % 2) * 3;
      ctx.beginPath();
      ctx.moveTo(50, y - 4);
      ctx.lineTo(50 + toothLength, y);
      ctx.lineTo(50, y + 4);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawSquidEyes(squid) {
    const lookX = clamp(squid.vx / 180, -3, 3);
    const lookY = clamp(squid.vy / 180, -3, 3);

    for (const y of [-18, 17]) {
      ctx.fillStyle = "#ffe6cf";
      ctx.beginPath();
      ctx.ellipse(24, y, 12, 10, 0, 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = "#24162b";
      ctx.beginPath();
      ctx.arc(27 + lookX, y + lookY, 5, 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(29 + lookX, y - 2 + lookY, 1.8, 0, TWO_PI);
      ctx.fill();
    }
  }

  function drawParticles() {
    ctx.save();
    for (const particle of state.particles) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, TWO_PI);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawVignette() {
    const gradient = ctx.createRadialGradient(
      state.width * 0.5,
      state.height * 0.42,
      Math.min(state.width, state.height) * 0.16,
      state.width * 0.5,
      state.height * 0.45,
      Math.max(state.width, state.height) * 0.78,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 9, 30, 0.54)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(3, 13, 28, 0.42)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#fff8ef";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 42px system-ui, sans-serif";
    ctx.fillText("Paused", state.width / 2, state.height / 2);
    ctx.restore();
  }

  function frame(time) {
    const dt = Math.min((time - state.lastTime) / 1000 || 0, 0.033);
    state.lastTime = time;
    update(dt);
    render(time);
    window.requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
      event.preventDefault();
      state.keys.add(key);
    }

    if (key === " " || key === "escape") {
      event.preventDefault();
      togglePause();
    }
  });
  window.addEventListener("keyup", (event) => {
    state.keys.delete(event.key.toLowerCase());
  });

  function togglePause() {
    state.paused = !state.paused;
    pauseButton.textContent = state.paused ? "Resume" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(state.paused));
  }

  pauseButton.addEventListener("click", togglePause);

  resize();
  window.requestAnimationFrame(frame);
})();
