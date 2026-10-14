import './styles/legacy.css';
import './legacy/legacy-app.js';

// The first milestone keeps the existing interface and sound engine intact.
// New feature modules are introduced behind explicit contracts in parallel.
const app = document.querySelector<HTMLElement>('#app');
if (app) app.dataset.application = 'sonne';