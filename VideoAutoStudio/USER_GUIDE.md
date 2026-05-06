# VideoAutoStudio User Guide

Welcome to VideoAutoStudio - Your AI-powered video creation platform! 🎬

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Managing Projects](#managing-projects)
4. [Working with Videos](#working-with-videos)
5. [AI Script Generation](#ai-script-generation)
6. [AI Voiceover](#ai-voiceover)
7. [Using Templates](#using-templates)
8. [Timeline Editor](#timeline-editor)
9. [Settings](#settings)
10. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Login
1. Open http://localhost:3000
2. Click "Login" or "Register"
3. Enter your credentials
4. You'll be taken to the Dashboard

### Language Selection
- Click "Language" in the top bar
- Choose English or Tiếng Việt
- Interface will update instantly

---

## Dashboard

Your command center with:
- **Stats Cards**: Total projects, scripts, voiceovers, storage
- **Quick Actions**: Fast access to common tasks
- **Recent Projects**: Your latest work
- **System Health**: Check if all services are running
- **Pro Tips**: Helpful hints for better results

### Quick Actions
1. **New Project** - Start a fresh video project
2. **Import Videos** - Bring in videos from Google Drive
3. **Generate Script** - Create AI-powered scripts
4. **Generate Voiceover** - Make ultra-realistic AI speech

---

## Managing Projects

### Creating a Project
1. Click "New Project" button
2. Enter project name and description
3. Select videos from your imported library
4. Click "Create Project"

### Project Cards
Each project shows:
- Video thumbnail (auto-generated)
- Project name and description
- Status badge (Draft/Processing/Completed)
- Script and Voiceover indicators
- Action buttons (View, Edit, Process, Preview)

### Project Statuses
- **Draft** - Being edited, not yet processed
- **Processing** - Video is being rendered
- **Completed** - Ready to download/preview

### Editing a Project
1. Click the **Edit** button on any project
2. Select a script (optional)
3. Select a voiceover (optional)
4. Click "Update Project"

### Processing Video
1. Ensure project has Script + Voiceover
2. Click "Process Video"
3. Wait for processing (check status)
4. Preview or download when completed

### Viewing Project Details
1. Click **View Details** (eye icon)
2. See full project info
3. Use **Timeline Editor** to reorder videos
4. Preview output video directly

---

## Working with Videos

### Importing from Google Drive
1. Go to **Drive Videos** page
2. Click "Connect Google Drive"
3. Authorize the application
4. Browse your Drive folders
5. Click "Import" on any video

### Managing Imported Videos
- View all imported videos
- See video duration and file size
- Delete unwanted videos
- Videos appear as thumbnails automatically

### Video Thumbnails
- Auto-generated from video content
- Shown on project cards
- Click to preview video
- Cached for fast loading

---

## AI Script Generation

### Generating a Script
1. Go to **Scripts** page
2. Click "Generate Script"
3. Enter a title
4. Select language (English/Vietnamese)
5. Choose tone:
   - **Professional** - Formal, business-like
   - **Casual** - Relaxed, conversational
   - **Funny** - Humorous, entertaining
   - **Inspirational** - Motivational, uplifting
   - **Educational** - Informative, teaching
6. (Optional) Select a template
7. Click "Generate Script"

### Using Templates
- Templates provide structure for your scripts
- Fill in variables defined by template
- Speeds up content creation

### Editing Scripts
1. Click **Edit** on any script
2. Modify the content in the editor
3. Click "Save Changes"

### Script Tips
- Keep titles clear and descriptive
- Match tone to your audience
- Use templates for consistent branding
- Review and edit AI-generated content

---

## AI Voiceover

### Generating Voiceover
1. Go to **Voiceover** page
2. Click "Generate Voiceover"
3. Select a script to convert
4. Choose a voice:
   - Multiple languages available
   - Different genders and styles
5. Adjust speed (0.5x to 2.0x)
6. Click "Generate Voiceover"

### Available Voices
- **English**: Rachel, Domi, Bella, Antoni, etc.
- **Tiếng Việt**: Various Vietnamese voices
- Each has unique characteristics

### Voiceover Settings
- **Speed**: 0.5x (slow) to 2.0x (fast)
- Recommended: 0.8x to 1.2x for natural sound
- Too fast/slow may sound unnatural

### Playing Voiceovers
- Use the built-in audio player
- Control volume and playback
- Download for external use

---

## Using Templates

### Template Categories
- **Intro** - Video introductions
- **Outro** - Video endings
- **Transition** - Scene transitions
- **Lower Third** - Name/title overlays
- **Title** - Main titles
- **Music Promo** - Music promotion

### Creating Templates
1. Go to **Templates** page
2. Click "New Template"
3. Enter name and description
4. Select category
5. Define configuration (JSON):
   ```json
   {
     "duration": 10,
     "elements": [...],
     "transitions": [...]
   }
   ```
6. Click "Create Template"

### Template Config
- Define structure for consistent videos
- Set duration, elements, effects
- Reuse across multiple projects
- Share with team members (future)

---

## Timeline Editor

### Accessing Timeline
1. Create a project with multiple videos
2. Click "View Details" on the project
3. Timeline appears in the modal

### Reordering Videos
1. **Drag & Drop** videos to reorder
2. Or use the handle (≡) icon
3. Changes save automatically
4. Video order affects final output

### Timeline Features
- **Video Track**: Shows all project videos
- **Audio Track**: Shows voiceover (if attached)
- **Time Ruler**: Visual time reference
- **Duration**: Total project length shown

### Video Blocks
- Each block shows video name
- Width represents duration proportionally
- Color gradients for visual distinction
- Hover for details

---

## Settings

### Profile Settings
- Update username
- Change email
- Manage preferences

### Language Settings
- Switch between English and Vietnamese
- Affects entire interface
- Changes apply instantly

### Password Change
1. Go to "Profile" tab
2. Scroll to "Change Password"
3. Enter current password
4. Enter new password (min 8 chars)
5. Confirm new password
6. Click "Change Password"

### Security Tips
- Use strong passwords
- Don't share your token
- Log out on shared computers
- Change password regularly

---

## Tips & Tricks

### Pro Tips
1. **Cinematic Voiceovers**: Use "Deep Narrative" preset with 0.8x speed for documentary feel
2. **Batch Import**: Import multiple videos from Drive at once
3. **Template First**: Start with a template for consistent branding
4. **Preview Often**: Check your work frequently during editing
5. **Script Before Video**: Generate script first, then voiceover

### Keyboard Shortcuts (Coming Soon)
- `Ctrl+N` - New Project
- `Ctrl+S` - Save changes
- `Ctrl+Z` - Undo
- `Space` - Play/Pause preview
- `Delete` - Remove selected item

### Best Practices
1. **Organize Videos**: Import and name videos clearly
2. **Draft First**: Keep projects as "Draft" until ready
3. **Check Status**: Monitor processing in Dashboard
4. **Use AI Wisely**: Review and edit generated content
5. **Backup**: Regularly export important projects

### Troubleshooting
- **Can't connect Drive?** Check Google API credentials in `.env`
- **Processing fails?** Ensure script AND voiceover are attached
- **Thumbnail not showing?** Video may still be processing
- **Login issues?** Clear localStorage and try again
- **Slow performance?** Check system health in Dashboard

---

## FAQ

**Q: How many projects can I create?**  
A: Unlimited! (depending on storage)

**Q: Can I collaborate with others?**  
A: Not yet, but it's on the roadmap!

**Q: Is my data safe?**  
A: Yes! JWT authentication and bcrypt password hashing.

**Q: Can I export in different formats?**  
A: Yes! Choose from mp4, avi, mov with quality settings.

**Q: How long does processing take?**  
A: Depends on video length and quality. Usually 2-5 minutes.

**Q: Can I use my own voice?**  
A: Currently only AI voices, custom voice cloning coming soon!

---

**Need more help? Contact support or check the API documentation! 📧**
