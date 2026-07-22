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
      btn_start:        'Pescar',
      btn_free:         'Pesca Livre',
      btn_free_desc:    'Com pontuação',
      btn_instructions: 'Como jogar',
      hint:             'Segure o celular na vertical para jogar',
      credits_by:       'Por',
      credits_brand:    'Eu Concego Jogar',

      // Tela de opções
      btn_options:           'Opções',
      options_title:         'Opções',
      options_lang_title:    'Idioma',
      options_a11y_title:    'Acessibilidade',
      options_sound:         'Efeitos sonoros',
      options_sound_desc:    'Ativa ou desativa todos os sons do jogo',
      options_haptic:        'Vibração (háptica)',
      options_haptic_desc:   'Ativa ou desativa o feedback de vibração',
      options_contrast:      'Alto contraste',
      options_contrast_desc: 'Aumenta o contraste das cores da interface',
      options_large_text:    'Texto grande',
      options_large_text_desc: 'Aumenta o tamanho dos textos do jogo',
      options_slow_game:     'Jogo lento',
      options_slow_game_desc:'Dá mais tempo para reagir (timers 60% mais longos)',
      options_verbose:       'Narração detalhada',
      options_verbose_desc:  'Anuncia mais informações de estado pelo leitor de tela',
      toggle_on:             'Ativado',
      toggle_off:            'Desativado',

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
      game_title:       'Jogo em andamento',
      hud_fish:         'Peixes',
      hud_best:         'Melhor',
      hud_bait:         'Isca',
      tension_label:    'Tensão da linha',

      // Painel de equipamento
      equip_title:      'Equipamento',
      equip_bait_title: 'Isca',
      equip_no_bait:    'Sem isca no estoque',
      equip_qty:        qty => `×${qty}`,
      equip_select:     'Usar',
      equip_selected:   'Equipada',
      equip_close:      'Fechar',
      equip_consume_ok: (bait, qty) => `${bait} equipada. Restam ${qty}.`,
      equip_no_stock:   'Isca esgotada!',

      // Iscas
      bait_worm:      'Minhoca',
      bait_cricket:   'Grilo',
      bait_fly:       'Mosca Artificial',
      bait_spoon:     'Colher',
      bait_live_bait: 'Isca Viva',
      bait_shrimp:    'Camarão',
      bait_jig:       'Jig',

      // Tela de resultado
      result_caught:    'Peixe capturado!',
      result_caught_desc:    fish => `Você pescou um(a) ${fish}.`,
      result_caught_weight:  (fish, kg, coins, total) => `${fish} • ${kg} kg • +${coins} moedas (total: ${total} 🪙)`,
      result_snapped:   'A linha arrebentou!',
      result_snapped_desc: 'O peixe era forte demais desta vez.',
      result_session_title: 'Sessão encerrada!',
      result_session_desc:  (n, coins) => `Você pescou ${n} peixe${n !== 1 ? 's' : ''} e acumulou ${coins} 🪙 moedas.`,
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
      bait_wrong_fish_left: 'O peixe não se interessou pela isca e foi embora.',
      bait_no_stock:    'Sem isca! Acesse Equipamento para trocar.',
      state_escaped:    '😔 O peixe fugiu...',
      state_tired:      fish => `😮‍💨 ${fish} está cansando — puxe!`,
      state_pulled_out: 'Isca fora da água — incline para frente',

      // Dicas de inclinação
      tilt_idle:        'Incline para lançar',
      tilt_casting:     'Lançando a isca...',
      tilt_waiting:     'Segure o celular neutro',
      tilt_biting:      'Sacuda o celular para fisgar!',
      tilt_reeling:     'Incline para trás para puxar!',

      // Voz curta (padrão)
      speak_ready:      'Pronto. Incline para frente.',
      speak_waiting:    'Isca na água. Aguarde.',
      speak_fish:       'Peixe! Sacuda!',
      speak_hooked:     'Fisgou! Incline para trás!',
      speak_rehooked:   'Fisgou!',
      speak_escaped:    'Fugiu.',
      speak_pulled_out: 'Relance. Incline para frente.',
      speak_tired:      'Cansado! Puxe!',
      speak_snapped:    'Linha arrebentou!',
      speak_caught:              (fish, size, score) => `${fish}! ${size}. ${score} peixes.`,
      speak_caught_special:      (fish, score) => `${fish}! Especial! ${score} peixes.`,
      speak_caught_noscore:      (fish, size) => `${fish}! ${size}.`,
      speak_caught_special_noscore: fish => `${fish}! Especial!`,
      speak_danger:     'Perigo! Solte!',
      speak_tension:    'Tensão alta!',
      speak_no_sensor:  'Permissão de sensores negada. Usando teclado para teste.',

      // Voz detalhada (narração ativada)
      vspeak_ready:      'Você está na beira da água com a vara preparada. Incline o celular para frente para lançar a isca.',
      vspeak_waiting:    'A isca está na água. Aguarde um peixe se aproximar sem mover o celular.',
      vspeak_fish:       'Um peixe está mordendo a isca! Sacuda o celular para fisgar agora!',
      vspeak_hooked:     'Você fisgou! Incline o celular para trás devagar para puxar o peixe sem arrebentar a linha.',
      vspeak_rehooked:   'Você fisgou novamente! Continue inclinando para trás.',
      vspeak_escaped:    'O peixe escapou antes de você fisgar. Tente novamente.',
      vspeak_pulled_out: 'A isca saiu da água. Incline para frente para relançar.',
      vspeak_tired:      'O peixe está cansando — agora é a hora de puxar com força! Incline para trás!',
      vspeak_snapped:    'A linha não aguentou a tensão e arrebentou. O peixe fugiu.',
      vspeak_caught:                (fish, size, score) => `Você capturou um ${fish} ${size}! Pontuação atual: ${score} peixes.`,
      vspeak_caught_special:        (fish, score) => `Incrível! Você capturou um ${fish} especial! Pontuação atual: ${score} peixes.`,
      vspeak_caught_noscore:        (fish, size) => `Você capturou um ${fish} ${size}!`,
      vspeak_caught_special_noscore: fish => `Incrível! Você capturou um ${fish} especial!`,
      vspeak_danger:     'Tensão crítica! Solte um pouco a linha para evitar que ela arrebente.',
      vspeak_tension:    'A tensão da linha está alta. Cuidado para não puxar demais.',

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
      btn_start:        'Fish',
      btn_free:         'Free Fishing',
      btn_free_desc:    'With scoring',
      btn_instructions: 'How to play',
      hint:             'Hold your phone upright to play',
      credits_by:       'By',
      credits_brand:    'Eu Concego Jogar',

      // Options screen
      btn_options:           'Options',
      options_title:         'Options',
      options_lang_title:    'Language',
      options_a11y_title:    'Accessibility',
      options_sound:         'Sound effects',
      options_sound_desc:    'Enable or disable all game sounds',
      options_haptic:        'Vibration (haptic)',
      options_haptic_desc:   'Enable or disable vibration feedback',
      options_contrast:      'High contrast',
      options_contrast_desc: 'Increase interface color contrast',
      options_large_text:    'Large text',
      options_large_text_desc: 'Increase game text size',
      options_slow_game:     'Slow game',
      options_slow_game_desc:'Gives more reaction time (timers 60% longer)',
      options_verbose:       'Verbose narration',
      options_verbose_desc:  'Announces more state info via screen reader',
      toggle_on:             'On',
      toggle_off:            'Off',

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
      game_title:       'Game in progress',
      hud_fish:         'Fish',
      hud_best:         'Best',
      hud_bait:         'Bait',
      tension_label:    'Line tension',

      // Equipment panel
      equip_title:      'Equipment',
      equip_bait_title: 'Bait',
      equip_no_bait:    'No bait in stock',
      equip_qty:        qty => `×${qty}`,
      equip_select:     'Use',
      equip_selected:   'Equipped',
      equip_close:      'Close',
      equip_consume_ok: (bait, qty) => `${bait} equipped. ${qty} remaining.`,
      equip_no_stock:   'Bait out of stock!',

      // Baits
      bait_worm:      'Earthworm',
      bait_cricket:   'Cricket',
      bait_fly:       'Artificial Fly',
      bait_spoon:     'Spoon',
      bait_live_bait: 'Live Bait',
      bait_shrimp:    'Shrimp',
      bait_jig:       'Jig',

      // Result screen
      result_caught:    'Fish caught!',
      result_caught_desc:    fish => `You caught a ${fish}!`,
      result_caught_weight:  (fish, kg, coins, total) => `${fish} • ${kg} kg • +${coins} coins (total: ${total} 🪙)`,
      result_snapped:   'The line snapped!',
      result_snapped_desc: 'That fish was too strong this time.',
      result_session_title: 'Session over!',
      result_session_desc:  (n, coins) => `You caught ${n} fish${n !== 1 ? '' : ''} and earned ${coins} 🪙 coins.`,
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
      bait_wrong_fish_left: 'The fish lost interest and swam away.',
      bait_no_stock:    'No bait! Open Equipment to change.',

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
      speak_caught:              (fish, size, score) => `${fish}! ${size}. ${score} fish.`,
      speak_caught_special:      (fish, score) => `${fish}! Special! ${score} fish.`,
      speak_caught_noscore:      (fish, size) => `${fish}! ${size}.`,
      speak_caught_special_noscore: fish => `${fish}! Special!`,
      speak_danger:     'Danger! Release!',
      speak_tension:    'High tension!',
      speak_no_sensor:  'Sensor permission denied. Using keyboard fallback.',

      // Verbose voice (narration on)
      vspeak_ready:      'You are at the water\'s edge with your rod ready. Tilt your phone forward to cast the lure.',
      vspeak_waiting:    'The lure is in the water. Wait for a fish to approach without moving your phone.',
      vspeak_fish:       'A fish is biting the lure! Shake your phone to hook it now!',
      vspeak_hooked:     'You\'ve hooked it! Tilt the phone back slowly to reel in the fish without snapping the line.',
      vspeak_rehooked:   'Hooked again! Keep tilting back.',
      vspeak_escaped:    'The fish escaped before you could hook it. Try again.',
      vspeak_pulled_out: 'The lure is out of the water. Tilt forward to recast.',
      vspeak_tired:      'The fish is tiring — now is the time to reel in hard! Tilt back!',
      vspeak_snapped:    'The line couldn\'t hold the tension and snapped. The fish got away.',
      vspeak_caught:                (fish, size, score) => `You caught a ${size} ${fish}! Current score: ${score} fish.`,
      vspeak_caught_special:        (fish, score) => `Amazing! You caught a special ${fish}! Current score: ${score} fish.`,
      vspeak_caught_noscore:        (fish, size) => `You caught a ${size} ${fish}!`,
      vspeak_caught_special_noscore: fish => `Amazing! You caught a special ${fish}!`,
      vspeak_danger:     'Critical tension! Ease up on the line to avoid snapping it.',
      vspeak_tension:    'The line tension is high. Be careful not to pull too hard.',

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
