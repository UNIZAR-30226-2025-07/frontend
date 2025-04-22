async function refreshAccessToken() {
    try {
        // Obtener el refresh token de las cookies
        const refreshToken = getCookie('refreshToken');
        
        if (!refreshToken) {
        // Redirigir al login si no hay refresh token
        //window.location.href = "/login";
        return null;
        }
        
        const response = await fetch("http://localhost:3000/auth/refresh-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
        });
        
        if (response.ok) {
        const data = await response.json();
        // Guardar el nuevo access token
        document.cookie = `accessToken=${data.accessToken}; path=/; SameSite=Lax;`;
        return data.accessToken;
        } else {
        // Si hay error al refrescar, redirigir al login
        console.error("Error al refrescar el token");
        window.location.href = "/login";
        return null;
        }
    } catch (error) {
        console.error("Error al refrescar el token:", error);
        window.location.href = "/login";
        return null;
    }
}

// Función auxiliar para obtener cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export async function fetchWithToken(url, options = {}) {
    // Obtener el token actual
    let accessToken = getCookie('accessToken');
    
    // Si no hay opciones de headers, inicializar
    if (!options.headers) {
        options.headers = {};
    }
    
    // Configurar el Content-Type por defecto si no está definido
    if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
    }
    
    // Añadir el token a la solicitud
    if (accessToken) {
        options.headers["Auth"] = accessToken; // Usando el encabezado "Auth" como indicas
    }
    
    // Realizar la solicitud
    let response = await fetch(url, options);
    
    // Si la respuesta es 401 (Unauthorized), puede ser que el token expiró
    if (response.status === 401) {
      // Intentar refrescar el token
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Actualizar el token en la solicitud
        options.headers["Auth"] = newToken;
        // Reintentar la solicitud original
        return fetch(url, options);
      }
    }
    
    return response;
}
