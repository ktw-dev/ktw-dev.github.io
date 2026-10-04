/**
 * The '⋯' panel (#sidebar) opens as a popover from #sidebar-trigger.
 * Browsers with the Popover API need no script; others get a plain toggle.
 */
const $sidebar = document.getElementById('sidebar');
const $trigger = document.getElementById('sidebar-trigger');

export function initSidebar() {
  if (!$sidebar || !$trigger) {
    return;
  }

  if (typeof $sidebar.showPopover === 'function') {
    return;
  }

  $sidebar.removeAttribute('popover');
  $sidebar.hidden = true;
  $trigger.setAttribute('aria-expanded', 'false');

  $trigger.addEventListener('click', () => {
    $sidebar.hidden = !$sidebar.hidden;
    $trigger.setAttribute('aria-expanded', String(!$sidebar.hidden));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$sidebar.hidden) {
      $sidebar.hidden = true;
      $trigger.setAttribute('aria-expanded', 'false');
      $trigger.focus();
    }
  });
}
