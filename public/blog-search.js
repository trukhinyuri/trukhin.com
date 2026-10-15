// Blog search on /blog/search/ with Pagefind (index built from dist after astro build, same origin).
// No styles are injected (CSP style-src 'self'); results are plain list items.
const form = document.querySelector('form[role="search"]');
const input = document.getElementById('q');
const statusEl = document.getElementById('search-status');
const list = document.getElementById('search-results');

let pagefind;
async function load() {
  pagefind ??= await import('/pagefind/pagefind.js');
  await pagefind.init();
  return pagefind;
}

function item(r) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = r.url;
  a.textContent = r.meta?.title ?? r.url;
  const p = document.createElement('p');
  p.className = 'small';
  // Pagefind excerpts are built from this site's own text; only <mark> is kept.
  p.innerHTML = r.excerpt.replace(/<(?!\/?mark>)[^>]*>/g, '');
  li.append(a, p);
  return li;
}

let seq = 0;
async function run(q) {
  const mine = ++seq;
  const term = q.trim();
  list.replaceChildren();
  if (!term) { statusEl.textContent = 'Type a word to search the posts.'; return; }
  statusEl.textContent = 'Searching…';
  const pf = await load();
  const res = await pf.debouncedSearch(term, {}, 150);
  if (res === null || mine !== seq) return;
  const data = await Promise.all(res.results.slice(0, 20).map((r) => r.data()));
  if (mine !== seq) return;
  list.replaceChildren(...data.map(item));
  statusEl.textContent = data.length ? `${res.results.length} result${res.results.length === 1 ? '' : 's'} for “${term}”` : `Nothing found for “${term}”.`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = new URL(location.href);
  url.searchParams.set('q', input.value);
  history.replaceState(null, '', url);
  run(input.value);
});
input.addEventListener('input', () => run(input.value));
const q = new URL(location.href).searchParams.get('q');
if (q) { input.value = q; run(q); } else statusEl.textContent = 'Type a word to search the posts.';
