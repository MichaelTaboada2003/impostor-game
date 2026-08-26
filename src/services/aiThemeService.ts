import { Theme, WordEntry } from '../types/game';
import { storageService } from './storageService';

// Default API Key fallback from environment or bundle
const DEFAULT_GROQ_KEY =
    process.env.EXPO_PUBLIC_GROQ_API_KEY ||
    process.env.APY_GROP ||
    '';

export interface GenerateThemeOptions {
    topic: string;
    vibe?: 'casual' | 'experto' | 'picante' | 'familiar';
    wordCount?: number;
    apiKey?: string;
}

export const AI_SUGGESTION_CHIPS = [
    { title: '🍿 Series y Películas', icon: '🎬', prompt: 'Series de TV y Películas Populares' },
    { title: '🎮 Videojuegos Épicos', icon: '👾', prompt: 'Videojuegos Populares y Personajes Famosos' },
    { title: '🌮 Comidas Callejeras', icon: '🌭', prompt: 'Comida Rápida y Antojitos Latinos' },
    { title: '🚀 Ciencia Ficción', icon: '👽', prompt: 'Ciencia Ficción, Espacio y Futuro' },
    { title: '💼 Vida de Oficina', icon: '👔', prompt: 'Vida Godín, Oficina y Trabajo' },
    { title: '🔥 Chismes & Farándula', icon: '💅', prompt: 'Farándula, Famosos y Celebridades' },
    { title: '🧙 Magia y Fantasía', icon: '🪄', prompt: 'Mundo Mágico, Hechizos y Criaturas Fantásticas' },
    { title: '⚽ Fútbol y Campeones', icon: '🏆', prompt: 'Fútbol Mundial, Jugadores y Equipos Históricos' },
];

// Offline fallback theme templates in case of network unavailability
const OFFLINE_THEME_TEMPLATES: Record<string, Theme> = {
    'series-tv': {
        id: 'ia-series-tv',
        name: 'Series de TV',
        icon: '📺',
        color: '#E50914',
        isAiGenerated: true,
        words: [
            { word: 'Stranger Things', hint: 'Monstruos', undercoverPair: 'Dark' },
            { word: 'Breaking Bad', hint: 'Química', undercoverPair: 'Ozark' },
            { word: 'Juego de Tronos', hint: 'Dragones', undercoverPair: 'Vikingos' },
            { word: 'La Casa de Papel', hint: 'Máscaras', undercoverPair: 'Lupin' },
            { word: 'The Walking Dead', hint: 'Apocalipsis', undercoverPair: 'The Last of Us' },
            { word: 'Friends', hint: 'Café', undercoverPair: 'How I Met Your Mother' },
            { word: 'The Office', hint: 'Papel', undercoverPair: 'Parks and Recreation' },
            { word: 'Black Mirror', hint: 'Tecnología', undercoverPair: 'Love Death and Robots' },
            { word: 'Peaky Blinders', hint: 'Gángsters', undercoverPair: 'Boardwalk Empire' },
            { word: 'Squid Game', hint: 'Juegos', undercoverPair: 'Alice in Borderland' },
        ],
    },
    'futbol-mundial': {
        id: 'ia-futbol-mundial',
        name: 'Fútbol Mundial',
        icon: '⚽',
        color: '#27AE60',
        isAiGenerated: true,
        words: [
            { word: 'Messi', hint: 'Zurda', undercoverPair: 'Cristiano Ronaldo' },
            { word: 'Cristiano Ronaldo', hint: 'Potencia', undercoverPair: 'Messi' },
            { word: 'Neymar', hint: 'Magia', undercoverPair: 'Ronaldinho' },
            { word: 'Mbappé', hint: 'Velocidad', undercoverPair: 'Haaland' },
            { word: 'Real Madrid', hint: 'Copas', undercoverPair: 'Barcelona' },
            { word: 'Barcelona', hint: 'Toque', undercoverPair: 'Real Madrid' },
            { word: 'Mundial', hint: 'Naciones', undercoverPair: 'Champions League' },
            { word: 'Penal', hint: 'Doce pasos', undercoverPair: 'Tiro libre' },
            { word: 'Árbitro', hint: 'Silbato', undercoverPair: 'VAR' },
            { word: 'Estadio', hint: 'Tribunas', undercoverPair: 'Cancha' },
        ],
    },
};

export const aiThemeService = {
    /**
     * Generates a new theme using Groq LLM API
     */
    async generateTheme(options: GenerateThemeOptions): Promise<Theme> {
        const { topic, vibe = 'casual', wordCount = 18, apiKey } = options;
        const key = apiKey?.trim() || DEFAULT_GROQ_KEY;

        const vibeInstructions: Record<string, string> = {
            casual: 'Palabras y conceptos divertidos, familiares y accesibles para cualquier jugador.',
            experto: 'Conceptos más específicos, detallados o desafiantes para jugadores conocedores.',
            picante: 'Conceptos atrevidos, jocosos y llenos de picardía para fiestas entre adultos.',
            familiar: 'Conceptos totalmente aptos para todas las edades y niños.',
        };

        const systemPrompt = `Eres un diseñador experto de juegos de mesa y fiesta como Impostor, Spyfall y Undercover.
Tu misión es generar una temática de juego divertida, personalizada y perfectamente equilibrada según el tema indicado por el usuario.

CONTEXTO CULTURAL Y AUDIENCIA:
- Los jugadores son de COLOMBIA y Latinoamérica.
- Todas las palabras deben ser 100% CONGRUENTES, POPULARES, COTIDIANAS y FÁCILES DE ADIVINAR en el contexto colombiano/latinoamericano.
- REGLA CRÍTICA: NUNCA incluyas conceptos oscuros, términos en idiomas extranjeros raros o comidas/objetos exóticos que nadie conoce en Colombia (por ejemplo: JAMÁS pongas 'Pho', 'Dim Sum', 'Falafel', 'Kebab', 'Bao', etc. En su lugar, prioriza cosas conocidas como 'Empanada', 'Arepa', 'Salchipapa', 'Bandeja Paisa', 'Hamburguesa', 'Perro Caliente', 'Ajiaco', 'Pizza', 'Sancocho', etc.).
- Si el tema es sobre música, cultura, lugares o vida cotidiana, prioriza referentes familiares en Colombia y Latinoamérica.

Debes responder EXCLUSIVAMENTE con un objeto JSON válido que cumpla esta estructura:
{
  "id": "slug-unico-en-minusculas-sin-espacios",
  "name": "Nombre Atractivo del Tema",
  "icon": "UN SOLO EMOJI APROPIADO",
  "color": "#HEXCOLOR (color vibrante y moderno como #6C5CE7, #FF4757, #00CEC9, #FD79A8, #E67E22, #9B59B6)",
  "words": [
    {
      "word": "Palabra o Concepto en Español (Claro, popular y reconocible)",
      "hint": "Pista sutil de 1 o 2 palabras para que el impostor pueda disimular",
      "undercoverPair": "Palabra similar o del mismo universo para modo Undercover"
    }
  ]
}

Reglas obligatorias:
1. Genera exactamente entre ${Math.max(12, wordCount - 2)} y ${wordCount + 2} palabras.
2. Cada palabra debe ser ampliamente conocida por cualquier persona en Colombia.
3. El campo 'hint' debe ser breve (1 a 2 palabras), ingenioso y sutil (no obvio pero que dé una idea de contexto).
4. El campo 'undercoverPair' debe ser otra palabra relacionada y parecida pero distinta.
5. El tono es: ${vibeInstructions[vibe] || vibeInstructions.casual}.
6. Devuelve ÚNICAMENTE el objeto JSON válido.`;

        const userPrompt = `Crea el tema para el juego Impostor sobre: "${topic}". Recuerda el contexto cultural de Colombia.`;


        const modelsToTry = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
        let lastError: any = null;

        for (const model of modelsToTry) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.7,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`Groq model ${model} failed (${response.status}):`, errorText);
                    lastError = new Error(`Error API (${response.status}): ${errorText}`);
                    continue;
                }

                const jsonResponse = await response.json();
                const content = jsonResponse.choices?.[0]?.message?.content;
                if (!content) {
                    continue;
                }

                // Clean potential markdown quotes
                let cleanedJson = content.trim();
                if (cleanedJson.startsWith('```')) {
                    cleanedJson = cleanedJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
                }

                const parsed = JSON.parse(cleanedJson);

                // Sanitize and validate
                const words: WordEntry[] = (parsed.words || []).map((w: any) => ({
                    word: String(w.word || '').trim(),
                    hint: String(w.hint || '').trim(),
                    undercoverPair: w.undercoverPair ? String(w.undercoverPair).trim() : undefined,
                })).filter((w: WordEntry) => w.word.length > 0);

                if (words.length < 5) {
                    throw new Error('La IA generó menos de 5 palabras válidas.');
                }

                const finalTheme: Theme = {
                    id: `ia_${Date.now()}_${(parsed.id || topic).toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                    name: parsed.name || topic,
                    icon: parsed.icon || '✨',
                    color: parsed.color?.startsWith('#') ? parsed.color : '#8E44AD',
                    words,
                    isAiGenerated: true,
                    createdAt: Date.now(),
                    description: `Generado por IA sobre "${topic}"`,
                };

                // Automatically save to local persistent storage
                await storageService.saveCustomTheme(finalTheme);

                return finalTheme;
            } catch (err: any) {
                console.error(`Error attempting model ${model}:`, err);
                lastError = err;
            }
        }

        // If network/API failed, check if we have a match in offline templates
        const normalized = topic.toLowerCase();
        for (const [key, template] of Object.entries(OFFLINE_THEME_TEMPLATES)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return template;
            }
        }

        // Generate synthetic smart fallback theme if all else fails
        const fallbackTheme: Theme = {
            id: `ia_custom_${Date.now()}`,
            name: topic.charAt(0).toUpperCase() + topic.slice(1),
            icon: '🎲',
            color: '#6C5CE7',
            isAiGenerated: true,
            createdAt: Date.now(),
            description: `Tema creado sobre "${topic}"`,
            words: [
                { word: `${topic} 1`, hint: 'Clásico' },
                { word: `${topic} 2`, hint: 'Popular' },
                { word: `${topic} 3`, hint: 'Famoso' },
                { word: `${topic} 4`, hint: 'Secreto' },
                { word: `${topic} 5`, hint: 'Legendario' },
            ],
        };

        if (lastError) {
            throw new Error(`No se pudo conectar con la IA de Groq. ${lastError.message || ''}`);
        }

        return fallbackTheme;
    },
};
