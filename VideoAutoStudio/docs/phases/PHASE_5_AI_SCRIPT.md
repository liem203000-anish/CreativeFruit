# Phase 5: AI Script Generation

**Duration**: 1-2 weeks  
**Priority**: Medium  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation)

## Overview

Integrate AI (Claude API) to automatically generate video scripts based on templates, user inputs, and selected tone/style. Scripts will be customizable and support both English and Vietnamese languages.

## Goals

1. Set up Claude API integration (or OpenAI as alternative)
2. Design script generation prompts based on templates
3. Create script management system (CRUD)
4. Build script generator UI with customization options
5. Support EN/VI languages for script generation

## Deliverables

### 5.1 AI Service Setup

**Claude API Integration**

**File**: `backend/src/services/ai.js`

```javascript
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
            length = 'medium', // short, medium, long
            model = 'claude-3-5-sonnet-20241022'
        } = options;
        
        try {
            const message = await this.anthropic.messages.create({
                model: model,
                max_tokens: 1024,
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
            prompt += `Description: ${template.description}\n\n`;
        }
        
        // Add variables
        if (variables) {
            prompt += "Variables:\n";
            Object.keys(variables).forEach(key => {
                prompt += `- ${key}: ${variables[key]}\n`;
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
```

**Environment Variables**
```env
CLAUDE_API_KEY=your_claude_api_key_here
# OR use OpenAI
# OPENAI_API_KEY=your_openai_api_key_here
```

### 5.2 Script Management Backend

**File**: `backend/src/routes/scripts.js`

**Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scripts/generate` | Generate AI script |
| GET | `/api/scripts` | List user's scripts |
| GET | `/api/scripts/:id` | Get script details |
| PUT | `/api/scripts/:id` | Update script |
| DELETE | `/api/scripts/:id` | Delete script |
| POST | `/api/scripts/:id/regenerate` | Regenerate script with new params |

**Generate Script Endpoint**

```javascript
router.post('/generate', authenticate, async (req, res) => {
    try {
        const { 
            templateId, 
            variables, 
            language = 'en', 
            tone = 'professional',
            customPrompt 
        } = req.body;
        
        // Fetch template if provided
        let template = null;
        if (templateId) {
            const result = await db.query(
                'SELECT * FROM templates WHERE id = $1',
                [templateId]
            );
            template = result.rows[0];
        }
        
        // Generate script
        const aiService = new AIService();
        const scriptContent = await aiService.generateFromTemplate(
            template, 
            variables, 
            language
        );
        
        // Save to database
        const saveResult = await db.query(`
            INSERT INTO scripts (user_id, project_id, title, content, language, tone, generated_by_ai)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [
            req.user.id,
            variables?.projectId || null,
            variables?.title || 'Generated Script',
            scriptContent.content,
            language,
            tone,
            true
        ]);
        
        res.json({ 
            success: true, 
            data: { 
                id: saveResult.rows[0].id,
                content: scriptContent.content,
                usage: scriptContent.usage
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### 5.3 Script Data Model

**Database Schema (Already in Phase 1)**

```sql
-- scripts table (created in Phase 1)
-- Additional enhancements:

ALTER TABLE scripts ADD COLUMN IF NOT EXISTS 
    tone VARCHAR(50); -- professional, casual, funny, etc.
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS 
    variables JSONB; -- Store input variables for regeneration
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS 
    ai_model VARCHAR(100); -- Model used for generation
ALTER TABLE scripts ADD COLUMN IF NOT EXISTS 
    token_usage INTEGER; -- Tokens used (for cost tracking)
```

### 5.4 Frontend: Script Generator Page

**File**: `frontend/src/pages/ScriptGeneratorPage.jsx`

**Features**

1. **Script Generator Form**
   - Template selection (optional)
   - Language selector (EN/VI)
   - Tone selector (professional, casual, funny, etc.)
   - Variable inputs (dynamic based on template)
   - Custom prompt input (advanced)

2. **Generated Script Display**
   - Show generated script in editable textarea
   - Character/word count
   - Copy to clipboard button
   - Regenerate button (with different params)

3. **Script Library**
   - List of saved scripts
   - Search/filter scripts
   - Edit existing scripts
   - Delete scripts

4. **Script Preview**
   - Preview how script will sound (with voiceover)
   - Link to voiceover generation (Phase 6)

**Components**

```jsx
// ScriptGenerator.jsx
const ScriptGenerator = () => {
    const [language, setLanguage] = useState('en');
    const [tone, setTone] = useState('professional');
    const [template, setTemplate] = useState(null);
    const [variables, setVariables] = useState({});
    const [generatedScript, setGeneratedScript] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await scriptApi.generate({
                templateId: template?.id,
                variables: { ...variables, tone, language },
                language,
                tone
            });
            setGeneratedScript(res.data.content);
        } catch (error) {
            toast.error('Failed to generate script');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="script-generator">
            <div className="options">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                </select>
                
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="inspirational">Inspirational</option>
                </select>
                
                {/* Template selector */}
                <TemplateSelector onSelect={setTemplate} />
                
                {/* Variable inputs */}
                {template?.template_config?.variables?.map(variable => (
                    <input 
                        key={variable.name}
                        placeholder={variable.description}
                        value={variables[variable.name] || ''}
                        onChange={(e) => setVariables({
                            ...variables,
                            [variable.name]: e.target.value
                        })}
                    />
                ))}
                
                <button onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Script'}
                </button>
            </div>
            
            {generatedScript && (
                <div className="generated-script">
                    <textarea 
                        value={generatedScript} 
                        onChange={(e) => setGeneratedScript(e.target.value)}
                        rows={20}
                    />
                    <div className="actions">
                        <button onClick={() => navigator.clipboard.writeText(generatedScript)}>
                            Copy
                        </button>
                        <button onClick={handleGenerate}>
                            Regenerate
                        </button>
                        <button onClick={() => saveScript()}>
                            Save Script
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
```

### 5.5 Multi-language Support

**Language-specific Prompts**

```javascript
const LANGUAGE_PROMPTS = {
    en: {
        systemPrompt: "You are a professional video script writer.",
        outputFormat: "Format the script with scene headings, visual descriptions, and audio text.",
        examples: "Example: [SCENE 1] Visual: A person walking... Audio: Welcome to..."
    },
    vi: {
        systemPrompt: "Bạn là một nhà biên kịch video chuyên nghiệp.",
        outputFormat: "Định dạng kịch bản với tiêu đề cảnh, mô tả hình ảnh, và văn bản âm thanh.",
        examples: "Ví dụ: [CẢNH 1] Hình ảnh: Một người đang đi... Âm thanh: Chào mừng đến với..."
    }
};
```

**i18n for Script Generator UI**

```json
{
  "script": {
    "title": "Script Generator",
    "language": "Language",
    "tone": "Tone",
    "template": "Template",
    "variables": "Variables",
    "generate": "Generate Script",
    "regenerate": "Regenerate",
    "copy": "Copy to Clipboard",
    "save": "Save Script",
    "loading": "Generating script with AI...",
    "error": "Failed to generate script. Please try again."
  }
}
```

### 5.6 Script Editing & Versioning

**Script Editor Features**

- [ ] Rich text editing (bold, italic, lists)
- [ ] Scene breakdown (auto-detect [SCENE] tags)
- [ ] Timing annotations (duration per scene)
- [ ] Variable highlighting ({{variable}} syntax)
- [ ] Word/character count
- [ ] Auto-save (debounced)

**Version History (Optional for MVP)**

```sql
CREATE TABLE script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.7 Cost Tracking

**Track API Usage**

```javascript
// After each generation
await db.query(`
    INSERT INTO usage_logs (user_id, service, tokens_used, cost_estimate)
    VALUES ($1, 'claude', $2, $3)
`, [req.user.id, tokenUsage, estimatedCost]);
```

**Usage Table**

```sql
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    service VARCHAR(50), -- 'claude', 'elevenlabs', etc.
    tokens_used INTEGER,
    cost_estimate DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Acceptance Criteria

- [ ] User can select language (EN/VI) for script generation
- [ ] User can choose tone (professional, casual, etc.)
- [ ] User can select template to base script on
- [ ] AI generates script based on inputs
- [ ] Generated script is editable
- [ ] User can save scripts to library
- [ ] User can view/edit/delete saved scripts
- [ ] Script generation shows loading state
- [ ] Errors are handled gracefully with user feedback
- [ ] Token usage is tracked (for cost monitoring)

## Testing

**API Test**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "tone": "professional",
    "variables": {
      "title": "My Business",
      "description": "We sell great products"
    }
  }' \
  http://localhost:4000/api/scripts/generate
```

**Manual Test Cases**
1. Generate EN script → Should return English text
2. Generate VI script → Should return Vietnamese text
3. Select template → Script should follow template structure
4. Change tone → Script style should change
5. Save script → Should appear in script library
6. Edit script → Should update in database

## Technical Debt / Notes

- Claude API has rate limits; implement retry logic with exponential backoff
- Cost can add up; consider adding usage quotas per user
- AI output may need moderation; implement content filtering if needed
- Consider caching similar prompts to reduce API calls
- For production, add streaming response (Claude supports streaming)
- Script quality depends on prompt engineering; iterate on prompts

## Next Phase

Proceed to [Phase 6: Voiceover System](PHASE_6_VOICEOVER.md) to integrate ElevenLabs API for AI voice generation from scripts.
