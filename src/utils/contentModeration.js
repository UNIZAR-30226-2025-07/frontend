// Lista de palabras prohibidas (ampliar según necesidades)
const PROHIBITED_WORDS = [
  "idiota", "tonto", "estúpido", "imbécil", "gilipollas", 
  "cabrón", "puta", "hijo de puta", "mierda", "jodido",
  // Añade más palabras según sea necesario
];

// Expresiones regulares para detectar variaciones (con espacios, caracteres especiales)
const WORD_BOUNDARIES = /\b|\s|\.|,|!|\?|:|;|-|_|\//g;

export function containsProhibitedContent(text) {
  if (!text) return false;
  
  // Convertir a minúsculas para hacer la comparación insensible a mayúsculas
  const lowerText = text.toLowerCase();
  
  // Verificar palabras exactas o con pequeñas modificaciones
  return PROHIBITED_WORDS.some(word => {
    // Buscar la palabra con límites de palabra
    const regex = new RegExp(`(^|\\s|[.,!?:;\\-_/])${word}($|\\s|[.,!?:;\\-_/])`, 'i');
    return regex.test(lowerText);
  });
}

export function moderateContent(text) {
  if (!text) return "";
  
  let moderatedText = text;
  
  // Reemplazar palabras prohibidas con asteriscos
  PROHIBITED_WORDS.forEach(word => {
    const regex = new RegExp(`(^|\\s|[.,!?:;\\-_/])${word}($|\\s|[.,!?:;\\-_/])`, 'gi');
    moderatedText = moderatedText.replace(regex, (match, p1, p2) => {
      // p1 es el carácter inicial (espacio, puntuación, etc.)
      // p2 es el carácter final
      // Reemplazar solo la palabra, manteniendo los caracteres de alrededor
      return p1 + '*'.repeat(word.length) + p2;
    });
  });
  
  return moderatedText;
}