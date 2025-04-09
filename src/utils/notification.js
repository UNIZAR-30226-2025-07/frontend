//Importar css
import '../styles/notification.css';

// Función para mostrar notificación
export const showNotification = (message, type) => {
    const notification = document.getElementById("notification");

    if (notification) {
        console.log("Se debería mostrar la notificacion");
        notification.textContent = message;
        notification.className = `notification ${type}`; // 'success' o 'error'
        notification.style.display = 'block';  // Asegura que la notificación se muestra

        // Después de 5 segundos, empezamos a ocultar la notificación de forma gradual
        setTimeout(() => {
        notification.style.opacity = "0";  // Comienza el desvanecimiento
        }, 2000);

        // Después de la animación de desvanecimiento (1 segundo), ocultamos el elemento
        setTimeout(() => {
        notification.style.display = 'none';
        notification.style.opacity = "1";  // Resetear la opacidad para futuras notificaciones
        }, 3000);  // 5 segundos de visibilidad + 1 segundo de desvanecimiento
    }
}

