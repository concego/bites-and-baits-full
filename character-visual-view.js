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
    CharacterAvatar.render(target, rendered, { isPlayer: true });
  }

  function localizedValue(value, lang) {
    if (typeof value === 'string') return value;
    return value?.[lang] || value?.pt || '';
  }

  function starterSetItems(categoryKey, option) {
    if (typeof CLOTHING_STARTER_SETS === 'undefined' || typeof getClothingItem !== 'function') return [];
    const mode = categoryKey === 'arrivalOutfit' ? 'arrival'
      : categoryKey === 'fishingOutfit' ? 'fishing' : '';
    const setNumber = Number(String(option?.value || '').split('-').pop());
    const set = mode && setNumber ? CLOTHING_STARTER_SETS[mode]?.[setNumber] : null;
    return set ? Object.values(set).map(getClothingItem).filter(Boolean) : [];
  }

  function clothingPieceDescription(item, lang) {
    const name = localizedValue(item?.name, lang);
    const color = localizedValue(item?.colorName, lang);
    const colorLabel = ({ pt: 'cor', en: 'color', hu: 'szín' })[lang] || 'cor';
    return color ? `${name} — ${colorLabel}: ${color}` : name;
  }

  function describeStarterSet(option, categoryKey, lang) {
    return starterSetItems(categoryKey, option)
      .map(item => clothingPieceDescription(item, lang))
      .filter(Boolean)
      .join('; ');
  }

  function characterVisualOptionDescription(option, categoryKey, lang, options, translate) {
    const clothingDetails = describeStarterSet(option, categoryKey, lang);
    if (clothingDetails) return clothingDetails;
    if (option?.description) return characterVisualLabel(option.description, lang);
    const index = Array.isArray(options) ? options.indexOf(option) : -1;
    const prefix = categoryKey === 'arrivalOutfit' ? 'outfit_arrival'
      : categoryKey === 'fishingOutfit' ? 'outfit_fishing' : '';
    if (prefix && index >= 0 && typeof translate === 'function') {
      const key = `${prefix}_${String(index + 1).padStart(2, '0')}_desc`;
      const translated = translate(key);
      if (translated && translated !== key) return translated;
    }
    return '';
  }

  function characterVisualOptionText(option, lang, categoryKey, options, translate) {
    const label = characterVisualLabel(option, lang);
    const description = characterVisualOptionDescription(option, categoryKey, lang, options, translate);
    return description ? `${label} — ${description}` : label;
  }

  function updateOptionDescription({ select, description, category, lang }) {
    if (!description) return;
    const option = category.options.find(item => item.value === select.value);
    const text = option
      ? characterVisualOptionDescription(option, category.key, lang, category.options)
      : '';
    description.textContent = text;
    description.hidden = !text;
  }

  function appendPieceList(target, items, lang) {
    const list = document.createElement('ul');
    list.className = 'character-outfit-piece-list';
    items.forEach(item => {
      const entry = document.createElement('li');
      entry.textContent = clothingPieceDescription(item, lang);
      list.appendChild(entry);
    });
    target.appendChild(list);
  }

  function updateOutfitDetails({ target, categories, appearance, lang, translate }) {
    if (!target) return;
    target.innerHTML = '';
    ['arrivalOutfit', 'fishingOutfit'].forEach(categoryKey => {
      const category = categories.find(item => item.key === categoryKey);
      if (!category) return;
      const option = category.options.find(item => item.value === appearance[categoryKey]);
      const block = document.createElement('article');
      block.className = 'character-outfit-detail';
      const title = document.createElement('h4');
      title.textContent = option
        ? `${characterVisualLabel(category, lang)}: ${characterVisualLabel(option, lang)}`
        : `${characterVisualLabel(category, lang)}: ${translate('character_visual_placeholder')}`;
      block.appendChild(title);

      const items = starterSetItems(categoryKey, option);
      if (items.length) {
        appendPieceList(block, items, lang);
      } else {
        const description = document.createElement('p');
        description.textContent = option
          ? characterVisualOptionDescription(option, categoryKey, lang, category.options, translate)
          : translate('character_outfit_not_selected');
        block.appendChild(description);
      }
      target.appendChild(block);
    });
  }

  function updateOutfitCatalog({ categories, lang, translate }) {
    [
      ['arrivalOutfit', 'character-arrival-outfit-catalog'],
      ['fishingOutfit', 'character-fishing-outfit-catalog'],
    ].forEach(([categoryKey, listId]) => {
      const list = document.getElementById(listId);
      const category = categories.find(item => item.key === categoryKey);
      if (!list || !category) return;
      list.innerHTML = '';
      category.options.forEach(option => {
        const entry = document.createElement('li');
        const name = document.createElement('strong');
        name.textContent = characterVisualLabel(option, lang);
        entry.appendChild(name);
        const items = starterSetItems(categoryKey, option);
        if (items.length) {
          appendPieceList(entry, items, lang);
        } else {
          const description = document.createElement('span');
          description.textContent = characterVisualOptionDescription(
            option, categoryKey, lang, category.options, translate
          );
          entry.appendChild(description);
        }
        list.appendChild(entry);
      });
    });
  }

  function updateSummary({ summary, categories, appearance, lang, translate }) {
    if (!summary) return;
    const parts = categories.map(category => {
      const option = category.options.find(item => item.value === appearance[category.key]);
      if (!option) return `${characterVisualLabel(category, lang)}: ${translate('character_visual_placeholder')}`;
      const isOutfit = ['arrivalOutfit', 'fishingOutfit'].includes(category.key);
      const optionText = isOutfit
        ? characterVisualLabel(option, lang)
        : characterVisualOptionText(option, lang, category.key, category.options, translate);
      return `${characterVisualLabel(category, lang)}: ${optionText}`;
    });
    summary.textContent = parts.join('. ') + '.';
  }

  function open({ fields, summary, outfitDetails, preview, character, categories, lang, translate, getElement }) {
    if (!fields) return;
    const appearance = character.appearance || {};
    fields.innerHTML = '';
    updateOutfitCatalog({ categories, lang, translate });

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
        item.textContent = characterVisualOptionText(option, lang, category.key, category.options, translate);
        select.appendChild(item);
      });
      select.value = appearance[category.key] || '';
      const description = document.createElement('p');
      description.className = 'character-visual-option-description';
      description.id = `character-visual-${category.key}-description`;
      description.hidden = true;
      const isOutfit = ['arrivalOutfit', 'fishingOutfit'].includes(category.key);
      const hasDescription = category.options.some(option =>
        characterVisualOptionDescription(option, category.key, lang, category.options, translate)
      );
      if (hasDescription && !isOutfit) select.setAttribute('aria-describedby', description.id);
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
      if (hasDescription && !isOutfit) fieldset.appendChild(description);
      fields.appendChild(fieldset);
    });
    const selected = readAppearance({ categories, getElement });
    updateOutfitDetails({ target: outfitDetails, categories, appearance: selected, lang, translate });
    updateSummary({ summary, categories, appearance: selected, lang, translate });
    renderAvatar({ target: preview, character, appearanceOverride: selected });
  }

  return {
    readAppearance,
    renderAvatar,
    updateSummary,
    updateOutfitDetails,
    updateOutfitCatalog,
    describeStarterSet,
    open,
  };
})();
