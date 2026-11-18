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

  const apiForm = document.getElementById('api-form');
  if (apiForm) {
    const results = document.getElementById('api-results');
    const status = document.getElementById('api-status');
    const query = document.getElementById('api-query');
    let controller;

    async function searchReleases() {
      const searchTerm = query.value.trim();
      if (searchTerm.length < 2) {
        status.textContent = 'Enter at least two characters.';
        return;
      }

      if (controller) controller.abort();
      controller = new AbortController();
      status.textContent = 'Loading releases from MusicBrainz…';
      results.replaceChildren();

      try {
        const releaseQuery = searchTerm.toLowerCase() === 'oasis'
          ? 'artist:"Oasis"'
          : 'artist:"Oasis" AND releasegroup:"' + searchTerm.replace(/"/g, '') + '"';
        const url = 'https://musicbrainz.org/ws/2/release-group/?query=' +
          encodeURIComponent(releaseQuery) + '&fmt=json&limit=18';
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw Error('HTTP ' + response.status);

        const data = await response.json();
        if (!Array.isArray(data['release-groups'])) {
          throw Error('Unexpected API response');
        }

        const releases = data['release-groups'];
        status.textContent = releases.length
          ? releases.length + ' releases found.'
          : 'No releases found. Try another title.';
        releases.forEach((release) => {
          const card = document.createElement('article');
          card.className = 'result-card';
          const title = document.createElement('strong');
          title.textContent = release.title || 'Untitled';
          const detail = document.createElement('small');
          detail.textContent = [
            release['first-release-date'] || 'Date unknown',
            release['primary-type'] || 'Release'
          ].join(' · ');
          card.append(title, detail);
          results.append(card);
        });
      } catch (error) {
        if (error.name === 'AbortError') return;
        status.textContent =
          'Unable to load live data (' + error.message + '). Check your internet connection and try again.';
      }
    }

    apiForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchReleases();
    });
    searchReleases();
  }
})();
