//testGemini.ts
// Archivo para probar la conexión con Gemini
// Ejecuta esto desde tu componente para verificar que todo funciona

export async function testGeminiConnection() {
    const API_KEY = process.env.EXPO_PUBLIC_GENAI_API_KEY;
    
    console.log('🔑 API Key (primeros 10 caracteres):', API_KEY?.substring(0, 10));
    console.log('🔑 API Key está definida:', !!API_KEY);
    
    if (!API_KEY || API_KEY === 'undefined') {
      console.error('❌ API Key no está configurada correctamente');
      return false;
    }
  
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;


    
    try {
      console.log('🚀 Intentando conectar con Gemini...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Responde solo "Hola" en español'
                }
              ]
            }
          ]
        })
      });
  
      const responseText = await response.text();
      console.log('📥 Respuesta completa:', responseText);
  
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status);
        console.error('❌ Detalle:', responseText);
        return false;
      }
  
      const data = JSON.parse(responseText);
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      console.log('✅ Conexión exitosa!');
      console.log('📝 Respuesta de la IA:', result);
      
      return true;
    } catch (error) {
      console.error('❌ Error en la prueba:', error);
      return false;
    }
  }
  
  // Función para verificar que el .env está cargado
  export function checkEnvVariables() {
    console.log('=== Verificación de Variables de Entorno ===');
    console.log('EXPO_PUBLIC_GENAI_API_KEY:', process.env.EXPO_PUBLIC_GENAI_API_KEY ? '✅ Definida' : '❌ No definida');
    console.log('Todas las variables EXPO_PUBLIC_*:', 
      Object.keys(process.env)
        .filter(key => key.startsWith('EXPO_PUBLIC_'))
    );
  }