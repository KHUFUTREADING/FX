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

// ===== الكود الرئيسي =====
document.addEventListener('DOMContentLoaded', function () {
    updateHeaderAuth();

    // ===== إخلاء المسؤولية =====
    const modal = document.getElementById('disclaimer-modal');
    const acceptBtn = document.getElementById('accept-disclaimer');

    if (modal && acceptBtn) {
        // لو لسه ما وافقش → أظهر الرسالة
        if (localStorage.getItem('disclaimerAccepted') !== 'true') {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        } else {
            // وافق قبل كده → خليها مخفية
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }

        // الضغط على زر "أنا المسؤول"
        acceptBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            localStorage.setItem('disclaimerAccepted', 'true');
            modal.classList.add('hidden');
            modal.style.display = 'none';
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