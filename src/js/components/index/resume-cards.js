// Servicios Supabase
import { generateGralSummaries } from "../../services/reports-service";
import { obtainLastWeek } from "../../utils/last-week";
import { renderDifference, renderReliability } from "../reports/reports-gral-table";

export async function createResumeCards() {
    const lastWeek = await obtainLastWeek();
    // Obtener el resumen de movimientos y conteos
    const allSummaries = await generateGralSummaries();
    
    // Filtrar por última semana y año
    const filtered = allSummaries.filter(s => s.semana === lastWeek.semana && s.anio === lastWeek.anio);
    // ${allSummaries.totalContado.toLocaleString('en-US')}
    const productText = document.getElementById('products-text');

    productText.innerText = `${filtered[0].totalContado.toLocaleString('en-US')}`;
    productText.className = "general-report-cant"

    renderDifference(filtered[0] || {});
    renderReliability(filtered[0] || {});
}
