/** character-visual-view.js — visual presentation for character customization. */
const CharacterVisualView = (() => {
  function readAppearance({ categories, getElement }) {
    const appearance = {};
    categories.forEach(category => {
      const select = getElement(`character-visual-${category.key}`);
      appearance[category.key] = select ? select.value : '';
    });
    return appearance;
  }

  function renderAvatar({ target, character, appearanceOverride }) {
    if (!target || typeof CharacterAvatar === 'undefined') return;
    const rendered = appearanceOverride ? { ...character, appearance: appearanceOverride } : character;
    CharacterAvatar.render(target, rendered);
  }

  const OUTFIT_DESCRIPTION_FALLBACKS = {
    arrivalOutfit: [
      _visualTriple('Camiseta clara, calça simples e cores leves.', 'Light shirt, simple trousers and soft colors.', 'Világos felső, egyszerű nadrág és lágy színek.'),
      _visualTriple('Camiseta escura, calça simples e contraste moderado.', 'Dark shirt, simple trousers and moderate contrast.', 'Sötét felső, egyszerű nadrág és mérsékelt kontraszt.'),
      _visualTriple('Blusa solta, calça confortável e tons suaves.', 'Loose top, comfortable trousers and soft tones.', 'Laza felső, kényelmes nadrág és lágy árnyalatok.'),
      _visualTriple('Camisa ou jaqueta leve e combinação contrastante.', 'Light shirt or jacket with a contrasting combination.', 'Könnyű ing vagy dzseki kontrasztos összeállításban.'),
      _visualTriple('Roupa simples e resistente, adequada para carregar malas.', 'Simple, sturdy clothes suitable for carrying luggage.', 'Egyszerű, strapabíró öltözet, amely alkalmas csomagok cipelésére.'),
    ],
    fishingOutfit: [
      _visualTriple('Camisa leve, calça resistente e colete simples.', 'Light shirt, sturdy trousers and a simple vest.', 'Könnyű felső, strapabíró nadrág és egyszerű mellény.'),
      _visualTriple('Tons azuis e terrosos com proteção leve.', 'Blue and earth tones with light protection.', 'Kékes és földszínek könnyű védelemmel.'),
      _visualTriple('Tons verdes e proteção visual contra o sol.', 'Green tones with visual protection from the sun.', 'Zöld árnyalatok nap elleni vizuális védelemmel.'),
      _visualTriple('Capa leve e peças visualmente impermeáveis.', 'Light rain cape and visibly waterproof pieces.', 'Könnyű esőköpeny és láthatóan vízálló darabok.'),
      _visualTriple('Colete reforçado, calça resistente e luvas visuais.', 'Reinforced vest, sturdy trousers and visual gloves.', 'Megerősített mellény, strapabíró nadrág és látható kesztyű.'),
    ],
  };

  function _visualTriple(pt, en, hu) { return { pt, en, hu }; }

  function characterVisualOptionDescription(option, categoryKey, lang) {
    if (option?.description) return characterVisualLabel(option.description, lang);
    const match = String(option?.value || '').match(/-(\d+)$/);
    const index = match ? Number(match[1]) - 1 : -1;
    const fallback = OUTFIT_DESCRIPTION_FALLBACKS[categoryKey]?.[index];
    return fallback ? characterVisualLabel(fallback, lang) : '';
  }

  function characterVisualOptionText(option, lang, categoryKey) {
    const label = characterVisualLabel(option, lang);
    const description = characterVisualOptionDescription(option, categoryKey, lang);
    return description ? `${label} — ${description}` : label;
  }

  function updateOptionDescription({ select, description, category, lang }) {
    if (!description) return;
    const option = category.options.find(item => item.value === select.value);
    const text = option ? characterVisualOptionDescription(option, category.key, lang) : '';
    description.textContent = text;
    description.hidden = !text;
  }

  function updateOutfitDetails({ target, categories, appearance, lang, translate }) {
    if (!target) return;
    target.innerHTML = '';
    ['arrivalOutfit', 'fishingOutfit'].forEach(categoryKey => {
      const category = categories.find(item => item.key === categoryKey);
      if (!category) return;
      const option = category.options.find(item => item.value === appearance[categoryKey]);
      if (!option) return;
      const block = document.createElement('article');
      block.className = 'character-outfit-detail';
      const title = document.createElement('h4');
      title.textContent = `${characterVisualLabel(category, lang)}: ${characterVisualLabel(option, lang)}`;
      const description = document.createElement('p');
      description.textContent = characterVisualOptionDescription(option, categoryKey, lang)
        || translate('character_outfit_not_selected');
      block.appendChild(title);
      block.appendChild(description);
      target.appendChild(block);
    });
    if (!target.children.length) {
      const empty = document.createElement('p');
      empty.textContent = translate('character_outfit_not_selected');
      target.appendChild(empty);
    }
  }

  function updateSummary({ summary, categories, appearance, lang, translate }) {
    if (!summary) return;
    const parts = categories.map(category => {
      const option = category.options.find(item => item.value === appearance[category.key]);
      if (!option) return `${characterVisualLabel(category, lang)}: ${translate('character_visual_placeholder')}`;
      return `${characterVisualLabel(category, lang)}: ${characterVisualOptionText(option, lang, category.key)}`;
    });
    summary.textContent = parts.join('. ') + '.';
  }

  function open({ fields, summary, outfitDetails, preview, character, categories, lang, translate, getElement }) {
    if (!fields) return;
    const appearance = character.appearance || {};
    fields.innerHTML = '';
    categories.forEach(category => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'character-visual-field';
      const legend = document.createElement('legend');
      legend.textContent = characterVisualLabel(category, lang);
      fieldset.appendChild(legend);
      const select = document.createElement('select');
      select.id = `character-visual-${category.key}`;
      select.name = category.key;
      select.required = true;
      select.setAttribute('aria-label', characterVisualLabel(category, lang));
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = translate('character_visual_placeholder');
      select.appendChild(placeholder);
      category.options.forEach(option => {
        const item = document.createElement('option');
        item.value = option.value;
        item.textContent = characterVisualOptionText(option, lang, category.key);
        select.appendChild(item);
      });
      select.value = appearance[category.key] || '';
      const description = document.createElement('p');
      description.className = 'character-visual-option-description';
      description.id = `character-visual-${category.key}-description`;
      description.hidden = true;
      if (category.options.some(option => characterVisualOptionDescription(option, category.key, lang))) {
        select.setAttribute('aria-describedby', description.id);
      }
      updateOptionDescription({ select, description, category, lang });
      select.addEventListener('change', () => {
        select.removeAttribute('aria-invalid');
        updateOptionDescription({ select, description, category, lang });
        const selected = readAppearance({ categories, getElement });
        updateOutfitDetails({ target: outfitDetails, categories, appearance: selected, lang, translate });
        updateSummary({ summary, categories, appearance: selected, lang, translate });
        renderAvatar({ target: preview, character, appearanceOverride: selected });
      });
      fieldset.appendChild(select);
      if (category.options.some(option => characterVisualOptionDescription(option, category.key, lang))) fieldset.appendChild(description);
      fields.appendChild(fieldset);
    });
    const selected = readAppearance({ categories, getElement });
    updateOutfitDetails({ target: outfitDetails, categories, appearance: selected, lang, translate });
    updateSummary({ summary, categories, appearance: selected, lang, translate });
    renderAvatar({ target: preview, character, appearanceOverride: selected });
  }

  return { readAppearance, renderAvatar, updateSummary, updateOutfitDetails, open };
})();
