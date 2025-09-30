
import supabase from '../supabase/supabase-client.js'

export async function generarInventarioGral() {
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaG').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioG').value);

    // Verificar si los filtros están vacíos
    if (!semanaSeleccionada && !anioSeleccionado) {
        generarTablaInventarioGral([]);
        return;
    }

    try {
        // Obtener todos los movimientos en el rango de fechas
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('tipo_movimiento, cantidad, fecha, semana, anio')
            .eq('semana', semanaSeleccionada)
            .eq('anio', anioSeleccionado);

        if (errorMov) throw errorMov;

        if (!movimientos || movimientos.length === 0) {
            generarTablaInventarioGral([]);
            return;
        }

        // Obtener todos los conteos en el rango de fechas
        const { data: conteos, error: errorConteos } = await supabase
            .from('conteos')
            .select('stock_real, fecha_conteo, semana_conteo, anio_conteo')
            .eq('semana_conteo', semanaSeleccionada)
            .eq('anio_conteo', anioSeleccionado);

        if (errorConteos) throw errorConteos;

        // Calcular sumatorias por tipo de movimiento
        const entradas = movimientos
            .filter(m => m.tipo_movimiento === 'Entrada')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const salidasFactura = movimientos
            .filter(m => m.tipo_movimiento === 'Salida por factura')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const trasladosMesas = movimientos
            .filter(m => m.tipo_movimiento === 'Traspaso a mesas')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const desarme = movimientos
            .filter(m => m.tipo_movimiento === 'Desarme')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        const trasladosComep = movimientos
            .filter(m => m.tipo_movimiento === 'Traspaso a Comep')
            .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

        // Calcular total en sistema (Entradas - Salidas)
        const totalSistema = entradas - (salidasFactura + trasladosMesas + desarme + trasladosComep);

        // Calcular total contado (suma de todos los conteos físicos)
        const totalContado = conteos 
            ? conteos.reduce((sum, conteo) => sum + parseInt(conteo.stock_real), 0)
            : 0;

        // Calcular diferencia
        const diferencia = totalContado - totalSistema;

        // Crear el objeto de resumen
        const resumen = {
            entradas,
            salidasFactura,
            trasladosMesas,
            desarme,
            trasladosComep,
            totalSistema,
            totalContado,
            diferencia
        };

        // Llamar a la función que genera la tabla con el resumen
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