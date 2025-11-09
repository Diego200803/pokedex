import { Pokemon } from '../types/Pokemon';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GENAI_API_KEY;

// 🔄 Lista de modelos para probar en orden
const MODELS_TO_TRY = [
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash-latest',
];

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class GeminiService {
  private pokemonContext: Pokemon[] = [];
  private workingModel: string | null = null;

  setPokemonContext(pokemon: Pokemon[]) {
    this.pokemonContext = pokemon;
  }

  private buildSystemPrompt(): string {
    const pokemonSample = this.pokemonContext.slice(0, 50).map(p => 
      `${p.name} (#${p.id}): ${p.types.map(t => t.type.name).join('/')}`
    ).join(', ');

    return `Eres un experto asistente de Pokédex. Tienes acceso a información de ${this.pokemonContext.length} Pokémon.

Algunos Pokémon: ${pokemonSample}

Responde en español de forma amigable y concisa sobre Pokémon (máximo 3-4 oraciones).`;
  }

  // Probar cada modelo hasta encontrar uno que funcione
  private async findWorkingModel(): Promise<string> {
    if (this.workingModel) {
      return this.workingModel;
    }

    console.log('🔍 Buscando modelo compatible...');

    for (const model of MODELS_TO_TRY) {
      try {
        console.log(`   Probando: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Di solo "OK"' }] }]
          })
        });

        if (response.ok) {
          console.log(`   ✅ ${model} funciona!`);
          this.workingModel = model;
          return model;
        } else {
          console.log(`   ❌ ${model} no disponible (${response.status})`);
        }
      } catch (error) {
        console.log(`   ❌ ${model} falló`);
      }
    }

    throw new Error('Ningún modelo de Gemini está disponible para tu API Key. Verifica tu configuración en https://aistudio.google.com');
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'undefined') {
        throw new Error('❌ API Key no configurada. Verifica tu archivo .env');
      }

      // Buscar un modelo que funcione
      const model = await this.findWorkingModel();
      console.log(`🚀 Usando modelo: ${model}`);

      const systemPrompt = this.buildSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nPregunta: ${userMessage}\n\nRespuesta:`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
            topP: 0.9,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, responseText);
        
        if (response.status === 400) {
          throw new Error('Configuración inválida. Verifica tu API Key.');
        }
        if (response.status === 403) {
          throw new Error('API Key sin permisos. Crea una nueva en https://aistudio.google.com/app/apikey');
        }
        if (response.status === 404) {
          // Si el modelo que funcionó ahora da 404, resetear
          this.workingModel = null;
          throw new Error('Modelo no disponible. Intenta de nuevo.');
        }
        if (response.status === 429) {
          throw new Error('Límite de solicitudes alcanzado. Espera unos minutos.');
        }
        
        throw new Error(`Error ${response.status}`);
      }

      const data = JSON.parse(responseText);
      
      if (data.promptFeedback?.blockReason) {
        throw new Error('Solicitud bloqueada por seguridad.');
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        console.error('❌ Respuesta inválida:', data);
        throw new Error('No se recibió respuesta válida.');
      }

      console.log('✅ Respuesta recibida');
      return aiResponse.trim();
    } catch (error) {
      console.error('❌ Error en sendMessage:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error al comunicarse con la IA.');
    }
  }

  async getPokemonSuggestion(criteria: string): Promise<string> {
    const message = `Recomienda 3 Pokémon para: ${criteria}. Sé breve.`;
    return this.sendMessage(message);
  }

  async comparePokemon(pokemon1: string, pokemon2: string): Promise<string> {
    const message = `Compara ${pokemon1} vs ${pokemon2} brevemente.`;
    return this.sendMessage(message);
  }
}