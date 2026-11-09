/* Navigation entre onglets et chargement du contenu Markdown. */
(() => {
  const views = ['projet', 'cahier', 'simulation', 'architecture', 'temps', 'logique', 'materiel'];
  const loaded = new Set();

  async function loadMarkdown(section) {
    const src = section.dataset.src;
    if (!src || loaded.has(src)) return;
    const target = section.querySelector('.prose');
    target.innerHTML = '<p class="loading">Chargement…</p>';
    try {
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const text = await res.text();
      target.innerHTML = window.marked.parse(text);
      // Les tableaux larges défilent dans leur propre cadre sur téléphone
      target.querySelectorAll('table').forEach(t => {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      });
      loaded.add(src);
    } catch (err) {
      target.innerHTML = `<p class="error">Le contenu « ${src} » n’a pas pu être chargé (${err.message}). ` +
        `Si tu as ouvert le fichier index.html directement depuis ton ordinateur, lance plutôt un petit serveur local (voir README).</p>`;
    }
  }

  function showView() {
    let id = location.hash.slice(1);
    if (!views.includes(id)) id = 'projet';
    views.forEach(v => {
      const section = document.getElementById('view-' + v);
      section.hidden = v !== id;
      document.getElementById('tab-' + v).setAttribute('aria-selected', v === id ? 'true' : 'false');
      if (v === id) loadMarkdown(section);
    });
    document.dispatchEvent(new CustomEvent('viewchange', { detail: id }));
  }

  window.addEventListener('hashchange', showView);
  showView();
})();
