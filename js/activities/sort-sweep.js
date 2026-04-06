/**
 * Sort Sweep — Sort items into the correct web!
 */
const SortSweep = (() => {
    const SORT_MODES = [
        {
            name: 'colors',
            generate() {
                const colors = [
                    { name: 'red', hex: '#e23636', emoji: '🔴' },
                    { name: 'blue', hex: '#2196F3', emoji: '🔵' },
                    { name: 'yellow', hex: '#FFD600', emoji: '🟡' },
                    { name: 'green', hex: '#4CAF50', emoji: '🟢' },
                    { name: 'orange', hex: '#FF9800', emoji: '🟠' },
                    { name: 'purple', hex: '#9C27B0', emoji: '🟣' }
                ];
                const pair = colors.sort(() => Math.random() - 0.5).slice(0, 2);
                const items = [];
                for (let i = 0; i < 6; i++) {
                    const cat = i < 3 ? 0 : 1;
                    items.push({
                        display: `<div class="sort-bug" style="background:${pair[cat].hex}">🐛</div>`,
                        correct: cat === 0 ? 'left' : 'right',
                        label: pair[cat].name
                    });
                }
                return { left: { label: pair[0].name, color: pair[0].hex, display: pair[0].emoji }, right: { label: pair[1].name, color: pair[1].hex, display: pair[1].emoji }, items: items.sort(() => Math.random() - 0.5) };
            }
        },
        {
            name: 'shapes',
            generate() {
                const shapes = [{ name: 'circle', emoji: '⚪' }, { name: 'square', emoji: '⬜' }, { name: 'triangle', emoji: '🔺' }, { name: 'star', emoji: '⭐' }];
                const pair = shapes.sort(() => Math.random() - 0.5).slice(0, 2);
                const items = [];
                for (let i = 0; i < 6; i++) {
                    const cat = i < 3 ? 0 : 1;
                    items.push({ display: pair[cat].emoji, correct: cat === 0 ? 'left' : 'right', label: pair[cat].name });
                }
                return { left: { label: pair[0].name, color: '#e23636', display: pair[0].emoji }, right: { label: pair[1].name, color: '#2196F3', display: pair[1].emoji }, items: items.sort(() => Math.random() - 0.5) };
            }
        },
        {
            name: 'size',
            generate() {
                const emojis = ['🐛', '🦋', '🐞', '🐝', '🕷️'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const items = [];
                for (let i = 0; i < 6; i++) {
                    const isBig = Math.random() > 0.5;
                    items.push({ display: emoji, correct: isBig ? 'left' : 'right', size: isBig ? 'big' : 'small' });
                }
                return { left: { label: 'big', color: '#4CAF50', display: '🔍' }, right: { label: 'small', color: '#FF9800', display: '🔎' }, items };
            }
        }
    ];

    let container = null, onComplete = null;
    let currentItem = 0, roundData = null;
    let roundCorrect = 0, roundTotal = 0;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentItem = 0;
        roundCorrect = 0;
        roundTotal = 0;
        roundData = SORT_MODES[Math.floor(Math.random() * SORT_MODES.length)].generate();
        _render();
        setTimeout(() => Voice.speak('Sort them! Tap the right web!'), 300);
    }

    function _render() {
        if (currentItem >= roundData.items.length) { _completeActivity(); return; }
        const item = roundData.items[currentItem];
        const isSize = item.size !== undefined;

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentItem + 1} / ${roundData.items.length}</span></div>
            <div class="sort-arena">
                <button class="sort-web sort-web-left" data-side="left">
                    <div class="sort-web-label">${roundData.left.display}</div>
                    <div class="sort-web-name">${roundData.left.label}</div>
                </button>
                <div class="sort-item ${isSize ? 'sort-item-' + item.size : ''}">
                    ${typeof item.display === 'string' && item.display.startsWith('<') ? item.display : `<span class="sort-item-emoji">${item.display}</span>`}
                </div>
                <button class="sort-web sort-web-right" data-side="right">
                    <div class="sort-web-label">${roundData.right.display}</div>
                    <div class="sort-web-name">${roundData.right.label}</div>
                </button>
            </div>
        `;
        container.querySelectorAll('.sort-web').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));

        setTimeout(() => {
            if (isSize) Voice.speak('Is this bug big or small?');
            else if (item.label) Voice.speak(`Where does the ${item.label} one go?`);
        }, 500);
    }

    function _onChoice(btn) {
        const side = btn.dataset.side;
        const item = roundData.items[currentItem];
        roundTotal++;

        if (side === item.correct) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('sort-sweep', true);
            Character.happy();
            btn.classList.add('sort-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentItem++;
            setTimeout(_render, 1000);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('sort-sweep', false);
            Character.encourage();
            btn.classList.add('sort-wrong');
            const correctBtn = container.querySelector(`[data-side="${item.correct}"]`);
            if (correctBtn) correctBtn.classList.add('sort-hint');
            const correctLabel = item.correct === 'left' ? roundData.left.label : roundData.right.label;
            Voice.speak(`Try the ${correctLabel} web!`);
            setTimeout(() => { btn.classList.remove('sort-wrong'); if (correctBtn) correctBtn.classList.remove('sort-hint'); }, 2000);
        }
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('All sorted! You did it!');
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() { currentItem = 999; }
    return { start, stop };
})();
