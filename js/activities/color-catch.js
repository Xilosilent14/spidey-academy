/**
 * Color Catch — Tap bugs of the target color!
 * Voice: "Can you catch the RED bugs?"
 * Bugs crawl across screen, tap matching ones.
 */
const ColorCatch = (() => {
    const ALL_COLORS = [
        { name: 'red', hex: '#e23636', dark: '#b01c1c' },
        { name: 'blue', hex: '#2196F3', dark: '#1565C0' },
        { name: 'yellow', hex: '#FFD600', dark: '#C7A500' },
        { name: 'green', hex: '#4CAF50', dark: '#2E7D32' },
        { name: 'orange', hex: '#FF9800', dark: '#E65100' },
        { name: 'purple', hex: '#9C27B0', dark: '#6A1B9A' }
    ];

    let container = null;
    let targetColor = null;
    let bugs = [];
    let caught = 0;
    let needed = 0;
    let roundActive = false;
    let onComplete = null;
    let moveInterval = null;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        caught = 0;
        needed = 3;
        roundActive = true;

        // Pick colors based on what the child knows
        const stats = Progress.getStats('color-catch');
        const availableColors = ALL_COLORS.filter(c => stats.colorsLearned.includes(c.name));
        targetColor = availableColors[Math.floor(Math.random() * availableColors.length)];

        // Build bug field
        const bugCount = 6 + Math.floor(Math.random() * 3); // 6-8 bugs
        bugs = [];

        // Ensure at least `needed` are the target color
        for (let i = 0; i < bugCount; i++) {
            let color;
            if (i < needed) {
                color = targetColor;
            } else {
                // Pick a non-target color
                const others = availableColors.filter(c => c.name !== targetColor.name);
                color = others[Math.floor(Math.random() * others.length)] || targetColor;
            }
            bugs.push({
                id: i,
                color,
                x: 80 + Math.random() * (window.innerWidth - 200),
                y: 80 + Math.random() * (window.innerHeight - 220),
                caught: false,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                wobble: Math.random() * Math.PI * 2
            });
        }

        // Shuffle bug positions
        bugs.sort(() => Math.random() - 0.5);

        _render();
        _startMovement();

        // Voice prompt
        setTimeout(() => {
            Voice.speak(`Can you catch the ${targetColor.name} bugs?`);
        }, 300);
    }

    function _render() {
        const targetDisplay = `
            <div class="activity-prompt">
                <div class="color-target-swatch" style="background:${targetColor.hex}"></div>
                <span class="catch-count">${caught} / ${needed}</span>
            </div>
        `;

        const bugsHtml = bugs.filter(b => !b.caught).map(b => `
            <div class="bug" data-bug-id="${b.id}"
                 style="left:${b.x}px; top:${b.y}px; --bug-color:${b.color.hex}; --bug-dark:${b.color.dark}">
                <div class="bug-body">
                    <div class="bug-eye left"></div>
                    <div class="bug-eye right"></div>
                    <div class="bug-leg l1"></div>
                    <div class="bug-leg l2"></div>
                    <div class="bug-leg l3"></div>
                    <div class="bug-leg r1"></div>
                    <div class="bug-leg r2"></div>
                    <div class="bug-leg r3"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = targetDisplay + `<div class="bug-field">${bugsHtml}</div>`;

        // Bind tap handlers
        container.querySelectorAll('.bug').forEach(el => {
            el.addEventListener('click', (e) => _onBugTap(e, el));
            el.addEventListener('touchstart', (e) => {
                e.preventDefault();
                _onBugTap(e, el);
            }, { passive: false });
        });
    }

    function _onBugTap(e, el) {
        if (!roundActive) return;
        const bugId = parseInt(el.dataset.bugId);
        const bug = bugs.find(b => b.id === bugId);
        if (!bug || bug.caught) return;

        if (bug.color.name === targetColor.name) {
            // Correct!
            bug.caught = true;
            caught++;
            Audio.playPop();
            Progress.recordAnswer('color-catch', true);
            Character.happy();

            // Sparkle at bug location
            const rect = el.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

            // Animate bug out
            el.classList.add('bug-caught');
            setTimeout(() => el.remove(), 400);

            // Update count
            const countEl = container.querySelector('.catch-count');
            if (countEl) countEl.textContent = `${caught} / ${needed}`;

            // Check if round complete
            if (caught >= needed) {
                _completeRound();
            } else if (caught === needed - 1) {
                Voice.speak('One more!');
            }

            // Check for sticker
            if (Progress.shouldAwardSticker()) {
                _awardSticker();
            }
        } else {
            // Wrong color
            Audio.playWrong();
            Progress.recordAnswer('color-catch', false);
            Character.encourage();
            el.classList.add('bug-shake');
            setTimeout(() => el.classList.remove('bug-shake'), 500);
            Voice.speak(`That's ${bug.color.name}. Try the ${targetColor.name} one!`);
        }
    }

    function _startMovement() {
        moveInterval = setInterval(() => {
            if (!roundActive) return;
            bugs.forEach(b => {
                if (b.caught) return;
                b.wobble += 0.05;
                b.x += b.vx + Math.sin(b.wobble) * 0.3;
                b.y += b.vy + Math.cos(b.wobble) * 0.3;

                // Bounce off edges
                if (b.x < 40 || b.x > window.innerWidth - 140) b.vx *= -1;
                if (b.y < 80 || b.y > window.innerHeight - 180) b.vy *= -1;
                b.x = Math.max(40, Math.min(window.innerWidth - 140, b.x));
                b.y = Math.max(80, Math.min(window.innerHeight - 180, b.y));

                const el = container.querySelector(`[data-bug-id="${b.id}"]`);
                if (el) {
                    el.style.left = b.x + 'px';
                    el.style.top = b.y + 'px';
                }
            });
        }, 50);
    }

    function _completeRound() {
        roundActive = false;
        if (moveInterval) clearInterval(moveInterval);

        Audio.playCelebration();
        Character.celebrate();
        Celebration.confetti();
        Voice.speak('Amazing! You caught them all!');

        Progress.recordActivityPlayed('color-catch');

        // Maybe expand content (unlock new color)
        _maybeUnlockColor();

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);
    }

    function _maybeUnlockColor() {
        const stats = Progress.getStats('color-catch');
        if (stats.played >= 2 && stats.colorsLearned.length < ALL_COLORS.length) {
            const nextColor = ALL_COLORS.find(c => !stats.colorsLearned.includes(c.name));
            if (nextColor) {
                Progress.expandContent('color-catch', nextColor.name);
            }
        }
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Audio.playSticker();

        // Show sticker earned overlay
        const overlay = document.createElement('div');
        overlay.className = 'sticker-earned-overlay';
        overlay.innerHTML = `
            <div class="sticker-earned-card">
                <div class="sticker-earned-emoji">${sticker.emoji}</div>
                <div class="sticker-earned-text">New Sticker!</div>
            </div>
        `;
        document.body.appendChild(overlay);

        Celebration.starBurst(window.innerWidth / 2, window.innerHeight / 2);

        setTimeout(() => overlay.remove(), 2500);
    }

    function stop() {
        roundActive = false;
        if (moveInterval) clearInterval(moveInterval);
        bugs = [];
    }

    return { start, stop };
})();
