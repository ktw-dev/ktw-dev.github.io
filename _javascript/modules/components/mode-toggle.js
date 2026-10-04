/**
 * Add listener for the theme preference switch (light / dark / system)
 */

const $toggle = document.getElementById('mode-toggle');

function syncChoice() {
  const preference = Theme.preference;

  $toggle.querySelectorAll('input[name="theme-mode"]').forEach(($input) => {
    $input.checked = $input.value === preference;
  });
}

export function modeWatcher() {
  if (!$toggle) {
    return;
  }

  syncChoice();

  $toggle.addEventListener('change', (event) => {
    if (event.target.name === 'theme-mode') {
      Theme.set(event.target.value);
    }
  });

  // The browser may restore a stale checked state when the page comes back from bfcache
  window.addEventListener('pageshow', syncChoice);
}
