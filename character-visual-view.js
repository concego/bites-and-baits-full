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

  function characterVisualOptionText(option, lang) {
    const label = characterVisualLabel(option, lang);
    const description = option.description ? characterVisualLabel(option.description, lang) : '';
    return description ? `${label} — ${description}` : label;
  }

  function updateOptionDescription({ select, description, category, lang }) {
    if (!description) return;
    const option = category.options.find(item => item.value === select.value);
    const text = option && option.description ? characterVisualLabel(option.description, lang) : '';
    description.textContent = text;
    description.hidden = !text;
  }

  function updateSummary({ summary, categories, appearance, lang, translate }) {
    if (!summary) return;
    const parts = categories.map(category => {
      const option = category.options.find(item => item.value === appearance[category.key]);
      if (!option) return `${characterVisualLabel(category, lang)}: ${translate('character_visual_placeholder')}`;
      return `${characterVisualLabel(category, lang)}: ${characterVisualOptionText(option, lang)}`;
    });
    summary.textContent = parts.join('. ') + '.';
  }

  function open({ fields, summary, preview, character, categories, lang, translate, getElement }) {
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
        item.textContent = characterVisualOptionText(option, lang);
        select.appendChild(item);
      });
      select.value = appearance[category.key] || '';
      const description = document.createElement('p');
      description.className = 'character-visual-option-description';
      description.id = `character-visual-${category.key}-description`;
      description.hidden = true;
      if (category.options.some(option => option.description)) {
        select.setAttribute('aria-describedby', description.id);
      }
      updateOptionDescription({ select, description, category, lang });
      select.addEventListener('change', () => {
        select.removeAttribute('aria-invalid');
        updateOptionDescription({ select, description, category, lang });
        const selected = readAppearance({ categories, getElement });
        updateSummary({ summary, categories, appearance: selected, lang, translate });
        renderAvatar({ target: preview, character, appearanceOverride: selected });
      });
      fieldset.appendChild(select);
      if (category.options.some(option => option.description)) fieldset.appendChild(description);
      fields.appendChild(fieldset);
    });
    const selected = readAppearance({ categories, getElement });
    updateSummary({ summary, categories, appearance: selected, lang, translate });
    renderAvatar({ target: preview, character, appearanceOverride: selected });
  }

  return { readAppearance, renderAvatar, updateSummary, open };
})();
