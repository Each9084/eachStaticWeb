/**
 * Navbar Component for Each Static Web
 * 修正后的路径与高亮逻辑
 */
document.addEventListener("DOMContentLoaded", function() {
    const isSubPage = window.location.pathname.includes('/pages/');
    
    // 核心修正：针对不同层级定义不同的链接目标
    const pathConfig = {
        index: isSubPage ? '../index.html' : './index.html',
        about: isSubPage ? './About.html' : './pages/About.html',
        blog: isSubPage ? './Blog.html' : './pages/Blog.html'
    };

    const navbarHTML = `
    <nav class="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div class="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
            <a href="${pathConfig.index}" class="flex items-center group">
                <span class="gothic-logo text-[#1d1d1f] dark:text-white font-semibold" style="font-family: 'UnifrakturMaguntia', serif; font-size: 1.5rem;">
                    <span class="text-[#0071e3]">Each</span> Web
                </span>
            </a>
            
            <div class="flex items-center space-x-10 text-[13px] font-bold" id="nav-menu">
                <a href="${pathConfig.index}" data-page="index" class="nav-link hover:text-blue-600 transition">主页</a>
                <a href="${pathConfig.about}" data-page="About" class="nav-link hover:text-blue-600 transition">关于</a>
                <a href="${pathConfig.blog}" data-page="Blog" class="nav-link hover:text-blue-600 transition">博客</a>
                <a href="https://github.com/Each9084" target="_blank" class="flex items-center hover:text-[#39d353] transition">
                    <i class="fab fa-github text-xl mr-2"></i> Github
                </a>
                <button id="themeToggle" class="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 transition-transform active:scale-90">
                    <i id="modeIcon" class="fas fa-sun text-orange-400 text-lg"></i>
                </button>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // 高亮逻辑保持不变
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const pageKey = link.getAttribute('data-page').toLowerCase();
        if (currentPath.includes(pageKey)) {
            link.classList.add('text-blue-600');
            link.classList.remove('hover:text-blue-600');
        } else if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && pageKey === 'index') {
            link.classList.add('text-blue-600');
        }
    });

    // 主题切换逻辑保持不变...
    const themeBtn = document.getElementById('themeToggle');
    const modeIcon = document.getElementById('modeIcon');
    if (document.body.classList.contains('dark-mode') && modeIcon) {
        modeIcon.className = 'fas fa-moon text-blue-200 text-lg';
    }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            modeIcon.className = isDark ? 'fas fa-moon text-blue-200 text-lg' : 'fas fa-sun text-orange-400 text-lg';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
});