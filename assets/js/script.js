// =============================================================================
// DOCE ACERTO — Jogo educativo (um arquivo, offline)
// =============================================================================

const DEFAULT_CONFIG = {
  levels: [
    { id: 1, name: "🍭 Colina dos Pirulitos", pattern: "AB", colors: 2, seqs: 6, seqLenBase: 5, emoji: "🍭" },
    { id: 2, name: "🍰 Planície do Bolo", pattern: "AB", colors: 3, seqs: 7, seqLenBase: 6, emoji: "🍰" },
    { id: 3, name: "🍫 Montanha de Chocolate", pattern: "ABC", colors: 3, seqs: 8, seqLenBase: 7, emoji: "🍫" },
    { id: 4, name: "🍦 Vale do Sorvete", pattern: "AABB|ABC", colors: 4, seqs: 10, seqLenBase: 8, emoji: "🍦" },
    { id: 5, name: "🏰 Castelo de Açúcar", pattern: "mixed", patterns: ["AB", "ABC", "AABB"], colors: 4, maxColors: 5, seqs: 12, seqLenBase: 9, emoji: "🏰" }
  ]
};

// ===== CONFIG — constantes globais =====
const CONFIG = {
  STORAGE_KEY: 'doceacerto_save_v1',
  TUTORIAL_SEQS: 8,
  INFINITE_STEP_EVERY: 5,
  MULT_MAX: 3,
  HINT_NAME_MS: 1500,
  ROUND_FADE_MS: 220,
  SLIDE_IN_MS: 520,
  STREAK_CELEBRATE: 3,
  MAP_LEVELS: 5,
  /** Raio mínimo das bolinhas no canvas (px) — alvo para toque infantil */
  MIN_BALL_RADIUS: 28,
  MAX_BALL_RADIUS: 46,
  MAX_PARTICULAS_ATIVAS: 120,
  COMBO_RAPIDO_MS: 2200,
  COMBO_RAPIDO_MIN: 3,
  STICKER_REWARD_BY_LEVEL: {
    1: 'st_morango',
    2: 'st_doce',
    3: 'st_limao',
    4: 'st_maca',
    5: 'st_castelo'
  }
};

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Fácil",
    speedMultiplier: 0.75,
    minGradeToPass: 60,
    maxColorsBonus: 0,
    hintsAfterErrors: 1,
    sequenceExtra: 0,
    timeWeight: 10,
    accuracyWeight: 70,
    attemptsWeight: 20,
    targetResponseMs: 5500,
    teacherText: "Sequências mais curtas, dica rápida e aprovação a partir de 60.",
    childPassText: "Bom trabalho! Vamos seguir com calma!"
  },
  normal: {
    label: "Normal",
    speedMultiplier: 1,
    minGradeToPass: 70,
    maxColorsBonus: 1,
    hintsAfterErrors: 2,
    sequenceExtra: 1,
    timeWeight: 15,
    accuracyWeight: 65,
    attemptsWeight: 20,
    targetResponseMs: 4500,
    teacherText: "Mais cores, sequência um pouco maior e aprovação a partir de 70.",
    childPassText: "Muito bom! Você está pronto para continuar!"
  },
  hard: {
    label: "Difícil",
    speedMultiplier: 1.25,
    minGradeToPass: 80,
    maxColorsBonus: 2,
    hintsAfterErrors: 2,
    sequenceExtra: 2,
    timeWeight: 20,
    accuracyWeight: 60,
    attemptsWeight: 20,
    targetResponseMs: 3500,
    teacherText: "Mais velocidade, mais cores, sequência maior e aprovação a partir de 80.",
    childPassText: "Excelente! Você dominou essa fase!"
  }
};

const DIFFICULTY_ALIASES = {
  slow: 'easy',
  easy: 'easy',
  normal: 'normal',
  fast: 'hard',
  hard: 'hard'
};

// ===== CORES — cada uma com fruta ou doce próprio (emoji visível em todo dispositivo) =====
const COLORS = [
  { id: 'red',    label: 'Vermelho', hex: '#FF3D3D', dark: '#c01010', mascot: '🍎', note: 261.6, name: 'Maçã', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/01-vermelho-maca.png' },
  { id: 'blue',   label: 'Azul',     hex: '#5B8BFF', dark: '#2a5ad4', mascot: '🫐', note: 293.7, name: 'Blueberry', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/02-azul-blueberry.png' },
  { id: 'yellow', label: 'Amarelo',  hex: '#FFD93D', dark: '#c4900a', mascot: '🍋', note: 329.6, name: 'Limão', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/03-amarelo-limao.png' },
  { id: 'green',  label: 'Verde',    hex: '#6BCB77', dark: '#3a9a45', mascot: '🍏', note: 349.2, name: 'Maçãzinha', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/04-verde-maca-verde.png' },
  { id: 'orange', label: 'Laranja',  hex: '#FF8C42', dark: '#cc5a12', mascot: '🍊', note: 392.0, name: 'Laranjito', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/05-laranja-laranja.png' },
  { id: 'purple', label: 'Roxo',     hex: '#C084FC', dark: '#7030a0', mascot: '🍇', note: 440.0, name: 'Uvite', asset: 'assets/img/bolinhas_chiclete_frutinhas_v2/06-roxo-uva.png' }
];

const BallAssetManager = {
  cache: {},
  preload() {
    COLORS.forEach(c => this.get(c));
  },
  get(color) {
    if (!color || !color.asset) return null;
    if (this.cache[color.id]) return this.cache[color.id];
    const img = new Image();
    img.src = color.asset;
    this.cache[color.id] = img;
    return img;
  }
};

const RoadAssetManager = {
  image: null,
  get() {
    if (this.image) return this.image;
    const img = new Image();
    img.src = 'assets/img/estrada-doce.png';
    this.image = img;
    return img;
  },
  preload() {
    this.get();
  }
};

const MachineAssetManager = {
  image: null,
  get() {
    if (this.image) return this.image;
    const img = new Image();
    img.src = 'assets/img/maquina_chiclete.png';
    this.image = img;
    return img;
  },
  preload() {
    this.get();
  }
};

// Forma por cor: vermelho=estrela, azul=triângulo, verde=quadrado, amarelo=círculo, laranja=cruz, roxo=losango.
const SHAPE_BY_COLOR = { red: 0, blue: 1, green: 2, yellow: 3, orange: 4, purple: 5 };
const SHAPE_SYMBOL_BY_COLOR = { red: '★', blue: '▲', green: '■', yellow: '●', orange: '✚', purple: '◆' };

// ===== getMascotSVG =====
function getMascotSVG(idx, size) {
  size = size || 70;
  const data = [
    { body: '#FF3D3D', body2: '#D91F2E', dark: '#8d121b', blush: '#ff9aa6', leaf: true, stem: true, shape: 'apple', smile: 'open', wink: false },
    { body: '#5B8BFF', body2: '#3A65D8', dark: '#203a92', blush: '#9ed7ff', leaf: true, stem: false, shape: 'berry', smile: 'open', wink: true },
    { body: '#FFD93D', body2: '#E9A90E', dark: '#8a5b00', blush: '#ff9da6', leaf: true, stem: false, shape: 'lemon', smile: 'open', wink: false },
    { body: '#6BCB77', body2: '#39A84C', dark: '#1d6a28', blush: '#b7f1b8', leaf: true, stem: true, shape: 'apple', smile: 'soft', wink: false },
    { body: '#FF8C42', body2: '#E35E17', dark: '#8f3508', blush: '#ffc28e', leaf: true, stem: true, shape: 'orange', smile: 'open', wink: true },
    { body: '#C084FC', body2: '#8B45D6', dark: '#55218f', blush: '#dfb7ff', leaf: true, stem: true, shape: 'plum', smile: 'open', wink: false }
  ];
  const c = data[idx] || data[0];
  const gid = 'm' + idx + '_' + Math.round(size);
  const bodyShape = {
    apple: '<path d="M50 30 C72 26 86 43 82 64 C78 86 60 91 50 82 C40 91 22 86 18 64 C14 43 28 26 50 30Z"/>',
    berry: '<path d="M18 61 C18 41 32 30 50 30 C68 30 82 41 82 61 C82 80 67 88 50 88 C33 88 18 80 18 61Z"/>',
    lemon: '<path d="M18 60 C18 42 34 31 50 31 C66 31 82 42 82 60 C82 78 66 88 50 88 C34 88 18 78 18 60Z"/>',
    orange: '<circle cx="50" cy="61" r="32"/>',
    plum: '<path d="M50 29 C69 29 82 43 82 62 C82 81 68 89 50 89 C32 89 18 81 18 62 C18 43 31 29 50 29Z"/>'
  }[c.shape];
  const leftEye = c.wink ? '<path d="M35 58 Q41 53 47 58" stroke="#2a1a3e" stroke-width="4" stroke-linecap="round" fill="none"/>' : '<ellipse cx="40" cy="58" rx="9" ry="10" fill="#fff"/><circle cx="40" cy="58" r="5.5" fill="#2a1a3e"/><circle cx="42" cy="55" r="2.2" fill="#fff"/>';
  const rightEye = '<ellipse cx="61" cy="58" rx="9" ry="10" fill="#fff"/><circle cx="61" cy="58" r="5.5" fill="#2a1a3e"/><circle cx="63" cy="55" r="2.2" fill="#fff"/>';
  const mouth = c.smile === 'soft'
    ? '<path d="M40 75 Q50 82 60 75" stroke="'+c.dark+'" stroke-width="3.2" stroke-linecap="round" fill="none"/>'
    : '<path d="M40 73 Q50 86 61 73 Q51 80 40 73Z" fill="'+c.dark+'"/><path d="M46 78 Q51 82 56 78" stroke="#ff8fb0" stroke-width="3" stroke-linecap="round"/>';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}g" x1="22" y1="24" x2="78" y2="88" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="0.18" stop-color="${c.body}"/>
        <stop offset="1" stop-color="${c.body2}"/>
      </linearGradient>
      <radialGradient id="${gid}h" cx="35%" cy="28%" r="65%">
        <stop offset="0" stop-color="#fff" stop-opacity="0.62"/>
        <stop offset="0.4" stop-color="#fff" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="92" rx="28" ry="7" fill="rgba(80,40,20,.18)"/>
    <path d="M24 64 Q11 61 11 70 Q17 74 25 70" fill="${c.body2}" stroke="${c.dark}" stroke-width="2" stroke-linecap="round"/>
    <path d="M76 64 Q89 60 90 69 Q84 75 75 70" fill="${c.body2}" stroke="${c.dark}" stroke-width="2" stroke-linecap="round"/>
    <g fill="url(#${gid}g)" stroke="rgba(255,255,255,.55)" stroke-width="2">${bodyShape}</g>
    <g fill="url(#${gid}h)">${bodyShape}</g>
    ${c.stem ? '<rect x="48" y="19" width="5" height="16" rx="2.5" fill="#7a4b27" transform="rotate(8 50 27)"/>' : ''}
    ${c.leaf ? '<path d="M50 32 C55 18 70 19 74 24 C64 26 58 32 50 32Z" fill="#65c95d"/><path d="M50 32 C42 20 30 22 27 29 C37 29 44 33 50 32Z" fill="#78df70"/>' : ''}
    <ellipse cx="33" cy="67" rx="7" ry="4" fill="${c.blush}" opacity=".75"/>
    <ellipse cx="68" cy="67" rx="7" ry="4" fill="${c.blush}" opacity=".75"/>
    ${leftEye}${rightEye}${mouth}
    <path d="M36 91 Q39 84 43 91" stroke="${c.dark}" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M57 91 Q61 84 64 91" stroke="${c.dark}" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`;
}


// ===== StorageManager =====
const StorageManager = {
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return this.defaultData();
      const parsed = JSON.parse(raw);
      return this.validateAndMigrate(parsed);
    } catch (e) { 
      console.warn('Progresso corrompido, resetando.', e);
      return this.defaultData(); 
    }
  },
  validateAndMigrate(data) {
    if (!data || typeof data !== 'object') return this.defaultData();
    const def = this.defaultData();
    for (let k in def) {
      if (data[k] === undefined) data[k] = def[k];
    }
    data.settings = Object.assign({}, def.settings, data.settings || {});
    data.settings.speed = normalizeDifficultyKey(data.settings.speed);
    for (const c of COLORS) {
      if (data.colorErrors[c.id] === undefined) data.colorErrors[c.id] = 0;
      if (data.colorTotal[c.id] === undefined) data.colorTotal[c.id] = 0;
      if (data.responseTimeSum[c.id] === undefined) data.responseTimeSum[c.id] = 0;
      if (data.responseTimeCount[c.id] === undefined) data.responseTimeCount[c.id] = 0;
    }
    return data;
  },
  save(data) { try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data)); } catch (e) {} },
  defaultData() {
    return {
      tutorialCompleto: false,
      unlockedLevels: [1],
      levelStars: {},
      levelAttempts: {},
      sessions: [],
      highScore: 0,
      rewardStickers: [],
      settings: {
        speed: 'normal',
        showLabels: false,
        showShapes: false,
        colorblind: false,
        accessibility: false,
        narration: false,
        calmMode: false
      },
      colorErrors: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      colorTotal: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      responseTimeSum: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      responseTimeCount: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      lastNote: null,
      dailyMission: { dayKey: '', target: 10, colorId: 'blue', count: 0 }
    };
  },
  get() { return this.load(); },
  set(fn) { const d = this.load(); fn(d); this.save(d); }
};

function normalizeDifficultyKey(key) {
  return DIFFICULTY_ALIASES[key] || 'normal';
}

function getDifficultyConfig(key) {
  return DIFFICULTY_CONFIG[normalizeDifficultyKey(key)];
}

function getCurrentDifficultyKey() {
  const data = StorageManager.get();
  return normalizeDifficultyKey(data.settings && data.settings.speed);
}

function getCurrentDifficultyConfig() {
  return getDifficultyConfig(getCurrentDifficultyKey());
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function calculateTimeScore(avgResponseTime, difficultyKey) {
  const diff = getDifficultyConfig(difficultyKey);
  if (!Number.isFinite(avgResponseTime) || avgResponseTime <= 0) return 0;
  const target = diff.targetResponseMs || 4500;
  if (avgResponseTime <= target) return 1;
  if (avgResponseTime >= target * 2) return 0;
  return clamp01(1 - ((avgResponseTime - target) / target));
}

function formatSeconds(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '0.0s';
  return (ms / 1000).toFixed(1) + 's';
}

function buildPedagogicalRecommendation(metrics) {
  const accuracy = Number.isFinite(metrics.accuracyPct) ? metrics.accuracyPct : 0;
  const avgTime = Number.isFinite(metrics.avgResponseTime) ? metrics.avgResponseTime : 0;
  const firstTryRate = Number.isFinite(metrics.firstTryRate) ? metrics.firstTryRate : 0;

  if (accuracy < 60) return "Reforçar reconhecimento das cores e padrões simples.";
  if (avgTime > 5000) return "A criança acerta, mas precisa de mais tempo para reconhecer o padrão.";
  if (firstTryRate < 70) return "Praticar antes de avançar para padrões mais longos.";
  return "Desempenho adequado para avançar.";
}

function getChildResultMessage(nota, minGradeToPass, passed) {
  if (!passed) return "Você foi bem, mas vamos treinar mais um pouquinho antes da próxima fase!";
  if (nota >= 90) return "Excelente! Você dominou essa fase!";
  if (nota >= 75) return "Muito bom! Você está pronto para continuar!";
  if (nota >= 60) return "Bom trabalho! Continue praticando para ficar ainda melhor!";
  return "Vamos tentar de novo com calma!";
}

function getStarsFromGrade(nota, passed) {
  if (!Number.isFinite(nota)) return 0;
  if (!passed) return nota >= 50 ? 1 : 0;
  if (nota >= 90) return 3;
  if (nota >= 70) return 2;
  return 1;
}

function ratingStars(value) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

function buildPedagogicalProfile(session) {
  if (!session) {
    return [
      { label: 'Memória', stars: '☆☆☆☆☆' },
      { label: 'Atenção', stars: '☆☆☆☆☆' },
      { label: 'Velocidade', stars: '☆☆☆☆☆' },
      { label: 'Reconhecimento de padrões', stars: '☆☆☆☆☆' }
    ];
  }
  const total = Math.max(1, session.totalRounds || 0);
  const firstTryRate = (session.firstTryCorrect || 0) / total;
  const finalRate = (session.correctRounds || 0) / total;
  const attemptEfficiency = clamp01(1 - (((session.totalAttempts || total) - total) / total));
  const timeScore = calculateTimeScore(session.avgResponseTime || 0, session.difficulty || 'normal');
  return [
    { label: 'Memória', stars: ratingStars(firstTryRate * 5) },
    { label: 'Atenção', stars: ratingStars(attemptEfficiency * 5) },
    { label: 'Velocidade', stars: ratingStars(timeScore * 5) },
    { label: 'Reconhecimento de padrões', stars: ratingStars(finalRate * 5) }
  ];
}

function buildSessionBadges(session) {
  if (!session) return [];
  const total = Math.max(1, session.totalRounds || 0);
  const firstTryRate = (session.firstTryCorrect || 0) / total;
  const finalRate = (session.correctRounds || 0) / total;
  const avgTime = session.avgResponseTime || 0;
  const badges = [];
  if (finalRate >= 0.9) badges.push('🏅 Mestre das Cores');
  if (firstTryRate >= 0.8) badges.push('🏅 Memória Excelente');
  if ((session.wrongAttempts || 0) <= Math.max(1, Math.floor(total * 0.2))) badges.push('🏅 Observador Atento');
  if (avgTime > 0 && avgTime <= 3000) badges.push('🏅 Velocidade Relâmpago');
  if ((session.wrongAttempts || 0) >= 3 && finalRate >= 0.8) badges.push('🏅 Persistência');
  return badges.length ? badges : ['🏅 Explorador de Padrões'];
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCalmMode() {
  const settings = StorageManager.get().settings || {};
  return !!settings.calmMode || prefersReducedMotion();
}

function applyBodySettingsClasses() {
  const settings = StorageManager.get().settings || {};
  document.body.classList.toggle('high-contrast-mode', !!settings.accessibility);
  document.body.classList.toggle('calm-mode', isCalmMode());
}

// ===== Máquina de estados (telas) =====
const GameState = { MENU: 'MENU', MAP: 'MAP', GAMEPLAY: 'GAMEPLAY', RESULT: 'RESULT' };
const GameStateMachine = {
  state: GameState.MENU,
  transition(next) {
    if (this.state === next) return;
    this.state = next;
  },
  get() { return this.state; }
};

// ===== Missão diária (mapa) =====
const MissionManager = {
  dayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  },
  ensureMission() {
    StorageManager.set(d => {
      const k = this.dayKey();
      if (!d.dailyMission || d.dailyMission.dayKey !== k) {
        const pool = ['red', 'blue', 'yellow', 'green'];
        d.dailyMission = {
          dayKey: k,
          target: 10,
          colorId: pool[Math.floor(Math.random() * pool.length)],
          count: 0
        };
      }
    });
  },
  recordCatch(colorId) {
    this.ensureMission();
    StorageManager.set(d => {
      const m = d.dailyMission;
      if (m && m.colorId === colorId) m.count = Math.min(m.target, (m.count || 0) + 1);
    });
  },
  bannerHTML() {
    const d = StorageManager.get().dailyMission || {};
    const c = COLORS.find(x => x.id === d.colorId);
    const label = c ? c.label : '';
    const em = c ? c.mascot : '🍬';
    return '🎯 Missão do dia: apanhe <span class="mm-prog">' + (d.count || 0) + '/' + (d.target || 10) + '</span> doces <strong>' + label + '</strong> ' + em;
  }
};

// ===== AudioManager — BGM + SFX (URLs placeholder; substituir por ficheiros locais quando existirem) =====
const AudioURL = {
  BGM_MENU: '', // ex: 'assets/bgm_menu.mp3'
  BGM_GAME: '', // ex: 'assets/bgm_game.mp3'
  SFX_CLICK: '',
  SFX_OK: '',
  SFX_ERR: '',
  SFX_LEVEL: ''
};

const AudioManager = {
  ctx: null,
  enabled: true,
  bgmMenu: null,
  bgmGame: null,
  activeBgm: null,
  init() {
    this._loadBgmSlots();
  },
  ensureCtx() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  _loadBgmSlots() {
    if (AudioURL.BGM_MENU && !this.bgmMenu) {
      try {
        this.bgmMenu = new Audio(AudioURL.BGM_MENU);
        this.bgmMenu.loop = true;
        this.bgmMenu.volume = 0.32;
      } catch (e) { this.bgmMenu = null; }
    }
    if (AudioURL.BGM_GAME && !this.bgmGame) {
      try {
        this.bgmGame = new Audio(AudioURL.BGM_GAME);
        this.bgmGame.loop = true;
        this.bgmGame.volume = 0.28;
      } catch (e) { this.bgmGame = null; }
    }
  },
  _stopAllBgm() {
    [this.bgmMenu, this.bgmGame].forEach(a => {
      if (a) { a.pause(); try { a.currentTime = 0; } catch (e) {} }
    });
    this.activeBgm = null;
  },
  resume() { this.ensureCtx(); },
  playBGMMenu() {
    this._loadBgmSlots();
    if (!this.bgmMenu || !AudioURL.BGM_MENU) return;
    if (this.activeBgm === this.bgmMenu) return;
    this._stopAllBgm();
    this.activeBgm = this.bgmMenu;
    this.bgmMenu.play().catch(() => {});
  },
  playBGMGame() {
    this._loadBgmSlots();
    if (!this.bgmGame || !AudioURL.BGM_GAME) return;
    if (this.activeBgm === this.bgmGame) return;
    this._stopAllBgm();
    this.activeBgm = this.bgmGame;
    this.bgmGame.play().catch(() => {});
  },
  stopBGM() { this._stopAllBgm(); },
  playSFX(name) {
    const url = AudioURL[name];
    if (!url) return;
    try {
      const a = new Audio(url);
      a.volume = 0.45;
      a.play().catch(() => {});
    } catch (e) {}
  },
  playClick() {
    if (AudioURL.SFX_CLICK) this.playSFX('SFX_CLICK');
    else this.playProceduralClick();
  },
  playProceduralClick() {
    if (!this.ctx) return; this.resume();
    this._play(660, 'sine', 0.04, 0.12, 0);
  },
  _play(freq, type, duration, vol, delay) {
    if (!this.ctx || !this.enabled) return;
    const finalVol = vol * (isCalmMode() ? 0.35 : 1);
    const t = this.ctx.currentTime + (delay || 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(finalVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t); osc.stop(t + duration + 0.02);
  },
  playPop() {
    if (!this.ctx) return; this.resume();
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(880, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);
    g.gain.setValueAtTime(isCalmMode() ? 0.08 : 0.28, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
    o.start(); o.stop(this.ctx.currentTime + 0.15);
  },
  playSuccess() {
    if (AudioURL.SFX_OK) { this.playSFX('SFX_OK'); return; }
    if (!this.ctx) return; this.resume();
    [523, 659, 784].forEach((f, i) => this._play(f, 'triangle', 0.18, 0.22, i * 0.08));
  },
  /** Som lúdico “boing” — sem tons graves de erro */
  playError() {
    if (AudioURL.SFX_ERR) { this.playSFX('SFX_ERR'); return; }
    if (!this.ctx) return; this.resume();
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(320, t0);
    o.frequency.exponentialRampToValueAtTime(680, t0 + 0.07);
    o.frequency.exponentialRampToValueAtTime(260, t0 + 0.18);
    g.gain.setValueAtTime(0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
    o.start(t0); o.stop(t0 + 0.24);
  },
  playLevelUp() {
    if (AudioURL.SFX_LEVEL) { this.playSFX('SFX_LEVEL'); return; }
    if (!this.ctx) return; this.resume();
    const notes = [392, 523, 659, 784, 988];
    notes.forEach((f, i) => this._play(f, 'sine', 0.12, 0.2, i * 0.06));
  },
  playTick() {
    if (!this.ctx) return; this.resume();
    this._play(880, 'square', 0.04, 0.08, 0);
  },
  playSwoosh() {
    if (!this.ctx) return; this.resume();
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'sine';
    const t = this.ctx.currentTime;
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t); o.stop(t + 0.2);
  },
  playWinElaborate() {
    if (!this.ctx) return; this.resume();
    const melody = [
      [523, 0], [587, 0.1], [659, 0.2], [698, 0.3], [784, 0.42], [880, 0.55], [784, 0.68], [1046, 0.82], [784, 1.0]
    ];
    melody.forEach(([f, d]) => this._play(f, 'triangle', 0.16, 0.22, d));
  },
  playHeartLoss() { if (!this.ctx) return; this.resume(); this._play(200, 'sawtooth', 0.35, 0.2, 0); },
  playTrophy() {
    if (!this.ctx) return; this.resume();
    [659, 784, 988, 784, 1046].forEach((f, i) => this._play(f, 'triangle', 0.2, 0.18, i * 0.1));
  }
};

// ===== SpeechManager =====
const SpeechManager = {
  isEnabled() {
    const settings = StorageManager.get().settings || {};
    return !!settings.narration;
  },
  speak(text) {
    if (!this.isEnabled()) return;
    if (!window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR'; u.rate = 0.92; u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  colorName(id) {
    const c = COLORS.find(x => x.id === id);
    if (c) this.speak(c.label + '! Eu sou ' + c.name + '!');
  }
};

// ===== VisualEffects =====
const VisualEffects = {
  canvas: null, ctx: null, particles: [], animId: null, _hadParticles: false,
  init() {
    this.canvas = document.getElementById('particleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const loop = () => {
      if (!this.ctx) {
        this.animId = requestAnimationFrame(loop);
        return;
      }
      const active = this.particles.length > 0;
      if (active || this._hadParticles) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0);
        for (const p of this.particles) {
          this.ctx.save();
          this.ctx.globalAlpha = Math.min(1, p.life);
          if (p.type === 'confetti') {
            this.ctx.translate(p.x, p.y); this.ctx.rotate(p.rot);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.rv; p.life -= p.dc;
          } else if (p.type === 'smoke') {
            const r = p.r * (1.6 - p.life);
            const grd = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            grd.addColorStop(0, 'rgba(140,140,140,0.45)');
            grd.addColorStop(1, 'rgba(100,100,100,0)');
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            this.ctx.fill();
            p.x += p.vx; p.y += p.vy; p.r += 0.35; p.life -= p.dc;
          }
          this.ctx.restore();
        }
      }
      this._hadParticles = this.particles.length > 0;
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  },
  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight;
  },
  _trimToMax() {
    const max = isCalmMode() ? Math.floor(CONFIG.MAX_PARTICULAS_ATIVAS * 0.35) : CONFIG.MAX_PARTICULAS_ATIVAS;
    if (this.particles.length > max) {
      this.particles.splice(0, this.particles.length - max);
    }
  },
  burst(x, y, count) {
    count = Math.min(isCalmMode() ? Math.ceil(count * 0.35) : count, 48);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 7;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: -4 - Math.random() * 6,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
        rot: Math.random() * 6.28, rv: (Math.random() - 0.5) * 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
        life: 1, dc: 0.012 + Math.random() * 0.01, g: 0.22, type: 'confetti'
      });
    }
    this._trimToMax();
  },
  smokeBurst(x, y, count) {
    count = Math.min(isCalmMode() ? Math.ceil(count * 0.35) : count, 32);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.4 + Math.random() * 1.8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(a) * sp, vy: -0.8 - Math.random() * 1.2,
        r: 6 + Math.random() * 10,
        life: 1, dc: 0.008 + Math.random() * 0.006, type: 'smoke'
      });
    }
    this._trimToMax();
  },
  trail(x1, y1, x2, y2, color) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const count = isCalmMode() ? 5 : Math.min(24, Math.max(10, Math.floor(dist / 15)));
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      this.particles.push({
        x: x + (Math.random() - 0.5)*18, y: y + (Math.random() - 0.5)*18,
        vx: (Math.random() - 0.5)*2.5, vy: (Math.random() - 0.5)*2.5,
        w: 5 + Math.random()*4, h: 5 + Math.random()*4, 
        rot: Math.random()*6.28, rv: (Math.random() - 0.5)*0.2, 
        color: color, life: 1, dc: 0.03 + Math.random()*0.03, g: 0.08, type: 'confetti'
      });
    }
    this._trimToMax();
  },
  splash(x, y) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:${y-30}px;left:${x-40}px;width:80px;height:80px;background:radial-gradient(circle, #5a3820, #3a2010);border-radius:40% 60% 50% 50%;z-index:998;pointer-events:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));`;
    document.body.appendChild(el);
    el.animate([
      { transform: 'scale(0) translateY(0)', opacity: 1 },
      { transform: 'scale(1.2) translateY(-10px)', opacity: 0.9, offset: 0.15 },
      { transform: 'scale(1.3) translateY(50px)', opacity: 0 }
    ], { duration: 1100, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' });
    setTimeout(() => el.remove(), 1100);
  },
  candyRain() {
    const icons = ['🍬', '🍭', '🍫', '🧁', '🎂'];
    const total = isCalmMode() ? 8 : 24;
    for (let i = 0; i < total; i++) {
      const el = document.createElement('div');
      el.textContent = icons[Math.floor(Math.random() * icons.length)];
      el.style.cssText = 'position:fixed;top:-40px;left:' + (Math.random() * 100) + '%;font-size:' + (1.3 + Math.random()) + 'rem;z-index:999;pointer-events:none;';
      el.style.animation = 'cr ' + (1.8 + Math.random() * 1.5) + 's linear forwards';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
    if (!document.getElementById('crStyle')) {
      const s = document.createElement('style');
      s.id = 'crStyle';
      s.textContent = '@keyframes cr{from{transform:translateY(0) rotate(0)}to{transform:translateY(110vh) rotate(720deg);opacity:0.3}}';
      document.head.appendChild(s);
    }
  },
  flash() {
    const el = document.getElementById('flashOverlay');
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 120);
  }
};

// ===== PedagogyTracker =====
const PedagogyTracker = {
  session: null,
  startSession(mode, levelId, levelName) {
    const difficultyKey = getCurrentDifficultyKey();
    const difficulty = getDifficultyConfig(difficultyKey);
    this.session = {
      mode, levelId: levelId || null, levelName: levelName || null,
      difficulty: difficultyKey,
      difficultyLabel: difficulty.label,
      minGradeToPass: difficulty.minGradeToPass,
      totalRounds: 0,
      correctRounds: 0,
      firstTryCorrect: 0,
      wrongAttempts: 0,
      totalAttempts: 0,
      hintCount: 0,
      responseTimes: [],
      roundsDetail: [],
      colorErrors: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      colorTotal: { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 },
      currentRound: null,
      complexBonus: 0,
      startTime: Date.now()
    };
  },
  startRound(expectedColorId) {
    if (!this.session) return;
    const s = this.session;
    s.totalRounds++;
    s.currentRound = {
      expectedColorId,
      attempts: 0,
      wrongAttempts: 0,
      selections: [],
      firstTry: true,
      success: false,
      responseTimeMs: 0,
      startedAt: Date.now()
    };
  },
  recordAttempt(selectedColorId, isCorrect, isFirstTry) {
    if (!this.session) return;
    const s = this.session;
    if (!s.currentRound) this.startRound(null);
    const round = s.currentRound;
    const expectedId = round.expectedColorId || selectedColorId;

    s.totalAttempts++;
    round.attempts++;
    round.selections.push(selectedColorId);
    s.colorTotal[expectedId] = (s.colorTotal[expectedId] || 0) + 1;

    if (!isCorrect) {
      s.wrongAttempts++;
      round.wrongAttempts++;
      round.firstTry = false;
      s.colorErrors[expectedId] = (s.colorErrors[expectedId] || 0) + 1;
      return;
    }

    if (isFirstTry && round.attempts === 1) {
      s.firstTryCorrect++;
    }
  },
  finishRound(success, responseTimeMs) {
    if (!this.session || !this.session.currentRound) return;
    const s = this.session;
    const round = s.currentRound;
    const cleanTime = Number.isFinite(responseTimeMs) && responseTimeMs >= 0 ? responseTimeMs : Date.now() - round.startedAt;

    round.success = !!success;
    round.responseTimeMs = Math.max(0, cleanTime);
    if (round.success) {
      s.correctRounds++;
      s.responseTimes.push(round.responseTimeMs);
    }
    s.roundsDetail.push({
      expectedColorId: round.expectedColorId,
      attempts: round.attempts,
      wrongAttempts: round.wrongAttempts,
      firstTry: round.success && round.attempts === 1,
      success: round.success,
      responseTimeMs: round.responseTimeMs,
      selections: round.selections.slice(0, 6)
    });
    s.currentRound = null;
  },
  recordResponseTime(colorId, ms) {
    if (!this.session || ms < 0 || ms > 120000) return;
    StorageManager.set(d => {
      d.responseTimeSum[colorId] = (d.responseTimeSum[colorId] || 0) + ms;
      d.responseTimeCount[colorId] = (d.responseTimeCount[colorId] || 0) + 1;
    });
  },
  recordHint() {
    if (this.session) this.session.hintCount++;
  },
  setComplexBonus(v) { if (this.session) this.session.complexBonus = v; },
  endSession() {
    if (!this.session) return null;
    const s = this.session;
    if (s.currentRound && s.currentRound.attempts > 0) {
      this.finishRound(false, Date.now() - s.currentRound.startedAt);
    }

    const totalRounds = Math.max(0, s.totalRounds);
    const divisor = Math.max(1, totalRounds);
    const avgResponseTime = s.responseTimes.length
      ? s.responseTimes.reduce((sum, ms) => sum + ms, 0) / s.responseTimes.length
      : 0;
    const firstTryRate = s.firstTryCorrect / divisor;
    const finalAccuracyRate = s.correctRounds / divisor;
    const attemptEfficiency = clamp01(1 - ((s.totalAttempts - totalRounds) / divisor));
    const avgTimeScore = calculateTimeScore(avgResponseTime, s.difficulty);

    let nota =
      firstTryRate * 60 +
      finalAccuracyRate * 20 +
      attemptEfficiency * 10 +
      avgTimeScore * 10;
    nota = Math.round(Math.max(0, Math.min(100, Number.isFinite(nota) ? nota : 0)));

    const accuracyPct = Math.round(finalAccuracyRate * 100);
    const firstTryPct = Math.round(firstTryRate * 100);
    const passed = s.mode === 'story' ? nota >= s.minGradeToPass : true;
    const recommendation = buildPedagogicalRecommendation({
      accuracyPct,
      avgResponseTime,
      firstTryRate: firstTryPct
    });

    const sessionData = {
      date: new Date().toLocaleDateString('pt-BR'),
      mode: s.mode,
      levelId: s.levelId,
      levelName: s.levelName,
      difficulty: s.difficulty,
      difficultyLabel: s.difficultyLabel,
      minGradeToPass: s.minGradeToPass,
      passed,
      nota,
      duration: Math.round((Date.now() - s.startTime) / 1000),
      accuracyPct,
      firstTryPct,
      totalRounds,
      correctRounds: s.correctRounds,
      firstTryCorrect: s.firstTryCorrect,
      wrongAttempts: s.wrongAttempts,
      totalAttempts: s.totalAttempts,
      hintCount: s.hintCount,
      avgResponseTime: Math.round(avgResponseTime),
      recommendation,
      roundsDetail: s.roundsDetail
    };
    sessionData.badges = buildSessionBadges(sessionData);
    sessionData.profile = buildPedagogicalProfile(sessionData);

    if (s.mode !== 'tutorial') {
      StorageManager.set(d => {
        d.lastNote = nota;
        d.sessions.unshift(sessionData);
        if (d.sessions.length > 10) d.sessions = d.sessions.slice(0, 10);
        for (const c of Object.keys(s.colorErrors)) {
          d.colorErrors[c] = (d.colorErrors[c] || 0) + s.colorErrors[c];
          d.colorTotal[c] = (d.colorTotal[c] || 0) + (s.colorTotal[c] || 0);
        }
      });
    }

    // Envio de postMessage com pontuação final, conforme o manual de padronização
    if (window.parent && s.mode !== 'tutorial') {
      window.parent.postMessage({
        type: 'C4A_GAME_SCORE',
        score: nota,
        difficulty: s.difficultyLabel
      }, '*');
    }

    this.session = null;
    return sessionData;
  }
};

// ===== LevelManager — 5 fases =====
const LevelManager = {
  /**
   * Fases agora são carregadas assincronamente a partir de config.json
   */
  levels: [],

  /** Comprimento da sequência no modo história: sobe levemente com a fase, rodada e dificuldade. */
  getStorySeqLen(level, seqsCompleted, difficultyKey) {
    const diff = getDifficultyConfig(difficultyKey);
    const base = level.seqLenBase != null ? level.seqLenBase : (5 + level.id);
    const grow = Math.min(5, Math.floor(seqsCompleted / 2) + Math.floor(level.id / 3));
    return Math.min(22, base + grow + (diff.sequenceExtra || 0));
  },

  patternOptions(patternType) {
    if (Array.isArray(patternType) && patternType.length) return patternType;
    if (typeof patternType !== 'string') return ['AB'];
    if (patternType === 'mixed') return ['AB', 'ABC', 'AABB'];
    if (patternType.indexOf('|') >= 0) return patternType.split('|').map(p => p.trim()).filter(Boolean);
    return [patternType || 'AB'];
  },

  patternColorCount(patternType) {
    return this.patternOptions(patternType).reduce((max, pat) => {
      const unique = new Set((pat.match(/[A-Z]/g) || ['A', 'B']));
      return Math.max(max, unique.size);
    }, 2);
  },

  /**
   * Monta a sequência; varietyOffset (ex.: rodadas já feitas) alterna fase do padrão para menos repetição visual.
   */
  generateSequence(patternType, availableColors, seqLen, varietyOffset) {
    varietyOffset = varietyOffset || 0;
    const colors = availableColors && availableColors.length ? availableColors : COLORS.slice(0, 2);
    const options = this.patternOptions(patternType);
    const selectedPattern = options[varietyOffset % options.length] || 'AB';
    const tokens = selectedPattern.match(/[A-Z]/g) || ['A', 'B'];
    const uniqueTokens = Array.from(new Set(tokens));
    const colorOffset = Math.floor(varietyOffset / Math.max(1, options.length)) % colors.length;
    const tokenColor = {};

    uniqueTokens.forEach((token, i) => {
      tokenColor[token] = colors[(colorOffset + i) % colors.length];
    });

    const seq = [];
    for (let i = 0; i < seqLen; i++) seq.push(tokenColor[tokens[i % tokens.length]]);
    return seq;
  },

  getLevel(id) { return this.levels.find(l => l.id === id); }
};

// ===== Utilitários de curva Bezier =====
function bezierPoint(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const uu = u * u, tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
  };
}
function bezierTangent(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return Math.atan2(dy, dx);
}

// ===== Desenho de forma daltônica dentro da bolinha =====
function drawDaltonShape(ctx, x, y, r, shapeKind) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  const s = r * 0.45;
  if (shapeKind === 0) {
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const b = a + Math.PI / 5;
      const x1 = x + Math.cos(a) * s, y1 = y + Math.sin(a) * s;
      const x2 = x + Math.cos(b) * (s * 0.45), y2 = y + Math.sin(b) * (s * 0.45);
      if (i === 0) ctx.beginPath(), ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath(); ctx.stroke();
  } else if (shapeKind === 1) {
    ctx.beginPath();
    ctx.moveTo(x, y - s); ctx.lineTo(x - s * 0.9, y + s * 0.75); ctx.lineTo(x + s * 0.9, y + s * 0.75);
    ctx.closePath(); ctx.stroke();
  } else if (shapeKind === 2) {
    ctx.strokeRect(x - s * 0.65, y - s * 0.65, s * 1.3, s * 1.3);
  } else if (shapeKind === 3) {
    ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, Math.PI * 2); ctx.stroke();
  } else if (shapeKind === 4) {
    ctx.beginPath(); ctx.moveTo(x, y - s * 0.7); ctx.lineTo(x, y + s * 0.7); ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x + s * 0.7, y); ctx.stroke();
  } else if (shapeKind === 5) {
    ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.8, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.8, y); ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
}

// ===== TutorialManager =====
const TutorialManager = {
  roundIndex: 0,
  showArrow: false,
  firstRoundStarted: false,

  reset() {
    this.roundIndex = 0;
    this.showArrow = true;
    this.firstRoundStarted = false;
  },

  dismissWelcome() {
    document.getElementById('tutorialWelcome').classList.add('hidden');
    SpeechManager.speak('Oi! Eu sou a maçã! Vamos aprender juntos?');
    setTimeout(() => {
      this.firstRoundStarted = true;
      Gameplay.generateRound();
    }, 500);
  },

  onRoundStart() {
    const msg = document.getElementById('tutorialMsg');
    if (Gameplay.mode !== 'tutorial') { msg.style.display = 'none'; return; }
    msg.style.display = 'block';
    const r = this.roundIndex;
    if (r === 0) {
      msg.textContent = 'Toque na cor que falta na sequência! 🎯';
    } else if (r < 4) {
      const focus = ['red', 'blue', 'yellow', 'green'][r % 4];
      const c = COLORS.find(x => x.id === focus);
      msg.textContent = 'Vamos conhecer o ' + c.mascot + ' ' + c.label + '!';
      SpeechManager.colorName(focus);
    } else {
      msg.textContent = 'Você está indo muito bem! Continue assim! 🌟';
    }
    this.showArrow = (r === 0);
  },

  afterCorrect() {
    this.roundIndex++;
    document.getElementById('tutorialMsg').textContent = 'Isso mesmo! Você acertou! 🎉';
    SpeechManager.speak('Isso mesmo! Muito bem!');
  },

  complete() {
    StorageManager.set(d => { d.tutorialCompleto = true; });
    Gameplay.stop();
    PedagogyTracker.endSession();
    GameEngine.showTutorialComplete();
  }
};

// ===== Gameplay — motor principal =====
const Gameplay = {
  canvas: null, ctx: null, mode: 'tutorial', level: null,
  colors: [], sequence: [], blankIdx: 0, answer: null,
  score: 0, seqsCompleted: 0, totalSeqs: 8,
  wrongCount: 0, firstTry: true, running: false, animFrame: null,
  speed: 1,
  difficultyKey: 'normal',
  difficultyConfig: DIFFICULTY_CONFIG.normal,
  hintActive: false, hintTimeout: null,
  fillAnim: null,
  bezier: null,
  slideT: 1,
  roundFade: 0,
  questionStartTime: 0,
  streak: 0,
  mult: 1,
  infiniteTier: 1,
  infinitePattern: 'AB',
  currentPatternType: 'AB',
  transitionPhase: 'idle',
  mistakesThisLevel: 0,
  _onResize: null,
  baseSpeedMul: 1,
  slowMoUntil: 0,
  specialBlank: null,
  recentCorrectTimes: [],

  getDynamicSpeedFactor() {
    let f = this.baseSpeedMul * (1 + Math.min(this.streak, 15) * 0.2);
    if (Date.now() < this.slowMoUntil) f *= 0.42;
    return Math.min(2.8, Math.max(0.35, f));
  },

  showComboFloat(text) {
    const el = document.createElement('div');
    el.className = 'combo-float-text';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  showMascotMessage(text, mood) {
    const guide = document.getElementById('mascotGuide');
    const speech = document.getElementById('mascotSpeech');
    if (!guide || !speech) return;
    speech.textContent = text;
    guide.classList.remove('hidden', 'mascot-happy', 'mascot-think');
    guide.classList.add(mood === 'think' ? 'mascot-think' : 'mascot-happy');
    guide.classList.add('mascot-pop');
    setTimeout(() => guide.classList.remove('mascot-pop'), 450);
  },

  vibrate(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  },
  vibrateSoft() {
    try { if (navigator.vibrate) navigator.vibrate(35); } catch (e) {}
  },

  canvasVisible() {
    const c = this.canvas;
    if (!c) return false;
    const r = c.getBoundingClientRect();
    return r.width > 8 && r.height > 8 && r.bottom > 0 && r.right > 0;
  },

  getTargetColorCount(mode, progressTier) {
    if (mode === 'tutorial') return 2;
    const diff = this.difficultyConfig || getCurrentDifficultyConfig();

    if (mode === 'story' && this.level) {
      const pattern = this.level.patterns || this.level.pattern || 'AB';
      const patternColors = LevelManager.patternColorCount(pattern);
      const base = Math.max(patternColors, this.level.colors || patternColors);
      const maxColors = Math.min(COLORS.length, this.level.maxColors || COLORS.length);
      return Math.max(patternColors, Math.min(maxColors, base + (diff.maxColorsBonus || 0)));
    }

    const tier = Math.max(1, progressTier || 1);
    const base = tier <= 2 ? 2 : tier <= 4 ? 3 : 4;
    return Math.min(COLORS.length, base + (diff.maxColorsBonus || 0));
  },

  init(mode, levelId) {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.mode = mode;
    this.score = 0;
    this.seqsCompleted = 0;
    this.wrongCount = 0;
    this.firstTry = true;
    this.streak = 0;
    this.mult = 1;
    this.infiniteTier = 1;
    this.running = true;
    this.slideT = 0;
    this.roundFade = 0;
    this.transitionPhase = 'idle';
    this.mistakesThisLevel = 0;
    this.slowMoUntil = 0;
    this.hitStopUntil = 0;
    this.specialBlank = null;
    this.recentCorrectTimes = [];

    const data = StorageManager.get();
    const cfg = data.settings || { speed: 'normal' };
    const diff = normalizeDifficultyKey(cfg.speed);
    this.difficultyKey = diff;
    this.difficultyConfig = getDifficultyConfig(diff);
    this.speed = this.difficultyConfig.speedMultiplier || 1;
    if (mode === 'tutorial') this.speed *= 0.55;
    this.baseSpeedMul = this.speed;

    if (mode === 'story' && levelId) {
      this.level = LevelManager.getLevel(levelId);
      this.totalSeqs = this.level ? this.level.seqs : 6;
    } else if (mode === 'tutorial') {
      this.level = null;
      this.totalSeqs = CONFIG.TUTORIAL_SEQS;
    } else {
      this.level = null;
      this.totalSeqs = Infinity;
    }

    let progressTier = 1;
    if (mode === 'story' && levelId) progressTier = levelId;
    else if (mode === 'infinite') progressTier = this.infiniteTier;
    this.colors = COLORS.slice(0, this.getTargetColorCount(mode, progressTier));

    const levelName = this.level ? this.level.name : (mode === 'tutorial' ? 'Tutorial' : mode === 'infinite' ? 'Infinito' : mode === 'discovery' ? 'Descoberta' : null);
    if (mode !== 'discovery') {
      PedagogyTracker.startSession(mode, levelId || null, levelName);
    } else {
      PedagogyTracker.session = null;
    }

    this.applyGameplayBackground();
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    this._onResize = () => { this.resize(); };
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.buildUI();

    if (mode === 'tutorial') {
      TutorialManager.reset();
      document.getElementById('tutorialWelcome').classList.remove('hidden');
      document.getElementById('twMascot').innerHTML = '<img class="tw-mascot-img" src="assets/imgs/mascot-red-apple.png" alt="Maçã">';
      document.getElementById('twText').textContent = 'Oi! Eu sou a maçã! Vamos aprender juntos?';
      document.getElementById('tutorialMsg').style.display = 'none';
      this.startLoop();
      return;
    }

    TutorialManager.roundIndex = 0;
    document.getElementById('tutorialWelcome').classList.add('hidden');
    document.getElementById('tutorialMsg').style.display = 'none';

    AudioManager.playSwoosh();
    this.generateRound();
    this.startLoop();
  },

  applyGameplayBackground() {
    const layer = document.getElementById('gameplayBg');
    layer.className = 'gameplay-layer';
    if (this.mode === 'tutorial') {
      layer.classList.add('bg-tutorial');
      layer.innerHTML = '';
    } else if (this.mode === 'infinite') {
      layer.classList.add('bg-infinite');
      let h = '';
      for (let i = 0; i < 20; i++) {
        h += '<div class="gal-particle" style="left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;animation-delay:' + (Math.random() * 5) + 's"></div>';
      }
      layer.innerHTML = h;
    } else if (this.mode === 'discovery') {
      layer.classList.add('bg-tutorial');
      layer.innerHTML = '';
    } else {
      layer.classList.add('bg-story');
      const bg = this.level && this.level.storyBg ? this.level.storyBg : 'linear-gradient(180deg,#ffd6e8,#a8e4ff)';
      layer.style.background = bg;
      layer.innerHTML = '';
    }
  },

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.logicalWidth = w;
    this.logicalHeight = h;
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.buildBezier();
  },

  /** Curva responsiva: usa quase toda a largura/altura, adapta a vertical e widescreen */
  buildBezier() {
    const w = this.logicalWidth || this.canvas.width;
    const h = this.logicalHeight || this.canvas.height;
    const shortSide = Math.min(w, h);
    const padL = shortSide * 0.02;
    const padR = shortSide * 0.02;
    const isWide = w > h * 1.25;
    const midY = h * (isWide ? 0.44 : 0.46);
    const amp = isWide ? h * 0.2 : Math.min(h * 0.24, w * 0.2);
    const dip = isWide ? h * 0.06 : h * 0.04;
    this.bezier = {
      p0: { x: -padL, y: midY },
      p1: { x: w * 0.22, y: midY - amp },
      p2: { x: w * 0.78, y: midY + amp - dip },
      p3: { x: w + padR, y: midY + (isWide ? 0 : dip * 0.5) }
    };
  },

  buildUI() {
    const modeEl = document.getElementById('modeBadge');
    const badges = { tutorial: '🧸 TUTORIAL', story: '🗺️ HISTÓRIA', infinite: '♾️ INFINITO', discovery: '🔎 DESCOBERTA' };
    const colors = { tutorial: '#FF6EB4', story: '#8B5E3C', infinite: '#9333ea', discovery: '#2d9cdb' };
    const diffLabel = this.difficultyConfig ? this.difficultyConfig.label : getCurrentDifficultyConfig().label;
    modeEl.textContent = (badges[this.mode] || '') + (this.mode === 'tutorial' || this.mode === 'discovery' ? '' : ' · ' + diffLabel);
    modeEl.style.background = colors[this.mode] || '#888';

    document.getElementById('levelHud').style.display = this.mode === 'infinite' ? 'inline' : 'none';
    document.getElementById('multBadge').style.display = this.mode === 'infinite' ? 'inline' : 'none';
    this.updateHudInfinite();

    this.updateScoreDisplay();
    this.buildAnswerBtns();
    this.updateProgress();
  },

  updateHudInfinite() {
    if (this.mode !== 'infinite') return;
    document.getElementById('levelHud').textContent = 'Nível ' + this.infiniteTier + ' 🔥';
    const mb = document.getElementById('multBadge');
    mb.textContent = 'x' + this.mult + (this.mult >= 2 ? ' 🔥' : '');
    mb.classList.toggle('mult-hot', this.mult >= 2);
  },

  buildAnswerBtns() {
    const container = document.getElementById('answerBtns');
    container.innerHTML = '';
    const settings = StorageManager.get().settings;
    const showCb = !!settings.colorblind;
    const showShapes = showCb || !!settings.showShapes;
    const landscape = typeof window.matchMedia === 'function' &&
      window.matchMedia('(orientation: landscape) and (max-height: 520px)').matches;

    const appendBtn = (parent, c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.dataset.colorId = c.id;
      btn.classList.add('answer-btn-image');
      btn.style.background = 'transparent';
      btn.innerHTML = '<img class="answer-btn-img" src="' + c.asset + '" alt="' + c.label + '">';
      if (showShapes) {
        btn.innerHTML += '<span class="answer-shape-symbol">' + (SHAPE_SYMBOL_BY_COLOR[c.id] || '●') + '</span>';
      }
      btn.addEventListener('click', () => {
        AudioManager.playClick();
        this.onAnswer(c.id);
      });
      parent.appendChild(btn);
    };

    if (landscape && this.colors.length > 1) {
      const left = document.createElement('div');
      left.className = 'answer-btn-col';
      const right = document.createElement('div');
      right.className = 'answer-btn-col';
      const half = Math.ceil(this.colors.length / 2);
      this.colors.forEach((c, i) => appendBtn(i < half ? left : right, c));
      container.appendChild(left);
      container.appendChild(right);
    } else {
      for (const c of this.colors) appendBtn(container, c);
    }

    if (this.mode === 'tutorial' && this.answer) {
      const glowBtn = container.querySelector('.answer-btn[data-color-id="' + this.answer.id + '"]');
      if (glowBtn) glowBtn.classList.add('tutorial-glow');
    }
    this.updateTutorialArrow();
  },

  updateTutorialArrow() {
    document.querySelectorAll('.tutorial-arrow').forEach(e => e.remove());
    if (this.mode !== 'tutorial' || !TutorialManager.showArrow || !this.answer) return;
    const btn = document.querySelector('.answer-btn[data-color-id="' + this.answer.id + '"]');
    if (!btn) return;
    const ar = document.createElement('div');
    ar.className = 'tutorial-arrow';
    ar.textContent = '👇';
    btn.appendChild(ar);
  },

  updateScoreDisplay() {
    document.getElementById('scoreDisplay').textContent = this.mode === 'discovery' ? '🔎 Explorar' : '⭐ ' + this.score;
  },

  scoreJump() {
    const el = document.getElementById('scoreDisplay');
    el.classList.add('score-jump');
    setTimeout(() => el.classList.remove('score-jump'), 160);
  },

  floatPoints(pts, mult) {
    const anchor = document.getElementById('floatingScoreAnchor');
    const rect = anchor.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'floating-points';
    el.textContent = '+' + pts + (mult > 1 ? ' 🔥' : '');
    el.style.left = (rect.left + rect.width / 2) + 'px';
    el.style.top = (rect.top - 8) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  updateProgress() {
    if (this.level) {
      const pct = Math.min(100, (this.seqsCompleted / this.totalSeqs) * 100);
      document.getElementById('phaseProgressFill').style.width = pct + '%';
    }
  },

  getInfinitePatternAndColors() {
    const cycle = [
      { pat: 'AB' },
      { pat: 'AABB' },
      { pat: 'ABC' }
    ];
    const i = (this.infiniteTier - 1) % cycle.length;
    const c = cycle[i];
    
    this.colors = COLORS.slice(0, this.getTargetColorCount('infinite', this.infiniteTier));
    this.infinitePattern = c.pat;
    this.buildAnswerBtns();
  },

  generateRound() {
    if (!this.canvasVisible()) return;
    this.wrongCount = 0;
    this.firstTry = true;
    this.hintActive = false;
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
    document.querySelectorAll('.answer-btn').forEach(b => {
      b.classList.remove('hint-soft', 'hint-mega', 'answer-btn-eliminated');
    });

    if (this.mode === 'infinite' && this.seqsCompleted > 0 && this.seqsCompleted % CONFIG.INFINITE_STEP_EVERY === 0) {
      this.infiniteTier++;
      this.getInfinitePatternAndColors();
      AudioManager.playLevelUp();
    }

    let patternType = 'AB';
    let seqLen = 6;
    let varietyOff = 0;

    if (this.mode === 'tutorial') {
      patternType = 'AB';
      seqLen = 6;
      this.colors = COLORS.slice(0, 2);
    } else if (this.level) {
      patternType = this.level.patterns || this.level.pattern;
      seqLen = LevelManager.getStorySeqLen(this.level, this.seqsCompleted, this.difficultyKey);
      varietyOff = this.seqsCompleted;
    } else if (this.mode === 'infinite') {
      patternType = this.infinitePattern;
      seqLen = 6 + Math.min(6, this.infiniteTier);
      varietyOff = this.seqsCompleted;
    }

    this.sequence = LevelManager.generateSequence(patternType, this.colors, seqLen, varietyOff);
    this.currentPatternType = Array.isArray(patternType) ? patternType.join('/') : String(patternType || 'AB');
    this.blankIdx = Math.floor(seqLen * 0.45) + Math.floor(Math.random() * Math.max(1, Math.floor(seqLen * 0.35)));
    this.blankIdx = Math.min(this.blankIdx, seqLen - 1);
    this.answer = this.sequence[this.blankIdx];
    PedagogyTracker.startRound(this.answer ? this.answer.id : null);

    this.specialBlank = null;
    if (this.mode !== 'tutorial') {
      const luck = Math.random();
      if (luck < 0.035) this.specialBlank = 'rainbow';
      else if (luck < 0.07) this.specialBlank = 'star';
    }

    this.questionStartTime = Date.now();
    this.slideT = 0;
    AudioManager.playSwoosh();

    if (this.mode !== 'tutorial' && (this.seqsCompleted === 0 || Math.random() < 0.35)) {
      const prompts = ['Olhe com calma!', 'Você consegue!', 'Ache o padrão!', 'Quase lá!'];
      this.showMascotMessage(prompts[Math.floor(Math.random() * prompts.length)], 'think');
    }

    if (this.mode === 'tutorial' && TutorialManager.firstRoundStarted) {
      TutorialManager.onRoundStart();
    }

    this.buildAnswerBtns();
    this.drawScene();
  },

  drawScene() {
    const gs = document.getElementById('gameplayScreen');
    if (!gs || !gs.classList.contains('active')) return;
    if (!this.canvas || !this.ctx || !this.canvasVisible()) return;
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!this.bezier) this.buildBezier();
    const b = this.bezier;

    ctx.save();
    ctx.globalAlpha = 1 - this.roundFade;
    this.drawCandyRoad(ctx, b);
    this.drawGumballMachine(ctx, b);
    this.drawSequenceOnPath(ctx, b);
    this.drawJar(ctx, w, h);
    ctx.restore();
  },

  drawGumballMachine(ctx, b) {
    const machineImg = MachineAssetManager.get();
    if (!machineImg || !machineImg.complete || machineImg.naturalWidth === 0) return;

    const cw = this.logicalWidth || this.canvas.width;
    const ch = this.logicalHeight || this.canvas.height;
    const size = Math.min(ch * 0.72, cw * 0.48, 390);
    const x = size * 0.34;
    const y = b.p0.y - size * 0.22;

    ctx.save();
    ctx.shadowColor = 'rgba(70, 35, 20, 0.25)';
    ctx.shadowBlur = Math.max(8, size * 0.08);
    ctx.shadowOffsetY = Math.max(5, size * 0.05);
    ctx.drawImage(machineImg, x - size / 2, y - size / 2, size, size);
    ctx.restore();
  },

  getMachineExitPoint(b, ballRBase) {
    const cw = this.logicalWidth || this.canvas.width;
    const ch = this.logicalHeight || this.canvas.height;
    const size = Math.min(ch * 0.72, cw * 0.48, 390);
    const x = size * 0.34;
    const y = b.p0.y - size * 0.22;
    return {
      x: x + size * 0.2,
      y: y + size * 0.25 + (ballRBase || CONFIG.MIN_BALL_RADIUS) * 0.08
    };
  },

  drawCandyRoad(ctx, b) {
    const roadImg = RoadAssetManager.get();
    if (roadImg && roadImg.complete && roadImg.naturalWidth > 0) {
      const cw = this.logicalWidth || this.canvas.width;
      const ch = this.logicalHeight || this.canvas.height;
      const ratio = roadImg.naturalHeight / roadImg.naturalWidth;
      const drawW = cw * 1.02;
      const drawH = Math.min(drawW * ratio, ch * 0.66);
      const centerY = (b.p0.y + b.p1.y + b.p2.y + b.p3.y) / 4 + ch * 0.03;
      const dx = (cw - drawW) / 2;
      const dy = centerY - drawH / 2;
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.shadowColor = 'rgba(80, 45, 20, 0.18)';
      ctx.shadowBlur = Math.max(8, ch * 0.025);
      ctx.shadowOffsetY = Math.max(4, ch * 0.012);
      ctx.drawImage(roadImg, dx, dy, drawW, drawH);
      ctx.restore();
      return;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const m = Math.min(w, h);
    const outer = Math.max(22, Math.min(48, m * 0.085));
    const inner = Math.max(16, outer - 8);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(b.p0.x, b.p0.y);
    ctx.bezierCurveTo(b.p1.x, b.p1.y, b.p2.x, b.p2.y, b.p3.x, b.p3.y);
    ctx.strokeStyle = '#c17a3a';
    ctx.lineWidth = outer;
    ctx.stroke();
    ctx.strokeStyle = '#f4e0b8';
    ctx.lineWidth = inner;
    ctx.setLineDash([Math.max(8, m * 0.02), Math.max(10, m * 0.025)]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    ctx.lineWidth = Math.max(2, m * 0.006);
    ctx.setLineDash([8, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const deco = Math.max(12, Math.min(20, m * 0.035));
    for (let i = 0; i < 5; i++) {
      const t = 0.12 + i * 0.19;
      const p = bezierPoint(t, b.p0, b.p1, b.p2, b.p3);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 4);
      ctx.font = deco + 'px serif';
      ctx.fillText(i % 2 ? '🍭' : '⭐', -deco * 0.45, deco * 0.25);
      ctx.restore();
    }
  },

  _slotT(i, n) {
    return (n <= 1) ? 0.5 : (0.08 + 0.84 * (i / (n - 1)));
  },

  getSequenceBallPosition(i, b, ballRBase) {
    const n = this.sequence.length;
    const cw = this.logicalWidth || this.canvas.width;
    const slide = Math.min(1, this.slideT);
    const t = this._slotT(i, n);
    const p = bezierPoint(t, b.p0, b.p1, b.p2, b.p3);
    const dyn = this.getDynamicSpeedFactor();
    const wobbleDiv = Math.max(0.45, dyn);
    const baseR = ballRBase || CONFIG.MIN_BALL_RADIUS;
    const entryGap = 0.82;
    const totalEntry = 1 + Math.max(0, n - 1) * entryGap;
    const localSlide = Math.max(0, Math.min(1, slide * totalEntry - i * entryGap));
    const visible = slide * totalEntry >= i * entryGap;
    const easedSlide = 1 - Math.pow(1 - localSlide, 3);
    const exit = this.getMachineExitPoint(b, baseR);
    const x = exit.x + (p.x - exit.x) * easedSlide + Math.sin(t * Math.PI * 2 + Date.now() / (800 / wobbleDiv)) * 2;
    const y = exit.y + (p.y - exit.y) * easedSlide - (localSlide < 1 ? Math.abs(Math.sin(localSlide * Math.PI * 4)) * baseR * 0.18 * (1 - localSlide) : 0);
    const dx = p.x - exit.x;
    const dy = p.y - exit.y;
    const travel = (1 - easedSlide) * Math.sqrt(dx * dx + dy * dy);
    return { x, y, t, travel, localSlide, visible };
  },

  drawSequenceOnPath(ctx, b) {
    const seq = this.sequence;
    const n = seq.length;
    const dyn = this.getDynamicSpeedFactor();
    const settings = StorageManager.get().settings;
    const showLabels = settings.showLabels;
    const colorblind = settings.colorblind || settings.showShapes;
    const cw = this.logicalWidth || this.canvas.width;
    const ch = this.logicalHeight || this.canvas.height;
    const gap = Math.max(4, cw * 0.012);
    const perSlot = (cw - gap * 2) / Math.max(1, n);
    const rFromW = Math.min(perSlot * 0.44, ch * 0.13);
    const ballRBase = Math.max(CONFIG.MIN_BALL_RADIUS, Math.min(CONFIG.MAX_BALL_RADIUS, rFromW));

    for (let i = 0; i < n; i++) {
      let t = this._slotT(i, n);
      const tangent = bezierTangent(t, b.p0, b.p1, b.p2, b.p3);
      const pos = this.getSequenceBallPosition(i, b, ballRBase);
      if (!pos.visible) continue;
      const x = pos.x;
      const y = pos.y;
      const squash = 1 + Math.sin(t * Math.PI * 3 + i) * 0.06;
      const c = seq[i];
      const isBlank = (i === this.blankIdx);
      const ballR = ballRBase * squash;
      const rollAngle = -pos.travel / Math.max(1, ballRBase);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tangent);
      if (!isBlank) ctx.rotate(rollAngle);
      ctx.scale(1, squash);

      if (isBlank) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        if (this.specialBlank === 'rainbow') {
          const hue = (Date.now() / 5) % 360;
          ctx.strokeStyle = 'hsla(' + hue + ', 90%, 58%, ' + (0.75 + pulse * 0.2) + ')';
          ctx.lineWidth = 5 + pulse * 2;
          ctx.beginPath();
          ctx.arc(0, 0, ballR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = 'hsla(' + ((hue + 40) % 360) + ', 85%, 50%, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, ballR * 0.88, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.specialBlank === 'star') {
          ctx.font = 'bold ' + Math.max(14, ballR * 0.95) + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 2);
          ctx.beginPath();
          ctx.arc(0, 0, ballR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 + pulse * 0.25) + ')';
          ctx.lineWidth = 3 + pulse * 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, ballR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 + pulse * 0.25) + ')';
          ctx.lineWidth = 3 + pulse * 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowColor = 'rgba(255,255,255,0.9)';
          ctx.shadowBlur = 12 + pulse * 10;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(0, 0, ballR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,' + (0.12 + pulse * 0.1) + ')';
          ctx.fill();
        }
      } else if (this.fillAnim && this.fillAnim.idx === i) {
        const pr = this.fillAnim.progress;
        this._drawBall(ctx, 0, 0, ballR * (0.5 + 0.5 * pr), c, colorblind);
      } else {
        this._drawBall(ctx, 0, 0, ballR, c, colorblind);
      }

      ctx.restore();

      if (showLabels && !isBlank) {
        ctx.save();
        ctx.font = 'bold ' + Math.max(10, Math.min(14, ballR * 0.38)) + 'px Comic Sans MS, sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, x, y + ballR + Math.max(12, ballR * 0.38));
        ctx.restore();
      }
    }

    if (this.slideT < 1) {
      this.slideT += 0.0065 * Math.min(1.15, dyn);
    }
  },

  _drawBall(ctx, x, y, r, color, colorblind) {
    const img = BallAssetManager.get(color);
    if (img && img.complete && img.naturalWidth > 0) {
      const size = r * 2.35;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.78, r * 0.78, r * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fill();
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      ctx.restore();
      if (colorblind) drawDaltonShape(ctx, x, y, r, SHAPE_BY_COLOR[color.id]);
      return;
    }

    ctx.beginPath();
    ctx.arc(x, y + 3, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
    g.addColorStop(0, color.hex);
    g.addColorStop(1, color.dark);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.font = (r * 0.9) + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.mascot, x, y + 1);
    if (colorblind) drawDaltonShape(ctx, x, y, r, SHAPE_BY_COLOR[color.id]);
  },

  drawJar(ctx, w, h) {
    const jw = Math.min(56, Math.max(38, w * 0.11));
    const jh = jw * 1.2;
    const jx = Math.max(8, w * 0.02);
    const jy = h * 0.72;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(jx + jw / 2, jy + jh + 4, jw / 2, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(jx + 4, jy + 12, jw - 8, jh - 12);
    ctx.strokeStyle = '#c8900a';
    ctx.lineWidth = 2;
    ctx.strokeRect(jx + 4, jy + 12, jw - 8, jh - 12);
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍯', jx + jw / 2, jy + jh / 2 + 10);
    ctx.restore();
  },

  onAnswer(colorId) {
    if (!this.running) return;
    AudioManager.resume();
    const ms = Date.now() - this.questionStartTime;
    const correct = this.answer && colorId === this.answer.id;
    const wasFirstTry = this.firstTry;

    PedagogyTracker.recordAttempt(colorId, correct, wasFirstTry);
    if (correct) {
      PedagogyTracker.finishRound(true, ms);
      PedagogyTracker.recordResponseTime(this.answer.id, ms);
    }
    this.firstTry = false;

    const btn = document.querySelector('.answer-btn[data-color-id="' + colorId + '"]');
    let btnX = window.innerWidth / 2, btnY = window.innerHeight;
    if (btn) {
      btn.classList.remove('tap-bounce');
      void btn.offsetWidth;
      btn.classList.add('tap-bounce');
      setTimeout(() => btn.classList.remove('tap-bounce'), 260);
      const rect = btn.getBoundingClientRect();
      btnX = rect.left + rect.width / 2;
      btnY = rect.top + rect.height / 2;
    }

    if (correct) {
      const p = this.getSequenceBallPosition(this.blankIdx, this.bezier);
      const canvasRect = this.canvas.getBoundingClientRect();
      const targetX = canvasRect.left + p.x;
      const targetY = canvasRect.top + p.y;
      const c = this.colors.find(c => c.id === colorId);
      
      this.hitStopUntil = Date.now() + 65;
      VisualEffects.trail(btnX, btnY, targetX, targetY, c ? c.hex : '#FFF');
      
      this.vibrate(50);
      this.onCorrect();
    } else {
      VisualEffects.splash(btnX, btnY - 20);
      this.vibrateSoft();
      this.onWrong(colorId);
    }
  },

  onCorrect() {
    AudioManager.playPop();
    setTimeout(() => AudioManager.playSuccess(), 90);
    VisualEffects.flash();

    MissionManager.recordCatch(this.answer.id);

    let bonusRainbow = 0;
    if (this.specialBlank === 'rainbow') bonusRainbow = 15;
    if (this.specialBlank === 'star') {
      this.slowMoUntil = Date.now() + 3000;
    }

    this.streak++;
    if (this.mode === 'infinite') {
      const prevM = this.mult;
      this.mult = Math.min(CONFIG.MULT_MAX, this.streak);
      if (this.mult > prevM) AudioManager.playLevelUp();
      const base = 10;
      const pts = base * this.mult + bonusRainbow;
      this.score += pts;
      this.updateScoreDisplay();
      this.scoreJump();
      this.floatPoints(pts, this.mult);
      this.updateHudInfinite();
    } else if (this.mode === 'discovery') {
      this.updateScoreDisplay();
    } else {
      this.score += 10 + bonusRainbow;
      this.updateScoreDisplay();
      this.scoreJump();
      this.floatPoints(10 + bonusRainbow, 1);
    }

    const now = Date.now();
    this.recentCorrectTimes.push(now);
    while (this.recentCorrectTimes.length && now - this.recentCorrectTimes[0] > CONFIG.COMBO_RAPIDO_MS) {
      this.recentCorrectTimes.shift();
    }
    if (this.recentCorrectTimes.length >= CONFIG.COMBO_RAPIDO_MIN) {
      const opts = ['Incrível!', 'Rápido!', 'Combo!'];
      this.showComboFloat(opts[Math.floor(Math.random() * opts.length)]);
      this.recentCorrectTimes = [];
    }

    document.getElementById('comboHeart').classList.toggle('hidden', this.streak < 3);

    if (this.mode === 'tutorial') TutorialManager.afterCorrect();

    const b = this.bezier;
    const p = this.getSequenceBallPosition(this.blankIdx, b);
    const bx = p.x;
    const by = p.y;
    VisualEffects.burst(bx, by, 28);

    this.fillAnim = { idx: this.blankIdx, progress: 0 };
    const fillLoop = () => {
      if (!this.fillAnim) return;
      this.fillAnim.progress += 0.12;
      this.drawScene();
      if (this.fillAnim.progress < 1) requestAnimationFrame(fillLoop);
      else {
        this.fillAnim = null;
        setTimeout(() => this.advanceRound(), 420);
      }
    };
    requestAnimationFrame(fillLoop);

    const comboMessages = { 3: 'Combo x3!', 5: 'Incrível!', 8: 'Sequência perfeita!' };
    if (comboMessages[this.streak]) {
      VisualEffects.candyRain();
      const b = document.createElement('div');
      b.className = 'streak-banner';
      b.textContent = comboMessages[this.streak];
      document.getElementById('gameplayScreen').appendChild(b);
      setTimeout(() => b.remove(), 2200);
      this.showComboFloat(comboMessages[this.streak]);
      this.showMascotMessage(comboMessages[this.streak], 'happy');
    }

    if (this.mode !== 'tutorial') {
      const phrases = ['Uau!', 'Muito bem!', 'Arrasou!'];
      SpeechManager.speak(phrases[Math.floor(Math.random() * phrases.length)]);
      if (!comboMessages[this.streak]) {
        this.showMascotMessage(phrases[Math.floor(Math.random() * phrases.length)], 'happy');
      }
    }
  },

  onWrong(colorId) {
    AudioManager.playError();
    this.wrongCount++;
    PedagogyTracker.recordHint();
    if (this.mode === 'tutorial') {
      SpeechManager.speak('Boa tentativa! Vamos tentar novamente?');
      this.showMascotMessage('Quase lá!', 'think');
    } else {
      const hintMessages = [
        'Vamos observar novamente.',
        'Olhe para a bolinha que brilha.',
        'Dica: começa com "' + (this.answer ? this.answer.label.charAt(0) : '') + '".',
        'O padrão repete: ' + this.currentPatternType + '. A cor que falta é ' + (this.answer ? this.answer.label : '') + '.'
      ];
      const msg = hintMessages[Math.min(this.wrongCount, hintMessages.length) - 1];
      SpeechManager.speak(this.wrongCount === 1 ? 'Boa tentativa!' : 'Vamos tentar novamente?');
      this.showMascotMessage(msg, 'think');
    }

    this.recentCorrectTimes = [];

    try {
      const b = this.bezier;
      const p = this.getSequenceBallPosition(this.blankIdx, b);
      const bx = p.x;
      const by = p.y;
      VisualEffects.smokeBurst(bx, by, 26);
      GameEngine.triggerScreenShake();
    } catch (e) {}

    this.streak = 0;
    this.mult = 1;
    this.updateHudInfinite();
    document.getElementById('comboHeart').classList.add('hidden');

    if (this.mode !== 'tutorial') this.mistakesThisLevel++;

    const wrongBtn = document.querySelector('.answer-btn[data-color-id="' + colorId + '"]');
    if (wrongBtn) wrongBtn.classList.add('answer-btn-eliminated');

    const correctBtn = document.querySelector('.answer-btn[data-color-id="' + this.answer.id + '"]');

    const hintAt = Math.max(1, this.difficultyConfig.hintsAfterErrors || 2);
    if (this.wrongCount >= hintAt && this.wrongCount < hintAt + 1) {
      if (correctBtn) correctBtn.classList.add('hint-soft');
    } else if (this.wrongCount >= hintAt + 1) {
      document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('hint-soft'));
      if (correctBtn) {
        correctBtn.classList.add('hint-mega');
      }
    }
    if (this.wrongCount >= 3) {
      const name = this.wrongCount >= 4
        ? 'Padrão ' + this.currentPatternType + ': ' + this.answer.label
        : 'Começa com ' + this.answer.label.charAt(0) + '!';
      const h = document.createElement('div');
      h.className = 'hint-big';
      h.textContent = name + '!';
      document.getElementById('gameplayScreen').appendChild(h);
      setTimeout(() => h.remove(), CONFIG.HINT_NAME_MS);
    }
  },

  fadeThenNewRound() {
    this.transitionPhase = 'fade';
    let f = 0;
    const step = () => {
      f += 0.12;
      this.roundFade = Math.min(1, f);
      this.drawScene();
      if (f < 1) requestAnimationFrame(step);
      else {
        this.roundFade = 0;
        this.generateRound();
      }
    };
    requestAnimationFrame(step);
  },

  advanceRound() {
    this.seqsCompleted++;
    this.updateProgress();

    if (this.level && this.level.id >= 3) {
      PedagogyTracker.setComplexBonus(Math.min(1, this.seqsCompleted / this.totalSeqs));
    }

    if (this.mode === 'tutorial') {
      if (this.seqsCompleted >= CONFIG.TUTORIAL_SEQS) {
        TutorialManager.complete();
        return;
      }
    }

    if (this.level && this.seqsCompleted >= this.totalSeqs) {
      this.levelComplete();
      return;
    }

    this.fadeThenNewRound();
  },

  levelComplete() {
    this.running = false;

    const result = PedagogyTracker.endSession() || {
      nota: 0,
      passed: false,
      totalRounds: this.seqsCompleted,
      correctRounds: 0,
      firstTryCorrect: 0,
      avgResponseTime: 0,
      minGradeToPass: this.difficultyConfig.minGradeToPass,
      difficultyLabel: this.difficultyConfig.label,
      recommendation: 'Repetir a fase para gerar dados pedagógicos mais confiáveis.'
    };
    const passed = !!result.passed;
    const stars = getStarsFromGrade(result.nota, passed);

    if (this.level) {
      StorageManager.set(d => {
        const cur = d.levelStars[this.level.id] || 0;
        d.levelStars[this.level.id] = Math.max(cur, stars);
        const nextId = this.level.id + 1;
        if (passed && !d.unlockedLevels.includes(nextId) && nextId <= CONFIG.MAP_LEVELS) {
          d.unlockedLevels.push(nextId);
        }
        if (passed) {
          if (!d.unlockedStickers) d.unlockedStickers = [];
          if (!d.rewardStickers) d.rewardStickers = [];
          const stickerId = CONFIG.STICKER_REWARD_BY_LEVEL[this.level.id];
          if (stickerId && !d.unlockedStickers.includes(stickerId)) {
            d.unlockedStickers.push(stickerId);
          }
          if (stickerId && !d.rewardStickers.includes(stickerId)) {
            d.rewardStickers.push(stickerId);
          }
        }
        const att = d.levelAttempts[this.level.id] || { sum: 0, rounds: 0 };
        att.sum += this.mistakesThisLevel;
        att.rounds += this.seqsCompleted;
        d.levelAttempts[this.level.id] = att;
      });
    }

    if (passed && stars === 3) {
      AudioManager.playTrophy();
      VisualEffects.burst(window.innerWidth / 2, window.innerHeight / 3, 50);
    }

    if (passed) {
      AudioManager.playWinElaborate();
      VisualEffects.candyRain();
      this.showMascotMessage('Você conseguiu!', 'happy');
    } else {
      AudioManager.playSuccess();
      VisualEffects.burst(window.innerWidth / 2, window.innerHeight / 2, 22);
      this.showMascotMessage('Vamos praticar mais!', 'think');
    }
    setTimeout(() => GameEngine.showResult(stars, this.score, this.mode, result), 900);
  },

  startLoop() {
    const loop = () => {
      if (this.running) {
        if (Date.now() >= this.hitStopUntil) {
          this.drawScene();
        }
      }
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  },

  stop() {
    this.running = false;
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
};

// ===== ProfessorPanel =====
const ProfessorPanel = {
  open() {
    document.getElementById('professorPanel').classList.add('open');
    this.refresh();
  },
  close() { document.getElementById('professorPanel').classList.remove('open'); },

  refresh() {
    const d = StorageManager.get();

    const scoreEl = document.getElementById('profScore');
    const descEl = document.getElementById('profScoreDesc');
    if (d.lastNote != null) {
      scoreEl.textContent = d.lastNote;
      descEl.textContent = d.lastNote >= 80 ? 'Excelente desempenho!' : d.lastNote >= 60 ? 'Bom progresso!' : 'Continue praticando!';
    } else {
      scoreEl.textContent = '--';
      descEl.textContent = 'Nenhuma sessão registrada ainda';
    }

    const latest = (d.sessions || [])[0] || null;
    const summaryEl = document.getElementById('profSessionSummary');
    const recEl = document.getElementById('profRecommendation');
    if (summaryEl) {
      if (latest) {
        const minGrade = latest.minGradeToPass || getDifficultyConfig(latest.difficulty).minGradeToPass;
        const status = latest.passed ? 'Apto para próxima fase' : 'Recomenda-se repetir';
        summaryEl.innerHTML =
          '<div><span>Dificuldade</span><strong>' + (latest.difficultyLabel || getDifficultyConfig(latest.difficulty).label) + '</strong></div>' +
          '<div><span>Nota mínima</span><strong>' + minGrade + '/100</strong></div>' +
          '<div><span>Status</span><strong>' + status + '</strong></div>' +
          '<div><span>Primeira tentativa</span><strong>' + (latest.firstTryCorrect || 0) + '/' + (latest.totalRounds || 0) + '</strong></div>' +
          '<div><span>Acertos totais</span><strong>' + (latest.correctRounds || 0) + '/' + (latest.totalRounds || 0) + '</strong></div>' +
          '<div><span>Tempo médio</span><strong>' + formatSeconds(latest.avgResponseTime || 0) + '</strong></div>' +
          '<div><span>Dicas usadas</span><strong>' + (latest.hintCount || 0) + '</strong></div>';
      } else {
        summaryEl.innerHTML = '<div><span>Sem sessões registradas</span><strong>—</strong></div>';
      }
    }
    if (recEl) {
      recEl.textContent = latest ? (latest.recommendation || 'Observar mais uma sessão para recomendação automática.') : 'Sem recomendação ainda.';
    }
    const profileEl = document.getElementById('pedagogicalProfile');
    if (profileEl) {
      const profile = latest ? (latest.profile || buildPedagogicalProfile(latest)) : buildPedagogicalProfile(null);
      profileEl.innerHTML = profile.map(p =>
        '<div class="ped-profile-row"><span>' + p.label + '</span><strong>' + p.stars + '</strong></div>'
      ).join('');
    }
    if (latest && descEl) {
      descEl.textContent = (latest.passed ? 'Apto para próxima fase' : 'Recomenda-se repetir') +
        ' · mínimo ' + (latest.minGradeToPass || getDifficultyConfig(latest.difficulty).minGradeToPass) + ' na dificuldade ' +
        (latest.difficultyLabel || getDifficultyConfig(latest.difficulty).label);
    }

    const accChart = document.getElementById('sessionAccuracyChart');
    accChart.innerHTML = '';
    const sess = (d.sessions || []).slice(0, 5);
    if (sess.length === 0) {
      accChart.innerHTML = '<li style="color:#888;font-size:0.85rem;padding:8px 0;">Sem sessões</li>';
    } else {
      sess.forEach(s => {
        const pct = typeof s.accuracyPct === 'number' ? s.accuracyPct : 0;
        const label = (s.levelName || s.mode || '') + '';
        accChart.innerHTML += '<div class="bar-row"><div class="bar-label" style="width:100px;">' + label.slice(0, 14) + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:#6BCB77"></div></div>' +
          '<div class="bar-pct">' + pct + '%</div></div>';
      });
    }

    const chart = document.getElementById('colorErrorChart');
    chart.innerHTML = '';
    for (const c of COLORS) {
      const total = d.colorTotal[c.id] || 0;
      const errors = d.colorErrors[c.id] || 0;
      const pct = total > 0 ? Math.round((errors / total) * 100) : 0;
      chart.innerHTML += '<div class="bar-row"><div class="bar-label">' + c.mascot + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + c.hex + '"></div></div>' +
        '<div class="bar-pct">' + pct + '%</div></div>';
    }

    const rt = document.getElementById('responseTimeChart');
    rt.innerHTML = '';
    for (const c of COLORS) {
      const cnt = d.responseTimeCount[c.id] || 0;
      const sum = d.responseTimeSum[c.id] || 0;
      const avg = cnt ? Math.round(sum / cnt) : 0;
      const display = cnt ? (avg + ' ms (média)') : '—';
      const barPct = cnt ? Math.min(100, avg / 25) : 0;
      rt.innerHTML += '<div class="bar-row"><div class="bar-label">' + c.mascot + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + barPct + '%;background:#6EC6FF"></div></div>' +
        '<div class="bar-pct">' + display + '</div></div>';
    }

    this.drawEvolutionChart();

    let hardest = '—';
    let worst = 0;
    const la = d.levelAttempts || {};
    for (const k of Object.keys(la)) {
      const a = la[k];
      const ratio = a.rounds ? a.sum / a.rounds : 0;
      if (ratio > worst) { worst = ratio; hardest = 'Fase ' + k + ' (média ' + ratio.toFixed(2) + ' erros/rodada)'; }
    }
    document.getElementById('hardestPhase').textContent = hardest;

    let hardColorText = 'Cor com mais dificuldade: —';
    let hardColorPct = -1;
    for (const c of COLORS) {
      const total = d.colorTotal[c.id] || 0;
      const errors = d.colorErrors[c.id] || 0;
      const pct = total ? Math.round((errors / total) * 100) : 0;
      if (total > 0 && pct > hardColorPct) {
        hardColorPct = pct;
        hardColorText = 'Cor com mais dificuldade: ' + c.label + ' (' + pct + '% de erros)';
      }
    }
    const hardestColorEl = document.getElementById('hardestColor');
    if (hardestColorEl) hardestColorEl.textContent = hardColorText;

    let totalTime = 0;
    let totalTimeCount = 0;
    for (const c of COLORS) {
      totalTime += d.responseTimeSum[c.id] || 0;
      totalTimeCount += d.responseTimeCount[c.id] || 0;
    }
    const avgGeneral = totalTimeCount ? Math.round(totalTime / totalTimeCount) : 0;
    const avgTimeEl = document.getElementById('profGlobalAvgTime');
    if (avgTimeEl) avgTimeEl.textContent = 'Tempo médio geral: ' + (avgGeneral ? formatSeconds(avgGeneral) : '—');

    const list = document.getElementById('sessionList');
    list.innerHTML = '';
    if (!d.sessions || d.sessions.length === 0) {
      list.innerHTML = '<li class="session-item"><span>Nenhuma sessão</span></li>';
    } else {
      for (const s of d.sessions) {
        const ln = s.levelName ? s.levelName : s.mode;
        list.innerHTML += '<li class="session-item"><span>' + s.date + ' — ' + ln + '</span><span><strong>' + s.nota + '</strong></span></li>';
      }
    }

    const cfg = d.settings || {};
    const activeSpeed = normalizeDifficultyKey(cfg.speed);
    document.querySelectorAll('.speed-btn').forEach(b => {
      const diffCfg = getDifficultyConfig(b.dataset.speed);
      b.textContent = diffCfg.label;
      b.title = diffCfg.teacherText;
      b.classList.toggle('active', b.dataset.speed === activeSpeed);
    });

    const tl = document.getElementById('toggleLabels');
    tl.textContent = 'Mostrar nomes: ' + (cfg.showLabels ? 'ON' : 'OFF');
    tl.classList.toggle('on', !!cfg.showLabels);

    const ts = document.getElementById('toggleShapes');
    if (ts) {
      ts.textContent = 'Símbolos: ' + (cfg.showShapes ? 'ON' : 'OFF');
      ts.classList.toggle('on', !!cfg.showShapes);
    }

    const td = document.getElementById('toggleDalton');
    td.textContent = 'Modo daltônico: ' + (cfg.colorblind ? 'ON' : 'OFF');
    td.classList.toggle('on', !!cfg.colorblind);

    const tn = document.getElementById('toggleNarration');
    if (tn) {
      tn.textContent = 'Narração: ' + (cfg.narration ? 'ON' : 'OFF');
      tn.classList.toggle('on', !!cfg.narration);
    }

    const tc = document.getElementById('toggleCalm');
    if (tc) {
      tc.textContent = 'Modo calmo: ' + (cfg.calmMode ? 'ON' : 'OFF');
      tc.classList.toggle('on', !!cfg.calmMode);
    }

    const ta = document.getElementById('toggleAccess');
    if (ta) {
      ta.textContent = 'Modo Acessibilidade: ' + (cfg.accessibility ? 'ON' : 'OFF');
      ta.classList.toggle('on', !!cfg.accessibility);
    }
    applyBodySettingsClasses();
  },

  setSpeed(speed) {
    StorageManager.set(d => { if (!d.settings) d.settings = {}; d.settings.speed = normalizeDifficultyKey(speed); });
    this.refresh();
  },
  toggleLabels() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.showLabels = !d.settings.showLabels;
    });
    this.refresh();
    if (Gameplay.running) Gameplay.drawScene();
  },
  toggleShapes() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.showShapes = !d.settings.showShapes;
    });
    this.refresh();
    if (Gameplay.running) {
      Gameplay.buildAnswerBtns();
      Gameplay.drawScene();
    }
  },
  toggleDaltonism() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.colorblind = !d.settings.colorblind;
    });
    this.refresh();
    if (Gameplay.running) {
      Gameplay.buildAnswerBtns();
      Gameplay.drawScene();
    }
  },
  toggleNarration() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.narration = !d.settings.narration;
    });
    this.refresh();
    if (StorageManager.get().settings.narration) SpeechManager.speak('Narração ativada.');
  },
  toggleCalmMode() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.calmMode = !d.settings.calmMode;
    });
    this.refresh();
  },
  toggleAccessibility() {
    StorageManager.set(d => {
      if (!d.settings) d.settings = {};
      d.settings.accessibility = !d.settings.accessibility;
    });
    this.refresh();
  },
  downloadReport() {
    const latest = (StorageManager.get().sessions || [])[0];
    if (!latest) {
      alert('Ainda não há sessão registrada para baixar.');
      return;
    }
    const report = {
      data: latest.date,
      modo: latest.mode,
      fase: latest.levelName || latest.levelId || '—',
      dificuldade: latest.difficultyLabel,
      nota: latest.nota,
      notaMinima: latest.minGradeToPass,
      status: latest.passed ? 'Apto para próxima fase' : 'Recomenda-se repetir',
      acertosPrimeiraTentativa: latest.firstTryCorrect,
      acertosTotais: latest.correctRounds,
      rodadas: latest.totalRounds,
      tentativasTotais: latest.totalAttempts,
      tentativasComApoio: latest.wrongAttempts,
      dicasUsadas: latest.hintCount || 0,
      tempoMedioMs: latest.avgResponseTime,
      recomendacaoPedagogica: latest.recommendation,
      perfilPedagogico: latest.profile || buildPedagogicalProfile(latest),
      medalhas: latest.badges || buildSessionBadges(latest)
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  drawEvolutionChart() {
    const canvas = document.getElementById('profEvolutionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sess = (StorageManager.get().sessions || []).slice(0, 5).reverse();
    if (sess.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Sem dados ainda', 10, 28);
      return;
    }
    const vals = sess.map(s => (typeof s.accuracyPct === 'number' ? s.accuracyPct : 0));
    const pad = 14;
    const maxH = h - pad * 2;
    const maxW = w - pad * 2;
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.stroke();
    ctx.strokeStyle = '#6BCB77';
    ctx.lineWidth = 2;
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = vals.length === 1 ? pad + maxW / 2 : pad + (i / (vals.length - 1)) * maxW;
      const y = h - pad - (v / 100) * maxH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#6BCB77';
    vals.forEach((v, i) => {
      const x = vals.length === 1 ? pad + maxW / 2 : pad + (i / (vals.length - 1)) * maxW;
      const y = h - pad - (v / 100) * maxH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.fillText('0%', 2, h - 6);
    ctx.fillText('100%', w - 32, pad + 8);
  },

  clearAllData() {
    if (!confirm('Isto limpa sessões, notas, métricas de tempo por cor, gráficos e tentativas por fase. Continuar?')) return;
    if (!confirm('Confirmação final: apagar todos estes dados?')) return;
    const cfg = StorageManager.get().settings;
    StorageManager.set(d => {
      d.sessions = [];
      d.lastNote = null;
      d.colorErrors = { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 };
      d.colorTotal = { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 };
      d.responseTimeSum = { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 };
      d.responseTimeCount = { red: 0, blue: 0, yellow: 0, green: 0, orange: 0, purple: 0 };
      d.levelAttempts = {};
      if (d.dailyMission) d.dailyMission.count = 0;
      if (cfg) d.settings = cfg;
    });
    this.refresh();
  }
};

// ===== GameEngine =====
const GameEngine = {
  init() {
    AudioManager.init();
    VisualEffects.init();
    applyBodySettingsClasses();
    this.populateMenuMascots();
    this.injectShakeStyle();
    this.updateMenuLock();
    this.showMenu();
  },

  injectShakeStyle() {
    if (document.getElementById('shakeStyle')) return;
    const s = document.createElement('style');
    s.id = 'shakeStyle';
    s.textContent = '@keyframes wrong-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';
    document.head.appendChild(s);
  },

  triggerScreenShake() {
    const g = document.getElementById('game');
    if (!g) return;
    g.classList.remove('screen-shake');
    void g.offsetWidth;
    g.classList.add('screen-shake');
    setTimeout(() => g.classList.remove('screen-shake'), 450);
  },

  populateMenuMascots() {
    const row = document.getElementById('menuMascots');
    row.innerHTML = '';
    const mascotAssets = [
      { src: 'assets/imgs/mascot-red-apple.png', alt: 'Mascote maçã vermelha' },
      { src: 'assets/imgs/mascot-blueberry.png', alt: 'Mascote frutinha azul' },
      { src: 'assets/imgs/mascot-lemon.png', alt: 'Mascote limão amarelo' },
      { src: 'assets/imgs/mascot-green-apple.png', alt: 'Mascote maçã verde' },
      { src: 'assets/imgs/mascot-orange.png', alt: 'Mascote laranja' },
      { src: 'assets/imgs/mascot-grape.png', alt: 'Mascote uva roxa' }
    ];

    mascotAssets.forEach((asset, i) => {
      const w = document.createElement('div');
      w.className = 'mascot-wrap';
      const img = document.createElement('img');
      img.src = asset.src;
      img.alt = asset.alt;
      img.loading = 'eager';
      img.draggable = false;
      w.appendChild(img);
      row.appendChild(w);
    });
  },

  updateMenuLock() {
    const d = StorageManager.get();
    const done = !!d.tutorialCompleto;
    document.getElementById('wrapStory').classList.toggle('menu-locked', !done);
    document.getElementById('hintStory').style.display = done ? 'none' : 'block';
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  showMenu() {
    Gameplay.stop();
    GameStateMachine.transition(GameState.MENU);
    AudioManager.stopBGM();
    AudioManager.playBGMMenu();
    this.showScreen('menuScreen');
    this.updateMenuLock();
  },

  showMap() {
    GameStateMachine.transition(GameState.MAP);
    AudioManager.stopBGM();
    AudioManager.playBGMMenu();
    this.showScreen('mapScreen');
    this.renderMap();
  },

  renderMap() {
    const data = StorageManager.get();
    const nodes = document.getElementById('mapNodes');
    nodes.innerHTML = '';
    const decor = document.getElementById('mapDecor');
    decor.innerHTML = '';

    const positions = [
      { x: 0.14, y: 0.68 }, { x: 0.30, y: 0.45 }, { x: 0.49, y: 0.62 },
      { x: 0.66, y: 0.40 }, { x: 0.84, y: 0.58 }
    ];
    const routePositions = positions.slice(0, LevelManager.levels.length);

    const decors = ['🌳', '☁️', '🍬', '🎡', '🎠', '🌈', '☁️', '🏆'];
    routePositions.forEach((p, i) => {
      if (i < routePositions.length - 1) {
        const d = document.createElement('div');
        d.className = 'map-decor';
        d.textContent = decors[i];
        d.style.left = ((p.x + routePositions[i + 1].x) / 2 * 100) + '%';
        d.style.top = ((p.y + routePositions[i + 1].y) / 2 * 100 - 5) + '%';
        decor.appendChild(d);
      }
    });

    const mapW = window.innerWidth, mapH = window.innerHeight;

    LevelManager.levels.forEach((lv, i) => {
      const pos = positions[i];
      const unlocked = data.unlockedLevels.includes(lv.id);
      const stars = data.levelStars[lv.id] || 0;

      const node = document.createElement('div');
      node.className = 'level-node ' + (unlocked ? 'unlocked' : 'locked');
      node.style.left = (pos.x * 100) + '%';
      node.style.top = (pos.y * 100) + '%';
      if (unlocked) {
        node.innerHTML = '<div class="level-pin">' + lv.id + '</div><div class="level-emoji">' + lv.emoji + '</div><div class="level-num">' + lv.name.replace(/^[^\s]+\s/, '') + '</div><div class="level-stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div>';
        node.addEventListener('click', () => this.startMode('story', lv.id));
      } else {
        node.innerHTML = '<div class="level-pin">' + lv.id + '</div><div class="lock-icon">🔒</div><div class="level-num">Fase ' + lv.id + '</div>';
      }
      nodes.appendChild(node);
    });

    const svg = document.getElementById('mapSvg');
    svg.setAttribute('viewBox', '0 0 ' + mapW + ' ' + mapH);
    let d = '';
    routePositions.forEach((pos, i) => {
      const x = pos.x * mapW, y = pos.y * mapH;
      if (i === 0) d += 'M ' + x + ' ' + y;
      else d += ' C ' + (x - 80) + ' ' + (y - 80) + ', ' + (x + 40) + ' ' + (y + 60) + ', ' + x + ' ' + y;
    });
    document.getElementById('mapPathRoad').setAttribute('d', d);
    document.getElementById('mapPathDash').setAttribute('d', d);

    MissionManager.ensureMission();
    const ban = document.getElementById('mapMissionBanner');
    if (ban) {
      ban.style.display = 'block';
      ban.innerHTML = MissionManager.bannerHTML();
    }
  },

  startMode(mode, levelId) {
    Gameplay.stop();
    GameStateMachine.transition(GameState.GAMEPLAY);
    AudioManager.stopBGM();
    AudioManager.playBGMGame();
    this.showScreen('gameplayScreen');

    setTimeout(() => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      Gameplay.init(mode, levelId);
    }, 50);
  },

  retryLevel() {
    const mode = Gameplay.mode;
    const level = Gameplay.level ? Gameplay.level.id : null;
    Gameplay.stop();
    setTimeout(() => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      Gameplay.init(mode, level);
    }, 50);
  },

  showTutorialComplete() {
    GameStateMachine.transition(GameState.RESULT);
    AudioManager.stopBGM();
    AudioManager.playBGMMenu();
    this.showScreen('resultScreen');
    const cont = document.getElementById('resultContent');
    cont.innerHTML = '<div class="result-title">Parabéns! Tutorial completado! 🎉</div>' +
      '<p class="result-next">Agora você pode jogar na História!</p>' +
      '<div class="result-btns"><button type="button" class="btn-glossy btn-pink btn-small" onclick="GameEngine.showMenu()">🏠 MENU</button></div>';
    VisualEffects.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
    this.updateMenuLock();
  },

  showResult(stars, score, mode, resultData) {
    GameStateMachine.transition(GameState.RESULT);
    AudioManager.stopBGM();
    AudioManager.playBGMMenu();
    this.showScreen('resultScreen');
    const cont = document.getElementById('resultContent');
    const lv = Gameplay.level;
    const data = StorageManager.get();
    const nextLv = lv && lv.id < CONFIG.MAP_LEVELS ? LevelManager.getLevel(lv.id + 1) : null;
    const result = typeof resultData === 'object' && resultData
      ? resultData
      : { nota: Number(resultData) || 0, passed: true };
    const nota = Number.isFinite(result.nota) ? result.nota : 0;
    const minGrade = result.minGradeToPass || getCurrentDifficultyConfig().minGradeToPass;
    const passed = result.passed !== false;
    const totalRounds = result.totalRounds || Gameplay.totalSeqs || 0;
    const correctRounds = result.correctRounds || 0;
    const firstTryCorrect = result.firstTryCorrect || 0;
    const avgTime = result.avgResponseTime || 0;
    const difficultyLabel = result.difficultyLabel || getCurrentDifficultyConfig().label;
    const childMessage = getChildResultMessage(nota, minGrade, passed);
    const statusText = passed ? 'Aprovado para a próxima fase' : 'Vamos treinar mais um pouquinho';
    const recommendation = result.recommendation || buildPedagogicalRecommendation({
      accuracyPct: totalRounds ? Math.round((correctRounds / totalRounds) * 100) : 0,
      avgResponseTime: avgTime,
      firstTryRate: totalRounds ? Math.round((firstTryCorrect / totalRounds) * 100) : 0
    });

    let starsHTML = '';
    for (let i = 0; i < 3; i++) {
      starsHTML += '<span class="star-fall" style="animation-delay:' + (i * 0.2) + 's">' + (i < stars ? '⭐' : '☆') + '</span>';
    }

    let trophy = '';
    if (stars === 3) {
      trophy = '<div class="trophy-burst" style="position:relative;font-size:4rem;">🏆</div>';
    }

    let nextName = nextLv ? nextLv.name : '—';
    let buttons = '<button type="button" class="btn-glossy btn-pink btn-small" onclick="GameEngine.retryLevel()">' + (passed ? 'REPETIR' : 'TENTAR DE NOVO') + '</button>' +
      '<button type="button" class="btn-glossy btn-choco btn-small" onclick="GameEngine.showMenu()">🏠 MENU</button>';
    if (passed && mode === 'story' && nextLv && data.unlockedLevels.includes(nextLv.id)) {
      buttons += '<button type="button" class="btn-glossy btn-green btn-small" onclick="GameEngine.startMode(\'story\',' + nextLv.id + ')">➡️ PRÓXIMA FASE</button>';
    } else if (mode === 'story') {
      buttons += '<button type="button" class="btn-glossy btn-green btn-small" onclick="GameEngine.showMap()">🗺️ MAPA</button>';
    }

    let pedText = '';
    if (nota >= 80) pedText = '<span style="color:#6BCB77">Excelente! Pronta para novos desafios! 🌟</span>';
    else if (nota >= 50) pedText = '<span style="color:#FF9800">Muito bem! Continua a praticar! 👍</span>';
    else pedText = '<span style="color:#ff4b2b">Vamos tentar de novo para melhorar! 💪</span>';

    const renderScoreBlock = (extraTop) => {
      return extraTop +
        '<div style="background:rgba(255,255,255,0.9); padding:10px 16px; border-radius:18px; margin: 10px 0; max-width: 320px; text-align: center; border: 3px solid #ff6eb4; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">' +
        '<div style="color:#333; font-weight:900; font-size:1.1rem; margin-bottom:4px;">Nota Final: <span style="font-size:1.4rem; color:#ff4b2b;">' + nota + '/100</span></div>' +
        '<div style="font-weight:900; font-size:1.05rem;">' + pedText + '</div></div>';
    };

    let scoreBlock = renderScoreBlock('');
    const resultClass = passed ? 'result-card passed' : 'result-card retry';
    const badges = result.badges || buildSessionBadges(result);
    const profile = result.profile || buildPedagogicalProfile(result);
    const badgesHTML = badges.length
      ? '<div class="result-badges">' + badges.map(b => '<span>' + b + '</span>').join('') + '</div>'
      : '';
    const profileHTML = '<div class="result-profile">' + profile.map(p =>
      '<div><span>' + p.label + '</span><strong>' + p.stars + '</strong></div>'
    ).join('') + '</div>';
    scoreBlock =
      '<div class="' + resultClass + '">' +
        '<div class="result-grade-row"><span>Nota Final</span><strong>' + nota + '/100</strong></div>' +
        '<div class="result-status">' + statusText + '</div>' +
        '<div class="result-child-message">' + childMessage + '</div>' +
        '<div class="result-metrics">' +
          '<div><span>Acertos de primeira</span><strong>' + firstTryCorrect + '/' + totalRounds + '</strong></div>' +
          '<div><span>Acertos totais</span><strong>' + correctRounds + '/' + totalRounds + '</strong></div>' +
          '<div><span>Tempo médio</span><strong>' + formatSeconds(avgTime) + '</strong></div>' +
          '<div><span>Dificuldade</span><strong>' + difficultyLabel + ' · min. ' + minGrade + '</strong></div>' +
        '</div>' +
        badgesHTML +
        profileHTML +
        '<div class="result-note"><strong>Observação:</strong> ' + recommendation + '</div>' +
      '</div>';



    const nextLine = (mode === 'story' && lv)
      ? (!passed
        ? '<div class="result-next">Treine mais um pouquinho para abrir a próxima fase.</div>'
        : lv.id >= CONFIG.MAP_LEVELS
          ? '<div class="result-next">Você completou o modo História! 🎊</div>'
          : '<div class="result-next">Próxima fase: ' + nextName + '</div>')
      : '';

    cont.innerHTML = '<div class="result-title">' + (passed ? 'Fase concluída!' : 'Vamos praticar!') + '</div>' + trophy +
      '<div class="result-stars">' + starsHTML + '</div>' +
      scoreBlock + nextLine +
      '<div class="result-btns">' + buttons + '</div>';

    VisualEffects.burst(window.innerWidth / 2, window.innerHeight / 2, 45);
  }
};

// ===== AlbumManager =====
const AlbumManager = {
  stickers: [
    { id: 'st_morango', name: 'Morango Feliz', cost: 3, svgIdx: 0 },
    { id: 'st_doce', name: 'Docinho Azul', cost: 5, svgIdx: 1 },
    { id: 'st_limao', name: 'Limão', cost: 5, svgIdx: 2 },
    { id: 'st_maca', name: 'Maçãzinha', cost: 8, svgIdx: 3 },
    { id: 'st_castelo', name: 'Castelo Mágico', cost: 12, emoji: '🏰' },
    { id: 'st_barco', name: 'Barco Pirulito', cost: 15, emoji: '⛵' }
  ],
  render() {
    const data = StorageManager.get();
    if (!data.unlockedStickers) data.unlockedStickers = [];
    
    // Contar total de estrelas vs estrelas gastas
    let totalStars = 0;
    for (let k in data.levelStars) totalStars += data.levelStars[k];
    let spentStars = 0;
    const rewardStickers = data.rewardStickers || [];
    this.stickers.forEach(s => {
      if (data.unlockedStickers.includes(s.id) && !rewardStickers.includes(s.id)) spentStars += s.cost;
    });
    const balance = Math.max(0, totalStars - spentStars);
    
    document.getElementById('albumTotalStars').textContent = balance;
    
    const grid = document.getElementById('albumGrid');
    grid.innerHTML = '';
    
    this.stickers.forEach(s => {
      const isUnlocked = data.unlockedStickers.includes(s.id);
      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.85); border-radius:18px; padding:16px; text-align:center; box-shadow: 0 6px 12px rgba(0,0,0,0.1); display:flex; flex-direction:column; align-items:center; border: 3px solid ' + (isUnlocked ? '#6BCB77' : '#ddd') + ';';
      
      const visual = s.emoji ? `<div style="font-size:3.5rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.2)); ${!isUnlocked ? 'filter:grayscale(1) opacity(0.3);' : ''}">${s.emoji}</div>` : 
        `<div style="${!isUnlocked ? 'filter:grayscale(1) opacity(0.3);' : ''}">${getMascotSVG(s.svgIdx, 60)}</div>`;
      
      card.innerHTML = visual + `<div style="font-weight:900; color:#444; margin:10px 0 5px 0; font-size:0.9rem;">${isUnlocked ? s.name : '???'}</div>`;
      
      if (!isUnlocked) {
        const btn = document.createElement('button');
        btn.className = 'btn-glossy btn-small';
        btn.style.cssText = `background: ${balance >= s.cost ? 'linear-gradient(180deg, #6BCB77, #3a9a45)' : '#999'}; box-shadow: 0 4px 0 ${balance >= s.cost ? '#206a2a' : '#666'}; width: 100%; min-height: 38px !important; font-size: 0.85rem !important; border-radius: 12px;`;
        btn.textContent = `🔓 ${s.cost} ⭐`;
        if (balance >= s.cost) {
          btn.onclick = () => {
             AudioManager.playSuccess();
             VisualEffects.burst(window.innerWidth/2, window.innerHeight/2, 40);
             StorageManager.set(d => {
               if(!d.unlockedStickers) d.unlockedStickers = [];
               d.unlockedStickers.push(s.id);
             });
             this.render();
          };
        }
        card.appendChild(btn);
      } else {
        card.innerHTML += `<div style="color:#6BCB77; font-weight:900; font-size:0.8rem;">Já tens! 🎉</div>`;
      }
      grid.appendChild(card);
    });
  }
};

GameEngine.showAlbum = function() {
  GameStateMachine.transition(GameState.MAP); // usar transição fictícia para ecrãs menores
  AudioManager.stopBGM();
  AudioManager.playBGMMenu();
  this.showScreen('albumScreen');
  AlbumManager.render();
};

// FIX 4.2: Tela de erro amigável com retry
function showErrorScreen(message) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);color:white;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-family:sans-serif;text-align:center;padding:20px;';
  overlay.innerHTML = '<h2 style="color:#ff6eb4;margin-bottom:10px;">Ops, algo deu errado!</h2><p style="margin-bottom:20px;font-size:1.1rem;">' + message + '</p><button onclick="location.reload()" style="padding:12px 24px;font-size:1rem;background:#6BCB77;border:none;border-radius:12px;color:white;cursor:pointer;font-weight:bold;box-shadow:0 4px 0 #3a9a45;">Tentar Novamente</button>';
  document.body.appendChild(overlay);
}

// ===== Boot =====
document.addEventListener('DOMContentLoaded', async () => {
  BallAssetManager.preload();
  RoadAssetManager.preload();
  MachineAssetManager.preload();

  // FIX 1.1: Bloqueio CORS por protocolo file://
  if (location.protocol === 'null:' || location.protocol === 'file:') {
    alert('⚠️ Este jogo precisa ser servido via servidor HTTP. Abra via Live Server ou http://localhost.');
    console.error('Protocolo file:// não suportado. O jogo pode apresentar falhas de carregamento.');
  }

  // FIX 4.1: Mostrar loading screen
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';

  try {
    const res = await fetch('assets/data/config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const configData = await res.json();
    LevelManager.levels = configData.levels;
  } catch(e) {
    console.warn('config.json não carregado, usando fallback:', e);
    // FIX 1.2: Fallback configuration
    LevelManager.levels = DEFAULT_CONFIG.levels;
  }

  if (loadingOverlay) loadingOverlay.style.display = 'none';

  try {
    GameEngine.init();
  } catch(e) {
    console.error('Falha crítica na inicialização:', e);
    showErrorScreen('Não foi possível inicializar o jogo.');
    return;
  }

  // FIX 1.3: Service Worker apenas para HTTP
  if ('serviceWorker' in navigator && ['http:', 'https:'].includes(location.protocol)) {
    navigator.serviceWorker.register('./assets/pwa/sw.js').catch(err => console.log('SW falhou', err));
  }
});
document.addEventListener('click', () => AudioManager.resume(), { once: true });
document.addEventListener('touchstart', () => AudioManager.resume(), { once: true });
