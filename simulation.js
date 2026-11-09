/* Les trois simulations du carré mobile VGA.
   Le modèle reprend exactement la logique du VHDL : mêmes constantes, mêmes règles. */
(() => {
  /* ---------- Paramètres (source unique) ---------- */
  const FRAME_HZ = 25e6 / (800 * 525);   // 59,52 images par seconde
  const S0 = 40, Y0 = 220, V0 = 4, X0 = 300;

  const fr = (n, d = 1) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);

  let tabActive = false;      // l'onglet Simulation est-il affiché ?
  let sub = 'resultat';       // sous-vue affichée

  /* ---------- Boutons KEY0 / KEY1 ---------- */
  const keys = { k0: false, k1: false };
  function setKey(which, down) {
    if (keys[which] === down) return;
    keys[which] = down;
    document.querySelectorAll(`[data-key="${which}"]`).forEach(b => {
      b.classList.toggle('pressed', down);
      b.setAttribute('aria-pressed', String(down));
    });
    document.querySelectorAll(`[data-level="${which}"]`).forEach(el => {
      el.textContent = down ? 'niveau 0, appuyé' : 'niveau 1, relâché';
    });
  }
  document.querySelectorAll('button.key').forEach(b => {
    const k = b.dataset.key;
    b.addEventListener('pointerdown', e => { b.setPointerCapture(e.pointerId); setKey(k, true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => b.addEventListener(t, () => setKey(k, false)));
    b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setKey(k, true); } });
    b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') setKey(k, false); });
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
  const typing = el => el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
  window.addEventListener('keydown', e => {
    if (!tabActive || typing(e.target)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setKey('k0', true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setKey('k1', true); }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft') setKey('k0', false);
    if (e.key === 'ArrowRight') setKey('k1', false);
  });
  window.addEventListener('blur', () => { setKey('k0', false); setKey('k1', false); });

  /* Règle du VHDL : if KEY0 … elsif KEY1 … sinon x_pos garde sa valeur */
  function rule(x, S, V) {
    if (keys.k0 && x >= V) return { x: x - V, row: 0 };
    if (keys.k1 && x <= 640 - S - V) return { x: x + V, row: 1 };
    return { x, row: 2 };
  }

  /* ---------- Navigation : onglet et sous-vues ---------- */
  document.addEventListener('viewchange', e => {
    tabActive = e.detail === 'simulation';
    if (!tabActive) { setKey('k0', false); setKey('k1', false); }
    if (tabActive && sub === 'signaux') drawSignals();
  });
  document.querySelectorAll('.subnav button').forEach(b => b.addEventListener('click', () => {
    sub = b.dataset.sub;
    document.querySelectorAll('.subnav button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    ['resultat', 'mecanisme', 'signaux'].forEach(s => { $('sub-' + s).hidden = s !== sub; });
    if (sub === 'signaux') drawSignals();
  }));

  /* ---------- 1. Résultat ---------- */
  const resCtx = $('res-canvas').getContext('2d');
  const R = { x: X0, frames: 0, acc: 0, row: 2 };
  const resRows = [...document.querySelectorAll('#sub-resultat tr[data-row]')];
  $('res-reset').addEventListener('click', () => { R.x = X0; });
  function stepResult(dt) {
    R.acc += dt;
    let n = 0;
    while (R.acc >= 1 / FRAME_HZ && n < 8) {
      R.acc -= 1 / FRAME_HZ;
      const r = rule(R.x, S0, V0);
      R.x = r.x; R.row = r.row; R.frames++; n++;
    }
  }
  function drawResult() {
    resCtx.fillStyle = '#000'; resCtx.fillRect(0, 0, 640, 480);
    resCtx.fillStyle = '#2BD46A'; resCtx.fillRect(R.x, Y0, S0, S0);
    resRows.forEach((tr, i) => tr.classList.toggle('active', i === R.row));
    $('res-x').textContent = R.x;
    $('res-frames').textContent = R.frames.toLocaleString('fr-FR');
    $('res-time').textContent = fr(R.frames / FRAME_HZ) + ' s';
    let msg = 'Aucun bouton : x_pos garde sa valeur.';
    if (R.row === 0) msg = 'KEY0 appuyé : le carré recule de 4 pixels par image.';
    else if (R.row === 1) msg = 'KEY1 appuyé : le carré avance de 4 pixels par image.';
    else if (keys.k0 || keys.k1) msg = 'Bord atteint : la condition de borne bloque le mouvement.';
    $('res-status').textContent = msg;
  }

  /* ---------- 2. Mécanisme ---------- */
  const W = 800, H = 525;
  const mCtx = $('mech-canvas').getContext('2d');
  const img = mCtx.createImageData(W, H);
  const buf = new Uint32Array(img.data.buffer);
  const BLACK = 0xFF000000, GREEN = 0xFF6AD42B, PORCH = 0xFF3B3E3A, SYNC = 0xFF1F5A8C;
  const isHs = h => h >= 656 && h <= 751;
  const isVs = v => v >= 490 && v <= 491;
  for (let v = 0; v < H; v++) for (let h = 0; h < W; h++) {
    buf[v * W + h] = (h < 640 && v < 480) ? BLACK : ((isHs(h) || isVs(v)) ? SYNC : PORCH);
  }
  const M = { h: 0, v: 0, x: X0, frames: 0, playing: !reduceMotion, speed: 420000, acc: 0, mode: 'frame' };
  const greenAt = (h, v, x) => h < 640 && v < 480 && h >= x && h < x + S0 && v >= Y0 && v < Y0 + S0;
  function stepPixel() {
    if (M.h < 640 && M.v < 480) buf[M.v * W + M.h] = greenAt(M.h, M.v, M.x) ? GREEN : BLACK;
    if (M.h === 799) {
      M.h = 0;
      if (M.mode === 'line') M.x = rule(M.x, S0, V0).x;
      if (M.v === 524) {
        M.v = 0; M.frames++;
        if (M.mode === 'frame') M.x = rule(M.x, S0, V0).x;
      } else M.v++;
    } else M.h++;
  }
  const speeds = [
    { v: 25, label: 'Un pixel toutes les 40 ms' },
    { v: 800, label: 'Une ligne par seconde' },
    { v: 25000, label: '31 lignes par seconde' },
    { v: 420000, label: 'Une image par seconde' },
    { v: 2520000, label: 'Six images par seconde' }
  ];
  const speedBox = $('mech-speeds');
  speeds.forEach(s => {
    const lab = document.createElement('label');
    lab.className = 'choice';
    const factor = Math.round(25e6 / s.v).toLocaleString('fr-FR');
    lab.innerHTML = `<input type="radio" name="mech-speed" value="${s.v}" ${s.v === M.speed ? 'checked' : ''}><span>${s.label}<br><span class="note">${factor} fois plus lent que la carte</span></span>`;
    speedBox.appendChild(lab);
  });
  speedBox.addEventListener('change', e => { M.speed = Number(e.target.value); M.acc = 0; });
  document.querySelectorAll('input[name="mech-mode"]').forEach(r => r.addEventListener('change', e => { M.mode = e.target.value; }));
  const playBtn = $('mech-play');
  const syncPlay = () => { playBtn.textContent = M.playing ? 'Pause' : 'Lecture'; };
  syncPlay();
  playBtn.addEventListener('click', () => { M.playing = !M.playing; M.acc = 0; syncPlay(); });
  $('mech-px').addEventListener('click', () => stepPixel());
  $('mech-line').addEventListener('click', () => { do { stepPixel(); } while (M.h !== 0); });
  $('mech-frame').addEventListener('click', () => { do { stepPixel(); } while (M.h !== 0 || M.v !== 0); });

  function zoneName(h, v) {
    if (h < 640 && v < 480) return 'Visible';
    if (isHs(h) && isVs(v)) return 'Impulsions HSYNC et VSYNC';
    if (isHs(h)) return 'Impulsion HSYNC';
    if (isVs(v)) return 'Impulsion VSYNC';
    return 'Marge (temps mort)';
  }
  function stepMech(dt) {
    if (!M.playing) return;
    M.acc += dt * M.speed;
    let n = Math.floor(M.acc);
    M.acc -= n;
    n = Math.min(n, 3000000);
    for (let i = 0; i < n; i++) stepPixel();
  }
  function drawMech() {
    mCtx.putImageData(img, 0, 0);
    mCtx.strokeStyle = 'rgba(255,255,255,0.45)'; mCtx.lineWidth = 1;
    mCtx.strokeRect(0.5, 0.5, 640, 480);
    mCtx.strokeStyle = 'rgba(255,255,255,0.22)';
    mCtx.beginPath();
    mCtx.moveTo(M.h + 0.5, 0); mCtx.lineTo(M.h + 0.5, H);
    mCtx.moveTo(0, M.v + 0.5); mCtx.lineTo(W, M.v + 0.5);
    mCtx.stroke();
    mCtx.strokeStyle = '#fff'; mCtx.lineWidth = 2.5;
    mCtx.beginPath(); mCtx.arc(M.h + 0.5, M.v + 0.5, 8, 0, Math.PI * 2); mCtx.stroke();
    $('m-h').textContent = M.h;
    $('m-v').textContent = M.v;
    $('m-zone').textContent = zoneName(M.h, M.v);
    $('m-hs').textContent = isHs(M.h) ? '0 (impulsion)' : '1';
    $('m-vs').textContent = isVs(M.v) ? '0 (impulsion)' : '1';
    $('m-g').textContent = greenAt(M.h, M.v, M.x) ? '1 (vert)' : '0';
    $('m-x').textContent = M.x;
    $('m-frames').textContent = M.frames.toLocaleString('fr-FR');
  }

  /* ---------- 3. Signaux et paramètres ---------- */
  const P = { line: 240, S: 40, x: 300, Y: 220, V: 4, mode: 'carre' };
  function clampParams() {
    $('p-x').max = 640 - P.S; $('p-y').max = 480 - P.S;
    if (P.x > 640 - P.S) P.x = 640 - P.S;
    if (P.Y > 480 - P.S) P.Y = 480 - P.S;
    $('p-x').value = P.x; $('p-y').value = P.Y;
    $('o-line').textContent = P.line; $('o-s').textContent = P.S; $('o-x').textContent = P.x;
    $('o-y').textContent = P.Y; $('o-v').textContent = P.V;
  }
  [['p-line', 'line'], ['p-s', 'S'], ['p-x', 'x'], ['p-y', 'Y'], ['p-v', 'V']].forEach(([id, key]) => {
    $(id).addEventListener('input', e => { P[key] = Number(e.target.value); clampParams(); drawSignals(); });
  });
  document.querySelectorAll('input[name="sig-mode"]').forEach(r => r.addEventListener('change', e => { P.mode = e.target.value; drawSignals(); }));

  const pGreen = (h, v) => P.mode === 'v1'
    ? (h < 640 && v < 480)
    : (h >= P.x && h < P.x + P.S && v >= P.Y && v < P.Y + P.S);
  const lineHasGreen = v => P.mode === 'v1' ? v < 480 : (v >= P.Y && v < P.Y + P.S);
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function drawChrono(cv, n, zones, rows, ticks, marker) {
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth;
    if (!w) return;
    const h = 44 + rows.length * 58 + 34;
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const ink = cssVar('--ink'), muted = cssVar('--muted'), line = cssVar('--line'), sig = cssVar('--signal'), syn = cssVar('--sync');
    const font = cssVar('--font') || 'sans-serif';
    const L = 92, Rm = 10, pw = w - L - Rm;
    const X = i => L + (i / n) * pw;
    zones.forEach(z => {
      c.globalAlpha = z.kind === 'vis' ? 0.35 : (z.kind === 'sync' ? 0.45 : 1);
      c.fillStyle = z.kind === 'vis' ? sig : (z.kind === 'sync' ? syn : line);
      c.fillRect(X(z.a), 10, X(z.b + 1) - X(z.a), 20);
    });
    c.globalAlpha = 1;
    c.fillStyle = muted; c.font = '12px ' + font; c.textAlign = 'left';
    c.fillText('zones', 0, 25);
    ticks.forEach(t => {
      c.strokeStyle = line; c.lineWidth = 1; c.setLineDash([3, 4]);
      c.beginPath(); c.moveTo(X(t.v) + 0.5, 10); c.lineTo(X(t.v) + 0.5, h - 30); c.stroke();
      c.setLineDash([]);
      c.fillStyle = muted; c.font = '12px ' + font; c.textAlign = t.align || 'center';
      c.fillText(String(t.v), X(t.v), t.low ? h - 4 : h - 18);
    });
    rows.forEach((r, k) => {
      const top = 48 + k * 58, hi = top + 8, lo = top + 38;
      c.fillStyle = ink; c.font = '700 14px ' + font; c.textAlign = 'left';
      c.fillText(r.name, 0, top + 28);
      c.strokeStyle = r.color; c.lineWidth = 2; c.beginPath();
      let prev = r.fn(0) ? 1 : 0;
      c.moveTo(X(0), prev ? hi : lo);
      for (let i = 1; i < n; i++) {
        const v = r.fn(i) ? 1 : 0;
        if (v !== prev) { c.lineTo(X(i), prev ? hi : lo); c.lineTo(X(i), v ? hi : lo); prev = v; }
      }
      c.lineTo(X(n), prev ? hi : lo);
      c.stroke();
    });
    if (marker !== undefined) {
      c.strokeStyle = ink; c.lineWidth = 2;
      c.beginPath(); c.moveTo(X(marker) + 0.5, 6); c.lineTo(X(marker) + 0.5, h - 30); c.stroke();
    }
  }

  function drawPreview() {
    const c = $('prev-canvas').getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, 640, 480);
    c.fillStyle = '#2BD46A';
    if (P.mode === 'v1') c.fillRect(0, 0, 640, 480);
    else c.fillRect(P.x, P.Y, P.S, P.S);
    if (P.line < 480) {
      c.strokeStyle = P.mode === 'v1' ? '#000' : '#fff';
      c.lineWidth = 3; c.setLineDash([10, 8]);
      c.beginPath(); c.moveTo(0, P.line + 0.5); c.lineTo(640, P.line + 0.5); c.stroke();
      c.setLineDash([]);
    }
  }

  function drawCalc() {
    const part = P.mode === 'v1' ? (640 * 480) / (800 * 525) : (P.S * P.S) / (800 * 525);
    const crossing = (640 - P.S) / (P.V * FRAME_HZ);
    const rows = [
      ['Course de x_pos', `0 à ${640 - P.S}`],
      ['Vitesse du carré', `${Math.round(P.V * FRAME_HZ)} pixels/s`],
      ['Traversée complète', `${fr(crossing)} s`],
      ['Pixels verts par image', (P.mode === 'v1' ? 640 * 480 : P.S * P.S).toLocaleString('fr-FR')],
      ['Part du temps où GREEN = 1', `${fr(part * 100, 2)} %`],
      ['Moyenne sur la broche GREEN, à vide', `${fr(3.24 * part, 2)} V`]
    ];
    $('calc').innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td></tr>`).join('');
  }

  function drawSignals() {
    if (!tabActive || sub !== 'signaux') return;
    $('line-title').textContent = `Une ligne, la n° ${P.line}`;
    drawChrono($('chrono-line'), 800,
      [{ a: 0, b: 639, kind: 'vis' }, { a: 640, b: 655, kind: 'porch' }, { a: 656, b: 751, kind: 'sync' }, { a: 752, b: 799, kind: 'porch' }],
      [
        { name: 'HSYNC', color: cssVar('--sync'), fn: h => !isHs(h) },
        { name: 'GREEN', color: cssVar('--signal'), fn: h => pGreen(h, P.line) }
      ],
      [{ v: 0, align: 'left' }, { v: 640 }, { v: 656, low: true }, { v: 752 }, { v: 800, align: 'right', low: true }]
    );
    drawChrono($('chrono-frame'), 525,
      [{ a: 0, b: 479, kind: 'vis' }, { a: 480, b: 489, kind: 'porch' }, { a: 490, b: 491, kind: 'sync' }, { a: 492, b: 524, kind: 'porch' }],
      [
        { name: 'VSYNC', color: cssVar('--sync'), fn: v => !isVs(v) },
        { name: 'Vert ?', color: cssVar('--signal'), fn: v => lineHasGreen(v) }
      ],
      [{ v: 0, align: 'left' }, { v: 480 }, { v: 490, low: true }, { v: 525, align: 'right', low: true }],
      P.line
    );
    drawPreview();
    drawCalc();
  }
  new ResizeObserver(() => drawSignals()).observe($('sub-signaux'));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawSignals);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawSignals);

  /* ---------- Boucle d'animation ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (tabActive && sub === 'resultat') { stepResult(dt); drawResult(); }
    else if (tabActive && sub === 'mecanisme') { stepMech(dt); drawMech(); }
    requestAnimationFrame(loop);
  }
  clampParams();
  drawResult();
  drawMech();
  requestAnimationFrame(loop);
})();
