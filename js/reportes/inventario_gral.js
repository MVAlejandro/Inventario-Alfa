
import supabase from '../supabase/supabase-client.js'

export async function generarInventarioGral() {
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaG').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioG').value);

    if (!semanaSeleccionada || !anioSeleccionado) {
        generarTablaInventarioGral([]);
        return;
    }

    try {
        // Obtener movimientos
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('tipo_movimiento, cantidad, semana, anio');

        if (errorMov) throw errorMov;

        // Obtener conteos
        const { data: conteos, error: errorConteos } = await supabase
            .from('conteos')
            .select('stock_real, semana_conteo, anio_conteo, id_producto');

        if (errorConteos) throw errorConteos;

        // Función auxiliar para obtener semana anterior
        const obtenerSemanaAnterior = (semana, anio) => {
            if (semana > 1) {
                return { semana: semana - 1, anio };
            } else {
                return { semana: 52, anio: anio - 1 };
            }
        };

        const { semana: semanaAnterior, anio: anioAnterior } = obtenerSemanaAnterior(semanaSeleccionada, anioSeleccionado);

        // Obtener stock contado de la semana anterior como inventario base
        const conteosAnteriores = conteos.filter(c =>
            c.anio_conteo === anioAnterior && c.semana_conteo === semanaAnterior
        );

        const inventarioInicial = conteosAnteriores.reduce((sum, c) => sum + parseInt(c.stock_real), 0);
        let totalSistema = inventarioInicial; // luego aplicas los movimientos

        // Filtrar movimientos solo de la semana seleccionada
        const movimientosSemanaSeleccionada = movimientos
            .filter(m =>
                parseInt(m.anio) === anioSeleccionado &&
                parseInt(m.semana) === semanaSeleccionada
            )
            .map(m => ({
                ...m,
                cantidad: parseInt(m.cantidad)
            }));

        // Aplicar movimientos al totalSistema
        for (const mov of movimientosSemanaSeleccionada) {
            const { tipo_movimiento, cantidad } = mov;

            if (['ENTRADA', 'TRASPASO A MESAS'].includes(tipo_movimiento)) {
                totalSistema += cantidad;
            } else if (['SALIDA POR FACTURA', 'DESARME', 'TRASPASO A COMEP'].includes(tipo_movimiento)) {
                totalSistema -= cantidad;
            }
        }

        // Calcular resumen por tipo de movimiento
        const getCantidad = tipo =>
            movimientosSemanaSeleccionada
                .filter(m => m.tipo_movimiento === tipo)
                .reduce((sum, m) => sum + m.cantidad, 0);

        const entradas = getCantidad('ENTRADA');
        const salidasFactura = getCantidad('SALIDA POR FACTURA');
        const trasladosMesas = getCantidad('TRASPASO A MESAS');
        const desarme = getCantidad('DESARME');
        const trasladosComep = getCantidad('TRASPASO A COMEP');

        // Obtener conteo real de la semana seleccionada
        const conteosFiltrados = conteos.filter(c =>
            c.anio_conteo === anioSeleccionado && c.semana_conteo === semanaSeleccionada
        );

        const totalContado = conteosFiltrados.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

        // Calcular diferencia y confiabilidad absoluta
        const diferencia = totalContado - totalSistema;
        const confiabilidad = totalSistema > 0
            ? (1 - Math.abs(diferencia) / totalSistema) * 100
            : 0;

        // Preparar resumen
        const resumen = {
            inventarioInicial,
            entradas,
            salidasFactura,
            trasladosMesas,
            desarme,
            trasladosComep,
            totalSistema,
            totalContado,
            diferencia,
            confiabilidad
        };

        generarTablaInventarioGral(resumen);

    } catch (error) {
        console.error('Error generando inventario:', error);
        generarTablaInventarioGral([]);
    }
}

export async function generarResumenInventarios() {
    try {
        // Obtener movimientos y conteos completos
        const { data: movimientos, error: errorMov } = await supabase
            .from('movimientos')
            .select('tipo_movimiento, cantidad, semana, anio');

        if (errorMov) throw errorMov;

        const { data: conteos, error: errorConteos } = await supabase
            .from('conteos')
            .select('stock_real, semana_conteo, anio_conteo, id_producto');

        if (errorConteos) throw errorConteos;

        // Obtener lista de combinaciones año+semana únicas (de movimientos y conteos)
        const semanasSet = new Set();

        movimientos.forEach(m => {
            semanasSet.add(`${m.anio}-${m.semana}`);
        });
        conteos.forEach(c => {
            semanasSet.add(`${c.anio_conteo}-${c.semana_conteo}`);
        });

        const semanasArray = Array.from(semanasSet)
            .map(s => {
                const [anio, semana] = s.split('-').map(Number);
                return { anio, semana };
            })
            // Ordenar por año y semana ascendente
            .sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.semana - b.semana);

        // Función para obtener semana anterior
        const obtenerSemanaAnterior = (semana, anio) => {
            if (semana > 1) {
                return { semana: semana - 1, anio };
            } else {
                return { semana: 52, anio: anio - 1 };
            }
        };

        const resumenes = [];

        // Mapear conteos por semana y año para acceso rápido
        const conteosMap = {};
        conteos.forEach(c => {
            const key = `${c.anio_conteo}-${c.semana_conteo}`;
            if (!conteosMap[key]) conteosMap[key] = [];
            conteosMap[key].push(c);
        });

        // Mapear movimientos por semana y año
        const movimientosMap = {};
        movimientos.forEach(m => {
            const key = `${m.anio}-${m.semana}`;
            if (!movimientosMap[key]) movimientosMap[key] = [];
            movimientosMap[key].push(m);
        });

        for (const { anio, semana } of semanasArray) {
            // Inventario inicial = suma de stock_real de la semana anterior
            const { semana: semanaAnterior, anio: anioAnterior } = obtenerSemanaAnterior(semana, anio);
            const keyAnterior = `${anioAnterior}-${semanaAnterior}`;
            const conteosAnteriores = conteosMap[keyAnterior] || [];

            const inventarioInicial = conteosAnteriores.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

            // Movimientos de la semana actual
            const movimientosSemana = movimientosMap[`${anio}-${semana}`] || [];

            // Calcular totalSistema empezando con inventarioInicial
            let totalSistema = inventarioInicial;

            movimientosSemana.forEach(m => {
                const cantidad = parseInt(m.cantidad);
                switch (m.tipo_movimiento) {
                    case 'ENTRADA':
                    case 'TRASPASO A MESAS':
                        totalSistema += cantidad;
                        break;
                    case 'SALIDA POR FACTURA':
                    case 'DESARME':
                    case 'TRASPASO A COMEP':
                        totalSistema -= cantidad;
                        break;
                }
            });

            // Cantidades por tipo de movimiento
            const getCantidad = tipo =>
                movimientosSemana
                    .filter(m => m.tipo_movimiento === tipo)
                    .reduce((sum, m) => sum + parseInt(m.cantidad), 0);

            const entradas = getCantidad('ENTRADA');
            const salidasFactura = getCantidad('SALIDA POR FACTURA');
            const trasladosMesas = getCantidad('TRASPASO A MESAS');
            const desarme = getCantidad('DESARME');
            const trasladosComep = getCantidad('TRASPASO A COMEP');

            // Conteo real semana actual
            const conteosActuales = conteosMap[`${anio}-${semana}`] || [];
            const totalContado = conteosActuales.reduce((sum, c) => sum + parseInt(c.stock_real), 0);

            // Diferencia y confiabilidad
            const diferencia = totalContado - totalSistema;
            const confiabilidad = totalSistema > 0 ? (1 - Math.abs(diferencia) / totalSistema) * 100 : 0;

            // Guardar resumen
            resumenes.push({
                anio,
                semana,
                inventarioInicial,
                entradas,
                salidasFactura,
                trasladosMesas,
                desarme,
                trasladosComep,
                totalSistema,
                totalContado,
                diferencia,
                confiabilidad: parseFloat(confiabilidad.toFixed(2))
            });
        }

        return resumenes;

    } catch (error) {
        console.error('Error generando resúmenes:', error);
        return [];
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

    // Determinar clase CSS para la confiabilidad
    let claseConfiabilidad = '';
    if (resumen.confiabilidad >= 95) {
        claseConfiabilidad = 'text-success'; // Excelente (95-100%)
    } else if (resumen.confiabilidad >= 85) {
        claseConfiabilidad = 'text-warning'; // Bueno (85-94%)
    } else {
        claseConfiabilidad = 'text-danger';  // Bajo (<85%)
    }

    // Generar la tabla con el resumen por tipo de movimiento
    tbody.innerHTML = 
        `<tr>
            <td class="fw-bold">INVENTARIO INICIAL</td>
            <td>${resumen.inventarioInicial}</td>
        </tr>
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
            <td class="fw-bold">CONFIABILIDAD</td>
            <td class="fw-bold ${claseConfiabilidad}">${resumen.confiabilidad.toFixed(2)}%</td>
        </tr>`;
}

export async function cargarFiltrosG(añoSel, semanaSel) {
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

    const selectAnio = document.getElementById(añoSel);
    const selectSemana = document.getElementById(semanaSel);

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
