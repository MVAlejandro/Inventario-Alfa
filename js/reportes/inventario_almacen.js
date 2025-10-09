
import supabase from '../supabase/supabase-client.js'

// Función para cargar almacenes en el select de filtro
export async function cargarAlmacenes(almacenElement) {
    const { data, error } = await supabase.from('almacenes').select('id_almacen, nombre');

    const selectAlmacen = document.getElementById(almacenElement);
    selectAlmacen.innerHTML = '<option value="0">Todos</option>';

    if (error) {
        console.error("Error cargando almacenes:", error);
        return;
    }

    data.forEach(almacen => {
        const option = document.createElement('option');
        option.value = almacen.id_almacen;
        option.textContent = almacen.nombre;
        selectAlmacen.appendChild(option);
    });
}

export async function generarInventarioInd() {
    // Tomar valores de los selects
    const semanaSeleccionada = parseInt(document.getElementById('filtro_semanaI').value);
    const anioSeleccionado = parseInt(document.getElementById('filtro_anioI').value);
    const almacenFiltro = document.getElementById('almacenI').value;

    // Verificar si los filtros están vacíos
    if (!semanaSeleccionada || !anioSeleccionado) {
        generarTablaInventarioInd([]);
        return;
    }

    try {
        // Construir query de productos
        let queryProductos = supabase
            .from('productos')
            .select(`
                id_producto,
                codigo,
                id_almacen,
                almacenes(nombre),
                conteos (
                    semana_conteo,
                    anio_conteo,
                    stock_real
                )
            `);

        // Aplicar filtro de almacén solo si no es '0'
        if (almacenFiltro && almacenFiltro !== "0") {
            queryProductos = queryProductos.eq('id_almacen', parseInt(almacenFiltro));
        }

        const { data: productos, error: errorProd } = await queryProductos;
        if (errorProd) throw errorProd;

        const inventario = [];

        productos.forEach(producto => {
            // Filtrar conteos hasta la semana/año seleccionados
            const conteo = producto.conteos.find(c => 
                c.anio_conteo === anioSeleccionado &&
                c.semana_conteo === semanaSeleccionada
            );

            if (conteo) {
                inventario.push({
                    id_producto: producto.id_producto,
                    codigo: producto.codigo,
                    almacen: producto.id_almacen,
                    almacen_nombre: producto.almacenes?.nombre,
                    semana_conteo: conteo.semana_conteo,
                    anio_conteo: conteo.anio_conteo,
                    stock_real: conteo.stock_real
                });
            }
        });

        generarTablaInventarioInd(inventario);

    } catch (error) {
        console.error('Error generando inventario contado:', error);
        generarTablaInventarioInd([]);
    }
}

function generarTablaInventarioInd(productos) {
    const tbody = document.querySelector("#reporteInd_tabla tbody");
    tbody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No hay productos en este rango</td></tr>`;
        return;
    }

    // Calcular totales
    const totalStockReal = productos.reduce((sum, p) => sum + p.stock_real, 0);

    // Generar filas de productos
    productos.forEach((p) => {
        const idProductos = p.id_producto;

        tbody.innerHTML += 
        `<tr data-id-tarea="${idProductos}">
            <th scope="row">${p.anio_conteo} / ${p.semana_conteo}</th>
            <td>${p.codigo}</td>
            <td>${p.almacen_nombre}</td>
            <td>${p.stock_real}</td>
        </tr>`;
    });

    // Agregar fila de totales al final
    tbody.innerHTML += 
    `<tr class="table-active fw-bold">
        <td colspan="3">TOTALES</td>
        <td>${totalStockReal}</td>
    </tr>`;
}

export async function cargarFiltros(añoSel, semanaSel, almacenSel) {
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
    const selectAlmacen = document.getElementById(almacenSel);

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
            selectAlmacen.disabled = true;
            selectAlmacen.innerHTML = '<option value="0">Seleccione...</option>';
        }
    });

    // Escuchar cuando se selecciona una semana
    selectSemana.addEventListener('change', function () {
        if (this.value !== "0") {
            selectAlmacen.disabled = false;
            cargarAlmacenes(almacenSel);
        } else {
            selectAlmacen.disabled = true;
            selectAlmacen.innerHTML = '<option value="0">Todos</option>';
        }
    });
}
