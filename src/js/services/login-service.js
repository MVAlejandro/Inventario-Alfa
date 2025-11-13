import supabase from '../supabase/supabase-client.js'

// Función para obtener la sesión actual
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }

  const { session } = data;
  if (!session) return null;

  return session;
}

// Función para obtener el rol del perfil
export async function getUserRole(session) {
  if (!session) {
    console.warn('No hay sesión activa');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return null;
  }

  return data.rol;
}
