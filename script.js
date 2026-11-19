(function () {
  'use strict';

  var FALLBACK = function (id) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
  };

  var list = Array.isArray(window.pokemons) ? window.pokemons : [];
  var els = {
    form: document.getElementById('controls'),
    search: document.getElementById('search'),
    type: document.getElementById('type'),
    sort: document.getElementById('sort'),
    cards: document.getElementById('cards'),
    count: document.getElementById('count'),
    empty: document.getElementById('empty')
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function weightOf(p) { var w = parseFloat(p.weight); return isNaN(w) ? 0 : w; }

  function imgSrc(p) {
    return String(p.img || '').replace(/^http:\/\//i, 'https://') || FALLBACK(p.id);
  }

  function createCard(p) {
    var card = el('article', 'card');
    card.appendChild(el('span', 'num', p.num));
    card.appendChild(el('h2', '', p.name));

    var img = el('img');
    img.alt = p.name;
    img.loading = 'lazy';
    img.width = 96; img.height = 96;
    var step = 0;
    img.onerror = function () {
      if (step === 0) { step = 1; img.src = FALLBACK(p.id); }
      else { img.onerror = null; img.style.visibility = 'hidden'; }
    };
    img.src = imgSrc(p);
    card.appendChild(img);

    var types = el('div', 'types');
    (p.type || []).forEach(function (t) { types.appendChild(el('span', 'type', t)); });
    card.appendChild(types);

    var candy = (typeof p.candy_count === 'number') ? p.candy_count : '—';
    card.appendChild(el('p', 'info', 'Candy count: ' + candy));
    card.appendChild(el('p', 'info', p.weight || '—'));
    card.appendChild(el('p', 'weak', (p.weaknesses || []).join(' ')));
    card.appendChild(el('span', 'time', p.spawn_time || '—'));
    return card;
  }

  var sorters = {
    'num-asc': function (a, b) { return a.id - b.id; },
    'num-desc': function (a, b) { return b.id - a.id; },
    'name-asc': function (a, b) { return a.name.localeCompare(b.name); },
    'name-desc': function (a, b) { return b.name.localeCompare(a.name); },
    'weight-asc': function (a, b) { return weightOf(a) - weightOf(b) || a.id - b.id; },
    'weight-desc': function (a, b) { return weightOf(b) - weightOf(a) || a.id - b.id; },
    'time-asc': function (a, b) { return String(a.spawn_time).localeCompare(String(b.spawn_time)) || a.id - b.id; },
    'time-desc': function (a, b) { return String(b.spawn_time).localeCompare(String(a.spawn_time)) || a.id - b.id; }
  };

  function render() {
    var q = els.search.value.trim().toLowerCase();
    var type = els.type.value;
    var result = list.filter(function (p) {
      var okName = !q || p.name.toLowerCase().indexOf(q) !== -1 || p.num.indexOf(q) !== -1;
      var okType = type === 'all' || (p.type || []).indexOf(type) !== -1;
      return okName && okType;
    });
    if (sorters[els.sort.value]) result.sort(sorters[els.sort.value]);

    var frag = document.createDocumentFragment();
    result.forEach(function (p) { frag.appendChild(createCard(p)); });
    els.cards.textContent = '';
    els.cards.appendChild(frag);
    els.empty.hidden = result.length > 0;
    els.count.textContent = result.length + ' / ' + list.length + ' pokemon';
  }

  // Fill type filter from data
  var types = [];
  list.forEach(function (p) {
    (p.type || []).forEach(function (t) { if (types.indexOf(t) === -1) types.push(t); });
  });
  types.sort().forEach(function (t) {
    var o = el('option', '', t); o.value = t; els.type.appendChild(o);
  });

  els.form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  els.search.addEventListener('input', render);
  els.type.addEventListener('change', render);
  els.sort.addEventListener('change', render);

  render();
})();
