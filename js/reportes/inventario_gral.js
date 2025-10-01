
import supabase from '../supabase/supabase-client.js'

export async function generarInventarioGral() {
    // Tomar valores de los selects
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaG').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioG').value);

    // Verificar si los filtros están vacíos
    if (!semanaSeleccionada && !anioSeleccionado) {
        generarTablaInventarioGral([]);
        return;
    }

    try {
        // Obtener todos los movimientos
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('tipo_movimiento, cantidad, semana, anio');

        if (errorMov) throw errorMov;

        // Obtener todos los conteos
        const { data: conteos, error: errorConteos } = await supabase
            .from('conteos')
            .select('stock_real, semana_conteo, anio_conteo');

        if (errorConteos) throw errorConteos;

        // Filtrar movimientos acumulados hasta la semana seleccionada
        const movimientosAcumulados = movimientos.filter(m => {
            const semanaMov = parseInt(m.semana);
            const anioMov = parseInt(m.anio);
            return anioMov < anioSeleccionado || (anioMov === anioSeleccionado && semanaMov <= semanaSeleccionada);
        });

        // Calcular sumatorias por tipo de movimiento
        const entradas = movimientosAcumulados
            .filter(m => m.tipo_movimiento === 'Entrada')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const salidasFactura = movimientosAcumulados
            .filter(m => m.tipo_movimiento === 'Salida por factura')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const trasladosMesas = movimientosAcumulados
            .filter(m => m.tipo_movimiento === 'Traspaso a mesas')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const desarme = movimientosAcumulados
            .filter(m => m.tipo_movimiento === 'Desarme')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const trasladosComep = movimientosAcumulados
            .filter(m => m.tipo_movimiento === 'Traspaso a Comep')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        // Total en sistema acumulado
        const totalSistema = entradas - (salidasFactura + trasladosMesas + desarme + trasladosComep);

        // Total contado solo de la semana seleccionada
        const totalContado = conteos
            .filter(c => c.anio_conteo === anioSeleccionado && c.semana_conteo === semanaSeleccionada)
            .reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        // Diferencia
        const diferencia = totalContado - totalSistema;

        // Calcular asertividad
        const asertividad = totalSistema > 0 ? (totalContado / totalSistema) * 100 : 0;

        // Crear el objeto de resumen
        const resumen = {
            entradas,
            salidasFactura,
            trasladosMesas,
            desarme,
            trasladosComep,
            totalSistema,
            totalContado,
            diferencia,
            asertividad
        };

        // Generar tabla con el resumen
        generarTablaInventarioGral(resumen);

    } catch (error) {
        console.error('Error generando inventario:', error);
        generarTablaInventarioGral([]);
    }
}

function generarTablaInventarioGral(resumen) {
    const tbody = document.querySelector("#reporteGral_tabla tbody");
    tbody.innerHTML = "";

    // Si no hay datos
    if (!resumen || Object.keys(resumen).length === 0) {
        tbody.innerHTML = `<tr><td colspan="2">No hay datos en este rango</td></tr>`;
        return;
    }

    // Determinar clase CSS para la diferencia
    let claseDiferencia = '';
    if (resumen.diferencia > 0) {
        claseDiferencia = 'text-success'; // Verde para positivo
    } else if (resumen.diferencia < 0) {
        claseDiferencia = 'text-danger';  // Rojo para negativo
    } else {
        claseDiferencia = 'text-muted';   // Gris para cero
    }

    // Determinar clase CSS para la asertividad
    let claseAsertividad = '';
    if (resumen.asertividad >= 95) {
        claseAsertividad = 'text-success'; // Excelente (95-100%)
    } else if (resumen.asertividad >= 90) {
        claseAsertividad = 'text-warning'; // Bueno (90-94%)
    } else if (resumen.asertividad >= 85) {
        claseAsertividad = 'text-orange';  // Regular (85-89%)
    } else {
        claseAsertividad = 'text-danger';  // Bajo (<85%)
    }

    // Generar la tabla con el resumen por tipo de movimiento
    tbody.innerHTML = `
        <tr>
            <td class="fw-bold">ENTRADAS</td>
            <td>${resumen.entradas}</td>
        </tr>
        <tr>
            <td class="fw-bold">SALIDAS POR FACTURA</td>
            <td>${resumen.salidasFactura}</td>
        </tr>
        <tr>
            <td class="fw-bold">TRASPASOS A MESAS</td>
            <td>${resumen.trasladosMesas}</td>
        </tr>
        <tr>
            <td class="fw-bold">DESARME</td>
            <td>${resumen.desarme}</td>
        </tr>
        <tr>
            <td class="fw-bold">TRASPASO A COMEP</td>
            <td>${resumen.trasladosComep}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">TOTAL EN SISTEMA</td>
            <td class="fw-bold">${resumen.totalSistema}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">TOTAL CONTADO</td>
            <td class="fw-bold">${resumen.totalContado}</td>
        </tr>
        <tr class="table-active">
            <td class="fw-bold">DIFERENCIA</td>
            <td class="fw-bold ${claseDiferencia}">${resumen.diferencia}</td>
        </tr>
        <tr class="table-info">
            <td class="fw-bold">ASERTIVIDAD</td>
            <td class="fw-bold ${claseAsertividad}">${resumen.asertividad.toFixed(2)}%</td>
        </tr>
    `;
}

export async function cargarFiltrosG() {
    const { data: conteos, error } = await supabase
        .from('conteos')
        .select('semana_conteo, anio_conteo');

    if (error) {
        console.error('Error cargando semanas/años:', error);
        return;
    }

    // Agrupar semanas por año
    const semanasPorAnio = {};
    conteos.forEach(c => {
        if (!semanasPorAnio[c.anio_conteo]) {
            semanasPorAnio[c.anio_conteo] = new Set();
        }
        semanasPorAnio[c.anio_conteo].add(c.semana_conteo);
    });

    const selectAnio = document.getElementById('filtro_anioG');
    const selectSemana = document.getElementById('filtro_semanaG');

    // Llenar select de años
    selectAnio.innerHTML = '<option value="0">Seleccione...</option>';
    Object.keys(semanasPorAnio)
        .sort((a, b) => b - a) // orden descendente
        .forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            selectAnio.appendChild(option);
        });

    // Escuchar cuando se selecciona un año
    selectAnio.addEventListener('change', function () {
        const anioSeleccionado = this.value;

        if (anioSeleccionado !== "0") {
            const semanas = Array.from(semanasPorAnio[anioSeleccionado]).sort((a, b) => a - b);
            selectSemana.disabled = false;
            selectSemana.innerHTML = '<option value="0">Seleccione...</option>';

            semanas.forEach(semana => {
                const option = document.createElement('option');
                option.value = semana;
                option.textContent = `Semana ${semana}`;
                selectSemana.appendChild(option);
            });
        } else {
            selectSemana.disabled = true;
            selectSemana.innerHTML = '<option value="0">Seleccione...</option>';
        }
    });
}