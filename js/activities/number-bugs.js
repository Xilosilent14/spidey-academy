/**
 * Number Bugs — Count the bugs!
 */
const NumberBugs = (() => {
    const BUG_EMOJIS = ['🐛', '🐞', '🦗', '🐜', '🐝', '🦋'];
    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 5, correctAnswer = 0;
    let roundCorrect = 0, roundTotal = 0;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentRound = 0;
        roundCorrect = 0;
        roundTotal = 0;
        _nextQuestion();
    }

    function _nextQuestion() {
        if (currentRound >= totalRounds) { _completeActivity(); return; }
        const stats = Progress.getStats('number-bugs');
        const maxNum = stats.maxNumber || 3;
        correctAnswer = 1 + Math.floor(Math.random() * maxNum);
        const bugEmoji = BUG_EMOJIS[Math.floor(Math.random() * BUG_EMOJIS.length)];

        const bugPositions = [];
        for (let i = 0; i < correctAnswer; i++) {
            let x, y, overlap, attempts = 0;
            do {
                x = 15 + Math.random() * 70;
                y = 10 + Math.random() * 50;
                overlap = bugPositions.some(p => Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 15);
                attempts++;
            } while (overlap && attempts < 20);
            bugPositions.push({ x, y });
        }

        const choices = new Set([correctAnswer]);
        while (choices.size < 3) {
            let n = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2));
            n = Math.max(1, Math.min(10, n));
            choices.add(n);
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="number-bug-field">
                ${bugPositions.map(p => `<div class="number-bug" style="left:${p.x}%;top:${p.y}%"><span class="number-bug-emoji">${bugEmoji}</span></div>`).join('')}
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-number="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak('How many bugs do you see?'), 400);
    }

    function _onChoice(btn) {
        const chosen = parseInt(btn.dataset.number);
        roundTotal++;
        if (chosen === correctAnswer) {
            roundCorrect++;
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
            const countWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
            Voice.speak(`Let's count! ${countWords.slice(1, correctAnswer + 1).join(', ')}. ${correctAnswer}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 3000);
        }
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You counted them all! Amazing!');
        _maybeExpand();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeExpand() {
        const stats = Progress.getStats('number-bugs');
        if (stats.played >= 2 && stats.maxNumber < 10) {
            Progress.expandContent('number-bugs', stats.maxNumber + 1);
        }
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() { currentRound = totalRounds; }
    return { start, stop };
})();
