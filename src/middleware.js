function getCookie(name, cookies = '') {
    // Si no se pasan cookies, intenta usar document.cookie (solo en el cliente)
    if (!cookies && typeof document !== 'undefined') {
      cookies = document.cookie;
    }
  
    // Buscar la cookie por nombre
    return cookies
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(`${name}=`))
      ?.split('=')[1] || null;
  }

export function onRequest(context, next) {
    console.log('Middleware ejecutado para:', context.request.url);
    // Obtener la URL actual
    const url = new URL(context.request.url);
    const rutaProtegida = url.pathname;
    
    // Lista de rutas protegidas
    const rutasAdmin = ['/admin'];
    const rutasProtegidas = ['/profile', '/seasonPass', '/store', '/achievements', '/friends', '/requests', '/createPG', '/joinPG' ]; // añade las que necesites
    
    // Obtener las cookies del encabezado
    const cookies = context.request.headers.get('cookie') || '';
    const tokenAutenticacion = getCookie('accessToken' , cookies); // Obtener el token de autenticación

    const adminCookie = getCookie('admin', cookies); // Obtener la cookie de admin

    // Verificar si el usuario es administrador
    const isAdmin = adminCookie === '678ugJHGJH86687678GJHGhjghADMIN';

    // Verificar si la ruta actual está protegida
    if (rutasProtegidas.includes(rutaProtegida)) {
        // Comprobar si el usuario tiene autorización (por ejemplo, un token en las cookies)
        if (!tokenAutenticacion) {
        // Redirigir al inicio o página de login
        return context.redirect('/login');
        }
    }

    // Verificar si la ruta es de admin y si el usuario tiene el rol de admin
    if (rutasAdmin.includes(rutaProtegida)) {
        if (!tokenAutenticacion || !isAdmin) {
            // Redirigir a una página de error o inicio
            return context.redirect('/login'); // Cambia '/error' por la ruta que desees
        }
    }
    
    // Si pasa la vear con la srificación, continuolicitud
    return next();
  }