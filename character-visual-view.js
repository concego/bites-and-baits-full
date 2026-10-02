/** character-visual-view.js — visual presentation for character customization. */
const CharacterVisualView = (() => {
  function readAppearance({ categories, getElement }) {
    const appearance = {};
    categories.forEach(category => {
      const control = getElement(`character-visual-${category.key}`);
      if (control) {
        appearance[category.key] = control.value;
        return;
      }
      const selected = document.querySelector(
        `input[type="radio"][name="character-visual-${category.key}"]:checked`
      );
      appearance[category.key] = selected ? selected.value : '';
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

  function appendOutfitChoices({ fieldset, category, appearance, lang, translate, onChange }) {
    const groupName = `character-visual-${category.key}`;
    category.options.forEach((option, index) => {
      const choice = document.createElement('div');
      choice.className = 'character-outfit-choice';

      const label = document.createElement('label');
      label.className = 'character-outfit-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = `${groupName}-${index + 1}`;
      radio.name = groupName;
      radio.value = option.value;
      radio.required = true;
      radio.checked = appearance[category.key] === option.value;
      const optionName = document.createElement('span');
      optionName.textContent = characterVisualLabel(option, lang);
      label.appendChild(radio);
      label.appendChild(optionName);
      choice.appendChild(label);

      const detailsButton = document.createElement('button');
      detailsButton.type = 'button';
      detailsButton.className = 'btn-secondary character-outfit-description-button';
      detailsButton.id = `${groupName}-description-button-${index + 1}`;
      detailsButton.textContent = translate('character_outfit_view_description');
      const details = document.createElement('div');
      details.className = 'character-outfit-description';
      details.id = `${groupName}-description-${index + 1}`;
      details.hidden = true;
      details.setAttribute('role', 'region');
      details.setAttribute('aria-labelledby', detailsButton.id);
      appendPieceList(details, starterSetItems(category.key, option), lang);
      detailsButton.setAttribute('aria-controls', details.id);
      detailsButton.setAttribute('aria-expanded', 'false');
      detailsButton.setAttribute('aria-label',
        `${detailsButton.textContent} — ${characterVisualLabel(option, lang)}`);
      detailsButton.addEventListener('click', () => {
        const expanded = detailsButton.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !expanded;
        details.hidden = !nextExpanded;
        detailsButton.setAttribute('aria-expanded', String(nextExpanded));
        const labelKey = nextExpanded
          ? 'character_outfit_hide_description'
          : 'character_outfit_view_description';
        detailsButton.textContent = translate(labelKey);
        detailsButton.setAttribute('aria-label',
          `${detailsButton.textContent} — ${characterVisualLabel(option, lang)}`);
      });
      choice.appendChild(detailsButton);
      choice.appendChild(details);

      radio.addEventListener('change', () => {
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(input => {
          input.removeAttribute('aria-invalid');
        });
        onChange();
      });
      fieldset.appendChild(choice);
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

  function open({ fields, summary, preview, character, categories, lang, translate, getElement }) {
    if (!fields) return;
    const appearance = character.appearance || {};
    fields.innerHTML = '';

    function handleAppearanceChange() {
      const selected = readAppearance({ categories, getElement });
      updateSummary({ summary, categories, appearance: selected, lang, translate });
      renderAvatar({ target: preview, character, appearanceOverride: selected });
    }

    categories.forEach(category => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'character-visual-field';
      const legend = document.createElement('legend');
      legend.textContent = characterVisualLabel(category, lang);
      fieldset.appendChild(legend);

      if (['arrivalOutfit', 'fishingOutfit'].includes(category.key)) {
        fieldset.classList.add('character-outfit-field');
        appendOutfitChoices({ fieldset, category, appearance, lang, translate, onChange: handleAppearanceChange });
        fields.appendChild(fieldset);
        return;
      }

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
      const hasDescription = category.options.some(option =>
        characterVisualOptionDescription(option, category.key, lang, category.options, translate)
      );
      if (hasDescription) select.setAttribute('aria-describedby', description.id);
      updateOptionDescription({ select, description, category, lang });
      select.addEventListener('change', () => {
        select.removeAttribute('aria-invalid');
        updateOptionDescription({ select, description, category, lang });
        handleAppearanceChange();
      });
      fieldset.appendChild(select);
      if (hasDescription) fieldset.appendChild(description);
      fields.appendChild(fieldset);
    });

    const selected = readAppearance({ categories, getElement });
    updateSummary({ summary, categories, appearance: selected, lang, translate });
    renderAvatar({ target: preview, character, appearanceOverride: selected });
  }

  return {
    readAppearance,
    renderAvatar,
    updateSummary,
    describeStarterSet,
    open,
  };
})();
