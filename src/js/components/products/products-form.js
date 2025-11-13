import supabase from '../../supabase/supabase-client.js'
// Servicios Supabase
import { createProduct } from '../../services/products-service.js'; 
import { renderProductsTable } from './products-table.js'; 
// Utilidades
import { textValidate, codeValidate, inputValidate, selectValidate } from '../../utils/form-validations.js';

// Mapeo de nombre de almacén a ID
const storeMap = {
    'NAVE 1': 1,
    'NAVE 2': 2,
    'NAVE 3': 3,
    'PRODUCCION':4,
    'MATERIA PRIMA':5
};

// Función para agregar un producto de forma manual
export async function addManualProduct(event) {
    event.preventDefault()

    // Capturar el botón que disparó el evento
    const btn = event.target.closest('#btn-add-manual');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Subiendo...';
    }

    const form = document.getElementById('form-manual');
    // Referencias para validación
    const codigoIn = document.getElementById('codigo')
    const nombreIn = document.getElementById('nombre')
    const id_almacenIn = document.getElementById('almacen')
    const descripcionIn = document.getElementById('descripcion')
    // Referencias para errores
    const codigoError = document.getElementById('error-codigo')
    const nombreError = document.getElementById('error-nombre')
    const almacenError = document.getElementById('error-almacen')
    const descripcionError = document.getElementById('error-descripcion')

    // Validaciones
    codeValidate(codigoIn, codigoError)
    textValidate(nombreIn, nombreError)
    selectValidate(id_almacenIn, almacenError)
    textValidate(descripcionIn, descripcionError)

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

    let fecha_creacion = new Date().toISOString().split('T')[0];

    // Guardar valores
    const newProductData = {
        codigo: codigoIn.value, 
        nombre: nombreIn.value, 
        id_almacen: id_almacenIn.value, 
        descripcion: descripcionIn.value, 
        fecha_creacion
    };

    try {
        await createProduct(newProductData);
        alert('Producto agregado con éxito.');
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
            e.classList.remove('is-valid', 'is-invalid');
        });
    
        // Recarga la tabla con los datos actualizados
        await renderProductsTable();
    } catch (err) {
        console.error('Error al agregar producto:', err);
        alert('Ocurrió un error al agregar el producto.');
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

// Función para agregar clientes con el formato de Excel
export async function addExcelProduct(event) {
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
    const excelDataError = document.getElementById('error-excel-data')

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

    // Dividir las filas y columnas
    const rows = excelData.split('\n');
    let insertedProducts = 0;

    for (let row of rows) {
        const columns = row.split('\t');
        if (columns.length < 4) continue;

        const codigo = columns[0].trim();
        const nombre = columns[1].trim();
        const nombreAlmacen = columns[2].trim().toUpperCase();
        const descripcion = columns[3].trim();
        let fecha_creacion = new Date().toISOString().split('T')[0];

        // Asignar almacén en base al mapa
        const id_almacen = storeMap[nombreAlmacen];

        // Insertar en Supabase
        const newProductData = {
            codigo,
            nombre,
            id_almacen,
            descripcion,
            fecha_creacion
        };

        try {
            await createProduct(newProductData);
            insertedProducts++;
        } catch (err) {
            console.error('Error al insertar producto:', newProductData, err);
        } 
    }

    alert(`Se agregaron ${insertedProducts} productos.`);
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
    await renderProductsTable();
};