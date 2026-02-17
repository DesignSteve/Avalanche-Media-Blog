/**
 * AVALANCHE MEDIA - Blog Application
 * Political Commentary | Review | Analysis
 * With Firebase Integration
 */

// ============================================
// FIREBASE CONFIGURATION
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
// SITE SETTINGS (Firebase Firestore)
// ============================================
const SiteSettings = {
    // Save eBook settings to Firebase
    async saveEbookSettings(settings) {
        try {
            const settingsRef = doc(db, 'siteSettings', 'ebook');
            await setDoc(settingsRef, {
                ...settings,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error saving eBook settings:', error);
            return false;
        }
    },
    
    // Get eBook settings from Firebase
    async getEbookSettings() {
        try {
            const settingsRef = doc(db, 'siteSettings', 'ebook');
            const docSnap = await getDoc(settingsRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting eBook settings:', error);
            return null;
        }
    },
    
    // Save banner settings to Firebase
    async saveBannerSettings(settings) {
        try {
            const settingsRef = doc(db, 'siteSettings', 'banner');
            await setDoc(settingsRef, {
                ...settings,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error saving banner settings:', error);
            return false;
        }
    },
    
    // Get banner settings from Firebase
    async getBannerSettings() {
        try {
            const settingsRef = doc(db, 'siteSettings', 'banner');
            const docSnap = await getDoc(settingsRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting banner settings:', error);
            return null;
        }
    }
};

// Make SiteSettings available globally
window.SiteSettings = SiteSettings;

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

    // Increment view count (excludes admin devices)
    async incrementViews(id) {
        try {
            // Check if user is admin (logged in to admin panel)
            const isAdmin = sessionStorage.getItem('adminLoggedIn') === 'true';
            
            // Check if this device is marked as admin device
            const isAdminDevice = localStorage.getItem('isAdminDevice') === 'true';
            
            // Don't count views from admin
            if (isAdmin || isAdminDevice) {
                console.log('Admin view - not counted');
                return;
            }
            
            // Check if user already viewed this article (prevent multiple counts)
            const viewedArticles = JSON.parse(localStorage.getItem('viewedArticles') || '[]');
            const viewKey = `${id}-${new Date().toDateString()}`;
            
            if (viewedArticles.includes(viewKey)) {
                console.log('Already viewed today - not counted');
                return;
            }
            
            // Add to viewed articles
            viewedArticles.push(viewKey);
            localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
            
            // Increment in Firebase
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, {
                views: increment(1)
            });
            
            // Track monthly views
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
            const monthlyData = JSON.parse(localStorage.getItem('monthlyViews') || '{}');
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            localStorage.setItem('monthlyViews', JSON.stringify(monthlyData));
            
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }
};

// Make DB available globally for debugging
window.DB = DB;

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
                                <img src="images/logo.png" alt="Avalanche Media" class="author-avatar-img">
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
                            <img src="images/logo.png" alt="Avalanche Media" class="author-avatar-img">
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
        const articleUrl = encodeURIComponent(window.location.href);
        const articleTitle = encodeURIComponent(article.title);
        
        // Update page title and meta tags for SEO
        document.title = `${article.title} | Avalanche Media`;
        document.querySelector('meta[name="description"]').setAttribute('content', article.excerpt || article.content.substring(0, 160));
        
        // Update Open Graph meta tags
        const ogTags = {
            'og:title': article.title,
            'og:description': article.excerpt || article.content.substring(0, 160),
            'og:image': article.image || 'https://avalanchemediablog.com/images/banner.png',
            'og:url': window.location.href
        };
        
        for (const [property, content] of Object.entries(ogTags)) {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        }
        
        // Update Twitter meta tags
        const twitterTags = {
            'twitter:title': article.title,
            'twitter:description': article.excerpt || article.content.substring(0, 160),
            'twitter:image': article.image || 'https://avalanchemediablog.com/images/banner.png'
        };
        
        for (const [name, content] of Object.entries(twitterTags)) {
            let meta = document.querySelector(`meta[name="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        }
        
        // Update Article Schema
        const schemaScript = document.getElementById('article-schema');
        if (schemaScript) {
            const schema = {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                "headline": article.title,
                "description": article.excerpt || article.content.substring(0, 160),
                "image": article.image || "https://avalanchemediablog.com/images/banner.png",
                "datePublished": article.createdAt,
                "dateModified": article.updatedAt || article.createdAt,
                "author": {
                    "@type": "Person",
                    "name": article.author || "Avalanche Media"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Avalanche Media",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://avalanchemediablog.com/images/logo.png"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": window.location.href
                }
            };
            schemaScript.textContent = JSON.stringify(schema);
        }
        
        // Convert markdown-like content to HTML
        let htmlContent = article.content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^## (.*$)/gm, '</p><h2>$1</h2><p>')
            .replace(/^### (.*$)/gm, '</p><h3>$1</h3><p>')
            .replace(/^> (.*$)/gm, '</p><blockquote>$1</blockquote><p>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // YouTube video embeds - convert YouTube URLs to embedded players
            .replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)/g, 
                '</p><div class="video-embed"><iframe width="100%" height="400" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p>')
            // Auto-link URLs (but not ones already in href or YouTube embeds)
            .replace(/(?<!href="|src="|">)(https?:\/\/(?!www\.youtube\.com|youtu\.be)[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
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
            
            <!-- Social Sharing Section -->
            <div class="article-actions">
                <div class="container">
                    <div class="share-section">
                        <h4>Share this article</h4>
                        <div class="share-buttons">
                            <a href="https://wa.me/?text=${articleTitle}%20${articleUrl}" target="_blank" class="share-btn whatsapp" title="Share on WhatsApp">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </a>
                            <a href="https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}" target="_blank" class="share-btn twitter" title="Share on Twitter">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                Twitter
                            </a>
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${articleUrl}" target="_blank" class="share-btn facebook" title="Share on Facebook">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </a>
                            <button onclick="App.copyLink()" class="share-btn copy-link" title="Copy Link">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                Copy Link
                            </button>
                        </div>
                    </div>
                    
                    <div class="like-section">
                        <button onclick="App.likeArticle('${article.id}')" class="like-btn" id="like-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            <span id="like-count">${article.likes || 0}</span> Likes
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Comments Section -->
            <div class="comments-section">
                <div class="container">
                    <h3 class="comments-title">Comments</h3>
                    
                    <form id="comment-form" class="comment-form" onsubmit="App.submitComment(event, '${article.id}')">
                        <input type="hidden" name="replyTo" id="reply-to" value="">
                        <input type="hidden" name="quotedComment" id="quoted-comment" value="">
                        <div id="reply-indicator" class="reply-indicator" style="display: none;">
                            <span id="reply-indicator-text"></span>
                            <button type="button" onclick="App.cancelReply()" class="cancel-reply">✕</button>
                        </div>
                        <input type="text" name="name" id="commenter-name" placeholder="Your Name" required>
                        <textarea name="comment" id="comment-text" placeholder="Write a comment..." required></textarea>
                        <button type="submit" class="btn">Post Comment</button>
                    </form>
                    
                    <div id="comments-list" class="comments-list">
                        <!-- Comments will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.title = `${article.title} | Avalanche Media`;
        
        // Update canonical URL for SEO
        const canonicalUrl = document.getElementById('canonical-url');
        if (canonicalUrl) {
            canonicalUrl.href = `https://avalanchemediablog.com/article.html?slug=${article.slug}`;
        }
        
        // Load comments
        App.loadComments(article.id);
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
        this.loadDashboardStats();
        this.setupForm();
    },

    // Load dashboard statistics
    async loadDashboardStats() {
        const articles = await DB.getArticles();
        
        // Total articles
        const totalArticles = articles.length;
        const statTotal = document.getElementById('stat-total');
        if (statTotal) statTotal.textContent = totalArticles;
        
        // Total views (sum of all article views)
        const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = totalViews.toLocaleString();
        
        // This month's views - calculate from articles created/viewed this month
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        // Calculate views from articles created this month
        let monthlyViews = 0;
        articles.forEach(article => {
            const articleDate = new Date(article.createdAt);
            // Count views from articles created this month
            if (articleDate.getMonth() === thisMonth && articleDate.getFullYear() === thisYear) {
                monthlyViews += (article.views || 0);
            }
        });
        
        // If no views this month, show total recent views (last 30 days estimate)
        if (monthlyViews === 0) {
            // Estimate: sum views of articles created in last 30 days
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            articles.forEach(article => {
                const articleDate = new Date(article.createdAt);
                if (articleDate >= thirtyDaysAgo) {
                    monthlyViews += (article.views || 0);
                }
            });
        }
        
        const statMonth = document.getElementById('stat-month');
        if (statMonth) statMonth.textContent = monthlyViews.toLocaleString();
        
        // Update categories count
        const statCategories = document.getElementById('stat-categories');
        if (statCategories) {
            const uniqueCategories = [...new Set(articles.map(a => a.category))].length;
            statCategories.textContent = uniqueCategories || 5;
        }
        
        // Load recent articles for dashboard
        this.loadRecentArticlesAdmin(articles.slice(0, 5));
    },
    
    // Load recent articles for admin dashboard
    loadRecentArticlesAdmin(articles) {
        const container = document.getElementById('recent-articles-admin');
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">No articles yet. Create your first article!</p>';
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        articles.forEach(article => {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f5f5eb; border-radius: 8px; border-left: 4px solid #8B0000;">
                    <div>
                        <strong style="font-size: 0.95rem; color: #111;">${Utils.truncate(article.title, 45)}</strong>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">
                            <span style="background: #8B0000; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 0.7rem;">${article.category}</span>
                            <span style="margin-left: 10px;">${Utils.formatDate(article.createdAt)}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.1rem; color: #8B0000; font-weight: 700;">${(article.views || 0).toLocaleString()}</span>
                        <span style="display: block; font-size: 0.75rem; color: #666;">views</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    // Load articles list for admin
    async loadArticlesList() {
        const container = document.getElementById('articles-list');
        if (!container) return;

        container.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;"><div class="loading-spinner"></div></td></tr>';

        const articles = await DB.getArticles();
        
        if (articles.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No articles yet. Create your first article!
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        articles.forEach(article => {
            const status = article.status || 'published';
            let statusBadge = '';
            if (status === 'draft') {
                statusBadge = '<span style="padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; background: #ffc107; color: #000;">📝 Draft</span>';
            } else if (status === 'scheduled') {
                statusBadge = '<span style="padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; background: #17a2b8; color: #fff;">⏰ Scheduled</span>';
            } else {
                statusBadge = '<span style="padding: 3px 8px; border-radius: 4px; font-size: 0.7rem; background: #28a745; color: #fff;">✓ Published</span>';
            }
            
            html += `
                <tr>
                    <td>${Utils.truncate(article.title, 40)}</td>
                    <td><span class="article-category" style="position: static;">${article.category}</span></td>
                    <td>${statusBadge}</td>
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

    // Get articles (wrapper for DB.getArticles)
    async getArticles() {
        return await DB.getArticles();
    },
    
    // Update article (wrapper for DB.updateArticle)
    async updateArticle(id, data) {
        return await DB.updateArticle(id, data);
    },

    // Save article
    async saveArticle() {
        const form = document.getElementById('article-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        
        // Disable button while saving
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Get publish option (publish, draft, or schedule)
        const publishOption = document.querySelector('input[name="publish-option"]:checked')?.value || 'publish';
        
        // Get image - either from base64 upload or URL
        let imageUrl = formData.get('image-base64') || formData.get('image') || '';
        
        const article = {
            title: formData.get('title'),
            slug: Utils.createSlug(formData.get('title')),
            category: formData.get('category'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            image: imageUrl,
            author: formData.get('author') || 'Avalanche Media',
            status: publishOption === 'publish' ? 'published' : publishOption
        };
        
        // Handle scheduling
        if (publishOption === 'schedule') {
            const scheduleDate = document.getElementById('schedule-date')?.value;
            const scheduleTime = document.getElementById('schedule-time')?.value || '09:00';
            
            if (scheduleDate) {
                article.scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            }
        }
        
        // Set published date for published articles
        if (publishOption === 'publish') {
            article.publishedAt = new Date().toISOString();
        }

        const editId = form.dataset.editId;
        
        let successMessage = 'Article published successfully!';
        if (publishOption === 'draft') {
            successMessage = 'Article saved as draft!';
        } else if (publishOption === 'schedule') {
            const scheduleDate = document.getElementById('schedule-date')?.value;
            const scheduleTime = document.getElementById('schedule-time')?.value || '09:00';
            successMessage = `Article scheduled for ${scheduleDate} at ${scheduleTime}!`;
        }
        
        if (editId) {
            await DB.updateArticle(editId, article);
            Utils.showToast('Article updated successfully!');
            delete form.dataset.editId;
        } else {
            const newArticle = await DB.addArticle(article);
            Utils.showToast(successMessage);
            
            // Only send email notifications for published articles
            if (publishOption === 'publish') {
                await this.notifySubscribers(article);
            }
        }

        form.reset();
        // Clear image preview
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('image-base64').value = '';
        
        // Reset publish option to "Publish Now"
        const publishNowRadio = document.querySelector('input[name="publish-option"][value="publish"]');
        if (publishNowRadio) {
            publishNowRadio.checked = true;
            document.getElementById('schedule-options').style.display = 'none';
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px;">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span id="submit-btn-text">Publish Article</span>
        `;
        
        this.loadArticlesList();
        
        // Switch to appropriate tab
        if (publishOption === 'draft' || publishOption === 'schedule') {
            document.querySelector('[data-tab="drafts"]')?.click();
        } else {
            document.querySelector('[data-tab="articles"]')?.click();
        }
    },
    
    // Send email notifications to all subscribers using Brevo
    async notifySubscribers(article) {
        try {
            // Get all subscribers from Firebase
            const subscribersRef = collection(db, 'subscribers');
            const snapshot = await getDocs(subscribersRef);
            
            if (snapshot.empty) {
                console.log('No subscribers to notify');
                return;
            }
            
            const articleLink = `https://designsteve.github.io/Avalanche-Media-Blog/article.html?slug=${article.slug}`;
            
            // Collect all subscriber emails
            const subscribers = [];
            snapshot.forEach((doc) => {
                const subscriber = doc.data();
                subscribers.push({ email: subscriber.email });
            });
            
            // Send email via Brevo API
            const emailData = {
                sender: {
                    name: "Avalanche Media",
                    email: "avalanchemedia2022@gmail.com"
                },
                to: subscribers,
                subject: `New Article from Avalanche Media: ${article.title}`,
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #8B0000; margin: 0;">AVALANCHE MEDIA</h1>
                            <p style="color: #666; margin: 5px 0;">Political Commentary | Review | Analysis</p>
                        </div>
                        
                        <h2 style="color: #1a1a1a;">New Article Published!</h2>
                        
                        <div style="background: #f5f5dc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #8B0000; margin-top: 0;">${article.title}</h3>
                            <p style="color: #3a3a3a; line-height: 1.6;">${article.excerpt || article.content.substring(0, 200) + '...'}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${articleLink}" style="background: #8B0000; color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Read Full Article</a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <div style="text-align: center; color: #666; font-size: 12px;">
                            <p>Avalanche Media - Your trusted source for political insight</p>
                            <p>
                                <a href="https://www.youtube.com/@avalanchemedia" style="color: #8B0000;">YouTube</a> | 
                                <a href="https://www.facebook.com/share/1FvBysr7xz/" style="color: #8B0000;">Facebook</a>
                            </p>
                            <p style="margin-top: 15px;">To unsubscribe, reply to this email with "UNSUBSCRIBE"</p>
                        </div>
                    </div>
                `
            };
            
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'api-key': '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'
                },
                body: JSON.stringify(emailData)
            });
            
            if (response.ok) {
                Utils.showToast(`Email sent to ${subscribers.length} subscriber(s)!`);
                console.log('Emails sent successfully');
            } else {
                const error = await response.json();
                console.error('Brevo API error:', error);
                Utils.showToast('Failed to send some emails', 'error');
            }
        } catch (error) {
            console.error('Error notifying subscribers:', error);
            Utils.showToast('Error sending notifications', 'error');
        }
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

    // Pagination state
    currentPage: 1,
    articlesPerPage: 6,
    allArticles: [],

    // Load content based on page
    async loadContent() {
        const articlesGrid = document.getElementById('articles-grid');
        const articleContent = document.getElementById('article-content');
        const popularPosts = document.getElementById('popular-posts');
        const trendingGrid = document.getElementById('trending-grid');

        try {
            let articles = await DB.getArticles();
            
            // Filter to only show published articles on public pages
            // Show articles that are: published, have no status (old articles), or status is empty/undefined
            const publishedArticles = articles.filter(a => {
                const status = (a.status || '').toLowerCase();
                return !status || status === 'published' || status === 'publish';
            });
            
            // Store all articles for pagination
            this.allArticles = publishedArticles;

            // Home page - Trending section (top 4 by views + recency)
            if (trendingGrid) {
                this.renderTrending(publishedArticles, trendingGrid);
            }

            // Home page - articles grid with pagination (only published)
            if (articlesGrid) {
                this.currentPage = 1;
                this.renderArticlesWithPagination(publishedArticles, articlesGrid);
            }

            // Article page
            if (articleContent) {
                const params = Utils.getUrlParams();
                const article = await DB.getArticleBySlug(params.slug);
                
                // Only show if published (or no status - for backward compatibility)
                const articleStatus = (article?.status || '').toLowerCase();
                const isPublished = !articleStatus || articleStatus === 'published' || articleStatus === 'publish';
                
                if (article && isPublished) {
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

            // Popular posts sidebar (only published)
            if (popularPosts) {
                ArticleRenderer.renderPopularPosts(publishedArticles, popularPosts);
            }
        } catch (error) {
            console.error('Error loading content:', error);
            // Show error message in trending grid if it exists
            if (trendingGrid) {
                trendingGrid.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Unable to load trending articles.</p>';
            }
        }
    },

    // Render trending articles - shows NEWEST articles (most recent first)
    renderTrending(articles, container) {
        if (!container) return;
        
        // Sort by date (newest first) and get top 4
        const trending = [...articles]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
        
        if (trending.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">No trending articles yet.</p>';
            return;
        }
        
        let html = '';
        trending.forEach((article, index) => {
            const imageUrl = article.image || Utils.getPlaceholderImage(article.category);
            
            // Check how new the article is
            const ageInHours = (new Date() - new Date(article.createdAt)) / (1000 * 60 * 60);
            let badgeText;
            
            if (ageInHours < 24) {
                badgeText = '🔴 JUST IN';
            } else if (ageInHours < 72) {
                badgeText = '🆕 NEW';
            } else {
                badgeText = '🔥 TRENDING';
            }
            
            html += `
                <a href="article.html?slug=${article.slug}" class="trending-card">
                    <div class="trending-card-image">
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='${Utils.getPlaceholderImage(article.category)}'">
                        <span class="trending-badge">${badgeText}</span>
                    </div>
                    <div class="trending-card-content">
                        <div class="trending-card-category">${article.category || 'News'}</div>
                        <h3 class="trending-card-title">${article.title}</h3>
                        <div class="trending-card-meta">
                            <span>${Utils.formatDate(article.createdAt)}</span>
                            <span class="trending-card-views">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                                ${(article.views || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </a>
            `;
        });
        container.innerHTML = html;
    },

    // Render articles with pagination
    renderArticlesWithPagination(articles, container) {
        if (!container) return;
        
        const totalPages = Math.ceil(articles.length / this.articlesPerPage);
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        // Render articles
        ArticleRenderer.renderGrid(paginatedArticles, container);
        
        // Render pagination
        this.renderPagination(totalPages);
    },

    // Render pagination controls
    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `<button class="pagination-btn nav-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="App.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                    ‹ Prev
                </button>`;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page
        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="App.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="App.goToPage(${i})">${i}</button>`;
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn" onclick="App.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        html += `<button class="pagination-btn nav-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="App.goToPage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                    Next ›
                </button>`;
        
        paginationContainer.innerHTML = html;
    },

    // Go to specific page
    goToPage(page) {
        const totalPages = Math.ceil(this.allArticles.length / this.articlesPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        const articlesGrid = document.getElementById('articles-grid');
        this.renderArticlesWithPagination(this.allArticles, articlesGrid);
        
        // Scroll to articles section
        document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
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

                // Filter articles (only published)
                const category = btn.dataset.category;
                let articles = await DB.getArticles();
                
                // Filter to only published articles
                articles = articles.filter(a => {
                    const status = (a.status || '').toLowerCase();
                    return !status || status === 'published' || status === 'publish';
                });
                
                if (category !== 'all') {
                    articles = articles.filter(a => a.category === category);
                }

                // Update allArticles and reset pagination
                this.allArticles = articles;
                this.currentPage = 1;
                this.renderArticlesWithPagination(articles, articlesGrid);
            });
        });
    },

    // Setup newsletter form with EmailJS
    setupNewsletter() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.toLowerCase().trim();
            const submitBtn = form.querySelector('button');
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            try {
                // Check if already subscribed
                const subscribersRef = collection(db, 'subscribers');
                const q = query(subscribersRef, where('email', '==', email));
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                    Utils.showToast('You are already subscribed! You will receive updates on new articles.');
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Subscribe';
                    return;
                }
                
                // Save new subscriber to Firebase
                await addDoc(collection(db, 'subscribers'), {
                    email: email,
                    subscribedAt: new Date().toISOString()
                });
                
                Utils.showToast('🎉 Successfully subscribed! You will receive email notifications when new articles are published.');
                form.reset();
            } catch (error) {
                console.error('Error subscribing:', error);
                Utils.showToast('Failed to subscribe. Please try again.', 'error');
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        });
    },

    // Navigate to article
    viewArticle(slug) {
        window.location.href = `article.html?slug=${slug}`;
    },
    
    // Copy link to clipboard
    copyLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            Utils.showToast('Link copied to clipboard!');
        }).catch(() => {
            Utils.showToast('Failed to copy link', 'error');
        });
    },
    
    // Like article
    async likeArticle(articleId) {
        try {
            const likeBtn = document.getElementById('like-btn');
            const likeCount = document.getElementById('like-count');
            
            // Check if already liked (using localStorage)
            const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
            
            if (likedArticles.includes(articleId)) {
                Utils.showToast('You already liked this article!');
                return;
            }
            
            // Update in Firebase
            const articleRef = doc(db, 'articles', articleId);
            await updateDoc(articleRef, {
                likes: increment(1)
            });
            
            // Save to localStorage
            likedArticles.push(articleId);
            localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
            
            // Update UI
            likeBtn.classList.add('liked');
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
            Utils.showToast('Thanks for the like!');
        } catch (error) {
            console.error('Error liking article:', error);
            Utils.showToast('Failed to like article', 'error');
        }
    },
    
    // Submit comment
    async submitComment(event, articleId) {
        event.preventDefault();
        
        const form = event.target;
        const name = form.querySelector('input[name="name"]').value;
        const comment = form.querySelector('textarea[name="comment"]').value;
        const replyTo = form.querySelector('input[name="replyTo"]').value;
        const quotedComment = form.querySelector('input[name="quotedComment"]').value;
        
        try {
            await addDoc(collection(db, 'comments'), {
                articleId: articleId,
                name: name,
                comment: comment,
                replyTo: replyTo || null,
                quotedComment: quotedComment || null,
                likes: 0,
                createdAt: new Date().toISOString()
            });
            
            Utils.showToast('Comment posted!');
            form.reset();
            document.getElementById('reply-to').value = '';
            document.getElementById('quoted-comment').value = '';
            document.getElementById('reply-indicator').style.display = 'none';
            this.loadComments(articleId);
        } catch (error) {
            console.error('Error posting comment:', error);
            Utils.showToast('Failed to post comment', 'error');
        }
    },
    
    // Reply to comment
    replyToComment: function(commenterName) {
        document.getElementById('reply-to').value = commenterName;
        document.getElementById('reply-indicator').style.display = 'flex';
        document.getElementById('reply-indicator-text').textContent = 'Replying to ' + commenterName;
        document.getElementById('comment-text').placeholder = 'Reply to ' + commenterName + '...';
        document.getElementById('comment-text').focus();
        document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Quote comment
    quoteComment: function(commenterName, commentText) {
        document.getElementById('reply-to').value = commenterName;
        document.getElementById('quoted-comment').value = commentText;
        document.getElementById('reply-indicator').style.display = 'flex';
        document.getElementById('reply-indicator-text').textContent = 'Quoting ' + commenterName;
        document.getElementById('comment-text').placeholder = 'Your reply to the quote...';
        document.getElementById('comment-text').focus();
        document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' });
    },
    
    // Cancel reply
    cancelReply: function() {
        document.getElementById('reply-to').value = '';
        document.getElementById('quoted-comment').value = '';
        document.getElementById('reply-indicator').style.display = 'none';
        document.getElementById('comment-text').placeholder = 'Write a comment...';
    },
    
    // Like comment
    likeComment: async function(commentId, articleId) {
        try {
            const likedComments = JSON.parse(localStorage.getItem('likedComments') || '[]');
            
            if (likedComments.includes(commentId)) {
                Utils.showToast('You already liked this comment!');
                return;
            }
            
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, {
                likes: increment(1)
            });
            
            likedComments.push(commentId);
            localStorage.setItem('likedComments', JSON.stringify(likedComments));
            
            Utils.showToast('Comment liked!');
            this.loadComments(articleId);
        } catch (error) {
            console.error('Error liking comment:', error);
            Utils.showToast('Failed to like comment', 'error');
        }
    },
    
    // Edit comment
    editComment: function(commentId, articleId, currentText, commenterName) {
        const newText = prompt('Edit your comment:', currentText);
        if (newText && newText.trim() !== '' && newText !== currentText) {
            this.updateComment(commentId, articleId, newText.trim(), commenterName);
        }
    },
    
    // Update comment in Firebase
    updateComment: async function(commentId, articleId, newText, commenterName) {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, {
                comment: newText,
                edited: true,
                editedAt: new Date().toISOString()
            });
            
            Utils.showToast('Comment updated!');
            this.loadComments(articleId);
        } catch (error) {
            console.error('Error updating comment:', error);
            Utils.showToast('Failed to update comment', 'error');
        }
    },
    
    // Delete comment
    deleteComment: async function(commentId, articleId) {
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                const commentRef = doc(db, 'comments', commentId);
                await deleteDoc(commentRef);
                
                Utils.showToast('Comment deleted!');
                this.loadComments(articleId);
            } catch (error) {
                console.error('Error deleting comment:', error);
                Utils.showToast('Failed to delete comment', 'error');
            }
        }
    },
    
    // Store current article ID for comment functions
    currentArticleId: null,
    
    // Load comments
    loadComments: async function(articleId) {
        const container = document.getElementById('comments-list');
        if (!container) return;
        
        // Store article ID for use in other functions
        this.currentArticleId = articleId;
        
        try {
            const commentsRef = collection(db, 'comments');
            const q = query(commentsRef, where('articleId', '==', articleId));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            const comments = [];
            snapshot.forEach(docSnap => {
                comments.push({ id: docSnap.id, ...docSnap.data() });
            });
            comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const likedComments = JSON.parse(localStorage.getItem('likedComments') || '[]');
            
            let html = '';
            comments.forEach((comment, index) => {
                const isLiked = likedComments.includes(comment.id);
                const commentIndex = index;
                
                // Get user initials for avatar
                const nameParts = comment.name.trim().split(' ');
                const initials = nameParts.length > 1 
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : comment.name.substring(0, 2).toUpperCase();
                
                // Generate a consistent color based on the name
                const colors = ['#8B0000', '#8B7500', '#2E7D32', '#1565C0', '#6A1B9A', '#C62828', '#00695C', '#4527A0'];
                const colorIndex = comment.name.length % colors.length;
                const avatarColor = colors[colorIndex];
                
                html += '<div class="comment" data-comment-id="' + comment.id + '" data-index="' + commentIndex + '">';
                html += '<div class="comment-header">';
                html += '<div class="comment-avatar" style="background: ' + avatarColor + '; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">' + initials + '</div>';
                html += '<div class="comment-info">';
                html += '<strong class="comment-author">' + comment.name + '</strong>';
                html += '<span class="comment-date">' + Utils.formatDate(comment.createdAt);
                if (comment.edited) {
                    html += ' (edited)';
                }
                html += '</span>';
                html += '</div>';
                html += '</div>';
                
                if (comment.quotedComment) {
                    html += '<div class="quoted-comment">';
                    html += '<span class="quoted-label">Quoting ' + comment.replyTo + ':</span>';
                    html += '<p>' + comment.quotedComment + '</p>';
                    html += '</div>';
                } else if (comment.replyTo) {
                    html += '<span class="reply-to-label">↩ Replying to ' + comment.replyTo + '</span>';
                }
                
                html += '<p class="comment-text" id="comment-text-' + commentIndex + '">' + comment.comment + '</p>';
                
                html += '<div class="comment-actions">';
                html += '<button class="comment-action-btn" data-action="reply" data-name="' + comment.name + '">Reply</button>';
                html += '<button class="comment-action-btn" data-action="quote" data-name="' + comment.name + '" data-index="' + commentIndex + '">Quote</button>';
                html += '<button class="comment-action-btn ' + (isLiked ? 'liked' : '') + '" data-action="like" data-id="' + comment.id + '">';
                html += '<span>❤</span> ' + (comment.likes || 0);
                html += '</button>';
                html += '<button class="comment-action-btn" data-action="edit" data-id="' + comment.id + '" data-index="' + commentIndex + '" data-name="' + comment.name + '">Edit</button>';
                html += '<button class="comment-action-btn delete-btn" data-action="delete" data-id="' + comment.id + '">Delete</button>';
                html += '</div>';
                html += '</div>';
            });
            
            container.innerHTML = html;
            
            // Add event listeners to all buttons
            this.attachCommentEventListeners(articleId);
            
        } catch (error) {
            console.error('Error loading comments:', error);
            container.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        }
    },
    
    // Attach event listeners to comment action buttons
    attachCommentEventListeners: function(articleId) {
        const buttons = document.querySelectorAll('.comment-action-btn');
        const self = this;
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const commentId = this.getAttribute('data-id');
                const commenterName = this.getAttribute('data-name');
                const commentIndex = this.getAttribute('data-index');
                
                if (action === 'reply') {
                    self.replyToComment(commenterName);
                } else if (action === 'quote') {
                    const commentTextEl = document.getElementById('comment-text-' + commentIndex);
                    const commentText = commentTextEl ? commentTextEl.textContent : '';
                    self.quoteComment(commenterName, commentText);
                } else if (action === 'like') {
                    self.likeComment(commentId, articleId);
                } else if (action === 'edit') {
                    const commentTextEl = document.getElementById('comment-text-' + commentIndex);
                    const currentText = commentTextEl ? commentTextEl.textContent : '';
                    self.editComment(commentId, articleId, currentText, commenterName);
                } else if (action === 'delete') {
                    self.deleteComment(commentId, articleId);
                }
            });
        });
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

// Make App available globally for onclick handlers
window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main app on all pages
    App.init();
    
    // Initialize admin if on admin page
    if (document.querySelector('.admin-container')) {
        Admin.init();
        setupAdminTabs();
    }
});
