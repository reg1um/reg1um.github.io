// Blog management system for loading markdown posts
class BlogManager {
    constructor() {
        this.posts = [];
        this.postsMetadata = [
            {
                filename: 'first-post.md',
                title: 'Your First Blog Post Title',
                date: '2024-01-15',
                category: 'Research',
                excerpt: 'A compelling excerpt from your blog post that gives readers a preview of what they can expect to learn...'
            },
            {
                filename: 'second-post.md',
                title: 'Another Interesting Topic',
                date: '2023-12-28',
                category: 'Technology',
                excerpt: 'Another engaging excerpt that demonstrates your expertise and insights in your field of study...'
            },
            {
                filename: 'third-post.md',
                title: 'How-to Guide or Tutorial',
                date: '2023-12-10',
                category: 'Tutorial',
                excerpt: 'A preview of a technical tutorial or guide you\'ve written to share knowledge with the community...'
            }
        ];
    }

    async init() {
        await this.loadBlogPosts();
    }

    async loadBlogPosts() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        // Clear existing content
        blogGrid.innerHTML = '';

        // Generate blog post cards from metadata
        this.postsMetadata.forEach((post, index) => {
            const article = this.createBlogPostCard(post, index);
            blogGrid.appendChild(article);
        });
    }

    createBlogPostCard(post, index) {
        const article = document.createElement('article');
        article.className = 'blog-post';
        article.innerHTML = `
            <div class="blog-meta">
                <span class="blog-date">${this.formatDate(post.date)}</span>
                <span class="blog-category">${post.category}</span>
            </div>
            <h2>${post.title}</h2>
            <p>${post.excerpt}</p>
            <a href="#" class="read-more" data-post="${post.filename}">Read more →</a>
        `;

        // Add click event to the read more link
        const readMoreLink = article.querySelector('.read-more');
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showFullPost(post.filename);
        });

        return article;
    }

    async showFullPost(filename) {
        try {
            const response = await fetch(`posts/${filename}`);
            if (!response.ok) {
                throw new Error('Post not found');
            }
            
            const markdown = await response.text();
            const { metadata, content } = this.parseMarkdown(markdown);
            
            this.displayFullPost(metadata, content);
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load blog post. Please try again later.');
        }
    }

    parseMarkdown(markdown) {
        const parts = markdown.split('---');
        let metadata = {};
        let content = markdown;
        
        if (parts.length >= 3) {
            // Parse frontmatter
            const frontmatter = parts[1].trim();
            frontmatter.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length) {
                    metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                }
            });
            content = parts.slice(2).join('---').trim();
        }
        
        // Convert markdown to HTML (basic implementation)
        content = this.markdownToHtml(content);
        
        return { metadata, content };
    }

    markdownToHtml(markdown) {
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            
            // Bold and italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            
            // Lists
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap orphaned li elements in ul
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // Wrap content in paragraphs
        if (html && !html.startsWith('<h1>') && !html.startsWith('<h2>')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }

    displayFullPost(metadata, content) {
        const blogSection = document.getElementById('blog');
        const originalContent = blogSection.innerHTML;
        
        blogSection.innerHTML = `
            <div class="blog-post-full">
                <button class="back-button" onclick="blogManager.returnToBlogList()">← Back to Blog</button>
                <article class="full-post">
                    <header class="post-header">
                        <div class="blog-meta">
                            <span class="blog-date">${this.formatDate(metadata.date)}</span>
                            <span class="blog-category">${metadata.category}</span>
                        </div>
                        <h1>${metadata.title}</h1>
                    </header>
                    <div class="post-content">
                        ${content}
                    </div>
                </article>
            </div>
        `;
        
        // Store original content for returning
        this.originalBlogContent = originalContent;
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    returnToBlogList() {
        const blogSection = document.getElementById('blog');
        blogSection.innerHTML = this.originalBlogContent;
        this.loadBlogPosts(); // Reload blog posts
    }

    showError(message) {
        const blogGrid = document.querySelector('.blog-grid');
        if (blogGrid) {
            blogGrid.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize blog manager when DOM is loaded
let blogManager;
document.addEventListener('DOMContentLoaded', function() {
    blogManager = new BlogManager();
    blogManager.init();
});