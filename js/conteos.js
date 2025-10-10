
import supabase from './supabase/supabase-client.js'
import { validarCamposInvalidos, validarSelect } from "../js/validaciones/validar_campos.js"
import { validarText, validarCantidad } from "./validaciones/regex.js"
import { cargarOpciones } from './funciones/cargar_select.js';

// Función para cargar productos en el select del formulario
async function cargarProductos(idAlmacen) {
    const { data, error } = await supabase
        .from('productos')
        .select('id_producto, codigo')
        .eq('id_almacen', idAlmacen);

    const selectProducto = document.getElementById('producto_manual');
    selectProducto.innerHTML = '<option value="0">Seleccione...</option>';

    if (error) {
        console.error("Error cargando productos:", error);
        return;
    }

    data.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id_producto;
        option.textContent = prod.codigo;
        selectProducto.appendChild(option);
    });
}

// Detectar cambio en el select de almacen en formulario
document.getElementById('almacen_manual').addEventListener('change', function() {
    const selectProducto = document.getElementById('producto_manual');
    const idAlmacen = this.value;
    if (idAlmacen !== "0") {
        selectProducto.disabled = false;
        cargarProductos(idAlmacen);
    } else {
        selectProducto.disabled = true;
        document.getElementById('producto_manual').innerHTML = '';
    }
});

// Función para calcular y asignar semana y año
function getWeekAndYear(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // lunes=1, domingo=7

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return { semana: week, anio: d.getUTCFullYear() };
}

// Función centralizada para obtener conteos
async function obtenerConteosCompletos() {
    const { data, error } = await supabase
        .from('conteos')
        .select(`
            id_conteo,
            fecha_conteo,
            semana_conteo,
            anio_conteo,
            stock_real,
            observaciones,
            id_producto,
            productos (
                codigo,
                id_almacen,
                almacenes (nombre)
            )
        `);

    if (error) {
        console.error('Error obteniendo conteos:', error);
        throw error;
    }

    return data.map(conteo => ({
        id_conteo: conteo.id_conteo,
        fecha_conteo: conteo.fecha_conteo,
        semana_conteo: conteo.semana_conteo,
        anio_conteo: conteo.anio_conteo,
        stock_real: conteo.stock_real,
        observaciones: conteo.observaciones,
        id_producto: conteo.id_producto,
        codigo: conteo.productos?.codigo,
        id_almacen: conteo.productos?.id_almacen,
        almacen: conteo.productos?.almacenes?.nombre
    }));
}

// Función para insertar un nuevo conteo en Supabase
async function insertarConteo(conteo) {
    // Calcular semana y año usando la fecha actual
    const fecha_conteo = conteo.fecha_conteo ? new Date(conteo.fecha_conteo) : new Date();
    const { semana, anio } = getWeekAndYear(fecha_conteo);

    // Agregar semana, año y fecha al objeto a insertar
    const conteoParaInsertar = {
        ...conteo,
        fecha_conteo: fecha_conteo.toISOString().split('T')[0], // YYYY-MM-DD
        semana_conteo: semana,
        anio_conteo: anio
    };

    const { data, error } = await supabase.from('conteos').insert([conteoParaInsertar]);

    if (error) {
        console.error(error)
        alert('Error al guardar el conteo: ' + error.message)
    } else {
        generarTablaConteos() // actualizar listado

    }
}

// Función de filtrado
document.getElementById('filtro_tipo').addEventListener('change', async function () {
    const tipo = this.value;
    const selectOrden = document.getElementById('filtro_orden');

    // Limpiar opciones anteriores
    selectOrden.innerHTML = '';

    if (tipo === '0') {
        selectOrden.disabled = true;
        return;
    }

    selectOrden.disabled = false;

    // Obtener conteos usando la función centralizada
    const conteos = await obtenerConteosCompletos();
    if (!conteos) return;

    let opciones = [];

    // Obtener valores únicos según el tipo
    switch (tipo) {
        case 'semana_conteo':
            opciones = conteos.map(c => `${c.anio_conteo} - ${c.semana_conteo}`);
            break;
        case 'codigo':
            opciones = conteos.map(c => c.codigo);
            break;
        case 'almacen':
            opciones = conteos.map(c => c.almacen);
            break;
    }

    // Eliminar duplicados y valores vacíos
    const opcionesUnicas = [...new Set(opciones)].filter(v => v);

    // Agregar opciones al select
    selectOrden.innerHTML = '<option value="0">Todos</option>';
    opcionesUnicas.forEach(opcion => {
        const optionEl = document.createElement('option');
        optionEl.value = opcion;
        optionEl.textContent = opcion;
        selectOrden.appendChild(optionEl);
    });
});

// Función al dar click en botón de filtrado
document.getElementById('btn_filtro').addEventListener('click', async function () {
    const tipo = document.getElementById('filtro_tipo').value;
    const valorSeleccionado = document.getElementById('filtro_orden').value;
    const textoBusqueda = document.getElementById('filtro_buscar').value.trim().toLowerCase();

    // Obtener conteos usando la función centralizada
    const conteosProcesados = await obtenerConteosCompletos();
    if (!conteosProcesados) return;

    // Si no hay filtros activos, mostrar todo
    const sinFiltros =
        tipo === '0' &&
        (!valorSeleccionado || valorSeleccionado === '0') &&
        textoBusqueda === '';

    if (sinFiltros) {
        generarTablaConteos(conteosProcesados);
        return;
    }

    // Aplicar filtros
    const filtrados = conteosProcesados.filter(c => {
        let cumpleSelect = true;
        let cumpleBusqueda = true;

        // Filtro por select dinámico
        if (tipo !== '0' && valorSeleccionado !== '0') {
            if (tipo === 'semana_conteo') {
                const campoSemana = `${c.anio_conteo} - ${c.semana_conteo}`;
                cumpleSelect = campoSemana === valorSeleccionado;
            } else {
                const campo = c[tipo]?.toString().toLowerCase();
                cumpleSelect = campo === valorSeleccionado.toLowerCase();
            }
        }

        // Filtro por búsqueda libre
        if (textoBusqueda) {
            cumpleBusqueda = Object.values(c).some(valor =>
                valor?.toString().toLowerCase().includes(textoBusqueda)
            );
        }

        return cumpleSelect && cumpleBusqueda;
    });

    generarTablaConteos(filtrados);
});

// Función para cargar los conteos desde Supabase en la tabla
function generarTablaConteos(conteos) {
    const tbody = document.querySelector('#tabla_conteos tbody');
    tbody.innerHTML = '';

    if (!conteos || conteos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No hay conteos que coincidan con los filtros</td></tr>`;
        return;
    }

    // Mostrar siempre las entradas ordenadas por id
    conteos.sort((a, b) => a.id_conteo - b.id_conteo);

    conteos.forEach(conteo => {
        tbody.innerHTML += 
        `<tr>
            <th scope="row">${conteo.anio_conteo} / ${conteo.semana_conteo}</th>
            <td>${conteo.codigo}</td>
            <td>${conteo.almacen}</td>
            <td>${conteo.stock_real}</td>
            <td>${conteo.observaciones}</td>
            <td><button type="button" class="btn btn-primary conteo-btn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#conteo_modal"
                    data-conteo='${JSON.stringify(conteo)}'>
                    Editar
                </button></td>
        </tr>`;
    });
}

// Agregar Movimiento Excel
// Mapeo de nombre de almacén a ID
const mapaAlmacenes = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3
};

// Función para buscar un producto por su código y almacén
async function buscarProducto(codigo, id_almacen) {
    const { data, error } = await supabase
        .from('productos')
        .select('id_producto')
        .eq('codigo', codigo)
        .eq('id_almacen', id_almacen)
        .maybeSingle();

    return data ? data.id_producto : null;
}

// Evento al dar click al botón Agregar Movimiento Excel
document.getElementById('btn_add_excel').addEventListener('click', async function(event) {
    event.preventDefault();
    const formulario = document.getElementById('form_excel');
    // Obtener valores de inputs
    const texto_datos = document.getElementById('datos_excel').value

    // Referencias para validación
    const texto_datosIn = document.getElementById('datos_excel')
    const error_texto_datos = document.getElementById('error-datos_excel')

    // Validaciones
    validarText(texto_datosIn, error_texto_datos)

    if (!texto_datos) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Divide filas y columnas
    const filas = texto_datos.split('\n');
    let conteosInsertados = 0;

    for (let fila of filas) {
        const columnas = fila.split('\t');
        if (columnas.length < 4) continue;

        const codigo = columnas[0].trim();
        const nombreAlmacen = columnas[1].trim().toUpperCase();
        const stock_real = parseInt(columnas[2].trim());
        const observaciones = columnas[3].trim();

        // Asignar valores en base a los mapas
        const id_almacen = mapaAlmacenes[nombreAlmacen];

        const id_producto = await buscarProducto(codigo, id_almacen);

        // Insertar en Supabase
        const nuevoConteo = {
            id_producto,
            stock_real,
            observaciones
        };

        await insertarConteo(nuevoConteo);
        conteosInsertados++;
    }

    alert(`Se agregaron ${conteosInsertados} conteos.`);
    // Reiniciar formulario y eliminar validaciones visuales
    formulario.reset();
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recargar tabla con datos actualizados
    const conteosActualizados = await obtenerConteosCompletos();
    generarTablaConteos(conteosActualizados);
});

// Evento al dar click al botón Agregar conteo
document.getElementById('btn_add_manual').addEventListener('click', async function(event) {
    event.preventDefault()
    const formulario = document.getElementById('form_manual');

    // Obtener valores de inputs
    const almacen = document.getElementById('almacen_manual').value
    const id_producto = document.getElementById('producto_manual').value
    const stock_real = document.getElementById('cantidad_manual').value
    const observaciones = document.getElementById('observaciones_manual').value

    // Referencias para validación
    const almacenIn = document.getElementById('almacen_manual')
    const id_productoIn = document.getElementById('producto_manual')
    const stock_realIn = document.getElementById('cantidad_manual')
    const observacionesIn = document.getElementById('observaciones_manual')

    const error_almacen = document.getElementById('error-almacen_manual')
    const error_producto = document.getElementById('error-producto_manual')
    const error_stock_real = document.getElementById('error-cantidad_manual')
    const error_observaciones = document.getElementById('error-observaciones_manual')

    // Validaciones
    validarSelect(almacenIn, error_almacen)
    validarSelect(id_productoIn, error_producto)
    validarCantidad(stock_realIn, error_stock_real)
    validarText(observacionesIn, error_observaciones)

    if (!almacen || !id_producto || !stock_real || !observaciones) {
        alert('Por favor, complete todos los campos para agregar la entrada.')
        return
    }

    const campos = document.querySelectorAll('input, select')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    let fecha_conteo = new Date().toISOString().split('T')[0];

    // Insertar en Supabase
    const nuevoConteo = { id_producto, stock_real, observaciones, fecha_conteo }
    await insertarConteo(nuevoConteo)
    alert('Movimiento agregado con éxito');
    formulario.reset();
    // Eliminar validaciones visuales
    formulario.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Recarga la tabla con los datos actualizados
    const conteosActualizados = await obtenerConteosCompletos();
    generarTablaConteos(conteosActualizados);
})

// Cargar los almacenes, productos y registros al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    cargarOpciones('almacen_manual', 'almacenes', 'id_almacen', 'nombre')
    generarTablaConteos()

    const conteosProcesados = await obtenerConteosCompletos();
    if (conteosProcesados) {
        generarTablaConteos(conteosProcesados);
    }
})

// Declarar los botones de editar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('conteo-btn')) {
        const conteoData = JSON.parse(e.target.getAttribute('data-conteo'));
        cargarDatosEnModal(conteoData);
    }
});

// Función para cargar datos en el modal
function cargarDatosEnModal(conteo) {
    // Campos no editables (solo lectura)
    document.getElementById('edit_id_conteo').value = conteo.id_conteo;
    document.getElementById('edit_id_display').value = conteo.id_conteo;
    document.getElementById('edit_fecha').value = conteo.fecha_conteo;
    document.getElementById('edit_producto').value = conteo.codigo;
    document.getElementById('edit_almacen').value = conteo.almacen;

    // Campos editables
    document.getElementById('edit_cantidad').value = conteo.stock_real;
    document.getElementById('edit_observaciones').value = conteo.observaciones;
}

// Función para guardar cambios
document.getElementById('btn_guardar_cambios').addEventListener('click', async function () {
    const id_conteo = document.getElementById('edit_id_conteo').value;
    const stock_real = document.getElementById('edit_cantidad').value;
    const observaciones = document.getElementById('edit_observaciones').value;

    // Referencias para validación
    const stock_realIn = document.getElementById('edit_cantidad');
    const observacionesIn = document.getElementById('edit_observaciones');

    const error_stock_real = document.getElementById('error-editCantidad');
    const error_observaciones = document.getElementById('error-editObservaciones');

    // Validaciones
    validarCantidad(stock_realIn, error_stock_real)
    validarText(observacionesIn, error_observaciones)

    // Validar campos requeridos
    if (!stock_real || !observaciones) {
        alert('Por favor, complete todos los campos obligatorios');
        return;
    }

    const campos = document.querySelectorAll('input')
    if (!validarCamposInvalidos(campos)) {
        alert('Corrige los errores antes de guardar.')
        return
    }

    // Actualizar en Supabase
    const { data, error } = await supabase
        .from('conteos')
        .update({
            stock_real: stock_real,
            observaciones: observaciones
        })
        .eq('id_conteo', id_conteo);

    if (error) {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el conteo: ' + error.message);
    } else {
        alert('Conteo actualizado correctamente');
        const conteosActualizados = await obtenerConteosCompletos();
        generarTablaConteos(conteosActualizados);
        bootstrap.Modal.getInstance(document.getElementById('conteo_modal')).hide();
    }
});

// Eliminar entrada al dar click en el botón del segundo modal
document.getElementById('btn_eliminar_entrada').addEventListener('click', async () => {
    const idConteo = document.getElementById('edit_id_conteo').value;

    if (!idConteo) {
        alert('No se pudo obtener el ID del conteo a eliminar.');
        return;
    }

    const { error } = await supabase
        .from('conteos')
        .delete()
        .eq('id_conteo', idConteo);

    if (error) {
        console.error('Error eliminando conteo:', error);
        alert('Ocurrió un error al eliminar el conteo.');
        return;
    }

    // Cerrar los modales
    const consultaModal = bootstrap.Modal.getInstance(document.getElementById('consulta_modal'));
    if (consultaModal) consultaModal.hide();

    const conteoModal = bootstrap.Modal.getInstance(document.getElementById('conteo_modal'));
    if (conteoModal) conteoModal.hide();

    // Recarga la tabla con los datos actualizados
    const conteosActualizados = await obtenerConteosCompletos();
    generarTablaConteos(conteosActualizados);

    // Mensaje de éxito
    alert('Conteo eliminado correctamente.');
});
