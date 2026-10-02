/** clothing-shop-view.js — accessible presentation for Marta's shop. */
const ClothingShopView = (() => {
  const TEXT = {
    pt: {
      everyday:'Roupa do dia a dia', fishing:'Roupa de pesca',
      top:'Peça superior', bottom:'Calça', outerwear:'Sobreposição', headwear:'Proteção para a cabeça', gloves:'Luvas',
      owned:'No guarda-roupa', equipped:'Em uso', wear:'Vestir neste conjunto', notOwned:'Essa peça não está no guarda-roupa.',
      buy:'Comprar', price:(n)=>`${n} moedas`, notEnough:'Moedas insuficientes.',
      purchased:(name)=>`${name} adicionada ao guarda-roupa.`, worn:(name)=>`${name} vestida.`,
      npc:'Marta — mãe de Dani e funcionária da loja.',
    },
    en: {
      everyday:'Everyday clothes', fishing:'Fishing clothes',
      top:'Top', bottom:'Trousers', outerwear:'Outer layer', headwear:'Headwear', gloves:'Gloves',
      owned:'In wardrobe', equipped:'Wearing', wear:'Wear with this outfit', notOwned:'This item is not in your wardrobe.',
      buy:'Buy', price:(n)=>`${n} coins`, notEnough:'Not enough coins.',
      purchased:(name)=>`${name} added to your wardrobe.`, worn:(name)=>`${name} equipped.`,
      npc:'Marta — Dani’s mother and the shop attendant.',
    },
    hu: {
      everyday:'Mindennapi ruházat', fishing:'Horgászruházat',
      top:'Felsőrész', bottom:'Nadrág', outerwear:'Külső réteg', headwear:'Fejfedő', gloves:'Kesztyű',
      owned:'A ruhatárban', equipped:'Viselve', wear:'Felvétel ehhez az összeállításhoz', notOwned:'Ez a darab nincs a ruhatáradban.',
      buy:'Vásárlás', price:(n)=>`${n} érme`, notEnough:'Nincs elég érméd.',
      purchased:(name)=>`${name} bekerült a ruhatáradba.`, worn:(name)=>`${name} felvéve.`,
      npc:'Marta — Dani édesanyja és az üzlet alkalmazottja.',
    },
  };

  function _lang() {
    const lang = typeof I18n !== 'undefined' && I18n.getLang ? I18n.getLang() : 'pt';
    return TEXT[lang] ? lang : 'pt';
  }

  function render({ mode, coins, onBuy, onEquip, onModeChange }) {
    const lang = _lang();
    const text = TEXT[lang];
    const modeSelect = document.getElementById('clothing-mode');
    const balance = document.getElementById('clothing-shop-coins');
    const npc = document.getElementById('clothing-shop-npc');
    const list = document.getElementById('clothing-catalog-list');
    const feedback = document.getElementById('clothing-shop-feedback');
    if (!list || !balance) return;

    if (modeSelect) {
      modeSelect.value = mode;
      modeSelect.onchange = () => onModeChange(modeSelect.value);
    }
    balance.textContent = String(coins);
    if (npc) npc.textContent = text.npc;
    if (feedback) { feedback.textContent = ''; feedback.classList.add('hidden'); }

    const owned = new Set(Wardrobe.ownedIds());
    const equipped = Wardrobe.getEquipped(mode);
    list.innerHTML = '';
    const items = CLOTHING_CATALOG.filter(item => item.modes.includes(mode));
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'clothing-card';
      const swatch = document.createElement('span');
      swatch.className = 'clothing-swatch';
      swatch.setAttribute('aria-hidden', 'true');
      swatch.style.backgroundColor = item.color;
      const info = document.createElement('div');
      info.className = 'clothing-card-info';
      const title = document.createElement('h3');
      title.textContent = item.name[lang];
      const description = document.createElement('p');
      description.textContent = item.description[lang];
      const slot = document.createElement('p');
      slot.className = 'clothing-slot';
      slot.textContent = text[item.slot] || item.slot;
      info.append(title, description, slot);
      const action = document.createElement('div');
      action.className = 'clothing-card-action';
      const price = document.createElement('span');
      price.textContent = owned.has(item.id) ? text.owned : text.price(item.price);
      const button = document.createElement('button');
      button.type = 'button';
      const isOwned = owned.has(item.id);
      const isEquipped = equipped[item.slot]?.id === item.id;
      if (isEquipped) {
        button.textContent = text.equipped;
        button.disabled = true;
        button.className = 'btn-equipped';
        button.setAttribute('aria-label', `${item.name[lang]} — ${text.equipped}`);
      } else if (isOwned) {
        button.textContent = text.wear;
        button.className = 'btn-secondary';
        button.setAttribute('aria-label', `${text.wear}: ${item.name[lang]}`);
        button.addEventListener('click', () => onEquip(item.id, item));
      } else {
        button.textContent = text.buy;
        button.className = 'btn-primary';
        button.disabled = coins < item.price;
        button.setAttribute('aria-label', `${text.buy} ${item.name[lang]} — ${text.price(item.price)}`);
        button.addEventListener('click', () => onBuy(item.id, item));
      }
      action.append(price, button);
      card.dataset.clothingId = item.id;
      card.append(swatch, info, action);
      list.appendChild(card);
    });

    const preview = document.getElementById('clothing-avatar-preview');
    const character = typeof Character !== 'undefined' ? Character.load() : null;
    if (preview && character && typeof CharacterAvatar !== 'undefined') {
      CharacterAvatar.render(preview, character, { outfit: mode === 'fishing' ? 'fishing' : 'arrival', isPlayer: true });
    }
  }

  function focusItem(id) {
    const card = Array.from(document.querySelectorAll('#clothing-catalog-list .clothing-card'))
      .find(node => node.dataset.clothingId === id);
    const heading = card?.querySelector('h3');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  function showFeedback(message) {
    const el = document.getElementById('clothing-shop-feedback');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  function textFor(key, itemName) {
    const text = TEXT[_lang()];
    if (key === 'notEnough') return text.notEnough;
    if (key === 'owned') return text.owned;
    if (key === 'notOwned') return text.notOwned;
    if (key === 'purchased') return text.purchased(itemName);
    if (key === 'worn') return text.worn(itemName);
    return '';
  }

  return { render, showFeedback, textFor, focusItem };
})();
