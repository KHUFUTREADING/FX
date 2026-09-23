// ===== نظام تسجيل الدخول =====
function isLoggedIn() {
    return localStorage.getItem('khufuLoggedIn') === 'true';
}

function setLoggedIn(value) {
    if (value) {
        localStorage.setItem('khufuLoggedIn', 'true');
    } else {
        localStorage.removeItem('khufuLoggedIn');
        localStorage.removeItem('khufuUserName');
        localStorage.removeItem('khufuUserEmail');
    }
}

// ===== قائمة الإيميلات المسموح لها بالتصوير (عدّلها كما تريد) =====
const ALLOWED_SCREENSHOT_EMAILS = [
    'admin@khufu.com',
    'owner@khufu.com',
    // أضف هنا أي إيميل تريده مسموح له
];

function canTakeScreenshot() {
    const email = (localStorage.getItem('khufuUserEmail') || '').toLowerCase().trim();
    if (!email) return false;
    return ALLOWED_SCREENSHOT_EMAILS.some(e => e.toLowerCase() === email);
}

// ===== حماية صفحات الكورسات =====
(function protectCourses() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || '';

    const protectedPages = [
        'dashboard.html',
        'course.html',
        'player.html'
    ];

    const isProtected = protectedPages.some(p => page === p || page.startsWith(p));

    if (isProtected && !isLoggedIn()) {
        window.location.href = 'login.html';
    }
})();

// تحديث الهيدر حسب حالة الدخول
function updateHeaderAuth() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;

    if (isLoggedIn()) {
        loginBtn.textContent = 'تسجيل الخروج';
        loginBtn.href = '#';
        loginBtn.onclick = function (e) {
            e.preventDefault();
            setLoggedIn(false);
            window.location.href = 'index.html';
        };
    } else {
        loginBtn.textContent = 'تسجيل الدخول';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
    }
}

// ============================================================
// ===== حماية ضد السكرين شوت وتسجيل الشاشة =====
// ملاحظة: دي حماية رادعة فقط، مش مطلقة 100%
// ============================================================
(function antiScreenshotProtection() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || '';

    // الصفحات اللي هتتطبق عليها الحماية
    const protectedPages = ['dashboard.html', 'course.html', 'player.html'];
    const isProtectedPage = protectedPages.some(p => page === p || page.startsWith(p));

    if (!isProtectedPage) return; // ما نطبقش على الرئيسية أو اللوجين أو الأدمن

    // لو الإيميل في القائمة المسموحة → نوقف الحماية
    if (canTakeScreenshot()) {
        console.log('Screenshot protection disabled for allowed email');
        return;
    }

    // --- 1. منع تحديد النص ---
    const style = document.createElement('style');
    style.id = 'anti-ss-style';
    style.textContent = `
        body, body * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }
        input, textarea {
            -webkit-user-select: text !important;
            user-select: text !important;
        }
        /* طبقة تشويش عند محاولة التصوير */
        #ss-blur-overlay {
            position: fixed;
            inset: 0;
            background: #0a0e17;
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: #ff6b6b;
            font-family: 'Cairo', sans-serif;
            font-size: 1.4rem;
            text-align: center;
            padding: 20px;
        }
        #ss-blur-overlay.show {
            display: flex;
        }
        #ss-watermark {
            position: fixed;
            pointer-events: none;
            z-index: 99998;
            opacity: 0.12;
            font-size: 18px;
            color: #00d2ff;
            font-family: 'Cairo', sans-serif;
            white-space: nowrap;
            transform: rotate(-25deg);
            user-select: none;
        }
    `;
    document.head.appendChild(style);

    // --- 2. طبقة التحذير ---
    const overlay = document.createElement('div');
    overlay.id = 'ss-blur-overlay';
    overlay.innerHTML = `
        <div style="font-size:3rem;margin-bottom:15px;">🚫</div>
        <div>التصوير وتسجيل الشاشة ممنوع</div>
        <div style="font-size:0.95rem;color:#a0aec0;margin-top:10px;">المحتوى محمي - Screenshot / Screen Recording is not allowed</div>
    `;
    document.body.appendChild(overlay);

    function showProtectionOverlay() {
        overlay.classList.add('show');
    }
    function hideProtectionOverlay() {
        overlay.classList.remove('show');
    }

    // --- 3. علامة مائية بإيميل المستخدم ---
    function addWatermark() {
        const email = localStorage.getItem('khufuUserEmail') || 'user';
        const wm = document.createElement('div');
        wm.id = 'ss-watermark';
        wm.textContent = email + ' • KHUFU • ' + new Date().toLocaleString('ar-EG');
        document.body.appendChild(wm);

        function positionWatermark() {
            const x = 50 + Math.random() * (window.innerWidth - 300);
            const y = 80 + Math.random() * (window.innerHeight - 150);
            wm.style.left = x + 'px';
            wm.style.top = y + 'px';
        }
        positionWatermark();
        setInterval(positionWatermark, 4000);
    }
    addWatermark();

    // --- 4. منع كليك يمين ---
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // --- 5. منع اختصارات لوحة المفاتيح الشائعة ---
    document.addEventListener('keydown', function (e) {
        // Print Screen
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            e.preventDefault();
            showProtectionOverlay();
            setTimeout(hideProtectionOverlay, 2500);
            return false;
        }
        // Ctrl + P (طباعة)
        if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
            e.preventDefault();
            showProtectionOverlay();
            setTimeout(hideProtectionOverlay, 2000);
            return false;
        }
        // Ctrl + S
        if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
        // Ctrl + Shift + I / J / C (أدوات المطور)
        if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
            e.preventDefault();
            return false;
        }
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl + U (عرض المصدر)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });

    // --- 6. كشف تغيير التبويب / فقدان التركيز (غالباً عند فتح أداة تصوير) ---
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            showProtectionOverlay();
        } else {
            setTimeout(hideProtectionOverlay, 800);
        }
    });

    window.addEventListener('blur', function () {
        showProtectionOverlay();
    });
    window.addEventListener('focus', function () {
        setTimeout(hideProtectionOverlay, 600);
    });

    // --- 7. كشف محاولات DevTools تقريباً ---
    let devtoolsOpen = false;
    const threshold = 160;
    setInterval(function () {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        if (widthDiff || heightDiff) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showProtectionOverlay();
            }
        } else {
            if (devtoolsOpen) {
                devtoolsOpen = false;
                hideProtectionOverlay();
            }
        }
    }, 1000);

    // --- 8. منع السحب ---
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    console.log('Anti-screenshot protection active');
})();

// ===== الكود الرئيسي =====
document.addEventListener('DOMContentLoaded', function () {
    updateHeaderAuth();

    // ===== إخلاء المسؤولية (نسخة مُصلحة) =====
    const modal = document.getElementById('disclaimer-modal');
    const acceptBtn = document.getElementById('accept-disclaimer');

    if (modal && acceptBtn) {
        modal.style.display = '';
        modal.classList.remove('hidden');

        if (localStorage.getItem('disclaimerAccepted') !== 'true') {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        } else {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }

        acceptBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            localStorage.setItem('disclaimerAccepted', 'true');
            modal.style.display = 'none';
            modal.classList.add('hidden');
        });
    }

    // ===== قائمة الموبايل =====
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // ===== أنيميشن الكروت =====
    const cards = document.querySelectorAll('.service-card');

    if (cards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.15
        });

        cards.forEach(card => observer.observe(card));
    }
});
