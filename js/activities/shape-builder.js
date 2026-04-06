/**
 * Shape Builder — Match shapes to complete Spidey's web!
 */
const ShapeBuilder = (() => {
    const ALL_SHAPES = [
        { name: 'circle', svg: '<circle cx="50" cy="50" r="40"/>', color: '#e23636' },
        { name: 'square', svg: '<rect x="10" y="10" width="80" height="80" rx="4"/>', color: '#2196F3' },
        { name: 'triangle', svg: '<polygon points="50,5 95,90 5,90"/>', color: '#4CAF50' },
        { name: 'star', svg: '<polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"/>', color: '#FFD600' },
        { name: 'heart', svg: '<path d="M50,85 C20,60 0,40 10,20 C20,0 40,5 50,25 C60,5 80,0 90,20 C100,40 80,60 50,85Z"/>', color: '#E056A0' },
        { name: 'diamond', svg: '<polygon points="50,5 90,50 50,95 10,50"/>', color: '#9C27B0' }
    ];

    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 5, targetShape = null;
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
        const stats = Progress.getStats('shape-builder');
        const available = ALL_SHAPES.filter(s => stats.shapesLearned.includes(s.name));
        targetShape = available[Math.floor(Math.random() * available.length)];
        const distractors = available.filter(s => s.name !== targetShape.name).sort(() => Math.random() - 0.5);
        const choices = [targetShape, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt">
                <div class="shape-web-frame">
                    <svg viewBox="0 0 100 100" class="shape-outline">${targetShape.svg}</svg>
                </div>
                <span class="round-counter">${currentRound + 1} / ${totalRounds}</span>
            </div>
            <div class="shape-choices">
                ${choices.map(s => `
                    <button class="shape-choice-btn" data-shape="${s.name}">
                        <svg viewBox="0 0 100 100" class="shape-filled" style="fill:${s.color}">${s.svg}</svg>
                    </button>
                `).join('')}
            </div>
        `;
        container.querySelectorAll('.shape-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));
        setTimeout(() => Voice.speak(`Spidey needs the ${targetShape.name}!`), 300);
    }

    function _onChoice(btn) {
        const chosen = btn.dataset.shape;
        roundTotal++;
        if (chosen === targetShape.name) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('shape-builder', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1200);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('shape-builder', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-shape="${targetShape.name}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`That's the ${chosen}. Look for the ${targetShape.name}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2000);
        }
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You built all the webs! Great job!');
        _maybeUnlock();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeUnlock() {
        const stats = Progress.getStats('shape-builder');
        if (stats.played >= 2 && stats.shapesLearned.length < ALL_SHAPES.length) {
            const next = ALL_SHAPES.find(s => !stats.shapesLearned.includes(s.name));
            if (next) Progress.expandContent('shape-builder', next.name);
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
