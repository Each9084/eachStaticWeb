/**
 * Navbar Component for Each Static Web
 * 修正 Vercel 部署后的路径与高亮逻辑
 */
document.addEventListener("DOMContentLoaded", function () {
    // 获取当前页面完整路径并标准化
    const pathName = window.location.pathname.toLowerCase();

    // 判断是否在 pages 目录下
    // 兼容 /pages/About.html 或 /pages/About (Vercel 自动去掉后缀)
    const isSubPage = pathName.includes('/pages/');

    // 定义不同环境下的基础链接
    const config = {
        index: isSubPage ? '../index.html' : './index.html',
        about: isSubPage ? './About.html' : './pages/About.html',
        blog: isSubPage ? './Blog.html' : './pages/Blog.html',
        // 在 pathConfig 里加入
        editor: isSubPage ? './mdEditor.html' : './pages/mdEditor.html',
        check: isSubPage ? './CheckIn.html' : './pages/CheckIn.html',
        blogSpace: isSubPage ? './BlogSpace.html' : './pages/BlogSpace.html',
        publish: isSubPage ? './BlogPublish.html' : './pages/BlogPublish.html'
    };

    const navbarHTML = `
    <nav class="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div class="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
            <a href="${config.index}" class="flex items-center group">
                <span class="gothic-logo text-[#1d1d1f] dark:text-white font-semibold" style="font-family: 'UnifrakturMaguntia', serif; font-size: 1.5rem;">
                    <span class="text-[#0071e3]">Each</span> Web
                </span>
            </a>
            
            <div class="flex items-center space-x-10 text-[13px] font-bold" id="nav-menu">
                <a href="${config.index}" data-page="index" class="nav-link hover:text-blue-600 transition">主页</a>
                <a href="${config.about}" data-page="about" class="nav-link hover:text-blue-600 transition">关于</a>
                <a href="${config.blog}"  data-page="blog"  class="nav-link hover:text-blue-600 transition">博客</a>
                <a href="${config.blogSpace}"  data-page="blog"  class="nav-link hover:text-blue-600 transition">Space</a>
                <a href="${config.publish}"  data-page="publish"  class="nav-link hover:text-blue-600 transition">Publish</a>
                <a href="${config.editor}" data-page="editor"  class="nav-link hover:text-blue-600 transition">编辑器</a>
                <a href="${config.check}" data-page="check"  class="nav-link hover:text-blue-600 transition">打卡</a>
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

    // 注入导航栏
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // 高亮逻辑判定
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const pageKey = link.getAttribute('data-page');
        // 特殊处理首页：路径为 / 或 index.html
        if (pageKey === 'index') {
            if (pathName.endsWith('/') || pathName.endsWith('index.html') || pathName === '') {
                link.classList.add('text-blue-600');
            }
        } else {
            // 其他页面：路径包含关键字
            if (pathName.includes(pageKey)) {
                link.classList.add('text-blue-600');
            }
        }
    });

    // 主题切换逻辑
    const themeBtn = document.getElementById('themeToggle');
    const modeIcon = document.getElementById('modeIcon');

    const updateIcon = (isDark) => {
        if (!modeIcon) return;
        modeIcon.className = isDark ? 'fas fa-moon text-blue-200 text-lg' : 'fas fa-sun text-orange-400 text-lg';
    };

    // 初始化图标
    updateIcon(document.documentElement.classList.contains('dark-mode'));

    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        document.body.classList.toggle('dark-mode');
        updateIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});