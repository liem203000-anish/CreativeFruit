const Anthropic = require('@anthropic-ai/sdk');

class AIService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
        });
    }
    
    // Generate script using Claude
    async generateScript(prompt, options = {}) {
        const {
            language = 'en',
            tone = 'professional',
            model = 'claude-sonnet-4-6'
        } = options;
        
        try {
            const message = await this.anthropic.messages.create({
                model: model,
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });
            
            return {
                success: true,
                content: message.content[0].text,
                usage: message.usage
            };
        } catch (error) {
            console.error('Claude API error:', error);
            throw new Error(`AI generation failed: ${error.message}`);
        }
    }
    
    // Generate script from template
    async generateFromTemplate(template, variables, language = 'en') {
        const prompt = this.buildPrompt(template, variables, language);
        return await this.generateScript(prompt, { language });
    }
    
    // Build prompt based on template and variables
    buildPrompt(template, variables, language) {
        const langInstructions = language === 'vi' 
            ? 'Viết bằng tiếng Việt. ' 
            : 'Write in English. ';
        
        let prompt = `${langInstructions}Generate a video script with the following requirements:\n\n`;
        
        // Add template context
        if (template) {
            prompt += `Template: ${template.name}\n`;
            if (template.description) {
                prompt += `Description: ${template.description}\n\n`;
            }
        }
        
        // Add variables
        if (variables) {
            prompt += "Variables:\n";
            Object.keys(variables).forEach(key => {
                if (key !== 'tone' && key !== 'language') {
                    prompt += `- ${key}: ${variables[key]}\n`;
                }
            });
            prompt += "\n";
        }
        
        // Add tone/style instructions
        prompt += this.getToneInstructions(variables?.tone || 'professional', language);
        
        // Add output format
        prompt += `\nOutput the script in the following format:
[SCENE 1]
Visual: <description>
Audio: <text to be spoken>
Duration: <seconds>

[SCENE 2]
...
`;
        
        return prompt;
    }
    
    // Get tone-specific instructions
    getToneInstructions(tone, language) {
        const tones = {
            professional: {
                en: "Use a professional, authoritative tone suitable for business or corporate content.",
                vi: "Sử dụng giọng điệu chuyên nghiệp, uy tín phù hợp cho nội dung doanh nghiệp."
            },
            casual: {
                en: "Use a casual, friendly tone like talking to a friend.",
                vi: "Sử dụng giọng điệu thân thiện, gần gũi như đang trò chuyện với bạn bè."
            },
            funny: {
                en: "Use humor, jokes, and a light-hearted tone.",
                vi: "Sử dụng hài hước, cười vui và giọng điệu nhẹ nhàng."
            },
            inspirational: {
                en: "Use motivational, uplifting language that inspires action.",
                vi: "Sử dụng ngôn ngữ truyền cảm hứng, khích lệ hành động."
            },
            educational: {
                en: "Use clear, informative language focused on teaching.",
                vi: "Sử dụng ngôn ngữ rõ ràng, mang tính thông tin để giảng dạy."
            }
        };
        
        return tones[tone]?.[language] || tones.professional[language];
    }
}

module.exports = new AIService();
