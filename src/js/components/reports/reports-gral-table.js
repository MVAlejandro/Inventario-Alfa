
let allSummaries = [];

// Función para crear la tabla general de movimientos
export async function renderGralTable(summariesParam = null) {
    // Obtener allSummarieses de la lista filtrada
    if (summariesParam) {
        allSummaries = summariesParam;
    }
    
    const tbody = document.querySelector("#general-report-table tbody");
    const weekText = document.getElementById('weekHeader');
    // Limpiar antes de insertar
    weekText.innerHTML = "";
    tbody.innerHTML = "";

    if (!allSummaries || Object.keys(allSummaries).length === 0) {
        tbody.innerHTML = `<tr><td colspan="2">No hay datos en este rango</td></tr>`;
        return;
    }

    weekText.innerHTML = `Semana ${allSummaries.semana}`;
    // Generar la tabla con el resumen por tipo de movimiento
    tbody.innerHTML = 
        `<tr>
            <td class="ps-4">INVENTARIO INICIAL</td>
            <td class="text-center">${allSummaries.inventarioInicial.toLocaleString('en-US')}</td>
        </tr>
        <tr>
            <td class="ps-4">ENTRADAS</td>
            <td class="text-center">${allSummaries.entradas.toLocaleString('en-US')}</td>
        </tr>
        <tr>
            <td class="ps-4">SALIDAS POR FACTURA</td>
            <td class="text-center">${allSummaries.salidasFactura.toLocaleString('en-US')}</td>
        </tr>
        <tr>
            <td class="ps-4">TRASPASOS A MESAS</td>
            <td class="text-center">${allSummaries.trasladosMesas.toLocaleString('en-US')}</td>
        </tr>
        <tr>
            <td class="ps-4">DESARME</td>
            <td class="text-center">${allSummaries.desarme.toLocaleString('en-US')}</td>
        </tr>
        <tr>
            <td class="ps-4">TRASPASO A COMEP</td>
            <td class="text-center">${allSummaries.trasladosComep.toLocaleString('en-US')}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold ps-4">TOTAL EN SISTEMA</td>
            <td class="text-center fw-bold">${allSummaries.totalSistema.toLocaleString('en-US')}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold ps-4">TOTAL CONTADO</td>
            <td class="text-center fw-bold">${allSummaries.totalContado.toLocaleString('en-US')}</td>
        </tr>`;
}

// Función para crear la card de diferencia
export async function renderDifference(summariesParam = null) {
    // Obtener allSummarieses de la lista filtrada
    if (summariesParam) {
        allSummaries = summariesParam;
    }
    
    const element = document.getElementById("diff-text");
    // Limpiar elemento antes de insertar
    element.textContent = "";

    // Determinar clase CSS para la diferencia
    let differenceClass = '';
    if (allSummaries.diferencia > 0) {
        differenceClass = 'text-success'; // Verde para positivo
    } else if (allSummaries.diferencia < 0) {
        differenceClass = 'text-danger';  // Rojo para negativo
    } else {
        differenceClass = 'text-muted';   // Gris para cero
    }

    if (!allSummaries || Object.keys(allSummaries).length === 0) {
        element.textContent = `-`;
        element.className = "general-report-cant text-muted"
        return;
    }

    // Generar el contenido
    element.textContent = `${allSummaries.diferencia.toLocaleString('en-US')}`;
    element.className = `general-report-cant ${differenceClass}`
}

// Función para crear la card de confiabilidad
export async function renderReliability(summariesParam = null) {
    // Obtener allSummarieses de la lista filtrada
    if (summariesParam) {
        allSummaries = summariesParam;
    }
    
    const element = document.getElementById("rel-text");
    // Limpiar elemento antes de insertar
    element.textContent = "";
    element.className = "general-report-cant text-muted"

    // Determinar clase CSS para la confiabilidad
    let reliabilityClass = '';
    if (allSummaries.confiabilidad >= 95) {
        reliabilityClass = 'text-success'; // Excelente (95-100%)
    } else if (allSummaries.confiabilidad >= 85) {
        reliabilityClass = 'text-warning'; // Bueno (85-94%)
    } else {
        reliabilityClass = 'text-danger';  // Bajo (<85%)
    }

    if (!allSummaries || Object.keys(allSummaries).length === 0) {
        element.textContent = `-`;
        return;
    }

    // Generar el contenido
    element.textContent = `${allSummaries.confiabilidad.toLocaleString('en-US')}%`;
    element.className = `general-report-cant ${reliabilityClass}`;
}
