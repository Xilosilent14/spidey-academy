/**
 * Sticker Book — Reward collection system
 * 30 stickers across 5 themed pages. Earned every 4 correct answers.
 */
const StickerBook = (() => {
    // 30 stickers, 6 per page, 5 themed pages
    const STICKERS = [
        // Page 1: Spider stickers
        { id: 'spider-1', emoji: '🕷️', name: 'Tiny Spider', page: 0 },
        { id: 'spider-2', emoji: '🕸️', name: 'Web Spinner', page: 0 },
        { id: 'spider-3', emoji: '🦸', name: 'Super Hero', page: 0 },
        { id: 'spider-4', emoji: '🎭', name: 'Mask', page: 0 },
        { id: 'spider-5', emoji: '💪', name: 'Strong', page: 0 },
        { id: 'spider-6', emoji: '⚡', name: 'Power Up', page: 0 },
        // Page 2: Bug stickers
        { id: 'bug-1', emoji: '🐛', name: 'Caterpillar', page: 1 },
        { id: 'bug-2', emoji: '🦋', name: 'Butterfly', page: 1 },
        { id: 'bug-3', emoji: '🐞', name: 'Ladybug', page: 1 },
        { id: 'bug-4', emoji: '🐝', name: 'Bee', page: 1 },
        { id: 'bug-5', emoji: '🦗', name: 'Cricket', page: 1 },
        { id: 'bug-6', emoji: '🐜', name: 'Ant', page: 1 },
        // Page 3: Star stickers
        { id: 'star-1', emoji: '⭐', name: 'Gold Star', page: 2 },
        { id: 'star-2', emoji: '🌟', name: 'Glowing Star', page: 2 },
        { id: 'star-3', emoji: '💫', name: 'Dizzy Star', page: 2 },
        { id: 'star-4', emoji: '✨', name: 'Sparkles', page: 2 },
        { id: 'star-5', emoji: '🎆', name: 'Firework', page: 2 },
        { id: 'star-6', emoji: '🌈', name: 'Rainbow', page: 2 },
        // Page 4: Nature stickers
        { id: 'nature-1', emoji: '🌸', name: 'Flower', page: 3 },
        { id: 'nature-2', emoji: '🌻', name: 'Sunflower', page: 3 },
        { id: 'nature-3', emoji: '🍀', name: 'Clover', page: 3 },
        { id: 'nature-4', emoji: '🌙', name: 'Moon', page: 3 },
        { id: 'nature-5', emoji: '☀️', name: 'Sun', page: 3 },
        { id: 'nature-6', emoji: '🦄', name: 'Unicorn', page: 3 },
        // Page 5: Fun stickers
        { id: 'fun-1', emoji: '🎈', name: 'Balloon', page: 4 },
        { id: 'fun-2', emoji: '🎉', name: 'Party', page: 4 },
        { id: 'fun-3', emoji: '🏆', name: 'Trophy', page: 4 },
        { id: 'fun-4', emoji: '🎸', name: 'Guitar', page: 4 },
        { id: 'fun-5', emoji: '🚀', name: 'Rocket', page: 4 },
        { id: 'fun-6', emoji: '🎮', name: 'Game', page: 4 }
    ];

    const PAGE_NAMES = ['Spider Power', 'Bug Friends', 'Star Collection', 'Nature Magic', 'Fun Time'];
    let currentPage = 0;

    function getNextUnearned() {
        const earned = Progress.getStickers();
        const unearned = STICKERS.filter(s => !earned.includes(s.id));
        if (unearned.length === 0) return null;
        return unearned[0];
    }

    function render(container) {
        const earned = Progress.getStickers();
        const pageStickers = STICKERS.filter(s => s.page === currentPage);

        container.innerHTML = `
            <div class="sticker-book-inner">
                <div class="sticker-page-title">${PAGE_NAMES[currentPage]}</div>
                <div class="sticker-page-count">${earned.filter(id => pageStickers.some(s => s.id === id)).length} / ${pageStickers.length}</div>
                <div class="sticker-grid">
                    ${pageStickers.map(s => {
                        const isEarned = earned.includes(s.id);
                        return `
                            <div class="sticker-slot ${isEarned ? 'earned' : 'locked'}">
                                <span class="sticker-emoji">${isEarned ? s.emoji : '❓'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="sticker-nav">
                    <button class="sticker-nav-btn" id="sticker-prev" ${currentPage === 0 ? 'disabled' : ''}>◀</button>
                    <span class="sticker-page-dots">
                        ${PAGE_NAMES.map((_, i) => `<span class="dot ${i === currentPage ? 'active' : ''}"></span>`).join('')}
                    </span>
                    <button class="sticker-nav-btn" id="sticker-next" ${currentPage === PAGE_NAMES.length - 1 ? 'disabled' : ''}>▶</button>
                </div>
            </div>
        `;

        container.querySelector('#sticker-prev')?.addEventListener('click', () => {
            if (currentPage > 0) { currentPage--; Audio.playTap(); render(container); }
        });
        container.querySelector('#sticker-next')?.addEventListener('click', () => {
            if (currentPage < PAGE_NAMES.length - 1) { currentPage++; Audio.playTap(); render(container); }
        });
    }

    function getTotalEarned() {
        return Progress.getStickers().length;
    }

    function getTotalAvailable() {
        return STICKERS.length;
    }

    return { render, getNextUnearned, getTotalEarned, getTotalAvailable, STICKERS };
})();
