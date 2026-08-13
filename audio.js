/**
 * audio.js — Bites & Baits
 * Gerencia sons via Web Audio API + arquivos .wav
 */

const Audio = (() => {
  let ctx = null;
  const buffers = {};
  let ambientNode = null;
  let ambientNodes = [];
  let ambientGain = null;
  let ambientFilter = null;
  let ambientKey = null;
  let nightNodes = [];
  let nightTimers = [];
  let nightActive = false;
  let cityMusicNode = null;
  let cityMusicGain = null;

  // ── Carretel contínuo ──────────────────────────────────────────────────────
  let reelNode  = null;   // BufferSource em loop
  let reelGain  = null;   // GainNode do carretel
  let reelPitch = null;   // playbackRate atual

  const FILES = {
    splash:       'assets/sounds/splash.wav',
    bloop:        'assets/sounds/bloop.wav',
    reel:         'assets/sounds/reel.wav',
    point_normal: 'assets/sounds/point_normal.wav',
    point_special:'assets/sounds/point_special.wav',
    uhoh:               'assets/sounds/uhoh.wav',
    ambient_river_strong:'assets/sounds/ambient_river_strong.mp3',
    ambient_river_birds: 'assets/sounds/ambient_river_birds.mp3',
    ambient_lake_loop:   'assets/sounds/ambient_lake_loop.mp3',
    ambient_lake_birds:  'assets/sounds/ambient_lake_birds.mp3',
    zone_transition:     'assets/sounds/zone_transition.mp3',
    city_menu:           'assets/sounds/city_menu.mp3',
  };

  function init() {
    // Reutiliza o contexto existente se já criado (evita erro de múltiplos AudioContext)
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    // Se os buffers já foram carregados, não busca de novo
    if (Object.keys(buffers).length === Object.keys(FILES).length) {
      return Promise.resolve();
    }
    return Promise.all(
      Object.entries(FILES).map(([key, url]) =>
        fetch(url)
          .then(r => r.arrayBuffer())
          .then(buf => ctx.decodeAudioData(buf))
          .then(decoded => { buffers[key] = decoded; })
          .catch(() => { console.warn(`Som não encontrado: ${url}`); })
      )
    );
  }

  function play(name, { volume = 1, loop = false } = {}) {
    if (!ctx || !buffers[name]) {
      // Fallback sintético se o arquivo não carregou
      _synthetic(name);
      return null;
    }
    if (ctx.state === 'suspended') ctx.resume();
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer     = buffers[name];
    src.loop       = loop;
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    return { src, gain };
  }

  function stop(node) {
    if (!node) return;
    try { node.src.stop(); } catch(e) {}
  }

  // ── Sons sintéticos (fallback ou gerados) ──────────────────────────────────

  function _synthetic(name) {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    switch(name) {
      case 'chomp':      _chomp(); break;
      case 'tension':    _tensionClick(); break;
      case 'snap':       _snap(); break;
      case 'splash':     _splashSynth(); break;
    }
  }

  // Chomp — peixe mordendo (click grave + envelope curto)
  function _chomp() {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // Click de tensão crescente
  function _tensionClick() {
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = 0.3;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  // Snap — linha arrebentando
  function _snap() {
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20);
    }
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.value = 0.8;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  // Splash sintético (ruído filtrado)
  function _splashSynth() {
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8);
    }
    const src    = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();
    src.buffer      = buf;
    filter.type     = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value  = 0.5;
    gain.gain.value = 0.5;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  // ── Ambiente ───────────────────────────────────────────────────────────────

  const AMBIENT_PROFILES = {
    // De dia: natureza em primeiro plano + água discreta.
    // À noite: a água continua reconhecível, mas os sons diurnos ficam baixos
    // e entram texturas noturnas procedurais, sem voz ou sinalização sonora.
    margem_rio_doce: {
      layers: [
        { key: 'ambient_river_birds', volume: 0.18, filter: 1800 },
        { key: 'ambient_river_strong', volume: 0.055, filter: 1600 },
      ],
      nightLayers: [
        { key: 'ambient_river_birds', volume: 0.035, filter: 1100 },
        { key: 'ambient_river_strong', volume: 0.045, filter: 1200 },
      ],
      nightTexture: 'river',
    },
    rio_doce: {
      layers: [{ key: 'ambient_river_strong', volume: 0.20, filter: 2200 }],
      nightLayers: [{ key: 'ambient_river_strong', volume: 0.13, filter: 1500 }],
      nightTexture: 'river',
    },
    lago_margem: {
      layers: [{ key: 'ambient_lake_birds', volume: 0.16, filter: 1600 }],
      nightLayers: [{ key: 'ambient_lake_birds', volume: 0.035, filter: 1050 }],
      nightTexture: 'lake',
    },
    lago_central: {
      layers: [{ key: 'ambient_lake_loop', volume: 0.16, filter: 1400 }],
      nightLayers: [{ key: 'ambient_lake_loop', volume: 0.075, filter: 1050 }],
      nightTexture: 'lake',
    },
    lago_central_fundo: {
      layers: [{ key: 'ambient_lake_loop', volume: 0.09, filter: 520 }],
      nightLayers: [{ key: 'ambient_lake_loop', volume: 0.045, filter: 420 }],
      nightTexture: 'deep',
    },
    lago_central_baia_isolada: {
      layers: [{ key: 'ambient_lake_loop', volume: 0.11, filter: 800 }],
      nightLayers: [{ key: 'ambient_lake_loop', volume: 0.055, filter: 620 }],
      nightTexture: 'deep',
    },
  };

  // Textura noturna leve: ruído filtrado como fundo, grilos espaçados e,
  // nos rios, coaxos graves ocasionais. Tudo passa por um ganho baixo para
  // preservar anúncios e leitor de tela.
  function _startNightTexture(kind = 'lake') {
    _stopNightTexture();
    if (!ctx) return;
    nightActive = true;

    const master = ctx.createGain();
    const volume = kind === 'deep' ? 0.018 : kind === 'river' ? 0.028 : 0.024;
    master.gain.value = volume;
    master.connect(ctx.destination);
    nightNodes.push(master);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = kind === 'river' ? 700 : 520;
    noiseGain.gain.value = 0.22;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    nightNodes.push(noise);

    const scheduleCricket = () => {
      if (!nightActive || !ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 2200 + Math.random() * 900;
      gain.gain.setValueAtTime(0, now);
      for (let i = 0; i < 3; i++) {
        const at = now + i * 0.11;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.16, at + 0.018);
        gain.gain.linearRampToValueAtTime(0, at + 0.07);
      }
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.42);
      nightTimers.push(setTimeout(scheduleCricket, 1100 + Math.random() * 2600));
    };
    scheduleCricket();

    if (kind === 'river' || kind === 'lake') {
      const scheduleFrog = () => {
        if (!nightActive || !ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(kind === 'river' ? 150 : 125, now);
        osc.frequency.exponentialRampToValueAtTime(kind === 'river' ? 95 : 82, now + 0.28);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 0.38);
        nightTimers.push(setTimeout(scheduleFrog, 3600 + Math.random() * 5200));
      };
      nightTimers.push(setTimeout(scheduleFrog, 900 + Math.random() * 1800));
    }
  }

  function _stopNightTexture() {
    nightActive = false;
    nightTimers.forEach(timer => clearTimeout(timer));
    nightTimers = [];
    nightNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    nightNodes = [];
  }

  function startAmbient(profile = 'lago_margem') {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const cfg = typeof profile === 'string'
      ? (AMBIENT_PROFILES[profile] || AMBIENT_PROFILES.lago_margem)
      : profile;
    const night = typeof GameTime !== 'undefined' && typeof GameTime.isNight === 'function'
      && GameTime.isNight();
    const layers = (night && cfg.nightLayers ? cfg.nightLayers : cfg.layers)
      || [{ key: cfg.key, volume: cfg.volume, filter: cfg.filter }];
    const texture = night ? (cfg.nightTexture || 'lake') : 'none';
    const signature = `${night ? 'night' : 'day'}:${texture}:`
      + layers.map(layer => `${layer.key}:${layer.volume}:${layer.filter}`).join('|');
    if (ambientNodes.length && ambientKey === signature) return;

    stopAmbient();
    const created = [];
    layers.forEach(layer => {
      if (!layer.key || !buffers[layer.key]) return;
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      src.buffer = buffers[layer.key];
      src.loop = true;
      filter.type = 'lowpass';
      filter.frequency.value = layer.filter || 1400;
      gain.gain.value = layer.volume ?? 0.16;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      created.push({ src, filter, gain });
    });
    if (!created.length) return;
    ambientNodes = created;
    ambientNode = created[0].src;
    ambientFilter = created[0].filter;
    ambientGain = created[0].gain;
    ambientKey = signature;
    if (night) _startNightTexture(texture);
  }

  function stopAmbient() {
    _stopNightTexture();
    ambientNodes.forEach(layer => {
      try { layer.src.stop(); } catch(e) {}
    });
    ambientNodes = [];
    ambientNode = null;
    ambientGain = null;
    ambientFilter = null;
    ambientKey = null;
  }

  function startCityMusic() {
    if (!ctx || cityMusicNode || !buffers.city_menu) return;
    if (ctx.state === 'suspended') ctx.resume();
    cityMusicNode = ctx.createBufferSource();
    cityMusicGain = ctx.createGain();
    cityMusicNode.buffer = buffers.city_menu;
    cityMusicNode.loop = true;
    cityMusicGain.gain.value = 0.13;
    cityMusicNode.connect(cityMusicGain);
    cityMusicGain.connect(ctx.destination);
    cityMusicNode.start();
  }

  function stopCityMusic() {
    if (cityMusicNode) {
      try { cityMusicNode.stop(); } catch(e) {}
    }
    cityMusicNode = null;
    cityMusicGain = null;
  }

  function playZoneTransition() {
    return play('zone_transition', { volume: 0.28 });
  }

  // ── Carretel contínuo com pitch variável ───────────────────────────────────

  /**
   * Inicia o loop do carretel.
   * mode: 'neutral' | 'pulling' | 'releasing'
   *   neutral   → playbackRate 1.0  (tom médio, volume baixo)
   *   pulling   → playbackRate 1.4  (mais agudo — linha saindo rápido)
   *   releasing → playbackRate 0.65 (mais grave — carretel cedendo)
   */
  function startReel(mode = 'neutral') {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // Já tocando? Só muda o pitch
    if (reelNode) { setReelMode(mode); return; }

    // Se o buffer não carregou, gera um oscilador sintético como fallback
    if (!buffers['reel']) {
      console.warn('[Audio] reel.wav não carregado — usando oscilador sintético');
      _startReelSynth(mode);
      return;
    }

    reelGain            = ctx.createGain();
    reelGain.gain.value = 0.35;
    reelGain.connect(ctx.destination);

    reelNode        = ctx.createBufferSource();
    reelNode.buffer = buffers['reel'];
    reelNode.loop   = true;
    reelPitch       = reelNode.playbackRate;

    reelNode.connect(reelGain);
    reelNode.start();

    setReelMode(mode);
  }

  // Fallback sintético para o carretel (oscilador modulado)
  let _reelOsc  = null;
  let _reelOscGain = null;
  function _startReelSynth(mode) {
    if (_reelOsc) return;
    _reelOsc      = ctx.createOscillator();
    _reelOscGain  = ctx.createGain();
    _reelOsc.type = 'sawtooth';
    _reelOsc.frequency.value = 220;
    _reelOscGain.gain.value  = 0.15;

    const filter = ctx.createBiquadFilter();
    filter.type  = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;

    _reelOsc.connect(filter);
    filter.connect(_reelOscGain);
    _reelOscGain.connect(ctx.destination);
    _reelOsc.start();

    reelNode  = _reelOsc;   // aponta pra o mesmo slot pra stopReel funcionar
    reelGain  = _reelOscGain;
    reelPitch = _reelOsc.frequency; // usa frequency como "pitch" no fallback

    setReelMode(mode);
  }

  function setReelMode(mode) {
    if (!reelPitch || !ctx) return;
    const now = ctx.currentTime;

    if (buffers['reel'] && reelNode instanceof AudioBufferSourceNode) {
      // Modo WAV: modula playbackRate
      const rates = { neutral: 1.0, pulling: 1.4, releasing: 0.65 };
      const rate  = rates[mode] ?? 1.0;
      reelPitch.cancelScheduledValues(now);
      reelPitch.setValueAtTime(reelPitch.value, now);
      reelPitch.linearRampToValueAtTime(rate, now + 0.04);
    } else {
      // Modo sintético: modula frequência do oscilador
      const freqs = { neutral: 220, pulling: 340, releasing: 140 };
      const freq  = freqs[mode] ?? 220;
      reelPitch.cancelScheduledValues(now);
      reelPitch.setValueAtTime(reelPitch.value, now);
      reelPitch.linearRampToValueAtTime(freq, now + 0.04);
    }

    // Volume levemente maior ao puxar (ambos os modos)
    if (reelGain) {
      const vols = { neutral: 0.30, pulling: 0.50, releasing: 0.28 };
      reelGain.gain.cancelScheduledValues(now);
      reelGain.gain.setValueAtTime(reelGain.gain.value, now);
      reelGain.gain.linearRampToValueAtTime(vols[mode] ?? 0.30, now + 0.04);
    }
  }

  function stopReel() {
    if (!reelNode) return;
    // Fade out rápido antes de parar para evitar clique
    if (reelGain) {
      const now = ctx.currentTime;
      reelGain.gain.cancelScheduledValues(now);
      reelGain.gain.setValueAtTime(reelGain.gain.value, now);
      reelGain.gain.linearRampToValueAtTime(0, now + 0.08);
    }
    const n = reelNode;
    setTimeout(() => { try { n.stop(); } catch(e) {} }, 100);
    reelNode     = null;
    reelGain     = null;
    reelPitch    = null;
    _reelOsc     = null;
    _reelOscGain = null;
  }

  // ── Beep de aproximação (pitch crescente) ─────────────────────────────────
  // Chamado quando o peixe se aproxima da isca
  function fishApproach() {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.0,  ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // ── Beep de afastamento (pitch descendente) ────────────────────────────────
  // Chamado quando o peixe perde interesse e se afasta
  function fishRetreat() {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.0,  ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // ── Alerta de tensão alta (tom agudo curto) ────────────────────────────────
  function tensionAlert() {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.0,  ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.0,  ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // ── Resistência do peixe (pulso grave sintético) ───────────────────────────
  // Chamado quando o peixe puxa forte de volta
  function fishResist() {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  // ── Vibração do dispositivo ────────────────────────────────────────────────
  function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  // ── Escape durante o REELING (peixe soltou e foi embora) ─────────────────
  // Dois elementos simultâneos:
  //  1. Linha assobiando — tensão se dissolvendo (sine descendente rápido)
  //  2. Splash de fuga   — ruído filtrado curto simulando mergulho
  function fishEscaped() {
    if (!ctx) return;
    const _play = () => {
      const now = ctx.currentTime;
      // 1. Linha assobiando (pitch caindo)
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.45);
      gain.gain.setValueAtTime(0.0,  now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.linearRampToValueAtTime(0.0,  now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
      // 2. Splash de fuga (ruído curto, filtro bandpass grave)
      const bufLen = Math.floor(ctx.sampleRate * 0.35);
      const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 14);
      }
      const noise  = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const nGain  = ctx.createGain();
      noise.buffer           = buf;
      filter.type            = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value         = 0.7;
      nGain.gain.value       = 0.55;
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now + 0.05);
    };
    if (ctx.state === 'suspended') { ctx.resume().then(_play); } else { _play(); }
  }

  // ── Peixe cansado (dois pulsos graves descendentes) ───────────────────────
  function fishTiredSound() {
    if (!ctx) return;
    const _play = () => {
      const now = ctx.currentTime;
      [0, 0.2].forEach(offset => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now + offset);
        osc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.25);
        gain.gain.setValueAtTime(0.0,  now + offset);
        gain.gain.linearRampToValueAtTime(0.42, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.32);
      });
    };
    if (ctx.state === 'suspended') { ctx.resume().then(_play); } else { _play(); }
  }

  // ── Peixe recuperou o fôlego (dois pulsos agudos ascendentes) ────────────
  function fishRecoveredSound() {
    if (!ctx) return;
    const _play = () => {
      const now = ctx.currentTime;
      [0, 0.22].forEach(offset => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now + offset);
        osc.frequency.exponentialRampToValueAtTime(440, now + offset + 0.22);
        gain.gain.setValueAtTime(0.0,  now + offset);
        gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.3);
      });
    };
    if (ctx.state === 'suspended') { ctx.resume().then(_play); } else { _play(); }
  }

  // Chomp é sempre sintético (não tem no pack)
  function chomp() { _chomp(); }
  function snap()  { _snap(); }

  return { init, play, stop, startAmbient, stopAmbient, startCityMusic, stopCityMusic,
           playZoneTransition, vibrate, chomp, snap,
           startReel, setReelMode, stopReel, fishResist,
           fishApproach, fishRetreat, tensionAlert,
           fishEscaped, fishTiredSound, fishRecoveredSound };
})();
