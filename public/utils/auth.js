// Función para decodificar el JWT (sin verificar la firma, ya que es del cliente)
const decodeJWT = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload;
    } catch (error) {
        console.error("Error decodificando el JWT:", error);
        return null;
    }
};

// Función para obtener el ID del usuario desde el accessToken en las cookies
export const getUserIdFromAccessToken = () => {
    // Asegúrate de que solo accedemos a cookies en el navegador (client-side)
    if (typeof document !== "undefined") {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === "accessToken") {
                const payload = decodeJWT(value);
                return payload?.id || null;
            }
        }
    }
    return null;
};