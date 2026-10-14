/*
 * TEMPORARY PLACEHOLDER.
 *
 * The original sonne-2s.html contains the actual workstation implementation.
 * Its inline JavaScript must be transferred here intact before feature parity
 * can be claimed. This file intentionally does not simulate instruments,
 * transport, scheduling, presets, or project persistence.
 */
const root = document.querySelector('#app');
if (root && !root.hasChildNodes()) {
  const notice = document.createElement('section');
  notice.className = 'migration-notice';
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<h1>Sonne migration scaffold</h1><p>The original workstation JavaScript has not yet been transferred into this repository. The modular TypeScript foundations are available, but audio and interface behavior are not active in this scaffold.</p>';
  root.append(notice);
}