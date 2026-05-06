# Phase 4: CapCut Templates Integration

**Duration**: 2 weeks  
**Priority**: Medium  
**Status**: Not Started  
**Depends On**: Phase 1 (Foundation), Phase 3 (Video Merging)

## Overview

Integrate CapCut template system to apply pre-designed video templates to merged videos. Templates include text overlays, transitions, effects, and timing configurations that can be customized with user content.

## Goals

1. Design template data model and storage
2. Create template upload/management system
3. Parse CapCut template configurations
4. Apply templates to videos using FFmpeg
5. Build template browser and editor UI

## Deliverables

### 4.1 Template Data Model

**Template Structure**

CapCut templates typically include:
- Video effects and transitions
- Text overlay positions and timing
- Music/sound synchronization
- Sticker/element placements
- Export settings (resolution, frame rate)

**Database Schema (Already in Phase 1)**

```sql
-- templates table (created in Phase 1)
-- Additional columns if needed:
ALTER TABLE templates ADD COLUMN IF NOT EXISTS 
    template_data JSONB; -- Full template configuration
ALTER TABLE templates ADD COLUMN IF NOT EXISTS 
    preview_video_url VARCHAR(500);
ALTER TABLE templates ADD COLUMN IF NOT EXISTS 
    category VARCHAR(50); -- e.g., "business", "lifestyle", "gaming"
```

**Template Config JSON Structure**

```json
{
  "version": "1.0",
  "name": "Business Promo Template",
  "duration": 30,
  "resolution": "1080x1920",
  "elements": [
    {
      "type": "text",
      "id": "title_text",
      "content": "{{title}}",
      "position": { "x": 540, "y": 200 },
      "font": { "family": "Arial", "size": 48, "color": "#FFFFFF" },
      "timing": { "start": 0, "end": 5 },
      "animation": "fadeIn"
    },
    {
      "type": "text",
      "id": "subtitle_text",
      "content": "{{subtitle}}",
      "position": { "x": 540, "y": 300 },
      "font": { "family": "Arial", "size": 32, "color": "#CCCCCC" },
      "timing": { "start": 2, "end": 8 },
      "animation": "slideUp"
    },
    {
      "type": "video_segment",
      "id": "main_video",
      "position": { "x": 0, "y": 0, "width": 1080, "height": 1920 },
      "timing": { "start": 0, "end": 30 },
      "effects": ["blur_background"]
    },
    {
      "type": "audio",
      "id": "background_music",
      "volume": 0.3,
      "timing": { "start": 0, "end": 30 }
    }
  ],
  "variables": [
    {
      "name": "title",
      "description": "Main title text",
      "default": "Your Title Here"
    },
    {
      "name": "subtitle",
      "description": "Subtitle text",
      "default": "Your subtitle here"
    }
  ]
}
```

### 4.2 Template Management Backend

**File**: `backend/src/routes/templates.js`

**Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| GET | `/api/templates/:id` | Get template details |
| POST | `/api/templates` | Upload new template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| POST | `/api/templates/:id/apply` | Apply template to project |
| GET | `/api/templates/categories` | List template categories |

**Template Upload**

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/templates/' });

router.post('/', authenticate, requireRole(['admin', 'creator']), upload.single('templateFile'), async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const templateFile = req.file;
        
        // Parse template file (JSON or CapCut format)
        let templateConfig = {};
        if (templateFile.mimetype === 'application/json') {
            const fileContent = fs.readFileSync(templateFile.path, 'utf8');
            templateConfig = JSON.parse(fileContent);
        } else {
            // Handle CapCut proprietary format (if applicable)
            // May need custom parser
        }
        
        // Save to database
        const result = await db.query(`
            INSERT INTO templates (user_id, name, description, category, template_config)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [req.user.id, name, description, category, templateConfig]);
        
        res.json({ success: true, data: { id: result.rows[0].id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

### 4.3 Template Application Service

**File**: `backend/src/services/capcut.js`

```javascript
const ffmpeg = require('fluent-ffmpeg');

class CapCutService {
    // Apply template to video
    async applyTemplate(videoPath, templateConfig, variables, outputPath) {
        return new Promise((resolve, reject) => {
            let command = ffmpeg(videoPath);
            
            // Process each element in template
            const filters = [];
            const outputs = [];
            
            templateConfig.elements.forEach((element, index) => {
                if (element.type === 'text') {
                    // Replace variables in text content
                    let textContent = element.content;
                    Object.keys(variables).forEach(key => {
                        textContent = textContent.replace(`{{${key}}}`, variables[key]);
                    });
                    
                    // Add text overlay filter
                    filters.push({
                        filter: 'drawtext',
                        options: {
                            text: textContent,
                            fontfile: this.getFontPath(element.font.family),
                            fontsize: element.font.size,
                            fontcolor: element.font.color,
                            x: element.position.x,
                            y: element.position.y,
                            enable: `between(t,${element.timing.start},${element.timing.end})`
                        }
                    });
                }
                
                if (element.type === 'video_segment') {
                    // Video positioning/scaling
                    filters.push({
                        filter: 'scale',
                        options: { w: element.position.width, h: element.position.height },
                        inputs: '[0:v]',
                        outputs: '[scaled]'
                    });
                }
            });
            
            command
                .complexFilter(filters)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }
    
    // Get font path for text rendering
    getFontPath(fontFamily) {
        const fontMap = {
            'Arial': '/path/to/arial.ttf',
            'Helvetica': '/path/to/helvetica.ttf',
            // Add more fonts as needed
        };
        return fontMap[fontFamily] || fontMap['Arial'];
    }
    
    // Parse CapCut template file (if proprietary format)
    async parseCapCutFile(filePath) {
        // Implementation depends on CapCut template format
        // May need reverse engineering or API access
        // For now, assume JSON format
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    }
}
```

### 4.4 Frontend: Templates Page

**File**: `frontend/src/pages/TemplatesPage.jsx`

**Features**

1. **Template Gallery**
   - Grid view of available templates
   - Filter by category
   - Search by name
   - Preview thumbnail/video

2. **Template Upload**
   - Upload template JSON file
   - Fill in template metadata (name, description, category)
   - Preview template structure

3. **Template Editor**
   - View template elements
   - Edit variable defaults
   - Modify text positions/timing
   - Save as new template

4. **Template Application**
   - Select template for project
   - Fill in template variables
   - Preview applied template
   - Confirm and apply

**Components**

```jsx
// TemplateCard.jsx
const TemplateCard = ({ template, onSelect, onPreview }) => {
    return (
        <div className="template-card">
            <img src={template.preview_url} alt={template.name} />
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <span className="category">{template.category}</span>
            <button onClick={() => onPreview(template)}>Preview</button>
            <button onClick={() => onSelect(template)}>Use Template</button>
        </div>
    );
};

// TemplateGallery.jsx
const TemplateGallery = ({ onSelectTemplate }) => {
    const [templates, setTemplates] = useState([]);
    const [category, setCategory] = useState('all');
    
    useEffect(() => {
        templateApi.getAll().then(res => setTemplates(res.data));
    }, []);
    
    const filtered = category === 'all' 
        ? templates 
        : templates.filter(t => t.category === category);
    
    return (
        <div className="template-gallery">
            <div className="filters">
                <button onClick={() => setCategory('all')}>All</button>
                <button onClick={() => setCategory('business')}>Business</button>
                <button onClick={() => setCategory('lifestyle')}>Lifestyle</button>
            </div>
            <div className="grid">
                {filtered.map(template => (
                    <TemplateCard 
                        key={template.id} 
                        template={template}
                        onSelect={onSelectTemplate}
                    />
                ))}
            </div>
        </div>
    );
};

// TemplateVariablesForm.jsx
const TemplateVariablesForm = ({ template, onSubmit }) => {
    const [variables, setVariables] = useState({});
    
    // Initialize with defaults
    useEffect(() => {
        const defaults = {};
        template.template_config.variables.forEach(v => {
            defaults[v.name] = v.default;
        });
        setVariables(defaults);
    }, [template]);
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(variables); }}>
            {template.template_config.variables.map(variable => (
                <div key={variable.name}>
                    <label>{variable.description}</label>
                    <input 
                        value={variables[variable.name]} 
                        onChange={(e) => setVariables({
                            ...variables,
                            [variable.name]: e.target.value
                        })}
                    />
                </div>
            ))}
            <button type="submit">Apply Template</button>
        </form>
    );
};
```

### 4.5 Template Variables System

**Variable Types**

```javascript
const VARIABLE_TYPES = {
    TEXT: 'text',           // Simple text input
    TEXTAREA: 'textarea',   // Multi-line text
    NUMBER: 'number',       // Numeric input
    SELECT: 'select',       // Dropdown selection
    COLOR: 'color',         // Color picker
    IMAGE: 'image',         // Image upload
    VIDEO: 'video',         // Video selection
    AUDIO: 'audio'          // Audio selection
};
```

**Variable Configuration in Template**

```json
{
  "variables": [
    {
      "name": "title",
      "type": "text",
      "description": "Main title",
      "default": "Your Title",
      "maxLength": 50
    },
    {
      "name": "description",
      "type": "textarea",
      "description": "Description text",
      "default": "Your description here",
      "maxLength": 200
    },
    {
      "name": "theme_color",
      "type": "color",
      "description": "Theme color",
      "default": "#FF0000"
    },
    {
      "name": "logo_image",
      "type": "image",
      "description": "Logo overlay",
      "default": null
    }
  ]
}
```

### 4.6 Text Overlay with FFmpeg

**Drawtext Filter Examples**

```javascript
// Simple text
const simpleText = {
    filter: 'drawtext',
    options: {
        text: 'Hello World',
        fontfile: '/fonts/arial.ttf',
        fontsize: 48,
        fontcolor: 'white',
        x: '(w-text_w)/2',
        y: '(h-text_h)/2',
        enable: 'between(t,0,5)'
    }
};

// Animated text (fade in)
const animatedText = {
    filter: 'drawtext',
    options: {
        text: 'Fade In Text',
        fontfile: '/fonts/arial.ttf',
        fontsize: 48,
        fontcolor: 'white',
        x: 100,
        y: 100,
        alpha: 'if(lt(t,1),0,if(lt(t,2),(t-1),1))', // Fade in over 1 second
        enable: 'between(t,0,5)'
    }
};

// Text with box background
const textWithBox = {
    filter: 'drawtext',
    options: {
        text: 'Text with Box',
        fontfile: '/fonts/arial.ttf',
        fontsize: 48,
        fontcolor: 'white',
        box: 1,
        boxcolor: 'black@0.5',
        boxborderw: 10,
        x: 100,
        y: 100
    }
};
```

### 4.7 Template Preview

**Generate Preview Video**

```javascript
// Create short preview with sample data
async function generatePreview(templateConfig, outputPath) {
    // Use sample video or solid color background
    const sampleVideo = 'uploads/samples/sample_1080x1920.mp4';
    
    // Apply template with sample variables
    const sampleVariables = {
        title: 'Sample Title',
        subtitle: 'Sample Subtitle',
        // ... other variables
    };
    
    await capcutService.applyTemplate(sampleVideo, templateConfig, sampleVariables, outputPath);
    return outputPath;
}
```

## Acceptance Criteria

- [ ] Admin can upload new CapCut templates (JSON format)
- [ ] Templates are stored in database with metadata
- [ ] User can browse template gallery with filters
- [ ] User can view template details (elements, variables)
- [ ] User can apply template to project
- [ ] Template variables are customizable
- [ ] Text overlays appear at correct positions and times
- [ ] Preview video shows template applied
- [ ] Template application modifies video correctly

## Testing

**Template Upload Test**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -F "name=Business Template" \
  -F "description=Professional business promo" \
  -F "category=business" \
  -F "templateFile=@template.json" \
  http://localhost:4000/api/templates
```

**Template Application Test**
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj123",
    "variables": {
      "title": "My Business",
      "subtitle": "Best services ever"
    }
  }' \
  http://localhost:4000/api/templates/{id}/apply
```

## Technical Debt / Notes

- CapCut has proprietary template format; JSON is easier for MVP
- Text rendering with FFmpeg requires font files; bundle common fonts
- Complex animations may require multiple FFmpeg passes
- Consider using Remotion (React video creation) as alternative to FFmpeg
- Template versioning; allow updating templates without breaking projects
- Consider marketplace for sharing templates in future

## Next Phase

Proceed to [Phase 5: AI Script Generation](PHASE_5_AI_SCRIPT.md) to integrate Claude API for automated script generation based on templates.
