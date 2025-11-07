import supabase from "../supabase/supabase-client";

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