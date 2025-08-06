// Smooth section navigation
function showSection(targetId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Nav link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            showSection(targetId);
            
            // Update URL hash without jumping
            history.pushState(null, null, `#${targetId}`);
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        } else {
            showSection('home');
        }
    });

    // Initialize based on URL hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('home');
    }

    // Smooth scrolling for anchor links within sections
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href !== '#') {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe portfolio cards and blog posts for animation
    const animatedElements = document.querySelectorAll('.portfolio-card, .blog-post, .project-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Allow keyboard navigation between sections
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    showSection('home');
                    break;
                case '2':
                    e.preventDefault();
                    showSection('portfolio');
                    break;
                case '3':
                    e.preventDefault();
                    showSection('blog');
                    break;
            }
        }
    });

    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Utility function for smooth scrolling to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.getElementById('home');
    const hero = heroSection?.querySelector('.hero');
    
    if (hero && heroSection.classList.contains('active')) {
        const speed = scrolled * 0.5;
        hero.style.transform = `translateY(${speed}px)`;
    }
});

// Add mobile menu toggle functionality (if needed in future)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-open');
}

// Add touch gesture support for mobile navigation
let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only handle horizontal swipes that are more significant than vertical ones
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const currentSection = document.querySelector('.section.active');
        const sections = ['home', 'portfolio', 'blog'];
        const currentIndex = sections.indexOf(currentSection.id);
        
        if (diffX > 0 && currentIndex < sections.length - 1) {
            // Swipe left - next section
            showSection(sections[currentIndex + 1]);
        } else if (diffX < 0 && currentIndex > 0) {
            // Swipe right - previous section
            showSection(sections[currentIndex - 1]);
        }
        
        touchStartX = null;
        touchStartY = null;
    }
}, { passive: true });

document.addEventListener('touchend', function() {
    touchStartX = null;
    touchStartY = null;
}, { passive: true });

// Add preloader functionality
window.addEventListener('load', function() {
    // Remove any loading states
    document.body.classList.add('loaded');
    
    // Initialize any additional animations or features
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '1';
    });
});