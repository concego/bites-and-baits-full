/**
 * i18n.js — Bites & Baits
 * Strings de interface e voz organizadas por idioma.
 * Uso: I18n.t('chave') → string no idioma ativo
 */

const I18n = (() => {

  // ── Strings por idioma ───────────────────────────────────────────────────
  const STRINGS = {

    pt: {
      // Tela de seleção de idioma
      lang_title:       'Escolha o idioma',
      lang_subtitle:    'Choose your language',

      // Menu
      subtitle:         'Um jogo de pesca pelo acelerômetro',
      btn_start:        'Começar a pescar',
      btn_instructions: 'Como jogar',
      hint:             'Segure o celular na vertical para jogar',
      credits_by:       'Por',
      credits_brand:    'Eu Concego Jogar',

      // Tela de instruções
      how_to_play:      'Como jogar',
      instr_sensor_title:  '📱 Celular com acelerômetro',
      instr_cast:       'Lançar',
      instr_cast_desc:  'incline o celular para frente',
      instr_reel:       'Puxar',
      instr_reel_desc:  'incline o celular para trás',
      instr_hook:       'Fisgar',
      instr_hook_desc:  'sacuda o celular quando ouvir o aviso',
      instr_kb_title:   '⌨️ PC / teclado',
      instr_kb_cast:    'Lançar',
      instr_kb_cast_desc: 'seta para cima ↑',
      instr_kb_reel:    'Puxar',
      instr_kb_reel_desc: 'seta para baixo ↓',
      instr_kb_hook:    'Fisgar',
      instr_kb_hook_desc: 'barra de espaço',
      instr_a11y_title: 'Acessibilidade',
      instr_a11y_1:     'Compatível com TalkBack ativado',
      instr_a11y_2:     'Todos os avisos são lidos em tempo real',
      instr_a11y_3:     'Haptic feedback (vibração) nos eventos principais',
      btn_back:         'Voltar ao menu',

      // HUD do jogo
      hud_fish:         'Peixes',
      hud_best:         'Melhor',
      tension_label:    'Tensão da linha',

      // Tela de resultado
      result_caught:    'Peixe capturado!',
      result_caught_desc:    fish => `Você pescou um(a) ${fish}.`,
      result_caught_weight:  (fish, kg, coins, total) => `${fish} • ${kg} kg • +${coins} moedas (total: ${total} 🪙)`,
      result_snapped:   'A linha arrebentou!',
      result_snapped_desc: 'O peixe era forte demais desta vez.',
      stat_today:       'Peixes hoje',
      stat_best:        'Melhor sessão',
      stat_unit:        'peixes',
      btn_again:        'Pescar de novo',
      btn_menu:         'Menu',

      // Estados — label visual
      state_idle:       '🎣 Pronto para lançar',
      state_casting:    '🌊 Lançando...',
      state_waiting:    '🌊 Aguardando...',
      state_biting:     fish => `⚡ ${fish} na isca! Dê um shake!`,
      state_reeling:    fish => `🎣 Puxando ${fish}...`,
      state_caught:     fish => `🏆 ${fish} capturado!`,
      state_snapped:    '💥 A linha arrebentou!',
      state_escaped:    '😔 O peixe fugiu...',
      state_tired:      fish => `😮‍💨 ${fish} está cansando — puxe!`,
      state_pulled_out: 'Isca fora da água — incline para frente',

      // Dicas de inclinação
      tilt_idle:        'Incline para lançar',
      tilt_casting:     'Lançando a isca...',
      tilt_waiting:     'Segure o celular neutro',
      tilt_biting:      'Sacuda o celular para fisgar!',
      tilt_reeling:     'Incline para trás para puxar!',

      // Voz (aria-live / TTS)
      speak_ready:      'Pronto. Incline para frente.',
      speak_waiting:    'Isca na água. Aguarde.',
      speak_fish:       'Peixe! Sacuda!',
      speak_hooked:     'Fisgou! Incline para trás!',
      speak_rehooked:   'Fisgou!',
      speak_escaped:    'Fugiu.',
      speak_pulled_out: 'Relance. Incline para frente.',
      speak_tired:      'Cansado! Puxe!',
      speak_snapped:    'Linha arrebentou!',
      speak_caught:     (fish, size, score) => `${fish}! ${size}. ${score} peixes.`,
      speak_caught_special: (fish, score) => `${fish}! Especial! ${score} peixes.`,
      speak_danger:     'Perigo! Solte!',
      speak_tension:    'Tensão alta!',
      speak_no_sensor:  'Permissão de sensores negada. Usando teclado para teste.',

      // Tamanhos (para voz)
      size_tiny:   'pequeno',
      size_small:  'médio',
      size_medium: 'grande',
      size_large:  'enorme',

      // Nomes dos peixes
      fish_lambari:  'Lambari',
      fish_tilapia:  'Tilápia',
      fish_truta:    'Truta',
      fish_dourado:  'Dourado',
      fish_pirarucu: 'Pirarucu',
    },

    en: {
      // Language selection screen
      lang_title:       'Choose your language',
      lang_subtitle:    'Escolha o idioma',

      // Menu
      subtitle:         'A fishing game using the accelerometer',
      btn_start:        'Start fishing',
      btn_instructions: 'How to play',
      hint:             'Hold your phone upright to play',
      credits_by:       'By',
      credits_brand:    'Eu Concego Jogar',

      // Instructions screen
      how_to_play:      'How to play',
      instr_sensor_title:  '📱 Phone with accelerometer',
      instr_cast:       'Cast',
      instr_cast_desc:  'tilt the phone forward',
      instr_reel:       'Reel in',
      instr_reel_desc:  'tilt the phone backward',
      instr_hook:       'Hook',
      instr_hook_desc:  'shake the phone when you hear the alert',
      instr_kb_title:   '⌨️ PC / keyboard',
      instr_kb_cast:    'Cast',
      instr_kb_cast_desc: 'arrow up ↑',
      instr_kb_reel:    'Reel in',
      instr_kb_reel_desc: 'arrow down ↓',
      instr_kb_hook:    'Hook',
      instr_kb_hook_desc: 'spacebar',
      instr_a11y_title: 'Accessibility',
      instr_a11y_1:     'Compatible with TalkBack enabled',
      instr_a11y_2:     'All alerts are read in real time',
      instr_a11y_3:     'Haptic feedback on key events',
      btn_back:         'Back to menu',

      // Game HUD
      hud_fish:         'Fish',
      hud_best:         'Best',
      tension_label:    'Line tension',

      // Result screen
      result_caught:    'Fish caught!',
      result_caught_desc:    fish => `You caught a ${fish}!`,
      result_caught_weight:  (fish, kg, coins, total) => `${fish} • ${kg} kg • +${coins} coins (total: ${total} 🪙)`,
      result_snapped:   'The line snapped!',
      result_snapped_desc: 'That fish was too strong this time.',
      stat_today:       'Fish today',
      stat_best:        'Best session',
      stat_unit:        'fish',
      btn_again:        'Fish again',
      btn_menu:         'Menu',

      // State labels
      state_idle:       '🎣 Ready to cast',
      state_casting:    '🌊 Casting...',
      state_waiting:    '🌊 Waiting...',
      state_biting:     fish => `⚡ ${fish} on the hook! Shake!`,
      state_reeling:    fish => `🎣 Reeling in ${fish}...`,
      state_caught:     fish => `🏆 ${fish} caught!`,
      state_snapped:    '💥 The line snapped!',
      state_escaped:    '😔 The fish got away...',
      state_tired:      fish => `😮‍💨 ${fish} is tiring — reel in!`,
      state_pulled_out: 'Lure out of water — tilt forward',

      // Tilt hints
      tilt_idle:        'Tilt to cast',
      tilt_casting:     'Casting lure...',
      tilt_waiting:     'Hold phone steady',
      tilt_biting:      'Shake to hook the fish!',
      tilt_reeling:     'Tilt back to reel in!',

      // Voice
      speak_ready:      'Ready. Tilt forward.',
      speak_waiting:    'Lure in water. Wait.',
      speak_fish:       'Fish! Shake!',
      speak_hooked:     'Hooked! Tilt back!',
      speak_rehooked:   'Hooked!',
      speak_escaped:    'Got away.',
      speak_pulled_out: 'Recast. Tilt forward.',
      speak_tired:      'Tired! Reel in!',
      speak_snapped:    'Line snapped!',
      speak_caught:     (fish, size, score) => `${fish}! ${size}. ${score} fish.`,
      speak_caught_special: (fish, score) => `${fish}! Special! ${score} fish.`,
      speak_danger:     'Danger! Release!',
      speak_tension:    'High tension!',
      speak_no_sensor:  'Sensor permission denied. Using keyboard fallback.',

      // Size descriptions
      size_tiny:   'small',
      size_small:  'medium',
      size_medium: 'large',
      size_large:  'enormous',

      // Fish names
      fish_lambari:  'Lambari',
      fish_tilapia:  'Tilapia',
      fish_truta:    'Trout',
      fish_dourado:  'Dourado',
      fish_pirarucu: 'Pirarucu',
    },
  };

  // ── Estado interno ───────────────────────────────────────────────────────
  let _lang = localStorage.getItem('bb_lang') || null;

  // ── API pública ──────────────────────────────────────────────────────────
  function setLang(code) {
    _lang = code;
    localStorage.setItem('bb_lang', code);
    document.documentElement.lang = code === 'pt' ? 'pt-BR' : 'en';
  }

  function getLang() { return _lang; }

  function t(key, ...args) {
    const dict = STRINGS[_lang] || STRINGS['pt'];
    const val  = dict[key];
    if (typeof val === 'function') return val(...args);
    return val ?? key;
  }

  return { setLang, getLang, t };
})();
