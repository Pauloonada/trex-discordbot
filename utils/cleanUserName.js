export default function cleanUserName(user) {
  return [...user]
    .map(c => {
      const code = c.charCodeAt(0);
      // Remove letras matemáticas, góticas, símbolos doidos
      if (
        (code >= 0x1D400 && code <= 0x1D7FF) || // letras/símbolos matemáticos
        (code >= 0x2460 && code <= 0x24FF) ||   // símbolos circulares
        (code >= 0x1F100 && code <= 0x1F9FF)    // emojis e afins (se quiser remover)
      ) return '';
      return c;
    })
    .join('');
}