import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { createCount } from '../../services/counts-service.js';
import { renderCountsTable } from './counts-table.js';  
// Utilidades
import { textValidate, amountValidate, inputValidate, selectValidate } from '../../utils/form-validations.js';

// Función para calcular y asignar semana_conteo y año
function getWeekAndYear(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // lunes=1, domingo=7

    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return { semana_conteo: week, anio_conteo: d.getUTCFullYear() };
}

// Mapeo de nombre de almacén a ID
const storeMap = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3,
    'PRODUCCION':4,
    'MATERIA PRIMA':5
};

// Función para buscar un producto por su código y almacén
async function searchProduct(codigo, id_almacen) {
    const { data, error } = await supabase
        .from('inv_productos')
        .select('id_producto')
        .eq('codigo', codigo)
        .eq('id_almacen', id_almacen)
        .maybeSingle();

    return data ? data.id_producto : null;
}

// Función para agregar un conteo de forma manual
export async function addManualCount(event) {
    event.preventDefault()

    // Capturar el botón que disparó el evento
    const btn = event.target.closest('#btn-add-manual');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Subiendo...';
    }

    const form = document.getElementById('form-manual');
    // Referencias para validación
    const almacenIn = document.getElementById('almacen')
    const id_productoIn = document.getElementById('producto')
    const stock_realIn = document.getElementById('cantidad')
    const observacionesIn = document.getElementById('observaciones')
    // Referencias para errores
    const almacenError = document.getElementById('almacen-error')
    const productoError = document.getElementById('producto-error')
    const stock_realError = document.getElementById('cantidad-error')
    const observacionesError = document.getElementById('observaciones-error')

    // Validaciones
    selectValidate(almacenIn, almacenError)
    selectValidate(id_productoIn, productoError)
    amountValidate(stock_realIn, stock_realError)
    textValidate(observacionesIn, observacionesError)

    const campos = form.querySelectorAll('input, select')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')

        // Restaurar estado del botón
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                    <path d="M11 2H9v3h2z"/>
                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                </svg>
                <p class="ps-2">Agregar</p>`;
        }
        return
    }

    const fecha_conteo = new Date();
    const { semana_conteo, anio_conteo } = getWeekAndYear(fecha_conteo);

    // Guardar valores
    const newCountData = {
        id_producto: id_productoIn.value, 
        stock_real: stock_realIn.value, 
        observaciones: observacionesIn.value,
        fecha_conteo: fecha_conteo.toISOString().split('T')[0],
        semana_conteo,
        anio_conteo
    };

    try {
        await createCount(newCountData);
        alert('Conteo agregado con éxito.');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
            e.classList.remove('is-valid', 'is-invalid');
        });
    
        // Recarga la tabla con los datos actualizados
        await renderCountsTable();
    } catch (err) {
        console.error('Error al agregar conteo:', err);
        alert('Ocurrió un error al agregar el conteo.');
    } finally {
        // Restaurar estado del botón
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                    <path d="M11 2H9v3h2z"/>
                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                </svg>
                <p class="ps-2">Agregar</p>`;
        }
    }
}

// Función para agregar conteos con el formato de Excel
export async function addExcelCount(event) {
    event.preventDefault();

    // Capturar el botón que disparó el evento
    const btn = event.target.closest('#btn-add-excel');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Subiendo...';
    }

    const form = document.getElementById('form-excel');
    // Referencias para validación y errores
    const excelData = document.getElementById('excel-data').value
    const excelDataIn = document.getElementById('excel-data')
    const excelDataError = document.getElementById('excel-data')

    // Validaciones
    textValidate(excelDataIn, excelDataError)

    if (!excelData) {
        alert('Por favor, ingrese la información para agregar la entrada.')
        // Restaurar estado del botón
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                    <path d="M11 2H9v3h2z"/>
                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
                </svg>
                <p class="ps-2">Agregar</p>`;
        }
        return
    }

    const campos = form.querySelectorAll('input')
    if (!inputValidate(campos)) {
        alert('Corrige los errores antes de guardar.')
        if (btn) btn.disabled = false;
        return
    }

    // Dividir las filas y columns
    const rows = excelData.split('\n');
    let insertedCounts = 0;

    for (let row of rows) {
        const columns = row.split('\t');
        if (columns.length < 3) continue;

        const codigo = columns[0].trim();
        const nombreAlmacen = columns[1].trim().toUpperCase();
        const stock_real = parseInt(columns[2].trim());
        const observaciones = columns[3].trim();
        const fecha_conteo = new Date();
        const { semana_conteo, anio_conteo } = getWeekAndYear(fecha_conteo);

        // Asignar valores en base a los mapas
        const id_almacen = storeMap[nombreAlmacen];
        const id_producto = await searchProduct(codigo, id_almacen);

        // Insertar en Supabase
        const newCountData = {
            id_producto,
            stock_real,
            observaciones,
            fecha_conteo: fecha_conteo.toISOString().split('T')[0],
            semana_conteo,
            anio_conteo
        };

        try {
            await createCount(newCountData);
            insertedCounts++;
        } catch (err) {
            console.error('Error al insertar conteo:', newCountData, err);
        }
    }

    alert(`Se agregaron ${insertedCounts} conteos.`);
    form.reset();
    form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
        e.classList.remove('is-valid', 'is-invalid');
    });

    // Restaurar estado del botón
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy pe-1" viewBox="0 0 16 16">
                <path d="M11 2H9v3h2z"/>
                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
            </svg>
            <p class="ps-2">Agregar</p>`;
    }

    // Recarga la tabla con los datos actualizados
    await renderCountsTable();
};