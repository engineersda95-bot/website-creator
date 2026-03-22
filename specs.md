# MVP SPECIFICATION — AI STATIC WEBSITE GENERATOR (CLIENT-FIRST, AUTO-DEPLOY)

## GOAL

Build a web app that allows small local businesses to generate a complete multi-page website in minutes using AI.

The app:
- Allows users to create a multi-page site by manually adding/editing blocks
- Provides a simple block-based editor for customization
- Publishes the website instantly to a live URL
- Runs primarily client-side, with minimal backend for auth and deploy

No complex CMS. No manual hosting. No technical setup required.

---

## TECH STACK

### Frontend  
- Next.js (App Router)

### Backend (minimal)  
- Supabase → Authentication + Database

### Hosting & Deployment  
- Cloudflare Pages → Static site hosting  
- Cloudflare Pages API → Automated deploy

### Storage  
- Base64 (MVP) or Cloudflare R2 (optional)

### AI  
- LLM API (OpenAI / Gemini)

---

## CORE USER FLOW

1. User lands on homepage  
2. Clicks “Create your site”  
4. User enters Editor:
   - Starts with a default "Home" page
   - Adds blocks from a library (Hero, Text, etc.)
   - Edits content instantly

5. User enters Editor:
   - Live preview
   - Block editing

6. User clicks “Publish”

7. App:
   - Generates static site
   - Deploys to Cloudflare Pages

8. Site is live at:
   - `project-name.pages.dev` (or custom domain)

9. User can edit and re-publish

---

## SITE STRUCTURE

- Max 5 pages:
  - Home
  - About
  - Services / Menu
  - Contact
  - Optional extra

Each page:
- Vertical list of blocks
- No nested layouts

---

## EDITOR MODEL (BLOCK-BASED)

- No drag positioning
- No pixel control

### Features:
- Add/remove blocks
- Reorder blocks
- Inline editing
- Basic style controls
- Live preview

---

## SUPPORTED BLOCK TYPES

1. **Navigation (Header)**: Logo + Menu links.
2. Hero  
3. Text  
4. Text + Image  
5. Gallery  
6. Services / Menu  
7. Contact  
8. Map  
9. Footer  

---

## MULTI-PAGE SUPPORT

- Projects can have up to 5 pages.
- Sidebar contains a "Page List" switcher.
- New pages can be added (About, Services, etc.).
- Navigation block automatically updates links when pages are added/removed.

---

## IMAGE HANDLING

- Users can upload images directly in the block configuration sidebar.
- MVP: Images are stored as Base64 strings in the JSON block data (max 2MB).
- Future: Integration with Cloudflare R2.

---

## BLOCK CONFIGURATION (SIDEBAR)

When a block is selected, a context-sidebar opens for detailed editing:

### General Styles:
- Padding (S / M / L)
- Background Color (Light / Dark / Accent)
- Text Alignment

### Content Specific:
- **Hero**: Title, Subtitle, CTA text, Image upload.
- **Gallery**: Multiple image uploads.
- **Map**: Address input.

---

## STARTER TEMPLATES

On project creation, the user selects from:
1. **Ristorante**: Hero + Menu + Map + Footer.
2. **Professionista**: Hero + Services + Testimonials + Contact.
3. **Empty**: Just a Hero to start from scratch.

---

## AUTHENTICATION (SUPABASE)

- **Login / Register**: Email & Password.
- **Protected Routes**: `/editor` and `/dashboard` require an active session.
- **User Ownership**: Projects are tied to the logged-in user's ID.

---

/* Section Deleted: AI GENERATION */

---

## DATA MODEL

All content stored as JSON.

### JSON Schema Samples

#### Page Data Structure
```json
{
  "title": "Home",
  "slug": "home",
  "blocks": [
    {
      "id": "uuid",
      "type": "hero",
      "content": {
        "title": "Welcome to My Business",
        "subtitle": "Best services in town",
        "cta": "Get Started",
        "image": "base64..."
      },
      "style": { "padding": "M", "align": "center" }
    }
  ]
}
```

---

## RULES AND CONSTRAINTS

- **Image Size**: Max 2MB per image (Base64 adds ~33% overhead).
- **Subdomain format**: `[a-z0-9-]` (kebab-case), min 3 characters.
- **Block Limit**: Max 10 blocks per page.
- **Page Limit**: Max 5 pages per project.
- **Deployment Rate Limit**: 5 deploys per hour.

---

## EDGE CASES

- **Subdomain Collision**: If the requested `project-name` exists on the default domain provider, the app must suggest a suffix (e.g., `-123`).
- **AI Hallucination**: [REMOVED]
- **Image Upload Failure**: If Base64 string is too large for Supabase `text` column, truncate or show error.
- **Disconnected Editing**: Handle loss of internet during editor session (local storage sync).

---

## ERROR HANDLING

- **Supabase Auth Failure**: Clear session and redirect to login with clear error message.
- **Cloudflare API Error**: Log error to Supabase and show "Service temporarily unavailable" toast.
- **Validation Errors**: Real-time feedback in setup wizard for invalid business inputs.

---

## ANTI-PATTERNS (DO NOT IMPLEMENT)

1. **Pixel-Perfect Dragging**: Do not allow users to move elements by X,Y coordinates. Only vertical block reordering.
2. **Custom CSS Injection**: No raw CSS inputs. Styles must be picked from pre-defined options.
3. **External JS scripts**: No Google Tag Manager or custom scripts allowed in generated sites (for security and performance).

---

## AUTH & DATABASE (SUPABASE)

### users
- id
- email

### projects
- id
- user_id
- name
- subdomain
- created_at

### pages
- id
- project_id
- slug
- blocks (JSON)

---

## DEPLOYMENT FLOW

On “Publish”:

1. Generate static HTML/CSS
2. Bundle assets
3. Deploy via Cloudflare Pages API
4. Return live URL

Re-publish overwrites previous deploy.

---

## OUTPUT

Generated sites are:
- Static
- Fast
- Mobile responsive
- SEO-friendly (basic)

---

## STORAGE

MVP:
- Images as Base64 in JSON

Optional:
- Cloudflare R2

---

## PERFORMANCE TARGET

- AI generation: < 20s
- Deploy: < 30s
- Editor: real-time

---

## FREE PLAN

- 1 project
- Max 5 pages
- Subdomain only
- Basic blocks
- Branding in footer

---

## FUTURE PRO

- Custom domains
- Multiple projects
- Unlimited AI
- Advanced blocks
- Remove branding
- SEO settings
- Analytics

---

## NON-GOALS

- No drag-and-drop builder
- No custom CSS
- No plugins
- No e-commerce

---

## PRINCIPLES

- Speed > flexibility
- Simplicity > control
- AI-first
- Instant publish