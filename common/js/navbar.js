(function () {
  const el = document.getElementById('site-navbar');
  if (!el) return;

  const home = el.dataset.home || './';
  const title = el.dataset.title;

  el.innerHTML = `
    <nav class="site-navbar">
      <a class="site-navbar-logo" href="${home}index.html">🥔 Kitchen Arcade</a>
      ${title ? `<span class="site-navbar-crumb">› ${title}</span>` : ''}
    </nav>
  `;
})();