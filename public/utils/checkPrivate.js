import { getUserIdFromAccessToken } from "./auth";
import { fetchWithToken } from "./fetchWithToken";
//Función para comprobar si hay que eliminar una partida privada o a un jugador de una partida privada
export const checkPrivate = async () => {
    //Comprobar si existe una cookie "leader"
    //Guardar una cookie
    
    if (typeof document === 'undefined') {
        console.error('❌ Este código solo debe ejecutarse en el cliente.');
        return;
    }
    const cookies = document.cookie.split('; ');
    let leaderId = null;
    let gameId = null;
    let gamePasswd = null;

    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === 'leader') leaderId = value;
      if (key === 'gameId') gameId = value;
      if (key === 'gamePasswd') gamePasswd = value;
    }
    if (leaderId) {
        const userId = getUserIdFromAccessToken();

        if (leaderId === userId) {
            // Eliminar la partida privada si el usuario es el líder
            const deleteResponse = await fetchWithToken(`http://galaxy.t2dc.es:3000/private/delete/${gameId}`, {
              method: '',
            });
    
            if (!deleteResponse.ok) {
              console.error('❌ Error al eliminar la partida privada:', await deleteResponse.text());
              return;
            }
    
            console.log('✅ Partida privada eliminada exitosamente.');
        } else {
            // Eliminar al usuario de la partida privada si no es el líder
            const deleteUserResponse = await fetchWithToken(
              `http://galaxy.t2dc.es:3000/private/deleteUserFromPrivate/${gameId}/${userId}`,
              {
                method: 'DELETE',
              }
            );
    
            if (!deleteUserResponse.ok) {
              console.error('❌ Error al eliminar al usuario de la partida privada:', await deleteUserResponse.text());
              return;
            }
    
            console.log('✅ Usuario eliminado de la partida privada exitosamente.');
        }
        document.cookie = 'gameId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
        document.cookie = 'gamePasswd=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
        document.cookie = 'leader=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';
    }
}


