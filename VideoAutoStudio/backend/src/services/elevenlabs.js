const axios = require('axios');

class ElevenLabsService {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.baseURL = 'https://api.elevenlabs.io/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'xi-api-key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }
    
    // Get available voices
    async getVoices() {
        try {
            const response = await this.client.get('/voices');
            return response.data.voices;
        } catch (error) {
            console.error('Failed to fetch voices:', error);
            throw new Error('Could not fetch voices from ElevenLabs');
        }
    }
    
    // Generate voiceover from text
    async generateVoiceover(text, voiceId, options = {}) {
        const {
            model = 'eleven_multilingual_v2',
            stability = 0.5,
            similarityBoost = 0.75,
            style = 0.0,
            speed = 1.0
        } = options;
        
        try {
            const response = await this.client.post(
                `/text-to-speech/${voiceId}`,
                {
                    text: text,
                    model_id: model,
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                        style,
                        speed
                    }
                },
                {
                    responseType: 'arraybuffer'
                }
            );
            
            return {
                success: true,
                audioBuffer: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            console.error('Voiceover generation failed:', error);
            throw new Error(`Voiceover generation failed: ${error.message}`);
        }
    }
    
    // Get voices by language
    getVoicesByLanguage(voices, language) {
        const keywords = language === 'vi' 
            ? ['vietnamese', 'vi-', 'nguyen', 'linh', 'vietnam']
            : ['english', 'en-'];
        
        return voices.filter(voice => 
            keywords.some(kw => 
                voice.name.toLowerCase().includes(kw) || 
                voice.labels?.language?.toLowerCase().includes(kw)
            )
        );
    }
}

module.exports = new ElevenLabsService();
