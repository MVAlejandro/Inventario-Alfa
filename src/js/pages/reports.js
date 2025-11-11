// Estilos generales
import '../../css/style.css'
import '../../css/pages/reports.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';

// Servicios Supabase
import { indReportFilter } from '../components/reports/reports-filter.js';

// Declarar el botón de filtrado
document.addEventListener('click', function(e) {
    if (e.target.id === 'filter-btn' || e.target.closest('#filter-btn')) {
        indReportFilter(e);
    }
});
   