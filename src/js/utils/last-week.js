import supabase from "../supabase/supabase-client";

// Función para obtener la última semana registrada de conteos
export async function obtainLastWeek() {
    const { data, error } = await supabase
        .from('inv_movimientos')
        .select('semana, anio')
        .order('anio', { ascending: false })
        .order('semana', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error obteniendo última semana:', error);
        return null;
    }

    return data?.[0] || null;
}
