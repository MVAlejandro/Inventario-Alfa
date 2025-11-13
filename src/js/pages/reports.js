// Estilos generales
import '../../css/style.css'
import '../../css/pages/reports.css'

// Estilos de componentes
import '../../css/components/navbar.css'
import '../../css/components/footer.css'

// Componentes JS
import '../components/navbar.js';

// Servicios Supabase
import { initPage } from '../utils/session-validate.js'; 
import { indReportFilter, gralReportFilter } from '../components/reports/reports-filter.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage()
    // Filtrar tabla individual con el cambio del select
    const storeFilter = document.getElementById('store-filter');
    if (storeFilter) {
        storeFilter.addEventListener('change', (e) => {
            indReportFilter(e);
        });
    }

    // Declarar el botón de filtrado
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            indReportFilter(e);
            gralReportFilter(e);
        });
    }
});
   