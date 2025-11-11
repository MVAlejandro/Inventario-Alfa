import supabase from "../supabase/supabase-client";
// Servicios Supabase
import { getMovements } from '../services/movements-service.js'; 

// Función para cargar datos en los select del formulario
export async function loadOptions(selectId, table, valueKey, textKey, selectedValue = '0') {
    const select = document.getElementById(selectId)
    if (!select) return

    if (selectedValue !== '0') {
        select.innerHTML = '';
    }
    
    const { data, error } = await supabase.from(table).select(`${valueKey}, ${textKey}`)

    if (error) {
        console.error(`Error cargando ${table}:`, error)
        return
    }

    data.forEach(item => {
        const option = document.createElement('option')
        option.value = item[valueKey]
        option.textContent = item[textKey]

        // Si el valor coincide, marcar como seleccionado
        if (selectedValue && item[valueKey] === selectedValue) {
            option.selected = true
        }

        select.appendChild(option)
    })
}

// Función para cargar datos en relación a los movimientos registrados
export async function loadOptionsFilter(selectId, fields, defaultOption, selectedValue = '0') {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Limpiar contenido previo
    select.innerHTML = '';

    // Obtener movimientos
    const allMovements = await getMovements();
    if (!allMovements) return;

    // Generar opciones según los campos
    const opciones = allMovements.map(m => {
        if (Array.isArray(fields)) {
            // Combinar varios campos
            return fields.map(f => m[f]).filter(Boolean).join(' - ');
        } else {
            // Solo un campo
            return m[fields];
        }
    });

    // Eliminar duplicados y valores vacíos
    const uniqueOptions = [...new Set(opciones)].filter(v => v);

    // Agregar opción por defecto
    const defaultOptionEl = document.createElement('option');
    defaultOptionEl.value = '0';
    defaultOptionEl.textContent = defaultOption;
    select.appendChild(defaultOptionEl);

    // Agregar opciones al select
    uniqueOptions.forEach(opcion => {
        const optionEl = document.createElement('option');
        optionEl.value = opcion;
        optionEl.textContent = opcion;

        // Marcar como seleccionado si coincide con selectedValue
        if (selectedValue && opcion === selectedValue) {
            optionEl.selected = true;
        }

        select.appendChild(optionEl);
    });
}


export async function loadProducts(storeId) {
    const { data, error } = await supabase
        .from('inv_productos')
        .select('id_producto, codigo')
        .eq('id_almacen', storeId);

    const selectProducto = document.getElementById('producto');
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