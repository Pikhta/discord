// =========================================================
// 3D‑сцена главного экрана: бот‑маскот + орбита иконок сервера
// =========================================================
// Обычный (не модульный) скрипт: так сайт работает и при открытии index.html двойным кликом.
// three.js подгружается с CDN через динамический import().
(async () => {
const container = document.getElementById('hero-scene');
const loader = document.getElementById('scene-loader');
let THREE, RoomEnvironment, RoundedBoxGeometry;
try {
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
  ({ RoomEnvironment } = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js'));
  ({ RoundedBoxGeometry } = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/geometries/RoundedBoxGeometry.js'));
} catch (err) {
  console.warn('Не удалось загрузить three.js:', err);
  container.classList.add('no-webgl');
  loader.classList.add('is-hidden');
  return;
}

const bubble = document.getElementById('bot-bubble');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const BOT_PHRASES = [
  'Привет! Я <b>Минти</b> из <b>Pikhta Servers</b>. Хочешь свой Discord‑сервер? Сделаем под ключ 🌲',
  'Каналы, роли, боты, защита — всё настроим <b>за тебя</b>.',
  'Ты придумываешь идею, а я превращаю её в <b>готовый сервер</b>.',
  'Права без дыр: никто лишний не сможет <b>сломать сервер</b>.',
  'Сервер под ключ — <b>5 000 ₽</b>. Заказ — в Telegram <b>@nepikhta</b>.',
  '🔥 <b>Пашок</b>, для тебя спецпредложение: только сегодня цена — <b>10 000 ₽</b>!',
  'После сдачи передаём тебе <b>права владельца</b> — сервер полностью твой.',
  'Боты для приветствий, ролей и модерации будут <b>уже работать</b>.',
  'Смотри <b>примеры серверов</b> ниже — кликай по каналам!',
];

const ICONS = [
  { glyph: '#', color: '#3ccf9a', text: '<b>Каналы</b>: продумаю категории и каналы под твою тематику.' },
  { glyph: '♪', color: '#8b93ff', text: '<b>Голосовые</b>: лобби, созвоны, музыка — настрою с лимитами мест.' },
  { glyph: '@', color: '#ffb86b', text: '<b>Роли</b>: иерархия от админа до новичка и безопасные права.' },
  { glyph: '★', color: '#ff8fab', text: '<b>Оформление</b>: единый стиль, эмодзи, цвета ролей.' },
  { glyph: '⚙', color: '#5ec8e5', text: '<b>Боты</b>: приветствия, роли по реакциям, модерация, тикеты.' },
  { glyph: '+', color: '#2fbf8a', text: '<b>Заказать сервер</b> — пиши в Telegram <b>@nepikhta</b>!' },
];

function glyphTexture(glyph, { bg = null, fg = '#ffffff', size = 256, font = 150 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  if (bg) {
    g.fillStyle = bg;
    g.beginPath();
    g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${font}px Unbounded, "DejaVu Sans", "Segoe UI Symbol", sans-serif`;
  g.fillText(glyph, size / 2, size / 2 + font * 0.06);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    container.classList.add('no-webgl');
    loader.classList.add('is-hidden');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const camTarget = new THREE.Vector3(0, 0.15, 0);

  // ---- свет ----
  scene.add(new THREE.HemisphereLight('#eafff6', '#2a6b5a', 0.7));
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#7cffd0', 1.4);
  rim.position.set(-6, 2, -5);
  scene.add(rim);
  const fill = new THREE.PointLight('#a9b0ff', 6, 14);
  fill.position.set(-4, -1, 4);
  scene.add(fill);

  const world = new THREE.Group();
  scene.add(world);

  // ---- материалы ----
  const shell = new THREE.MeshPhysicalMaterial({ color: '#f4fffb', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
  const mint = new THREE.MeshPhysicalMaterial({ color: '#3ccf9a', roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const deep = new THREE.MeshPhysicalMaterial({ color: '#143f35', roughness: 0.12, metalness: 0.1, clearcoat: 1 });
  const glow = new THREE.MeshBasicMaterial({ color: '#6dffd0', toneMapped: false });
  const blush = new THREE.MeshBasicMaterial({ color: '#ff9fb8', transparent: true, opacity: 0.55, toneMapped: false });

  // ---- бот ----
  const bot = new THREE.Group();
  world.add(bot);
  const interactive = []; // меши для raycast

  const head = new THREE.Group();
  head.position.y = 0.6;
  bot.add(head);

  const headMesh = new THREE.Mesh(new RoundedBoxGeometry(2.3, 1.75, 1.75, 8, 0.6), shell);
  head.add(headMesh);

  const visor = new THREE.Mesh(new RoundedBoxGeometry(1.86, 1.2, 0.3, 6, 0.14), deep);
  visor.position.z = 0.77;
  head.add(visor);

  const face = new THREE.Group();
  face.position.z = 0.94;
  head.add(face);

  const eyeGeo = new THREE.CapsuleGeometry(0.12, 0.2, 8, 16);
  const eyeL = new THREE.Mesh(eyeGeo, glow);
  const eyeR = new THREE.Mesh(eyeGeo, glow);
  eyeL.position.set(-0.36, 0.08, 0);
  eyeR.position.set(0.36, 0.08, 0);
  face.add(eyeL, eyeR);

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 8, 24, Math.PI), glow);
  mouth.rotation.z = Math.PI;
  mouth.position.y = -0.2;
  face.add(mouth);

  const cheekGeo = new THREE.CircleGeometry(0.1, 24);
  const cheekL = new THREE.Mesh(cheekGeo, blush);
  const cheekR = new THREE.Mesh(cheekGeo, blush);
  cheekL.position.set(-0.64, -0.16, 0.01);
  cheekR.position.set(0.64, -0.16, 0.01);
  face.add(cheekL, cheekR);

  // антенна
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.42, 12), mint);
  stem.position.set(0, 1.08, 0.25);
  head.add(stem);
  const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), glow.clone());
  antBall.position.set(0, 1.34, 0.25);
  head.add(antBall);

  // наушники (голосовой чат!)
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.085, 12, 56, Math.PI), mint);
  band.rotation.x = -0.35;
  head.add(band);
  const cupGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 36);
  const ringGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 36);
  [-1, 1].forEach((s) => {
    const cup = new THREE.Mesh(cupGeo, deep);
    cup.rotation.z = Math.PI / 2;
    cup.position.x = s * 1.22;
    head.add(cup);
    const ring = new THREE.Mesh(ringGeo, glow);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = s * 1.37;
    head.add(ring);
  });
  // микрофон
  const micArm = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 8, 24, Math.PI * 0.42), deep);
  micArm.position.set(1.22, -0.05, 0.05);
  micArm.rotation.set(0, -Math.PI / 2, Math.PI * 1.08);
  head.add(micArm);
  const mic = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mint);
  mic.position.set(1.05, -0.62, 0.62);
  head.add(mic);

  // тело
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.35, 1.0, 1.05, 6, 0.4), shell);
  body.position.y = -0.95;
  bot.add(body);
  const badge = new THREE.Mesh(
    new THREE.CircleGeometry(0.27, 40),
    new THREE.MeshBasicMaterial({ map: glyphTexture('#', { bg: '#143f35', fg: '#6dffd0', font: 140 }), toneMapped: false })
  );
  badge.position.set(0, -0.92, 0.53);
  bot.add(badge);

  const handGeo = new THREE.SphereGeometry(0.24, 24, 16);
  const handL = new THREE.Mesh(handGeo, mint);
  const handR = new THREE.Mesh(handGeo, mint);
  bot.add(handL, handR);

  bot.traverse((o) => { if (o.isMesh) { o.userData.kind = 'bot'; interactive.push(o); } });

  // тень
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(15,70,55,0.35)', 'rgba(15,70,55,0)'), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.05;
  world.add(shadow);

  // ---- орбита иконок ----
  const orbit = new THREE.Group();
  world.add(orbit);
  const iconGeo = new RoundedBoxGeometry(0.82, 0.82, 0.22, 5, 0.24);
  const glyphGeo = new THREE.PlaneGeometry(0.62, 0.62);
  const icons = ICONS.map((def, i) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({ color: def.color, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
    const box = new THREE.Mesh(iconGeo, mat);
    const face = new THREE.Mesh(glyphGeo, new THREE.MeshBasicMaterial({ map: glyphTexture(def.glyph, { fg: '#0f2e27' }), transparent: true, toneMapped: false }));
    face.position.z = 0.115;
    g.add(box, face);
    box.userData = { kind: 'icon', index: i };
    face.userData = { kind: 'icon', index: i };
    interactive.push(box, face);
    orbit.add(g);
    return {
      group: g, def, mat,
      angle: (i / ICONS.length) * Math.PI * 2,
      radius: 3.05 + (i % 2) * 0.35,
      yOff: (i % 3 - 1) * 0.55,
      scale: 1, targetScale: 1, pop: 0, spin: 0,
    };
  });

  // ---- частицы ----
  const pCount = 70;
  const pPos = new Float32Array(pCount * 3);
  const pSeed = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 11;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    pSeed[i] = Math.random() * 100;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.09, map: radialTexture('rgba(109,255,208,1)', 'rgba(109,255,208,0)'),
    transparent: true, depthWrite: false, toneMapped: false, color: '#9dffd9',
  }));
  scene.add(particles);

  // ---- вспышки при клике ----
  const burstTextures = ['♥', '#', '✓', '!', '★', '@'].map((g, i) =>
    glyphTexture(g, { bg: ['#ff8fab', '#3ccf9a', '#6dffd0', '#ffb86b', '#8b93ff', '#5ec8e5'][i], fg: '#0f2e27', font: 130 })
  );
  const bursts = [];
  function spawnBurst(origin) {
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: burstTextures[i % burstTextures.length], transparent: true, toneMapped: false }));
      s.position.copy(origin);
      s.scale.setScalar(0.01);
      const a = Math.random() * Math.PI * 2;
      const sp = 2.2 + Math.random() * 2.5;
      s.userData = {
        v: new THREE.Vector3(Math.cos(a) * sp * 0.7, 3 + Math.random() * 3, Math.sin(a) * sp * 0.5 + 1.5),
        life: 0, max: 1.1 + Math.random() * 0.5, size: 0.28 + Math.random() * 0.18,
      };
      scene.add(s);
      bursts.push(s);
    }
  }

  // ---- пузырь с репликой ----
  let bubbleTimer = 0;
  let bubbleAnchor = null; // объект, к которому привязан пузырь
  function say(html, anchor = head, duration = 3800) {
    bubble.innerHTML = html;
    bubble.classList.add('is-visible');
    bubbleAnchor = anchor;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('is-visible'), duration);
  }

  // ---- взаимодействие ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  const rot = { y: -0.25, x: 0, vy: 0, vx: 0 };
  const drag = { active: false, id: null, sx: 0, sy: 0, lx: 0, ly: 0, moved: 0 };
  let hovered = null;
  let phraseIdx = 0;
  let clicks = 0;
  const react = { jump: 0, happy: 0, wave: 0, spin: 0 };

  function setNdc(e) {
    const r = container.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }
  function pick() {
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(interactive, false)[0];
    return hit ? hit.object.userData : null;
  }

  window.addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    look.tx = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.5, 1.5);
    look.ty = THREE.MathUtils.clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1.5, 1.5);
  }, { passive: true });

  container.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag.active = true;
    drag.id = e.pointerId;
    drag.sx = drag.lx = e.clientX;
    drag.sy = drag.ly = e.clientY;
    drag.moved = 0;
    rot.vy = rot.vx = 0;
    if (e.pointerType === 'mouse') container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    setNdc(e);
    if (drag.active && e.pointerId === drag.id) {
      const dx = e.clientX - drag.lx;
      const dy = e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 6) container.classList.add('is-dragging');
      rot.vy = dx * 0.006;
      rot.vx = dy * 0.003;
      rot.y += rot.vy;
      rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -0.4, 0.4);
    } else if (e.pointerType === 'mouse') {
      const hit = pick();
      hovered = hit;
      container.classList.toggle('is-hovering', !!hit);
    }
  });

  function endDrag(e) {
    if (!drag.active || e.pointerId !== drag.id) return;
    drag.active = false;
    container.classList.remove('is-dragging');
    if (drag.moved < 8) {
      setNdc(e);
      handleClick(pick());
    }
  }
  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', (e) => { drag.active = false; container.classList.remove('is-dragging'); });
  container.addEventListener('pointerleave', () => { hovered = null; container.classList.remove('is-hovering'); });

  function handleClick(hit) {
    if (!hit) return;
    if (hit.kind === 'bot') {
      clicks++;
      react.jump = 1;
      react.happy = 1;
      react.wave = 1;
      const top = new THREE.Vector3(0, 1.4, 0.4);
      head.localToWorld(top);
      spawnBurst(top);
      if (clicks % 6 === 0) {
        react.spin = 1;
        say('Ура, ты нашёл секретный трюк! 🎉 Раз ты такой любопытный — самое время <b>заказать сервер</b>.');
      } else {
        say(BOT_PHRASES[phraseIdx++ % BOT_PHRASES.length]);
      }
    } else if (hit.kind === 'icon') {
      const ic = icons[hit.index];
      ic.pop = 1;
      ic.spin = 1;
      react.happy = 0.6;
      say(ic.def.text, ic.group, 4200);
    }
  }

  // клавиатура: Enter/Space на сцене = клик по боту
  container.tabIndex = 0;
  container.setAttribute('role', 'button');
  container.setAttribute('aria-label', '3D‑бот Минти. Нажмите Enter, чтобы получить совет.');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick({ kind: 'bot' }); }
    if (e.key === 'ArrowLeft') rot.vy = -0.06;
    if (e.key === 'ArrowRight') rot.vy = 0.06;
  });

  // ---- размеры ----
  let orbitMaxX = 3.4;
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const aspect = w / h;
    const dist = aspect < 0.9 ? 11.8 : aspect < 1.15 ? 11 : 10.2;
    camera.position.set(0, 0.7, dist);
    // иконки не должны вылетать за края холста
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * aspect;
    orbitMaxX = Math.max(2.1, halfW - 0.6);
    camera.lookAt(camTarget);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // ---- видимость (не рендерим вне экрана) ----
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.01 }).observe(container);

  // ---- моргание ----
  let nextBlink = 2;
  let blink = 0;

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const speed = reduceMotion ? 0.35 : 1;
  let first = true;

  function tick() {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime * speed;

    // вращение мира с инерцией
    if (!drag.active) {
      rot.y += rot.vy;
      rot.vy *= 0.94;
      rot.x += rot.vx;
      rot.vx *= 0.9;
      rot.x *= 0.96;
      rot.y += (-0.25 + Math.sin(t * 0.2) * 0.15 - rot.y) * 0.004; // мягкий возврат
    }
    world.rotation.y = rot.y;
    world.rotation.x = rot.x;

    // взгляд за курсором
    look.x += (look.tx - look.x) * 0.08;
    look.y += (look.ty - look.y) * 0.08;
    head.rotation.y = look.x * 0.45 - rot.y * 0.25;
    head.rotation.x = -look.y * 0.25;
    face.position.x = look.x * 0.12;
    face.position.y = look.y * 0.08;
    body.rotation.y = look.x * 0.15;

    // реакции
    react.jump = Math.max(0, react.jump - dt * 1.6);
    react.happy = Math.max(0, react.happy - dt * 0.7);
    react.wave = Math.max(0, react.wave - dt * 1.1);
    react.spin = Math.max(0, react.spin - dt * 0.9);
    const jumpY = Math.sin((1 - react.jump) * Math.PI) * (react.jump > 0 ? 0.55 : 0);
    const bob = Math.sin(t * 1.6) * 0.12;
    bot.position.y = bob + jumpY;
    const squash = 1 + Math.sin((1 - react.jump) * Math.PI * 2) * 0.06 * react.jump;
    bot.scale.set(1 / squash, squash, 1 / squash);
    bot.rotation.y = react.spin > 0 ? (1 - react.spin) * Math.PI * 2 : 0;
    shadow.scale.setScalar(1 - (bob + jumpY) * 0.25);
    shadow.material.opacity = 1 - jumpY * 0.6;

    // руки
    handL.position.set(-1.0, -0.95 + Math.sin(t * 1.6 + 1) * 0.08, 0.15);
    handR.position.set(1.0, -0.95 + Math.sin(t * 1.6 + 2) * 0.08, 0.15);
    if (react.wave > 0) {
      const w = Math.sin(react.wave * Math.PI);
      handR.position.y += w * 1.05;
      handR.position.x += w * 0.25 + Math.sin(t * 18) * 0.12 * w;
      handL.position.y += w * 0.3;
    }

    // моргание и «счастливые» глаза
    nextBlink -= dt;
    if (nextBlink <= 0) { blink = 1; nextBlink = 2.5 + Math.random() * 3; }
    blink = Math.max(0, blink - dt * 7);
    const eyeY = react.happy > 0.15 ? 0.35 : 1 - Math.sin(blink * Math.PI) * 0.9;
    eyeL.scale.y = eyeR.scale.y = eyeY;
    const smile = 1 + react.happy * 0.6;
    mouth.scale.set(smile, smile, 1);
    blush.opacity = 0.45 + react.happy * 0.5 + (hovered?.kind === 'bot' ? 0.2 : 0);

    // антенна пульсирует
    const pulse = 1 + Math.sin(t * 3) * 0.12 + react.happy * 0.4;
    antBall.scale.setScalar(pulse);
    antBall.material.color.setHSL(0.44 + react.happy * 0.12, 1, 0.7);

    // иконки по орбите
    icons.forEach((ic, i) => {
      ic.angle += dt * 0.28 * speed;
      const a = ic.angle;
      ic.group.position.set(
        Math.cos(a) * Math.min(ic.radius, orbitMaxX),
        0.15 + ic.yOff + Math.sin(a * 2 + i) * 0.25,
        Math.sin(a) * ic.radius * 0.7
      );
      ic.pop = Math.max(0, ic.pop - dt * 2);
      ic.spin = Math.max(0, ic.spin - dt * 1.4);
      const isHover = hovered?.kind === 'icon' && hovered.index === i;
      ic.targetScale = isHover ? 1.22 : 1;
      ic.scale += (ic.targetScale - ic.scale) * 0.15;
      const s = ic.scale + Math.sin(ic.pop * Math.PI) * 0.45;
      ic.group.scale.setScalar(s);
      camera.getWorldPosition(tmp);
      ic.group.lookAt(tmp);
      ic.group.rotateZ(Math.sin(t * 1.3 + i) * 0.12);
      if (ic.spin > 0) ic.group.rotateY((1 - ic.spin) * Math.PI * 2);
      ic.mat.emissive.set(isHover ? ic.def.color : '#000000');
      ic.mat.emissiveIntensity = isHover ? 0.25 : 0;
    });

    // частицы
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      arr[i * 3 + 1] += dt * 0.18 * speed;
      arr[i * 3] += Math.sin(t + pSeed[i]) * dt * 0.05;
      if (arr[i * 3 + 1] > 3.6) arr[i * 3 + 1] = -3.6;
    }
    pGeo.attributes.position.needsUpdate = true;

    // вспышки
    for (let i = bursts.length - 1; i >= 0; i--) {
      const s = bursts[i];
      const u = s.userData;
      u.life += dt;
      u.v.y -= 7 * dt;
      s.position.addScaledVector(u.v, dt);
      const k = u.life / u.max;
      s.scale.setScalar(u.size * Math.min(1, u.life * 8) * (1 - k * 0.4));
      s.material.opacity = 1 - k * k;
      if (k >= 1) { scene.remove(s); s.material.dispose(); bursts.splice(i, 1); }
    }

    renderer.render(scene, camera);

    // позиция пузыря
    if (bubble.classList.contains('is-visible') && bubbleAnchor) {
      tmp.set(0, bubbleAnchor === head ? 1.5 : 0.55, 0);
      bubbleAnchor.localToWorld(tmp);
      tmp.project(camera);
      const w = container.clientWidth;
      const h = container.clientHeight;
      let x = (tmp.x * 0.5 + 0.5) * w;
      let y = (-tmp.y * 0.5 + 0.5) * h;
      const bw = bubble.offsetWidth;
      x = THREE.MathUtils.clamp(x, bw * 0.1 + 8, w - bw * 0.9 - 8);
      y = Math.max(bubble.offsetHeight + 8, y);
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
    }

    if (first) {
      first = false;
      loader.classList.add('is-hidden');
      setTimeout(() => say(BOT_PHRASES[phraseIdx++]), 900);
    }
  }
  tick();
}

// Шрифт нужен для глифов на текстурах — ждём его, но не дольше секунды
Promise.race([
  document.fonts ? document.fonts.load('700 100px Unbounded') : Promise.resolve(),
  new Promise((r) => setTimeout(r, 1000)),
]).finally(init);
})();
