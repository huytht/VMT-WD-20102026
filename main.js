/**
 * Romantic 20/10 Website - Main Interactive Logic
 * Handles Audio, Polaroid Lightbox, Love Vouchers, Heart Blaster & Sweet Effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initAudioPlayer();
    initPolaroidLightbox();
    initVouchers();
    initHeartBlaster();
    initGlobalClickHearts();
});

/* =========================================================
   1. AUDIO PLAYER CONTROLLER
   ========================================================= */
function initAudioPlayer() {
    const musicBar = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    const statusText = document.getElementById('music-status-text');

    if (!audio || !musicBar) return;

    let isPlaying = false;
    audio.volume = 0.65;

    function playAudio() {
        audio.play().then(() => {
            isPlaying = true;
            musicBar.classList.add('playing');
            if (statusText) statusText.textContent = 'Đang phát • Phương Mỹ Chi';
        }).catch((err) => {
            console.log('Autoplay deferred until user interaction:', err);
            isPlaying = false;
            musicBar.classList.remove('playing');
            if (statusText) statusText.textContent = 'Phương Mỹ Chi • Chạm để nghe';
        });
    }

    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        musicBar.classList.remove('playing');
        if (statusText) statusText.textContent = 'Tạm dừng • Chạm để nghe';
    }

    musicBar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    // Auto-start on first user gesture anywhere on page if not already playing
    const unlockAudio = () => {
        if (!isPlaying) {
            playAudio();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
}

/* =========================================================
   2. POLAROID LIGHTBOX
   ========================================================= */
function initPolaroidLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.getElementById('lightbox-close');

    if (!modal) return;

    const cards = document.querySelectorAll('.polaroid-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const img = card.querySelector('.polaroid-img');
            const title = card.querySelector('.polaroid-text');
            const sub = card.querySelector('.polaroid-sub');

            if (img && modalImg) {
                modalImg.src = img.src;
                modalImg.alt = img.alt || 'Ảnh Vợ Yêu';
            }
            if (title && modalTitle) {
                modalTitle.textContent = title.textContent;
            }
            if (sub && modalDesc) {
                modalDesc.textContent = sub.textContent;
            }

            modal.classList.add('active');
            spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 12);
        });
    });

    function closeModal() {
        modal.classList.remove('active');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* =========================================================
   3. 20/10 LOVE VOUCHERS REDEMPTION
   ========================================================= */
function initVouchers() {
    const voucherButtons = document.querySelectorAll('.voucher-btn');

    voucherButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.voucher-card');
            if (!card || card.classList.contains('redeemed')) return;

            card.classList.add('redeemed');
            btn.innerHTML = '<span>Đã nhận đặc quyền 💕</span>';

            const rect = btn.getBoundingClientRect();
            spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);

            showLoveToast('Vợ đã nhận voucher thành công! Chồng sẽ thực hiện ngay nha 🥰');
        });
    });
}

/* =========================================================
   4. HEART BLASTER & SWEET TOASTS
   ========================================================= */
const sweetQuotes = [
    "Vợ anh là người phụ nữ xinh đẹp và tuyệt vời nhất! 💖",
    "Yêu em hơn cả 3000 lần! 💕",
    "Cảm ơn vì em đã luôn là mái ấm dịu dàng của anh! 🌸",
    "Chúc công chúa của anh ngày 20/10 luôn tràn ngập tiếng cười! ✨",
    "Mỗi ngày được ở bên em đều là một ngày hạnh phúc! 🥰",
    "Vợ yêu hãy luôn rạng rỡ và an yên nhé, việc còn lại để chồng lo! 👑",
    "Trái tim anh mãi mãi chỉ thuộc về một mình em thôi! 💍",
    "20/10 thật hạnh phúc nhé tình yêu của đời anh! 💐"
];

let lastQuoteIndex = -1;

function initHeartBlaster() {
    const blasterBtn = document.getElementById('heart-blaster-btn');
    if (!blasterBtn) return;

    blasterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = blasterBtn.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;

        // Spawn multiple hearts
        spawnHeartBurst(startX, startY, 25);

        // Pick random non-repeating quote
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * sweetQuotes.length);
        } while (nextIndex === lastQuoteIndex && sweetQuotes.length > 1);
        lastQuoteIndex = nextIndex;

        showLoveToast(sweetQuotes[nextIndex]);
    });
}

function showLoveToast(message) {
    let toast = document.getElementById('love-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'love-toast';
        toast.className = 'love-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}

/* =========================================================
   5. SPAWN FLOATING HEARTS & PARTICLES
   ========================================================= */
const heartIcons = ['💖', '💕', '💗', '💓', '🌸', '✨', '🦋', '🌷', '🥰'];

function spawnHeartBurst(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'flying-heart-particle';
            el.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];

            el.style.left = `${x}px`;
            el.style.top = `${y}px`;

            const dx = (Math.random() - 0.5) * 240;
            const rot = (Math.random() - 0.5) * 60;
            const size = 18 + Math.random() * 22;

            el.style.setProperty('--dx', `${dx}px`);
            el.style.setProperty('--rot', `${rot}deg`);
            el.style.fontSize = `${size}px`;

            document.body.appendChild(el);

            setTimeout(() => {
                el.remove();
            }, 2100);
        }, i * 35);
    }
}

/* =========================================================
   6. GLOBAL CLICK EFFECT (MINI HEARTS ON TAP)
   ========================================================= */
function initGlobalClickHearts() {
    document.addEventListener('click', (e) => {
        // Don't trigger if clicked on specific buttons that already burst
        if (e.target.closest('#heart-blaster-btn') || e.target.closest('.voucher-btn')) return;

        const el = document.createElement('div');
        el.className = 'flying-heart-particle';
        el.textContent = ['💕', '💖', '✨', '🌸'][Math.floor(Math.random() * 4)];

        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;

        const dx = (Math.random() - 0.5) * 80;
        const rot = (Math.random() - 0.5) * 45;

        el.style.setProperty('--dx', `${dx}px`);
        el.style.setProperty('--rot', `${rot}deg`);
        el.style.fontSize = `${16 + Math.random() * 14}px`;

        document.body.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 1800);
    });
}
