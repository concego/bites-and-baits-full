/* content-data.js — carrega conteúdo fixo modular do jogo sem servidor remoto. */
const ContentData = (() => {
  const SCHEMA_VERSION = 1;
  const NPC_ID = /^[a-z][a-z0-9_-]*$/;
  const JSON_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_./-]+\.json$/;
  const APPEARANCE_FIELDS = Object.freeze([
    'skinTone', 'bodyShape', 'height', 'faceShape', 'eyeDetails', 'eyeColor',
    'hairStyle', 'hairColor', 'headCovering', 'facialHair', 'arrivalOutfit',
    'fishingOutfit', 'footwear', 'accessories',
  ]);
  const BASE_URL = new URL('content/manifest.json', document.baseURI);
  let loadPromise = null;
  let npcs = null;

  function _fail(path, detail) {
    throw new Error(`Conteúdo inválido em ${path}: ${detail}`);
  }

  function _object(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function _path(value, source) {
    if (typeof value !== 'string' || !JSON_PATH.test(value)) _fail(source, 'caminho JSON inválido');
    return value;
  }

  function _id(value, source) {
    if (typeof value !== 'string' || !NPC_ID.test(value)) _fail(source, 'ID inválido');
    return value;
  }

  function _validateManifest(value) {
    const source = 'content/manifest.json';
    if (!_object(value) || value.schemaVersion !== SCHEMA_VERSION) _fail(source, 'schemaVersion deve ser 1');
    if (!_object(value.domains)) _fail(source, 'domains ausente ou inválido');
    _path(value.domains.npcs, source + ':domains.npcs');
    return value;
  }

  function _validateIndex(value) {
    const source = 'índice de NPCs';
    if (!_object(value) || value.schemaVersion !== SCHEMA_VERSION || value.domain !== 'npcs') {
      _fail(source, 'versão ou domínio inválido');
    }
    if (!Array.isArray(value.records) || value.records.length === 0) _fail(source, 'records vazio ou inválido');
    const ids = new Set();
    value.records.forEach((record, index) => {
      const at = `${source}:records[${index}]`;
      if (!_object(record)) _fail(at, 'registro inválido');
      const id = _id(record.id, at + ':id');
      _path(record.path, at + ':path');
      if (ids.has(id)) _fail(at, `ID duplicado: ${id}`);
      ids.add(id);
    });
    return value;
  }

  function _validateNpc(value, expectedId, source) {
    if (!_object(value)) _fail(source, 'registro deve ser objeto');
    if (_id(value.id, source + ':id') !== expectedId) _fail(source, `ID não corresponde ao índice (${expectedId})`);
    if (typeof value.name !== 'string' || !value.name.trim()) _fail(source, 'name ausente');
    if (!['feminine', 'masculine', 'neutral'].includes(value.genderProfile)) _fail(source, 'genderProfile inválido');
    if (!_object(value.appearance)) _fail(source, 'appearance ausente ou inválido');
    APPEARANCE_FIELDS.forEach(field => {
      if (typeof value.appearance[field] !== 'string' || !value.appearance[field]) {
        _fail(source, `appearance.${field} ausente ou inválido`);
      }
    });
    return value;
  }

  async function _readJson(path, label) {
    const url = new URL(path, BASE_URL);
    let response;
    try {
      response = await fetch(url.href, { cache: 'no-cache' });
    } catch (error) {
      _fail(label || path, `falha de rede (${error.message})`);
    }
    if (!response.ok) _fail(label || path, `HTTP ${response.status}`);
    try {
      return await response.json();
    } catch (error) {
      _fail(label || path, `JSON inválido (${error.message})`);
    }
  }

  async function _load() {
    const manifest = _validateManifest(await _readJson('manifest.json', 'content/manifest.json'));
    const indexPath = _path(manifest.domains.npcs, 'manifest:domains.npcs');
    const index = _validateIndex(await _readJson(indexPath, indexPath));
    const loaded = Object.create(null);
    for (const record of index.records) {
      const recordPath = _path(record.path, `índice de NPCs:${record.id}`);
      const relativePath = indexPath.slice(0, indexPath.lastIndexOf('/') + 1) + recordPath;
      const value = _validateNpc(await _readJson(relativePath, relativePath), record.id, relativePath);
      loaded[record.id] = Object.freeze({
        id: value.id,
        name: value.name,
        genderProfile: value.genderProfile,
        appearance: Object.freeze({ ...value.appearance }),
      });
    }
    // Publica os dados somente depois que todos os registros foram carregados e validados.
    npcs = Object.freeze(loaded);
    return true;
  }

  function load() {
    if (!loadPromise) loadPromise = _load();
    return loadPromise;
  }

  function getNpc(id) {
    if (!npcs) throw new Error('ContentData ainda não terminou de carregar.');
    if (!Object.prototype.hasOwnProperty.call(npcs, id)) throw new Error(`NPC não encontrado: ${id}`);
    return npcs[id];
  }

  return Object.freeze({
    load,
    getNpc,
    validation: Object.freeze({ manifest: _validateManifest, npcIndex: _validateIndex, npc: _validateNpc }),
  });
})();
