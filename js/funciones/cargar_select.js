
import supabase from '../supabase/supabase-client.js'

// Función para cargar datos en los select del formulario
export async function cargarOpciones(selectId, tabla, valueKey, textKey, valorSeleccionado = '0') {
    const select = document.getElementById(selectId)
    if (!select) return

    if (valorSeleccionado !== '0') {
        select.innerHTML = '';
    }
    
    const { data, error } = await supabase.from(tabla).select(`${valueKey}, ${textKey}`)

    if (error) {
        console.error(`Error cargando ${tabla}:`, error)
        return
    }

    data.forEach(item => {
        const option = document.createElement('option')
        option.value = item[valueKey]
        option.textContent = item[textKey]

        // Si el valor coincide, marcar como seleccionado
        if (valorSeleccionado && item[valueKey] === valorSeleccionado) {
            option.selected = true
        }

        select.appendChild(option)
    })
}