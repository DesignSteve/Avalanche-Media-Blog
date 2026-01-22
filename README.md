# Avalanche Media Blog

A professional blog website for **Avalanche Media** YouTube channel - your source for Political Commentary, Review, Analysis & Political Happenings.

![Avalanche Media](images/banner.png)

## 📁 Project Structure

```
avalanche-media-blog/
├── index.html          # Homepage
├── article.html        # Article detail page
├── admin.html          # Admin panel for managing articles
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── app.js          # Main JavaScript application
├── images/
│   ├── logo.png        # Avalanche Media logo
│   └── banner.png      # Channel banner
└── README.md           # This file
```

## ✨ Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Matches your Avalanche Media brand aesthetic
- **Article Management**: Create, edit, and delete articles through the admin panel
- **Category Filtering**: Filter articles by Politics, Analysis, Commentary, Review, and News
- **View Tracking**: Automatically tracks article views
- **Newsletter Signup**: Ready for email collection integration
- **YouTube Integration**: Prominent links to your YouTube channel
- **Local Storage**: Articles stored in browser's localStorage (perfect for static hosting)

## 🚀 Quick Start (Local Development)

### Option 1: Using Python (Recommended)
```bash
# Navigate to the project folder
cd avalanche-media-blog

# Start a local server (Python 3)
python -m http.server 8000

# Or for Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Using Node.js
```bash
# Install a simple server
npm install -g http-server

# Navigate to project folder and run
cd avalanche-media-blog
http-server -p 8000
```

### Option 3: Using VS Code
Install the "Live Server" extension and click "Go Live" in the status bar.

---

## 🌐 Hosting Guide - Step by Step

### Option A: GitHub Pages (FREE - Recommended)

**Step 1: Create a GitHub Account**
1. Go to [github.com](https://github.com)
2. Click "Sign Up" and create an account

**Step 2: Create a New Repository**
1. Click the "+" icon in the top right → "New repository"
2. Name it: `avalanche-media-blog` (or your preferred name)
3. Make it **Public**
4. Click "Create repository"

**Step 3: Upload Your Files**
1. On your new repository page, click "uploading an existing file"
2. Drag and drop ALL files from your `avalanche-media-blog` folder
3. Click "Commit changes"

**Step 4: Enable GitHub Pages**
1. Go to repository **Settings** → **Pages** (left sidebar)
2. Under "Source", select **main** branch
3. Click **Save**
4. Your site will be live at: `https://yourusername.github.io/avalanche-media-blog`

**Step 5: Custom Domain (Optional)**
1. In **Settings** → **Pages**, add your custom domain
2. Update your domain's DNS to point to GitHub:
   - A record: `185.199.108.153`
   - A record: `185.199.109.153`
   - A record: `185.199.110.153`
   - A record: `185.199.111.153`

---

### Option B: Netlify (FREE - Easy)

**Step 1: Sign Up**
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign Up" (use GitHub for easiest setup)

**Step 2: Deploy**
1. Click "Add new site" → "Deploy manually"
2. Drag and drop your `avalanche-media-blog` folder
3. Done! Your site is live instantly.

**Step 3: Custom Domain (Optional)**
1. Go to **Domain Settings**
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

---

### Option C: Vercel (FREE - Fast)

**Step 1: Sign Up**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

**Step 2: Deploy**
1. Click "New Project"
2. Import your GitHub repository (if uploaded) or drag folder
3. Click "Deploy"

---

### Option D: Traditional Web Hosting

If you have existing hosting (Bluehost, HostGator, GoDaddy, etc.):

**Step 1: Access File Manager**
1. Log into your hosting control panel (cPanel)
2. Open **File Manager**

**Step 2: Upload Files**
1. Navigate to `public_html` folder
2. Upload all files from `avalanche-media-blog`
3. Ensure `index.html` is in the root

**Step 3: Done!**
Your site should be live at your domain.

---

## 📝 How to Use the Admin Panel

### Creating Articles

1. Go to `yoursite.com/admin.html`
2. Click **"Create Article"** in the sidebar
3. Fill in:
   - **Title**: Your article headline
   - **Category**: Select from Politics, Analysis, Commentary, Review, or News
   - **Author**: Your name (optional, defaults to "Avalanche Media")
   - **Featured Image URL**: Paste an image URL (optional)
   - **Excerpt**: Brief summary (optional)
   - **Content**: Your article text (supports basic formatting)
4. Click **"Publish Article"**

### Formatting Your Content

The editor supports basic Markdown:
- `**bold text**` for **bold**
- `*italic text*` for *italic*
- `## Heading` for section headers
- `### Subheading` for smaller headers
- `> quote` for blockquotes

### Managing Articles

- View all articles in the **"All Articles"** tab
- Click **"Edit"** to modify an article
- Click **"Delete"** to remove an article (permanent!)

---

## 🎨 Customization

### Changing Colors

Edit `css/style.css` and modify the CSS variables at the top:

```css
:root {
    --primary-red: #E31B23;      /* Main red color */
    --gold: #C9A227;              /* Gold accent */
    --black: #0A0A0A;             /* Background */
    /* ... other colors */
}
```

### Changing Fonts

The site uses Google Fonts. To change, update the `@import` in `css/style.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap');
```

Then update the font variables:
```css
:root {
    --font-display: 'YOUR_FONT', sans-serif;
}
```

### Adding Social Links

Edit the social links in `index.html` - search for `social-links` and update the `href` attributes.

---

## 💡 Tips for Success

1. **Consistent Posting**: Add new articles regularly to keep visitors coming back
2. **Quality Images**: Use high-quality images for featured articles
3. **SEO**: Update meta descriptions in each HTML file's `<head>` section
4. **Backup**: Periodically export your articles (they're stored in localStorage)
5. **Cross-Promote**: Link your blog articles in your YouTube video descriptions

---

## 🔧 Technical Notes

### Data Storage

Articles are stored in the browser's `localStorage`. This means:
- ✅ No server/database needed
- ✅ Free to host anywhere
- ⚠️ Data is per-browser (each visitor starts fresh)
- ⚠️ Clearing browser data removes articles

**For a production site with persistent data**, you would need to:
1. Use a backend service (Firebase, Supabase, etc.)
2. Or use a headless CMS (Contentful, Strapi, etc.)
3. Or generate static articles during build

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## 📞 Support

For questions about hosting or customization:
- Visit: [youtube.com/@avalanchemedia](https://www.youtube.com/@avalanchemedia)

---

## 📄 License

© 2026 Avalanche Media. All rights reserved.

---

**Happy Blogging! 🚀**

*Built with ❤️ for Avalanche Media*
