/** home-decoration-data.js — items owned for future placement in the house. */
const HOME_DECORATION_CATALOG = Object.freeze({
  dani_lambari_drawing: Object.freeze({
    id: 'dani_lambari_drawing',
    nameKey: 'home_decor_dani_lambari_name',
    descriptionKey: 'home_decor_dani_lambari_desc',
    emoji: '🖼️',
  }),
});

function getHomeDecorationItem(id) {
  return HOME_DECORATION_CATALOG[id] || null;
}
