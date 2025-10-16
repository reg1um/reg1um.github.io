// Terminal Portfolio with Vim-style Navigation
class TerminalPortfolio {
    constructor() {
        this.mode = 'NORMAL'; // NORMAL, COMMAND, INSERT
        this.currentSection = 'nav-menu';
        this.currentSelection = 0;
        this.selectableItems = [];
        this.commandHistory = [];
        this.commandHistoryIndex = -1;
        this.lastGPress = 0; // For gg command
        
        this.sections = {
            'nav-menu': { name: 'portfolio', items: '.nav-item' },
            'about-section': { name: 'about.md', items: '.content-item' },
            'experience-section': { name: 'experience/', items: '.content-item' },
            'projects-section': { name: 'projects/', items: '.content-item' },
            'posts-section': { name: 'posts/', items: '.content-item' },
            'contact-section': { name: 'contact.sh', items: '.content-item' }
        };
        
        this.commands = {
            'help': this.showHelp.bind(this),
            'about': () => this.navigateToSection('about-section'),
            'experience': () => this.navigateToSection('experience-section'),
            'projects': () => this.navigateToSection('projects-section'),
            'posts': () => this.navigateToSection('posts-section'),
            'contact': () => this.navigateToSection('contact-section'),
            'home': () => this.navigateToSection('nav-menu'),
            'clear': this.clearTerminal.bind(this),
            'ls': this.listItems.bind(this),
            'pwd': this.printWorkingDirectory.bind(this),
            'exit': this.exitPortfolio.bind(this),
            'vim': this.toggleVimMode.bind(this),
            'theme': this.toggleTheme.bind(this),
            'time': this.showTime.bind(this)
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCustomCursor();
        this.updateSelectableItems();
        this.updateStatusBar();
        this.startClock();
        this.setupCommandAutocomplete();
        
        // Welcome message
        this.executeCommand('help');
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Command input events
        const commandInput = document.getElementById('commandInput');
        commandInput.addEventListener('keydown', this.handleCommandInput.bind(this));
        commandInput.addEventListener('blur', () => {
            if (this.mode === 'COMMAND') {
                this.setMode('NORMAL');
            }
        });
        
        // Mouse events (for accessibility)
        document.addEventListener('click', this.handleMouseClick.bind(this));
        
        // Prevent default scrolling in normal mode
        document.addEventListener('wheel', (e) => {
            if (this.mode === 'NORMAL') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    setupCustomCursor() {
        const cursor = document.querySelector('.cursor');
        let mouseX = 0, mouseY = 0;
        let isMoving = false;
        let hideTimeout;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
            
            // Show cursor when moving
            cursor.classList.add('visible');
            isMoving = true;
            
            // Hide cursor after 2 seconds of no movement
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                cursor.classList.remove('visible');
                isMoving = false;
            }, 2000);
        });
        
        // Hide system cursor
        document.body.style.cursor = 'none';
    }
    
    handleKeyboard(e) {
        // Always allow certain keys
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            return; // Allow page refresh
        }
        
        if (this.mode === 'COMMAND') {
            return; // Let command input handle it
        }
        
        e.preventDefault();
        
        const key = e.key;
        const keyLower = key.toLowerCase();
        
        switch (keyLower) {
            // Vim navigation
            case 'h':
            case 'arrowleft':
                this.navigateLeft();
                break;
            case 'j':
            case 'arrowdown':
                this.navigateDown();
                break;
            case 'k':
            case 'arrowup':
                this.navigateUp();
                break;
            case 'l':
            case 'arrowright':
                this.navigateRight();
                break;
                
            // Selection and actions
            case 'enter':
                this.selectCurrentItem();
                break;
            case 'escape':
                this.goBack();
                break;
                
            // Vim-style movement
            case 'g':
                if (key === 'G') {
                    this.goToBottom();
                } else {
                    this.handleGCommand();
                }
                break;
                
            // Mode switches
            case ':':
                this.enterCommandMode();
                break;
            case '?':
                this.toggleHelp();
                break;
                
            // Quick navigation
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                this.quickNavigate(parseInt(keyLower));
                break;
                
            // Page navigation
            case ' ':
                this.pageDown();
                break;
            case 'b':
                this.pageUp();
                break;
                
            // Search
            case '/':
                this.startSearch();
                break;
                
            // Reload
            case 'r':
                this.refreshSection();
                break;
        }
        
        this.updateStatusBar();
    }
    
    handleGCommand() {
        const now = Date.now();
        if (now - this.lastGPress < 500) {
            // Double g - go to top
            this.goToTop();
            this.lastGPress = 0;
        } else {
            this.lastGPress = now;
        }
    }
    
    handleCommandInput(e) {
        const input = e.target;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = input.value.trim();
            if (command) {
                this.executeCommand(command);
                this.commandHistory.unshift(command);
                this.commandHistoryIndex = -1;
            }
            input.value = '';
            this.setMode('NORMAL');
        } else if (e.key === 'Escape') {
            e.preventDefault();
            input.value = '';
            this.setMode('NORMAL');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateCommandHistory(1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateCommandHistory(-1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocompleteCommand(input);
        }
    }
    
    navigateCommandHistory(direction) {
        const input = document.getElementById('commandInput');
        
        if (direction > 0 && this.commandHistoryIndex < this.commandHistory.length - 1) {
            this.commandHistoryIndex++;
            input.value = this.commandHistory[this.commandHistoryIndex];
        } else if (direction < 0 && this.commandHistoryIndex > -1) {
            this.commandHistoryIndex--;
            if (this.commandHistoryIndex === -1) {
                input.value = '';
            } else {
                input.value = this.commandHistory[this.commandHistoryIndex];
            }
        }
    }
    
    autocompleteCommand(input) {
        const value = input.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(value));
        
        if (matches.length === 1) {
            input.value = matches[0];
        } else if (matches.length > 1) {
            // Show available completions
            const completions = matches.join(', ');
            this.showMessage(`Available: ${completions}`);
        }
    }
    
    executeCommand(command) {
        const [cmd, ...args] = command.toLowerCase().split(' ');
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else if (this.sections[cmd + '-section']) {
            this.navigateToSection(cmd + '-section');
        } else {
            this.showMessage(`Command not found: ${cmd}. Type 'help' for available commands.`);
        }
    }
    
    // Navigation methods
    navigateUp() {
        if (this.currentSelection > 0) {
            this.currentSelection--;
            this.updateSelection();
        }
    }
    
    navigateDown() {
        if (this.currentSelection < this.selectableItems.length - 1) {
            this.currentSelection++;
            this.updateSelection();
        }
    }
    
    navigateLeft() {
        if (this.currentSection !== 'nav-menu') {
            this.goBack();
        }
    }
    
    navigateRight() {
        this.selectCurrentItem();
    }
    
    goToTop() {
        this.currentSelection = 0;
        this.updateSelection();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    goToBottom() {
        this.currentSelection = this.selectableItems.length - 1;
        this.updateSelection();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    
    pageDown() {
        const increment = Math.min(5, this.selectableItems.length - 1);
        this.currentSelection = Math.min(this.currentSelection + increment, this.selectableItems.length - 1);
        this.updateSelection();
        window.scrollBy({ top: 300, behavior: 'smooth' });
    }
    
    pageUp() {
        const decrement = Math.min(5, this.currentSelection);
        this.currentSelection = Math.max(this.currentSelection - decrement, 0);
        this.updateSelection();
        window.scrollBy({ top: -300, behavior: 'smooth' });
    }
    
    selectCurrentItem() {
        const currentItem = this.selectableItems[this.currentSelection];
        if (!currentItem) return;
        
        if (this.currentSection === 'nav-menu') {
            const section = currentItem.dataset.section;
            if (section) {
                this.navigateToSection(section + '-section');
            }
        } else {
            // Handle item-specific actions
            const links = currentItem.querySelectorAll('.item-link');
            if (links.length > 0) {
                links[0].click();
            }
        }
    }
    
    navigateToSection(sectionId) {
        // Hide current section
        const currentSectionEl = document.getElementById(this.currentSection);
        if (currentSectionEl) {
            currentSectionEl.classList.remove('active');
        }
        
        // Show new section
        const newSectionEl = document.getElementById(sectionId);
        if (newSectionEl) {
            newSectionEl.classList.add('active');
            this.currentSection = sectionId;
            this.currentSelection = 0;
            this.updateSelectableItems();
            this.updateSelection();
            this.updateStatusBar();
            
            // Add transition animation
            newSectionEl.classList.add('mode-transition');
            setTimeout(() => {
                newSectionEl.classList.remove('mode-transition');
            }, 300);
        }
    }
    
    goBack() {
        if (this.currentSection !== 'nav-menu') {
            this.navigateToSection('nav-menu');
        }
    }
    
    quickNavigate(number) {
        if (this.currentSection === 'nav-menu') {
            const navItems = document.querySelectorAll('.nav-item');
            if (navItems[number - 1]) {
                this.currentSelection = number - 1;
                this.updateSelection();
                this.selectCurrentItem();
            }
        }
    }
    
    updateSelectableItems() {
        const sectionInfo = this.sections[this.currentSection];
        if (sectionInfo) {
            this.selectableItems = Array.from(document.querySelectorAll(sectionInfo.items));
        }
    }
    
    updateSelection() {
        // Remove previous selections
        document.querySelectorAll('.selected, .focused').forEach(el => {
            el.classList.remove('selected', 'focused');
        });
        
        // Add current selection
        const currentItem = this.selectableItems[this.currentSelection];
        if (currentItem) {
            currentItem.classList.add('selected');
            if (this.currentSection === 'nav-menu') {
                currentItem.classList.add('active');
            } else {
                currentItem.classList.add('focused');
            }
            
            // Center the selected item in the viewport
            const rect = currentItem.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const headerHeight = 80; // Terminal header
            const footerHeight = 140; // Command line + status bar
            const availableHeight = viewportHeight - headerHeight - footerHeight;
            
            // Calculate the center position
            const itemCenter = rect.top + rect.height / 2;
            const viewportCenter = headerHeight + availableHeight / 2;
            const scrollOffset = itemCenter - viewportCenter;
            
            if (Math.abs(scrollOffset) > 50) { // Only scroll if significantly off-center
                window.scrollBy({
                    top: scrollOffset,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Command implementations
    showHelp() {
        const helpText = `
reg1um@portfolio:~$ Terminal Portfolio Navigation

KEYBOARD CONTROLS:
  Movement:     j/k (↓/↑)    h/l (←/→)    
  Select:       Enter       
  Back:         Escape      
  Quick Jump:   1-4         
  Top/Bottom:   gg / G      
  Page:         Space/b     
  
COMMANDS:
  :help         Show this help
  :about        Go to about section  
  :experience   Go to experience section
  :projects     Go to projects section
  :posts        Go to posts section
  :contact      Go to contact section
  :home         Go to main menu
  :ls           List current items
  :clear        Clear terminal
  :vim          Toggle vim mode
  
VIM FEATURES:
  /             Search (coming soon)
  ?             Toggle help panel
  :             Enter command mode
  gg            Go to top
  G             Go to bottom
  
Press ? to toggle the help panel, or Escape to continue.
        `;
        this.showMessage(helpText.trim());
    }
    
    listItems() {
        const sectionInfo = this.sections[this.currentSection];
        const items = this.selectableItems;
        const itemList = items.map((item, index) => {
            const title = item.querySelector('.nav-item-title, .item-title')?.textContent || `Item ${index + 1}`;
            return `${index + 1}. ${title}`;
        }).join('\n');
        
        this.showMessage(`Items in ${sectionInfo.name}:\n${itemList}`);
    }
    
    printWorkingDirectory() {
        const sectionInfo = this.sections[this.currentSection];
        this.showMessage(`~/portfolio/${sectionInfo.name}`);
    }
    
    clearTerminal() {
        // Clear any messages
        const messages = document.querySelectorAll('.terminal-message');
        messages.forEach(msg => msg.remove());
    }
    
    exitPortfolio() {
        if (confirm('Are you sure you want to exit?')) {
            window.close();
        }
    }
    
    toggleVimMode() {
        document.body.classList.toggle('vim-mode');
        const isVimMode = document.body.classList.contains('vim-mode');
        this.showMessage(`Vim mode: ${isVimMode ? 'ON' : 'OFF'}`);
    }
    
    toggleTheme() {
        // Future implementation for theme switching
        this.showMessage('Theme switching coming soon!');
    }
    
    showTime() {
        const now = new Date();
        this.showMessage(`Current time: ${now.toLocaleTimeString()}`);
    }
    
    // Mode management
    setMode(mode) {
        this.mode = mode;
        const commandLine = document.querySelector('.command-line');
        const commandInput = document.getElementById('commandInput');
        
        document.body.className = document.body.className.replace(/\\b\\w*-mode\\b/g, '');
        
        if (mode === 'COMMAND') {
            document.body.classList.add('command-mode');
            commandInput.focus();
        } else {
            commandInput.blur();
        }
        
        this.updateStatusBar();
    }
    
    enterCommandMode() {
        this.setMode('COMMAND');
    }
    
    toggleHelp() {
        const helpPanel = document.getElementById('helpPanel');
        helpPanel.classList.toggle('visible');
    }
    
    startSearch() {
        // Future implementation
        this.showMessage('Search functionality coming soon! Use / to search.');
    }
    
    refreshSection() {
        // Refresh current section content
        if (this.currentSection === 'posts-section') {
            // Reload blog posts
            if (window.blogManager) {
                window.blogManager.loadPosts();
            }
        }
        this.showMessage('Section refreshed!');
    }
    
    // Utility methods
    updateStatusBar() {
        document.getElementById('current-mode').textContent = this.mode;
        const sectionInfo = this.sections[this.currentSection];
        document.getElementById('current-section').textContent = sectionInfo.name;
        document.getElementById('item-count').textContent = this.selectableItems.length;
    }
    
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            const timeEl = document.getElementById('current-time');
            if (timeEl) {
                timeEl.textContent = timeStr;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    setupCommandAutocomplete() {
        // Add command suggestions as you type
        const commandInput = document.getElementById('commandInput');
        commandInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.startsWith(':')) {
                const cmd = value.slice(1);
                const matches = Object.keys(this.commands).filter(command => command.startsWith(cmd));
                if (matches.length > 0 && matches.length < 5) {
                    // Could show dropdown here
                }
            }
        });
    }
    
    showMessage(message) {
        // Create temporary message display
        const messageEl = document.createElement('div');
        messageEl.className = 'terminal-message';
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-secondary);
            border: 2px solid var(--border-active);
            border-radius: 8px;
            padding: 20px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            z-index: 1000;
            white-space: pre-wrap;
            font-family: var(--font-mono);
            font-size: 12px;
            line-height: 1.4;
            box-shadow: var(--shadow-glow);
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        // Remove on any key press or click
        const removeMessage = () => {
            messageEl.remove();
            document.removeEventListener('keydown', removeMessage);
            document.removeEventListener('click', removeMessage);
        };
        
        setTimeout(() => {
            document.addEventListener('keydown', removeMessage);
            document.addEventListener('click', removeMessage);
        }, 100);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                messageEl.remove();
            }
        }, 10000);
    }
    
    handleMouseClick(e) {
        // Allow basic mouse interaction for accessibility
        if (e.target.classList.contains('nav-item') || e.target.closest('.nav-item')) {
            const navItem = e.target.classList.contains('nav-item') ? e.target : e.target.closest('.nav-item');
            const items = Array.from(document.querySelectorAll('.nav-item'));
            this.currentSelection = items.indexOf(navItem);
            this.updateSelection();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new TerminalPortfolio();
    console.log('🚀 Terminal Portfolio initialized!');
    console.log('💡 Press ? for help, : for command mode');
});

// Prevent accidental page navigation
window.addEventListener('beforeunload', (e) => {
    if (window.portfolio && window.portfolio.mode !== 'NORMAL') {
        e.preventDefault();
        e.returnValue = '';
    }
});