// ===========================
// MOBILE NAVIGATION
// ===========================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===========================
// ACTIVE SECTION HIGHLIGHTING
// ===========================

const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// ===========================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.project-card, .blog-card, .skill-category');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===========================
// SMOOTH SCROLLING FOR SAFARI
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// TYPING EFFECT (OPTIONAL)
// ===========================

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment to enable typing effect on hero subtitle
// const heroSubtitle = document.querySelector('.hero-subtitle');
// if (heroSubtitle) {
//     const originalText = heroSubtitle.textContent;
//     typeWriter(heroSubtitle, originalText, 50);
// }

// ===========================
// SKILL TAG INTERACTIONS
// ===========================

const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach(tag => {
    tag.addEventListener('click', () => {
        tag.style.transform = 'scale(1.05)';
        setTimeout(() => {
            tag.style.transform = 'scale(1)';
        }, 200);
    });
});

// ===========================
// PROJECT CARD TILT EFFECT (SUBTLE)
// ===========================

const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ===========================
// CURSOR TRAIL EFFECT (OPTIONAL)
// ===========================

class CursorTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 20;
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            if (this.particles.length < this.maxParticles) {
                this.createParticle(e.clientX, e.clientY);
            }
        });
    }
    
    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.background = 'rgba(59, 130, 246, 0.5)';
        particle.style.pointerEvents = 'none';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.zIndex = '9999';
        particle.style.transition = 'all 0.5s ease';
        
        document.body.appendChild(particle);
        this.particles.push(particle);
        
        setTimeout(() => {
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0)';
        }, 10);
        
        setTimeout(() => {
            particle.remove();
            this.particles = this.particles.filter(p => p !== particle);
        }, 500);
    }
}

// Uncomment to enable cursor trail (can be performance intensive)
// const cursorTrail = new CursorTrail();

// ===========================
// PARALLAX EFFECT ON SCROLL
// ===========================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===========================
// SCROLL TO TOP BUTTON
// ===========================

function createScrollToTop() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent-color);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
        } else {
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1) translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1) translateY(0)';
    });
}

createScrollToTop();

// ===========================
// LOADING ANIMATION
// ===========================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// PREVENT FLASH OF UNSTYLED CONTENT
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
});

// ===========================
// CONSOLE MESSAGE (EASTER EGG)
// ===========================

console.log('%c👋 Hello there!', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cInterested in the code? Check out the repository!', 'color: #a3a3a3; font-size: 14px;');
console.log('%chttps://github.com/reg1um/reg1um.github.io', 'color: #3b82f6; font-size: 14px;');

// ===========================
// PERFORMANCE MONITORING
// ===========================

if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
        }, 0);
    });
}

// ===========================
// THEME TOGGLE (OPTIONAL - PLACEHOLDER)
// ===========================

// This is a placeholder for future theme toggle functionality
// You can implement dark/light mode switching here

function initThemeToggle() {
    // Check for saved theme preference or default to 'dark'
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Theme toggle button can be added here
}

// initThemeToggle();

// ===========================
// COPY TO CLIPBOARD FOR CODE BLOCKS
// ===========================

document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.setAttribute('title', 'Click to copy');
    
    tag.addEventListener('click', () => {
        const text = tag.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = tag.textContent;
            tag.textContent = '✓ Copied!';
            setTimeout(() => {
                tag.textContent = originalText;
            }, 1000);
        });
    });
});

// ===========================
// EMAIL PROTECTION
// ===========================

// Simple email obfuscation to prevent spam bots
document.addEventListener('DOMContentLoaded', () => {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Email click tracking can be added here
            console.log('Email link clicked');
        });
    });
});
