const MARKDOWN_PATH = "./content.md";

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

async function initializeApp() {
    await renderMarkdown();
    generateNavigation();
    setupSearch();
    setupScrollSpy();
    highlightCode();
}

async function renderMarkdown() {
    const contentDiv = document.getElementById("markdown-content");
    
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
    let markdownContent = "";
    try {
        const response = await fetch(MARKDOWN_PATH, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to fetch markdown: ${response.status}`);
        }
        markdownContent = await response.text();
    } catch (error) {
        console.error(error);
        markdownContent = "# Alicia Lua research\n\nFailed to load `content.md`.";
    }
    const html = marked.parse(markdownContent);
    contentDiv.innerHTML = html;
    
    addIdsToHeadings();
}

function addIdsToHeadings() {
    const headings = document.querySelectorAll('#markdown-content h1, #markdown-content h2, #markdown-content h3');
    headings.forEach(heading => {
        const id = heading.textContent
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
        heading.id = id;
    });
}

function generateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    const headings = document.querySelectorAll('#markdown-content h1, #markdown-content h2, #markdown-content h3');
    
    headings.forEach(heading => {
        const navItem = document.createElement('div');
        const level = heading.tagName.toLowerCase();
        navItem.className = `nav-item level-${level.charAt(1)}`;
        navItem.textContent = heading.textContent;
        navItem.dataset.target = heading.id;
        
        navItem.addEventListener('click', () => {
            document.getElementById(heading.id).scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            navItem.classList.add('active');
        });
        
        navMenu.appendChild(navItem);
    });
}

function setupSearch() {
    const searchBox = document.getElementById('search');
    const navItems = document.querySelectorAll('.nav-item');
    
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
}

function setupScrollSpy() {
    const content = document.querySelector('.content');
    const navItems = document.querySelectorAll('.nav-item');
    const headings = document.querySelectorAll('#markdown-content h1, #markdown-content h2, #markdown-content h3');
    
    content.addEventListener('scroll', () => {
        let current = '';
        
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
                current = heading.id;
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.target === current) {
                item.classList.add('active');
            }
        });
    });
}

function highlightCode() {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}
