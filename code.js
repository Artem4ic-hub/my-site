document.addEventListener('DOMContentLoaded', () => {
    // 1. АКОРДЕОНИ
    document.querySelectorAll('.accordion-header').forEach(button => {
        const accordionId = button.textContent.trim();
        if (localStorage.getItem('acc_' + accordionId) === 'open') {
            button.parentElement.classList.add('active');
        }
    });

    // 2. ТЕМА І КРУГОВА АНІМАЦІЯ
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            const isLight = e.target.checked;

            if (!document.startViewTransition) {
                applyTheme(isLight);
                return;
            }

            const rect = themeToggle.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const transition = document.startViewTransition(() => {
                applyTheme(isLight);
            });

            transition.ready.then(() => {
                const clipPath = [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ];

                document.documentElement.animate(
                    { clipPath: clipPath },
                    {
                        duration: 500,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        });
    }

    function applyTheme(isLight) {
        if (isLight) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    }
});

// 3. УПРАВЛІННЯ АКОРДЕОНОМ
function toggleAccordion(button) {
    const item = button.parentElement;
    item.classList.toggle('active');
    
    const accordionId = button.textContent.trim();
    if (item.classList.contains('active')) {
        localStorage.setItem('acc_' + accordionId, 'open');
    } else {
        localStorage.removeItem('acc_' + accordionId);
    }
}

// 4. КАЛЬКУЛЯТОР БАЛІВ
function calculateGrade() {
    const theoryInput = document.getElementById('theoryScore');
    const practiceInput = document.getElementById('practiceScore');
    const resultBox = document.getElementById('calcResult');

    if (!theoryInput || !practiceInput || !resultBox) return;

    const theory = parseFloat(theoryInput.value);
    const practice = parseFloat(practiceInput.value);

    if (isNaN(theory) || isNaN(practice) || theory < 1 || theory > 12 || practice < 1 || practice > 12) {
        resultBox.style.display = 'block';
        resultBox.style.color = '#ef4444';
        resultBox.innerHTML = '⚠️ Будь ласка, введіть дійсні оцінки від 1 до 12!';
        return;
    }

    const average = Math.round((theory + practice) / 2);
    
    let level = '';
    if (average <= 3) level = 'Початковий рівень';
    else if (average <= 6) level = 'Середній рівень';
    else if (average <= 9) level = 'Достатній рівень';
    else level = 'Високий рівень';

    resultBox.style.display = 'block';
    resultBox.style.color = 'var(--text-color)';
    resultBox.innerHTML = `Середній бал: <strong>${average} балів</strong> — <span style="color: var(--accent-color); font-weight: bold;">${level}</span>`;
}

// 5. ПРОГРЕС-БАР ТА СКРОЛ
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('progress-bar');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (progressBar) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }

    if (scrollTopBtn) {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
// ======================================================
// 6. ПЕРЕВІРКА ПІДСУМКОВОГО ТЕСТУ (ПО ВСІХ СТОРІНКАХ)
// ======================================================
function checkFullQuiz() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const resultBox = document.getElementById('quizResult');

    if (!resultBox) return;

    if (!q1 || !q2 || !q3) {
        resultBox.style.display = 'block';
        resultBox.style.color = '#ef4444';
        resultBox.innerHTML = '⚠️ Будь ласка, дайте відповіді на <strong>всі 3 запитання</strong>!';
        return;
    }

    let score = 0;
    if (q1.value === 'correct') score++;
    if (q2.value === 'correct') score++;
    if (q3.value === 'correct') score++;

    resultBox.style.display = 'block';
    
    if (score === 3) {
        resultBox.style.color = '#10b981';
        resultBox.innerHTML = '🎉 <strong>Відмінно! (3/3)</strong> Ви ідеально знаєте критерії оцінювання, правила ТБ та академічну доброчесність!';
    } else if (score === 2) {
        resultBox.style.color = '#f59e0b';
        resultBox.innerHTML = `👍 <strong>Добре! (${score}/3)</strong> Ви відповіли правильно на більшість питань, але перегляньте розділи з помилками.`;
    } else {
        resultBox.style.color = '#ef4444';
        resultBox.innerHTML = `⚠️ <strong>Результат: ${score}/3.</strong> Рекомендуємо ще раз прочитати матеріали на всіх сторінках порталу.`;
    }
}