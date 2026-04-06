/**
 * Letter Web — Find the matching letter!
 * Voice: "Find the letter B!"
 * A letter shows in Spidey's web, tap the matching one from 3 choices.
 */
const LetterWeb = (() => {
    const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const LETTER_COLORS = [
        '#e23636', '#2196F3', '#4CAF50', '#FFD600', '#FF9800',
        '#9C27B0', '#00BCD4', '#E056A0', '#8BC34A', '#FF5722'
    ];

    let container = null;
    let onComplete = null;
    let currentRound = 0;
    let totalRounds = 5;
    let targetLetter = '';

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentRound = 0;
        _nextQuestion();
    }

    function _nextQuestion() {
        if (currentRound >= totalRounds) {
            _completeActivity();
            return;
        }

        const stats = Progress.getStats('letter-web');
        const available = stats.lettersLearned || ['A', 'B', 'C', 'O'];

        // Pick target
        targetLetter = available[Math.floor(Math.random() * available.length)];
        const targetColor = LETTER_COLORS[ALL_LETTERS.indexOf(targetLetter) % LETTER_COLORS.length];

        // Pick distractors from known letters
        const distractors = available.filter(l => l !== targetLetter);
        const shuffled = distractors.sort(() => Math.random() - 0.5);
        const choices = [targetLetter, ...shuffled.slice(0, 2)].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt">
                <span class="round-counter">${currentRound + 1} / ${totalRounds}</span>
            </div>
            <div class="letter-web-display">
                <div class="letter-web-frame">
                    <svg class="web-bg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
                        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                        <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <line x1="30" y1="30" x2="170" y2="170" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="170" y1="30" x2="30" y2="170" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                    </svg>
                    <div class="letter-web-target" style="color:${targetColor}">${targetLetter}</div>
                </div>
            </div>
            <div class="letter-choices">
                ${choices.map(l => {
                    const color = LETTER_COLORS[ALL_LETTERS.indexOf(l) % LETTER_COLORS.length];
                    return `
                        <button class="letter-choice-btn" data-letter="${l}" style="--letter-color:${color}">
                            <span class="letter-text">${l}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        container.querySelectorAll('.letter-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => _onChoice(btn));
        });

        setTimeout(() => {
            Voice.speak(`Find the letter ${targetLetter}!`);
        }, 400);
    }

    function _onChoice(btn) {
        const chosen = btn.dataset.letter;

        if (chosen === targetLetter) {
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');

            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);

            Voice.speak(`Yes! That's ${targetLetter}!`);

            if (Progress.shouldAwardSticker()) _awardSticker();

            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('letter-web', false);
            Character.encourage();
            btn.classList.add('choice-wrong');

            const correctBtn = container.querySelector(`[data-letter="${targetLetter}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');

            Voice.speak(`That's ${chosen}. Look for ${targetLetter}!`);

            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 2500);
        }
    }

    function _completeActivity() {
        Audio.playCelebration();
        Character.celebrate();
        Celebration.confetti();
        Voice.speak('You found all the letters! Super!');

        Progress.recordActivityPlayed('letter-web');
        _maybeUnlockLetters();

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);
    }

    function _maybeUnlockLetters() {
        const stats = Progress.getStats('letter-web');
        if (stats.played >= 2 && stats.lettersLearned.length < ALL_LETTERS.length) {
            // Unlock 1-2 new letters each time
            const unlearnedLetters = ALL_LETTERS.filter(l => !stats.lettersLearned.includes(l));
            const toAdd = unlearnedLetters.slice(0, 2);
            toAdd.forEach(l => Progress.expandContent('letter-web', l));
        }
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Audio.playSticker();
        const overlay = document.createElement('div');
        overlay.className = 'sticker-earned-overlay';
        overlay.innerHTML = `<div class="sticker-earned-card"><div class="sticker-earned-emoji">${sticker.emoji}</div><div class="sticker-earned-text">New Sticker!</div></div>`;
        document.body.appendChild(overlay);
        Celebration.starBurst(window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => overlay.remove(), 2500);
    }

    function stop() { currentRound = totalRounds; }

    return { start, stop };
})();
