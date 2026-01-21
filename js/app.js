/**
 * AVALANCHE MEDIA - Blog Application
 * Political Commentary | Review | Analysis
 */

// ============================================
// DATA STORE (LocalStorage based)
// ============================================
const DB = {
    ARTICLES_KEY: 'avalanche_articles',
    SETTINGS_KEY: 'avalanche_settings',

    // Get all articles
    getArticles() {
        const data = localStorage.getItem(this.ARTICLES_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Save articles
    saveArticles(articles) {
        localStorage.setItem(this.ARTICLES_KEY, JSON.stringify(articles));
    },

    // Add new article
    addArticle(article) {
        const articles = this.getArticles();
        article.id = Date.now().toString();
        article.createdAt = new Date().toISOString();
        article.views = 0;
        articles.unshift(article);
        this.saveArticles(articles);
        return article;
    },

    // Update article
    updateArticle(id, updates) {
        const articles = this.getArticles();
        const index = articles.findIndex(a => a.id === id);
        if (index !== -1) {
            articles[index] = { ...articles[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveArticles(articles);
            return articles[index];
        }
        return null;
    },

    // Delete article
    deleteArticle(id) {
        const articles = this.getArticles();
        const filtered = articles.filter(a => a.id !== id);
        this.saveArticles(filtered);
    },

    // Get single article by ID
    getArticle(id) {
        const articles = this.getArticles();
        return articles.find(a => a.id === id);
    },

    // Get article by slug
    getArticleBySlug(slug) {
        const articles = this.getArticles();
        return articles.find(a => a.slug === slug);
    },

    // Increment view count
    incrementViews(id) {
        const articles = this.getArticles();
        const index = articles.findIndex(a => a.id === id);
        if (index !== -1) {
            articles[index].views = (articles[index].views || 0) + 1;
            this.saveArticles(articles);
        }
    },

    // Get settings
    getSettings() {
        const data = localStorage.getItem(this.SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            siteName: 'Avalanche Media',
            tagline: 'Political Commentary | Review | Analysis | Political Happenings',
            youtubeUrl: 'https://www.youtube.com/@avalanchemedia'
        };
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    // Create URL slug from title
    createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    // Format date
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // Calculate read time
    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    },

    // Truncate text
    truncate(text, length = 150) {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get URL parameters
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params.entries());
    },

    // Generate placeholder image
    getPlaceholderImage(category) {
        const colors = {
            'Politics': 'E31B23',
            'Analysis': 'C9A227',
            'Commentary': '1E88E5',
            'Review': '43A047',
            'News': '8E24AA'
        };
        const color = colors[category] || 'E31B23';
        return `https://placehold.co/800x400/${color}/FFFFFF?text=${encodeURIComponent(category)}`;
    }
};

// ============================================
// ARTICLE RENDERER
// ============================================
const ArticleRenderer = {
    // Render article card
    renderCard(article, featured = false) {
        const readTime = Utils.calculateReadTime(article.content || '');
        const imageUrl = article.image || Utils.getPlaceholderImage(article.category);
        
        if (featured) {
            return `
                <article class="article-featured" onclick="App.viewArticle('${article.slug}')">
                    <div class="article-image">
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy">
                        <span class="article-category">${article.category}</span>
                    </div>
                    <div class="article-content">
                        <div class="article-meta">
                            <span class="article-date">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                ${Utils.formatDate(article.createdAt)}
                            </span>
                            <span class="article-read-time">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${readTime}
                            </span>
                        </div>
                        <h3>${article.title}</h3>
                        <p class="article-excerpt">${Utils.truncate(article.excerpt || article.content, 200)}</p>
                        <div class="article-footer">
                            <div class="article-author">
                                <div class="author-avatar">AM</div>
                                <span class="author-name">${article.author || 'Avalanche Media'}</span>
                            </div>
                            <a href="article.html?slug=${article.slug}" class="read-more">
                                Read More
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }

        return `
            <article class="article-card" onclick="App.viewArticle('${article.slug}')">
                <div class="article-image">
                    <img src="${imageUrl}" alt="${article.title}" loading="lazy">
                    <span class="article-category">${article.category}</span>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${Utils.formatDate(article.createdAt)}
                        </span>
                        <span class="article-read-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${readTime}
                        </span>
                    </div>
                    <h3>${article.title}</h3>
                    <p class="article-excerpt">${Utils.truncate(article.excerpt || article.content, 120)}</p>
                    <div class="article-footer">
                        <div class="article-author">
                            <div class="author-avatar">AM</div>
                            <span class="author-name">${article.author || 'Avalanche Media'}</span>
                        </div>
                        <a href="article.html?slug=${article.slug}" class="read-more">
                            Read
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            </article>
        `;
    },

    // Render articles grid
    renderGrid(articles, container) {
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="no-articles" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Articles Yet</h3>
                    <p style="color: var(--text-muted);">Check back soon for the latest political commentary and analysis.</p>
                </div>
            `;
            return;
        }

        let html = '';
        articles.forEach((article, index) => {
            html += this.renderCard(article, index === 0);
        });
        container.innerHTML = html;
    },

    // Render full article
    renderFullArticle(article, container) {
        if (!container || !article) return;
        
        const readTime = Utils.calculateReadTime(article.content || '');
        const imageUrl = article.image || Utils.getPlaceholderImage(article.category);
        
        // Convert markdown-like content to HTML
        let htmlContent = article.content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^## (.*$)/gm, '</p><h2>$1</h2><p>')
            .replace(/^### (.*$)/gm, '</p><h3>$1</h3><p>')
            .replace(/^> (.*$)/gm, '</p><blockquote>$1</blockquote><p>');
        
        htmlContent = '<p>' + htmlContent + '</p>';
        htmlContent = htmlContent.replace(/<p><\/p>/g, '');

        container.innerHTML = `
            <div class="article-header">
                <div class="container">
                    <span class="article-category">${article.category}</span>
                    <h1>${article.title}</h1>
                    <div class="article-meta">
                        <span class="article-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${Utils.formatDate(article.createdAt)}
                        </span>
                        <span class="article-read-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${readTime}
                        </span>
                        <span class="article-author">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            ${article.author || 'Avalanche Media'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="container">
                <img src="${imageUrl}" alt="${article.title}" class="article-hero-image">
            </div>
            <div class="article-body">
                ${htmlContent}
            </div>
        `;

        // Update page title
        document.title = `${article.title} | Avalanche Media`;
    },

    // Render popular posts widget
    renderPopularPosts(articles, container, limit = 5) {
        if (!container) return;
        
        const sorted = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
        
        if (sorted.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No articles yet.</p>';
            return;
        }

        let html = '';
        sorted.forEach(article => {
            const imageUrl = article.image || Utils.getPlaceholderImage(article.category);
            html += `
                <a href="article.html?slug=${article.slug}" class="popular-post">
                    <div class="popular-post-image">
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="popular-post-content">
                        <h4>${Utils.truncate(article.title, 60)}</h4>
                        <span class="popular-post-date">${Utils.formatDate(article.createdAt)}</span>
                    </div>
                </a>
            `;
        });
        container.innerHTML = html;
    }
};

// ============================================
// ADMIN PANEL
// ============================================
const Admin = {
    // Initialize admin panel
    init() {
        this.loadArticlesList();
        this.setupForm();
    },

    // Load articles list for admin
    loadArticlesList() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        const articles = DB.getArticles();
        
        if (articles.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No articles yet. Create your first article!
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        articles.forEach(article => {
            html += `
                <tr>
                    <td>${Utils.truncate(article.title, 40)}</td>
                    <td><span class="article-category" style="position: static;">${article.category}</span></td>
                    <td>${Utils.formatDate(article.createdAt)}</td>
                    <td>${article.views || 0}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="Admin.editArticle('${article.id}')" style="padding: 5px 10px; font-size: 0.75rem;">Edit</button>
                        <button class="btn" onclick="Admin.deleteArticle('${article.id}')" style="padding: 5px 10px; font-size: 0.75rem; background: #dc3545;">Delete</button>
                    </td>
                </tr>
            `;
        });
        container.innerHTML = html;
    },

    // Setup article form
    setupForm() {
        const form = document.getElementById('article-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArticle();
        });
    },

    // Save article
    saveArticle() {
        const form = document.getElementById('article-form');
        const formData = new FormData(form);
        
        const article = {
            title: formData.get('title'),
            slug: Utils.createSlug(formData.get('title')),
            category: formData.get('category'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            image: formData.get('image'),
            author: formData.get('author') || 'Avalanche Media',
            featured: formData.get('featured') === 'on'
        };

        const editId = form.dataset.editId;
        
        if (editId) {
            DB.updateArticle(editId, article);
            Utils.showToast('Article updated successfully!');
            delete form.dataset.editId;
        } else {
            DB.addArticle(article);
            Utils.showToast('Article published successfully!');
        }

        form.reset();
        this.loadArticlesList();
        
        // Switch to articles tab
        document.querySelector('[data-tab="articles"]')?.click();
    },

    // Edit article
    editArticle(id) {
        const article = DB.getArticle(id);
        if (!article) return;

        const form = document.getElementById('article-form');
        form.dataset.editId = id;

        form.querySelector('[name="title"]').value = article.title;
        form.querySelector('[name="category"]').value = article.category;
        form.querySelector('[name="excerpt"]').value = article.excerpt || '';
        form.querySelector('[name="content"]').value = article.content;
        form.querySelector('[name="image"]').value = article.image || '';
        form.querySelector('[name="author"]').value = article.author || '';
        
        // Switch to create tab
        document.querySelector('[data-tab="create"]')?.click();
        
        Utils.showToast('Editing article: ' + article.title, 'info');
    },

    // Delete article
    deleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            DB.deleteArticle(id);
            this.loadArticlesList();
            Utils.showToast('Article deleted');
        }
    }
};

// ============================================
// MAIN APP
// ============================================
const App = {
    // Initialize application
    init() {
        this.setupHeader();
        this.setupMobileNav();
        this.loadContent();
        this.setupFilters();
        this.setupNewsletter();
        this.loadSampleArticles();
    },

    // Setup sticky header
    setupHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    },

    // Setup mobile navigation
    setupMobileNav() {
        const toggle = document.querySelector('.menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (toggle && mobileNav) {
            toggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        }
    },

    // Load content based on page
    loadContent() {
        const articlesGrid = document.getElementById('articles-grid');
        const articleContent = document.getElementById('article-content');
        const popularPosts = document.getElementById('popular-posts');

        const articles = DB.getArticles();

        // Home page - articles grid
        if (articlesGrid) {
            ArticleRenderer.renderGrid(articles, articlesGrid);
        }

        // Article page
        if (articleContent) {
            const params = Utils.getUrlParams();
            const article = DB.getArticleBySlug(params.slug);
            
            if (article) {
                DB.incrementViews(article.id);
                ArticleRenderer.renderFullArticle(article, articleContent);
            } else {
                articleContent.innerHTML = `
                    <div style="text-align: center; padding: 100px 20px;">
                        <h2>Article Not Found</h2>
                        <p style="color: var(--text-muted); margin: 20px 0;">The article you're looking for doesn't exist.</p>
                        <a href="index.html" class="btn">Back to Home</a>
                    </div>
                `;
            }
        }

        // Popular posts sidebar
        if (popularPosts) {
            ArticleRenderer.renderPopularPosts(articles, popularPosts);
        }
    },

    // Setup category filters
    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const articlesGrid = document.getElementById('articles-grid');
        
        if (!filterBtns.length || !articlesGrid) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter articles
                const category = btn.dataset.category;
                let articles = DB.getArticles();
                
                if (category !== 'all') {
                    articles = articles.filter(a => a.category === category);
                }

                ArticleRenderer.renderGrid(articles, articlesGrid);
            });
        });
    },

    // Setup newsletter form
    setupNewsletter() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            // In a real app, this would send to a backend
            Utils.showToast('Thanks for subscribing!');
            form.reset();
        });
    },

    // Navigate to article
    viewArticle(slug) {
        window.location.href = `article.html?slug=${slug}`;
    },

    // Load sample articles if none exist
    loadSampleArticles() {
        const articles = DB.getArticles();
        if (articles.length > 0) return;

        const sampleArticles = [
            {
                title: "Breaking Down the Latest Policy Reforms: What You Need to Know",
                category: "Politics",
                excerpt: "An in-depth analysis of the recent policy changes and their potential impact on citizens across the nation.",
                content: `The political landscape continues to evolve with new policy reforms that promise significant changes to how government operates. In this comprehensive analysis, we examine the key aspects of these reforms and what they mean for everyday citizens.

## The Core Changes

The new policy framework introduces several fundamental shifts in governance approach. These changes affect everything from local administration to federal oversight mechanisms.

First and foremost, the reforms emphasize transparency in governmental processes. This means more public access to decision-making procedures and greater accountability for elected officials.

## Impact on Citizens

The direct impact on citizens cannot be overstated. From tax implications to social services, these reforms touch nearly every aspect of civic life.

> "These changes represent the most significant shift in policy direction we've seen in decades." - Political Analyst

Healthcare access, education funding, and infrastructure development are all areas that will see substantial modifications under the new framework.

## Looking Ahead

As we move forward, it's crucial for citizens to stay informed and engaged. The implementation of these reforms will require public participation and oversight to ensure they achieve their intended goals.

We'll continue to monitor developments and provide updates as the situation evolves. Stay tuned to Avalanche Media for comprehensive coverage.`,
                author: "Avalanche Media",
                image: ""
            },
            {
                title: "Election Analysis: Key Takeaways from Recent Voting Trends",
                category: "Analysis",
                excerpt: "Our team breaks down the voting patterns and demographic shifts that shaped recent electoral outcomes.",
                content: `Understanding electoral dynamics requires careful analysis of multiple factors. In this piece, we examine the key trends that emerged from recent elections and what they might signal for future political contests.

## Demographic Shifts

Voter demographics continue to evolve, with younger generations showing increased participation rates. This shift has profound implications for political strategy and messaging.

Urban-rural divides remain significant, but new patterns are emerging in suburban areas that could reshape electoral maps for years to come.

## Voter Turnout Analysis

Turnout numbers tell a compelling story about civic engagement. We've seen record-breaking participation in some regions while others struggle to maintain historical averages.

> "The data suggests a fundamental realignment in how Americans view their role in the democratic process."

## Policy Implications

These voting trends directly influence policy priorities. Elected officials are adjusting their platforms to reflect the evolving preferences of their constituents.

## What's Next

As we approach future election cycles, these trends will likely intensify. Political observers should pay close attention to emerging patterns that could signal further shifts in the electoral landscape.`,
                author: "Avalanche Media",
                image: ""
            },
            {
                title: "Commentary: The State of Political Discourse in Modern Media",
                category: "Commentary",
                excerpt: "A critical examination of how political discussion has evolved in the age of social media and 24-hour news cycles.",
                content: `Political discourse in contemporary society faces unprecedented challenges. The intersection of traditional media, social platforms, and citizen journalism has created a complex information ecosystem that demands scrutiny.

## The Media Landscape

Today's media environment is characterized by fragmentation and polarization. News consumers increasingly gravitate toward sources that confirm their existing beliefs, creating echo chambers that limit exposure to diverse perspectives.

The 24-hour news cycle has accelerated the pace of political coverage, often at the expense of depth and nuance. Quick takes and hot reactions have replaced thoughtful analysis in many outlets.

## Social Media's Role

Social platforms have democratized political discourse, giving voice to previously marginalized perspectives. However, this democratization comes with significant drawbacks.

> "The challenge isn't access to information—it's distinguishing signal from noise in an overwhelming flood of content."

Misinformation spreads rapidly, and algorithmic curation can amplify extreme viewpoints while suppressing moderate voices.

## A Path Forward

Improving political discourse requires effort from media producers and consumers alike. Critical thinking, source verification, and a commitment to engaging with diverse viewpoints are essential skills for navigating today's information landscape.

At Avalanche Media, we're committed to providing balanced, thoughtful analysis that contributes to healthier political conversation.`,
                author: "Avalanche Media",
                image: ""
            },
            {
                title: "Policy Review: Infrastructure Investment and Economic Growth",
                category: "Review",
                excerpt: "Evaluating the effectiveness of recent infrastructure initiatives and their impact on economic development.",
                content: `Infrastructure investment has long been touted as a driver of economic growth. In this review, we assess recent initiatives and examine whether they're delivering on their promises.

## Investment Overview

Billions of dollars have been allocated to infrastructure projects nationwide. These investments span transportation, digital connectivity, energy systems, and public facilities.

The scope of these projects is ambitious, aiming to modernize aging infrastructure while creating jobs and stimulating local economies.

## Economic Impact Assessment

Measuring the economic impact of infrastructure spending requires looking at both direct and indirect effects. Construction jobs and material purchases provide immediate stimulus, while improved infrastructure supports long-term productivity gains.

> "The true return on infrastructure investment often takes years to fully materialize."

Early data suggests positive trends in regions with significant project activity, though isolating the effects of infrastructure spending from other economic factors remains challenging.

## Challenges and Criticisms

Not all aspects of infrastructure investment have gone smoothly. Cost overruns, project delays, and questions about prioritization have prompted criticism from various quarters.

## Verdict

While it's too early for a definitive assessment, initial indicators suggest these investments are contributing to economic resilience and growth. Continued monitoring and adjustment will be essential for maximizing returns.`,
                author: "Avalanche Media",
                image: ""
            },
            {
                title: "Weekly News Roundup: Top Political Stories You May Have Missed",
                category: "News",
                excerpt: "A comprehensive summary of this week's most important political developments from around the nation.",
                content: `This week brought several significant political developments that deserve attention. Here's our roundup of the stories that shaped the political landscape.

## Legislative Updates

Congress made progress on several key bills this week. Budget negotiations continued with both parties seeking common ground on spending priorities.

Committee hearings addressed topics ranging from technology regulation to environmental policy, with testimony from expert witnesses informing ongoing debates.

## Executive Actions

The administration announced new initiatives focused on economic competitiveness and national security. These executive actions signal policy priorities for the coming months.

> "The balance of power between branches continues to evolve through these ongoing negotiations and actions."

## State-Level Developments

State governments saw their own share of political activity. Election law changes, judicial appointments, and local policy decisions will have ripple effects beyond state borders.

## International Implications

Domestic political developments increasingly carry international significance. Trade relationships, diplomatic positioning, and global cooperation all factor into the week's political calculus.

## Looking Ahead

Next week promises continued activity as legislators work toward key deadlines. Stay tuned to Avalanche Media for comprehensive coverage of developing stories.`,
                author: "Avalanche Media",
                image: ""
            }
        ];

        sampleArticles.forEach(article => {
            article.slug = Utils.createSlug(article.title);
            DB.addArticle(article);
        });

        // Reload content after adding samples
        this.loadContent();
    }
};

// ============================================
// ADMIN TAB NAVIGATION
// ============================================
function setupAdminTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll('.admin-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPanel = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target panel
            panels.forEach(panel => {
                panel.style.display = panel.id === `${targetPanel}-panel` ? 'block' : 'none';
            });
        });
    });
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app on all pages
    App.init();
    
    // Initialize admin if on admin page
    if (document.querySelector('.admin-container')) {
        Admin.init();
        setupAdminTabs();
    }
});
