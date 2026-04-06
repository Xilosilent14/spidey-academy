/**
 * Number Bugs — Count the bugs!
 * Voice: "How many bugs do you see?"
 * Bugs appear on screen, tap the correct number.
 */
const NumberBugs = (() => {
    const BUG_EMOJIS = ['🐛', '🐞', '🦗', '🐜', '🐝', '🦋'];
    let container = null;
    let onComplete = null;
    let currentRound = 0;
    let totalRounds = 5;
    let correctAnswer = 0;

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

        const stats = Progress.getStats('number-bugs');
        const maxNum = stats.maxNumber || 3;

        // Pick a number to count
        correctAnswer = 1 + Math.floor(Math.random() * maxNum);
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];

        // Generate bug positions (spread out nicely)
        const bugPositions = [];
        for (let i = 0; i < correctAnswer; i++) {
            let x, y, overlap;
            let attempts = 0;
            do {
                x = 15 + Math.random() * 70; // % of container width
                y = 10 + Math.random() * 50; // % of container height
                overlap = bugPositions.some(p =>
                    Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 15
                );
                attempts++;
            } while (overlap && attempts < 20);
            bugPositions.push({ x, y });
        }

        // Number choices (3 buttons)
        const choices = new Set([correctAnswer]);
        while (choices.size < 3) {
            let n = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2));
            if (n >= 1 && n <= 10) choices.add(n);
            else choices.add(Math.max(1, Math.min(10, n)));
        }
        const sortedChoices = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt">
                <span class="round-counter">${currentRound + 1} / ${totalRounds}</span>
            </div>
            <div class="number-bug-field">
                ${bugPositions.map(p => `
                    <div class="number-bug" style="left:${p.x}%;top:${p.y}%">
                        <span class="number-bug-emoji">${bugEmoji}</span>
                    </div>
                `).join('')}
            </div>
            <div class="number-choices">
                ${sortedChoices.map(n => `
                    <button class="number-choice-btn" data-number="${n}">
                        <span class="number-text">${n}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Bind handlers
        container.querySelectorAll('.number-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => _onChoice(btn));
        });

        // Voice prompt
        setTimeout(() => {
            Voice.speak('How many bugs do you see?');
        }, 400);
    }

    function _onChoice(btn) {
        const chosen = parseInt(btn.dataset.number);

        if (chosen === correctAnswer) {
            Audio.playCorrect();
            Progress.recordAnswer('number-bugs', true);
            Character.happy();
            btn.classList.add('choice-correct');

            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);

            Voice.speak(`Yes! ${correctAnswer}!`);

            if (Progress.shouldAwardSticker()) _awardSticker();

            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('number-bugs', false);
            Character.encourage();
            btn.classList.add('choice-wrong');

            const correctBtn = container.querySelector(`[data-number="${correctAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');

            Voice.speak(`Let's count again. One, two${correctAnswer > 2 ? ', three' : ''}${correctAnswer > 3 ? ', four' : ''}${correctAnswer > 4 ? ', five' : ''}. ${correctAnswer}!`);

            setTimeout(() => {
                btn.classList.remove('choice-wrong');
                if (correctBtn) correctBtn.classList.remove('choice-hint');
            }, 3000);
        }
    }

    function _completeActivity() {
        Audio.playCelebration();
        Character.celebrate();
        Celebration.confetti();
        Voice.speak('You counted them all! Amazing!');

        Progress.recordActivityPlayed('number-bugs');
        _maybeExpandNumbers();

        setTimeout(() => {
            if (onComplete) onComplete();
        }, 3000);
    }

    function _maybeExpandNumbers() {
        const stats = Progress.getStats('number-bugs');
        if (stats.played >= 2 && stats.maxNumber < 10) {
            Progress.expandContent('number-bugs', stats.maxNumber + 1);
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
