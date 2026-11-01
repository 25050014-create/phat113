document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. ÂM THANH GÕ PHÍM & HƠ-VƠ BUTTONS (WEB AUDIO API)
    // ==========================================================================
    let soundEnabled = false;
    const soundToggle = document.getElementById('sound-toggle');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playKeySound() {
        if (!soundEnabled) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }

    function playBeepSound() {
        if (!soundEnabled) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const icon = soundToggle.querySelector('i');
        if (soundEnabled) {
            icon.className = 'fas fa-volume-high';
            soundToggle.classList.add('active');
        } else {
            icon.className = 'fas fa-volume-mute';
            soundToggle.classList.remove('active');
        }
    });

    document.querySelectorAll('.cyber-btn, .icon-btn, .tab-btn').forEach(btn => {
        btn.addEventListener('mouseenter', playBeepSound);
    });

    // ==========================================================================
    // 2. HIỆU ỨNG MATRIX CODE RAIN
    // ==========================================================================
    const matrixCanvas = document.getElementById('matrix-canvas');
    const matrixCtx = matrixCanvas.getContext('2d');
    const effectToggle = document.getElementById('effect-toggle');

    function resizeMatrixCanvas() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
    }
    resizeMatrixCanvas();

    const latinChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const fontSize = 16;
    let columns = Math.floor(matrixCanvas.width / fontSize);
    let drops = Array(columns).fill(1);
    let matrixInterval = null;

    function drawMatrix() {
        matrixCtx.fillStyle = "rgba(9, 10, 15, 0.08)";
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        matrixCtx.fillStyle = "#00f3ff";
        matrixCtx.font = fontSize + "px 'Fira Code', monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = latinChars.charAt(Math.floor(Math.random() * latinChars.length));
            matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    let isEffectOn = false;
    effectToggle.addEventListener('click', () => {
        isEffectOn = !isEffectOn;
        if (isEffectOn) {
            matrixCanvas.classList.add('active');
            effectToggle.classList.add('active');
            matrixInterval = setInterval(drawMatrix, 33);
        } else {
            clearInterval(matrixInterval);
            matrixInterval = null;
            matrixCanvas.classList.remove('active');
            effectToggle.classList.remove('active');
            matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        }
    });

    window.addEventListener('resize', () => {
        resizeMatrixCanvas();
        columns = Math.floor(matrixCanvas.width / fontSize);
        drops = Array(columns).fill(1);
    });

    // ==========================================================================
    // 3. CANVAS BACKGROUND HẠT SYNTHWAVE
    // ==========================================================================
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speedY: Math.random() * 0.5 + 0.1
    }));

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y -= p.speedY;
            if (p.y < 0) p.y = canvas.height;
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ==========================================================================
    // 4. TYPING EFFECT
    // ==========================================================================
    const words = ["Sinh Viên Năm 2 CNTT", "Front-End Developer", "UI/UX Cyber Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextSpan = document.getElementById("typed");

    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typedTextSpan.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextSpan.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            playKeySound();
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }
    typeEffect();

    // ==========================================================================
    // 5. INTERACTIVE TERMINAL CLI LOGIC
    // ==========================================================================
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');

    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = cliInput.value.trim().toLowerCase();
                cliInput.value = '';

                printCLILine(`visitor@tanphat-dev:~$ ${cmd}`, 'cmd-highlight');

                switch (cmd) {
                    case 'help':
                        printCLILine('Các lệnh khả dụng:');
                        printCLILine('  about    - Giới thiệu bản thân');
                        printCLILine('  skills   - Danh sách kỹ năng chuyên môn');
                        printCLILine('  projects - Xem danh sách dự án');
                        printCLILine('  contact  - Thông tin liên hệ');
                        printCLILine('  clear    - Xóa màn hình Terminal');
                        break;
                    case 'about':
                        printCLILine('Phan Tấn Phát - Sinh viên năm 2 CNTT tại Đại học Bình Dương.');
                        printCLILine('Đam mê thiết kế UI/UX và phát triển ứng dụng Web.');
                        break;
                    case 'skills':
                        printCLILine('Skillset: HTML5 (90%), CSS3 (85%), JavaScript ES6+ (80%), Python (75%), Java (78%).');
                        break;
                    case 'projects':
                        printCLILine('1. Cyberpunk Dashboard UI (Web App)');
                        printCLILine('2. Smart Code Manager (Tool)');
                        printCLILine('3. Hệ Thống Quản Lý Thư Viện (Web App)');
                        break;
                    case 'contact':
                        printCLILine('Email: phantanphat.dev@gmail.com | Phone: +84 987 654 321');
                        printCLILine('Địa chỉ: Thủ Dầu Một, Bình Dương');
                        break;
                    case 'clear':
                        cliOutput.innerHTML = '';
                        break;
                    case '':
                        break;
                    default:
                        printCLILine(`[LỖI] Lệnh '${cmd}' không hợp lệ. Gõ 'help' để xem danh sách lệnh.`, 'err-msg');
                }
                cliOutput.scrollTop = cliOutput.scrollHeight;
            }
        });
    }

    function printCLILine(text, className = '') {
        const p = document.createElement('p');
        p.className = `cli-line ${className}`;
        p.textContent = text;
        cliOutput.appendChild(p);
    }

    // ==========================================================================
    // 6. TRÌNH PHÁT NHẠC MINI SYNTHWAVE (WEB AUDIO SYNTHESIZER)
    // ==========================================================================
    const playerToggleBtn = document.getElementById('player-toggle-btn');
    const playerControls = document.getElementById('player-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    let isPlayingMusic = false;
    let synthLoop = null;

    playerToggleBtn.addEventListener('click', () => {
        playerControls.classList.toggle('active');
    });

    playPauseBtn.addEventListener('click', () => {
        isPlayingMusic = !isPlayingMusic;
        const icon = playPauseBtn.querySelector('i');

        if (isPlayingMusic) {
            icon.className = 'fas fa-pause';
            if (audioCtx.state === 'suspended') audioCtx.resume();
            startSynthMusic();
        } else {
            icon.className = 'fas fa-play';
            stopSynthMusic();
        }
    });

    function startSynthMusic() {
        const notes = [220, 261.63, 293.66, 329.63, 392.00];
        let noteIndex = 0;

        synthLoop = setInterval(() => {
            if (!isPlayingMusic) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[noteIndex % notes.length], audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);

            noteIndex++;
        }, 300);
    }

    function stopSynthMusic() {
        if (synthLoop) {
            clearInterval(synthLoop);
            synthLoop = null;
        }
    }

    // ==========================================================================
    // 7. LOCALSTORAGE VISITOR COUNTER & THEME MEMORY
    // ==========================================================================
    let visits = localStorage.getItem('site_visits') || 1042;
    visits = parseInt(visits) + 1;
    localStorage.setItem('site_visits', visits);
    const visitCountEl = document.getElementById('visit-count');
    if (visitCountEl) {
        visitCountEl.textContent = visits.toLocaleString('en-US').padStart(7, '0');
    }

    // ==========================================================================
    // 8. MOBILE MENU, THEME TOGGLE, FILTER, MODALS & SCROLL
    // ==========================================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') themeIcon.classList.replace('fa-sun', 'fa-moon');

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);

        if (nextTheme === 'light') {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    const filterBtns = document.querySelectorAll('.tab-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    const modalBtns = document.querySelectorAll('.quick-view-btn, .view-cert-btn');
    const closeBtns = document.querySelectorAll('.close-modal');

    modalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'flex';
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    const cyberForm = document.getElementById('cyber-form');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const feedback = document.getElementById('form-feedback');

    cyberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        document.querySelectorAll('.err-msg').forEach(el => el.textContent = '');
        feedback.textContent = '';

        if (username.value.trim() === '') {
            setError(username, '[LỖI] Vui lòng nhập họ và tên.');
            valid = false;
        }

        if (email.value.trim() === '') {
            setError(email, '[LỖI] Vui lòng nhập email.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            setError(email, '[LỖI] Email không hợp lệ.');
            valid = false;
        }

        if (message.value.trim() === '') {
            setError(message, '[LỖI] Vui lòng nhập tin nhắn.');
            valid = false;
        }

        if (valid) {
            feedback.style.color = 'var(--primary)';
            feedback.textContent = '>> HỆ THỐNG: ĐÃ GỬI TIN NHẮN THÀNH CÔNG!';
            cyberForm.reset();
        }
    });

    function setError(input, msg) {
        input.nextElementSibling.textContent = msg;
    }

    const scrollTop = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTop.style.display = 'flex';
        } else {
            scrollTop.style.display = 'none';
        }
    });

    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});