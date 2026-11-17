(() => {
  'use strict';

  const root = document.documentElement;
  const stored = localStorage.getItem('oasis-theme');
  root.dataset.theme = stored === 'dark' ? 'dark' : 'light';

  const theme = document.getElementById('theme-toggle');
  function updateTheme() {
    theme.textContent = root.dataset.theme === 'dark' ? '☀ Light' : '☾ Dark';
  }
  updateTheme();
  theme.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('oasis-theme', root.dataset.theme);
    updateTheme();
  });

  document.querySelectorAll('.site-header nav a').forEach((link) => {
    const currentPage = location.pathname.split('/').pop();
    if (
      link.getAttribute('href') === currentPage ||
      (!currentPage && link.getAttribute('href') === 'index.html')
    ) {
      link.classList.add('active');
    }
  });

  const dialog = document.getElementById('auth-dialog');
  const toggle = document.getElementById('auth-toggle');
  const close = document.getElementById('auth-close');
  const form = document.getElementById('auth-form');
  const error = document.getElementById('auth-error');

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('oasis-user') || 'null');
    } catch {
      return null;
    }
  }

  function updateAuth() {
    const user = getUser();
    toggle.textContent = user ? 'Sign out (' + user.name.slice(0, 12) + ')' : 'Sign in';
  }
  updateAuth();

  toggle.addEventListener('click', () => {
    if (getUser()) {
      localStorage.removeItem('oasis-user');
      updateAuth();
    } else {
      dialog.showModal();
    }
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = 'Enter a name (2+ characters) and valid email.';
      return;
    }
    localStorage.setItem('oasis-user', JSON.stringify({ name, email }));
    error.textContent = '';
    form.reset();
    dialog.close();
    updateAuth();
  });

  $('.faq-question').on('click', function () {
    const indicator = $(this).find('.faq-indicator');
    const expanded = indicator.text() === '−';
    indicator.text(expanded ? '+' : '−');
    $(this).next('.faq-answer').stop(true, true).slideToggle(250);
  });

  $('.album-open').on('click', function () {
    document.getElementById('album-large').src = this.dataset.image;
    document.getElementById('album-large').alt = this.dataset.title;
    document.getElementById('album-caption').textContent = this.dataset.title;
    document.getElementById('album-dialog').showModal();
  });
  $('#album-close').on('click', () => document.getElementById('album-dialog').close());

  const releaseForm = document.getElementById('release-search-form');
  if (releaseForm) {
    const releases = [
      { title: 'Definitely Maybe', year: '1994', type: 'Studio album' },
      { title: "(What's the Story) Morning Glory?", year: '1995', type: 'Studio album' },
      { title: 'Be Here Now', year: '1997', type: 'Studio album' },
      { title: 'The Masterplan', year: '1998', type: 'Compilation album' },
      { title: 'Standing on the Shoulder of Giants', year: '2000', type: 'Studio album' },
      { title: 'Heathen Chemistry', year: '2002', type: 'Studio album' },
      { title: "Don't Believe the Truth", year: '2005', type: 'Studio album' },
      { title: 'Stop the Clocks', year: '2006', type: 'Compilation album' },
      { title: 'Dig Out Your Soul', year: '2008', type: 'Studio album' },
      { title: 'Time Flies... 1994–2009', year: '2010', type: 'Compilation album' }
    ];
    const results = document.getElementById('release-results');
    const status = document.getElementById('release-status');
    const query = document.getElementById('release-query');

    function searchReleases(searchTerm) {
      const normalizedQuery = searchTerm.trim().toLocaleLowerCase();
      const matches = releases.filter((release) =>
        [release.title, release.year, release.type, 'Oasis'].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery)
        )
      );

      status.textContent = matches.length
        ? matches.length + ' releases found.'
        : 'No releases found. Try a title or year.';
      results.replaceChildren();

      matches.forEach((release) => {
        const card = document.createElement('article');
        card.className = 'result-card';
        const title = document.createElement('strong');
        title.textContent = release.title;
        const detail = document.createElement('small');
        detail.textContent = release.year + ' · ' + release.type;
        card.append(title, detail);
        results.append(card);
      });
    }

    releaseForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchReleases(query.value);
    });
    searchReleases(query.value);
  }
})();
