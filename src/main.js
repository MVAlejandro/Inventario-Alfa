// Estilos generales
import './css/style.css';
import './css/pages/index.css';

// Estilos de componentes
import './css/components/navbar.css';
import './css/components/footer.css';

// Componentes JS
import './js/components/navbar.js';
import { createResumeCards } from './js/components/index/resume-cards.js'

document.addEventListener('DOMContentLoaded', async () => {
    createResumeCards()
})