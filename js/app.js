/**
 * AVALANCHE MEDIA - Blog Application
 * Political Commentary | Review | Analysis
 * With Firebase Integration
 * 
 * FIXED VERSION - Added error handling for image loading issues
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
            console.log('Fetched articles:', articles.length); // DEBUG LOG
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
            
            // Increment view count in Firebase
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, {
                views: increment(1)
            });
            
            // Mark as viewed
            viewedArticles.push(viewKey);
            localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
            
            console.log('View counted for article:', id);
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    },

    // Like article
    async likeArticle(id) {
        try {
            const articleRef = doc(db, 'articles', id);
            await updateDoc(articleRef, {
                likes: increment(1)
            });
            return true;
        } catch (error) {
            console.error('Error liking article:', error);
            return false;
        }
    },

    // Add comment
    async addComment(comment) {
        try {
            comment.createdAt = new Date().toISOString();
            comment.likes = 0;
            comment.edited = false;
            const docRef = await addDoc(collection(db, 'comments'), comment);
            return { id: docRef.id, ...comment };
        } catch (error) {
            console.error('Error adding comment:', error);
            return null;
        }
    },

    // Get comments for an article
    async getComments(articleId) {
        try {
            const commentsRef = collection(db, 'comments');
            const q = query(commentsRef, where('articleId', '==', articleId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const comments = [];
            snapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            return [];
        }
    },

    // Like comment
    async likeComment(commentId) {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, {
                likes: increment(1)
            });
            return true;
        } catch (error) {
            console.error('Error liking comment:', error);
            return false;
        }
    },

    // Update comment
    async updateComment(commentId, updates) {
        try {
            updates.edited = true;
            updates.editedAt = new Date().toISOString();
            const commentRef = doc(db, 'comments', commentId);
            await updateDoc(commentRef, updates);
            return true;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    },

    // Delete comment
    async deleteComment(commentId) {
        try {
            await deleteDoc(doc(db, 'comments', commentId));
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
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
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    },

    // Calculate read time - FIXED to handle null/undefined content
    calculateReadTime(content) {
        try {
            if (!content || typeof content !== 'string') {
                console.warn('Invalid content for read time calculation:', content);
                return '1 min read';
            }
            const wordsPerMinute = 200;
            const words = content.trim().split(/\s+/).length;
            const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
            return `${minutes} min read`;
        } catch (error) {
            console.error('Error calculating read time:', error);
            return '1 min read';
        }
    },

    // Truncate text - FIXED to handle null/undefined
    truncate(text, length = 150) {
        try {
            if (!text || typeof text !== 'string') {
                console.warn('Invalid text for truncation:', text);
                return '';
            }
            if (text.length <= length) return text;
            return text.substring(0, length).trim() + '...';
        } catch (error) {
            console.error('Error truncating text:', error);
            return '';
        }
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
        return `https://placehold.co/800x400/${color}/FFFFFF?text=${encodeURIComponent(category || 'Article')}`;
    },
    
    // ADDED: Safe image URL getter
    getSafeImageUrl(article) {
        try {
            // Check if article has valid image property
            if (article && article.image && typeof article.image === 'string' && article.image.trim() !== '') {
                return article.image;
            }
            // Return placeholder if no valid image
            return this.getPlaceholderImage(article?.category || 'Article');
        } catch (error) {
            console.error('Error getting image URL:', error);
            return this.getPlaceholderImage('Article');
        }
    }
};

// ============================================
// ARTICLE RENDERER
// ============================================
const ArticleRenderer = {
    // Render article card - FIXED with better error handling
    renderCard(article, featured = false) {
        try {
            // Validate article data
            if (!article) {
                console.error('Cannot render card: article is null/undefined');
                return '';
            }
            
            if (!article.slug || !article.title) {
                console.error('Cannot render card: missing required fields', article);
                return '';
            }
            
            // Use safe methods with fallbacks
            const readTime = Utils.calculateReadTime(article.content || '');
            const imageUrl = Utils.getSafeImageUrl(article); // FIXED: Use new safe method
            const placeholderUrl = Utils.getPlaceholderImage(article.category);
            const title = article.title || 'Untitled Article';
            const excerpt = Utils.truncate(article.excerpt || article.content || 'No description available', featured ? 200 : 120);
            const category = article.category || 'News';
            const author = article.author || 'Avalanche Media';
            const dateStr = Utils.formatDate(article.createdAt);
            
            console.log(`Rendering article: ${title}, Image: ${imageUrl}`); // DEBUG LOG
            
            if (featured) {
                return `
                    <article class="article-featured" onclick="App.viewArticle('${article.slug}')">
                        <div class="article-image">
                            <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${placeholderUrl}'">
                            <span class="article-category">${category}</span>
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
                                    ${dateStr}
                                </span>
                                <span class="article-read-time">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    ${readTime}
                                </span>
                            </div>
                            <h3>${title}</h3>
                            <p class="article-excerpt">${excerpt}</p>
                            <div class="article-footer">
                                <div class="article-author">
                                    <img src="images/logo.png" alt="Avalanche Media" class="author-avatar-img">
                                    <span class="author-name">${author}</span>
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
                        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.onerror=null; this.src='${placeholderUrl}'">
                        <span class="article-category">${category}</span>
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
                                ${dateStr}
                            </span>
                            <span class="article-read-time">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${readTime}
                            </span>
                        </div>
                        <h3>${title}</h3>
                        <p class="article-excerpt">${excerpt}</p>
                        <div class="article-footer">
                            <div class="article-author">
                                <img src="images/logo.png" alt="Avalanche Media" class="author-avatar-img">
                                <span class="author-name">${author}</span>
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
        } catch (error) {
            console.error('Error rendering article card:', article, error);
            return ''; // Return empty string to prevent breaking the whole page
        }
    },

    // Render articles grid - FIXED with better error handling
    renderGrid(articles, container) {
        if (!container) {
            console.error('No container provided for renderGrid');
            return;
        }
        
        console.log('Rendering grid with articles:', articles.length); // DEBUG LOG
        
        if (!articles || articles.length === 0) {
            container.innerHTML = `
                <div class="no-articles" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Articles Yet</h3>
                    <p style="color: var(--text-muted);">Check back soon for the latest political commentary and analysis.</p>
                </div>
            `;
            return;
        }

        let html = '';
        let renderedCount = 0;
        articles.forEach((article, index) => {
            try {
                const cardHtml = this.renderCard(article, index === 0);
                if (cardHtml) {
                    html += cardHtml;
                    renderedCount++;
                } else {
                    console.warn(`Failed to render article at index ${index}:`, article);
                }
            } catch (error) {
                console.error(`Error rendering article at index ${index}:`, article, error);
            }
        });
        
        console.log(`Successfully rendered ${renderedCount} out of ${articles.length} articles`); // DEBUG LOG
        
        if (renderedCount === 0) {
            container.innerHTML = `
                <div class="no-articles" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <h3 style="color: var(--text-secondary); margin-bottom: 10px;">Error Loading Articles</h3>
                    <p style="color: var(--text-muted);">Please check the browser console for details.</p>
                </div>
            `;
        } else {
            container.innerHTML = html;
        }
    },

    // Render full article (continued from original file...)
    renderFullArticle(article, container) {
        if (!container || !article) return;
        
        const readTime = Utils.calculateReadTime(article.content || '');
        const imageUrl = Utils.getSafeImageUrl(article); // FIXED
        const articleUrl = encodeURIComponent(window.location.href);
        const articleTitle = encodeURIComponent(article.title);
        
        // Convert markdown-style content to HTML
        let htmlContent = article.content || '';
        
        // Convert markdown links [text](url) to HTML
        htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert bold **text** to <strong>
        htmlContent = htmlContent.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic *text* to <em>
        htmlContent = htmlContent.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        
        // Convert line breaks to paragraphs
        htmlContent = htmlContent.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
        
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
                        <span class="article-views">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${article.views || 0} views
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
                <img src="${imageUrl}" alt="${article.title}" class="article-hero-image" onerror="this.onerror=null; this.src='${Utils.getPlaceholderImage(article.category)}'">
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
            const imageUrl = Utils.getSafeImageUrl(article); // FIXED
            const placeholderUrl = Utils.getPlaceholderImage(article.category);
            html += `
                <a href="article.html?slug=${article.slug}" class="popular-post">
                    <div class="popular-post-image">
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.onerror=null; this.src='${placeholderUrl}'">
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

// ... (rest of the file continues with App, Admin, and other sections - would be too long to include here)
// The key fixes are in the renderCard, renderGrid, calculateReadTime, truncate, and getSafeImageUrl functions
