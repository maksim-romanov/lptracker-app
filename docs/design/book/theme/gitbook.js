(function () {
  function ready(fn) { document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var dark = document.getElementById('mdbook-theme-navy');
    if (dark) dark.textContent = 'Dark';
    try { var saved = localStorage.getItem('mdbook-theme'); if (saved && saved !== 'light' && saved !== 'navy') { localStorage.setItem('mdbook-theme', 'light'); location.reload(); } } catch (error) {}
    document.querySelectorAll('.content blockquote').forEach(function (quote) {
      var first = quote.querySelector('p');
      if (!first) return;
      var lead = first.firstElementChild;
      var text = lead ? lead.textContent.trim() : '';
      if (lead && /^(pending|rule|placeholder policy|relation to existing decisions|definition of done|font independence)/i.test(text)) {
        var title = document.createElement('span');
        title.className = 'callout-title';
        title.textContent = text.replace(/[.:]$/, '');
        lead.remove();
        first.insertBefore(title, first.firstChild);
        if (/pending/i.test(text)) quote.classList.add('pending');
      }
    });
    var headings = Array.prototype.slice.call(document.querySelectorAll('.content main h2'));
    if (headings.length < 2) return;
    var nav = document.createElement('nav');
    nav.className = 'page-outline show';
    nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = '<div class="outline-title">On this page</div>';
    var links = headings.map(function (heading) {
      var link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      nav.appendChild(link);
      return link;
    });
    document.body.appendChild(nav);
    function update() {
      var current = 0;
      headings.forEach(function (heading, index) { if (heading.getBoundingClientRect().top < 120) current = index; });
      links.forEach(function (link, index) { link.classList.toggle('on', index === current); });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  });
})();
