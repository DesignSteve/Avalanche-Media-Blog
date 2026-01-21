/**
 * AVALANCHE MEDIA - Blog Application
 * Political Commentary | Review | Analysis
 * With Firebase Integration
 */

// ============================================
// FIREBASE CONFIGURATION
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9_opVhLABVhRH4naU7deKcNXPZZxn0gE",
    authDomain: "avalanchemedia-3e261.firebaseapp.com",
    projectId: "avalanchemedia-3e261",
    storageBucket: "avalanchemedia-3e261.firebasestorage.app",
    messagingSenderId: "152968664590",
    appId: "1:152968664590:web:741ae914516ecc906a4e5f"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ============================================
// DATA STORE (Firebase Firestore)
// ============================================
const DB = {
    // Get all articles
    async getArticles() {
        try {
            const articlesRef = collection(db, 'articles');
            const q = query(articlesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const articles = [];
            snapshot.forEach(doc => {
                articles.push({ id: doc.id, ...doc.data() });
            });
            return articles;
        } catch (error) {
            console.error('Error getting articles:', error);
            return [];
        }
    },

    // Add new article
    async addArticle(article) {
        try {
            article.createdAt = new Date().toISOString();
            article.views = 0;
            const docRef = await addDoc(collection(db, 'articles'), article);
            return { id: docRef.id, ...article };
        } catch (error) {
            console.error('Error adding article:', error);
            return null;
        }
    },

    // Update article
    async updateArticle(id, updates) {
        try {
            updates.updatedAt = new Date().toISOString();
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, updates);
            return { id, ...updates };
        } catch (error) {
            console.error('Error updating article:', error);
            return null;
        }
    },

    // Delete article
    async deleteArticle(id) {
        try {
            await deleteDoc(doc(db, 'articles', id));
            return true;
        } catch (error) {
            console.error('Error deleting article:', error);
            return false;
        }
    },

    // Get single article by ID
    async getArticle(id) {
        try {
            const docSnap = await getDoc(doc(db, 'articles', id));
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting article:', error);
            return null;
        }
    },

    // Get article by slug
    async getArticleBySlug(slug) {
        try {
            const articlesRef = collection(db, 'articles');
            const q = query(articlesRef, where('slug', '==', slug));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting article by slug:', error);
            return null;
        }
    },

    // Increment view count
    async incrementViews(id) {
        try {
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, {
                views: increment(1)
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
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
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='${Utils.getPlaceholderImage(article.category)}'">
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
                    <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='${Utils.getPlaceholderImage(article.category)}'">
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
                <img src="${imageUrl}" alt="${article.title}" class="article-hero-image" onerror="this.src='${Utils.getPlaceholderImage(article.category)}'">
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
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='${Utils.getPlaceholderImage(article.category)}'">
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
    async loadArticlesList() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;"><div class="loading-spinner"></div></td></tr>';

        const articles = await DB.getArticles();
        
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
    async saveArticle() {
        const form = document.getElementById('article-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        
        // Disable button while saving
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        const article = {
            title: formData.get('title'),
            slug: Utils.createSlug(formData.get('title')),
            category: formData.get('category'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            image: formData.get('image'),
            author: formData.get('author') || 'Avalanche Media'
        };

        const editId = form.dataset.editId;
        
        if (editId) {
            await DB.updateArticle(editId, article);
            Utils.showToast('Article updated successfully!');
            delete form.dataset.editId;
        } else {
            await DB.addArticle(article);
            Utils.showToast('Article published successfully!');
        }

        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Publish Article
        `;
        
        this.loadArticlesList();
        
        // Switch to articles tab
        document.querySelector('[data-tab="articles"]')?.click();
    },

    // Edit article
    async editArticle(id) {
        const article = await DB.getArticle(id);
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
    async deleteArticle(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            await DB.deleteArticle(id);
            this.loadArticlesList();
            Utils.showToast('Article deleted');
        }
    }
};

// Make Admin available globally
window.Admin = Admin;

// ============================================
// MAIN APP
// ============================================
const App = {
    // Initialize application
    async init() {
        this.setupHeader();
        this.setupMobileNav();
        await this.loadContent();
        this.setupFilters();
        this.setupNewsletter();
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
    async loadContent() {
        const articlesGrid = document.getElementById('articles-grid');
        const articleContent = document.getElementById('article-content');
        const popularPosts = document.getElementById('popular-posts');

        const articles = await DB.getArticles();

        // Home page - articles grid
        if (articlesGrid) {
            ArticleRenderer.renderGrid(articles, articlesGrid);
        }

        // Article page
        if (articleContent) {
            const params = Utils.getUrlParams();
            const article = await DB.getArticleBySlug(params.slug);
            
            if (article) {
                await DB.incrementViews(article.id);
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
            btn.addEventListener('click', async () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter articles
                const category = btn.dataset.category;
                let articles = await DB.getArticles();
                
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
    }
};

// Make App available globally
window.App = App;

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
