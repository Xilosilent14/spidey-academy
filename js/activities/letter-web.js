/**
 * Letter Web — Find the matching letter!
 * V2: 8 rounds, uppercase/lowercase matching, faster unlock (3 per 2 plays), sound hints
 */
const LetterWeb = (() => {
    const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const LETTER_COLORS = ['#e23636','#2196F3','#4CAF50','#FFD600','#FF9800','#9C27B0','#00BCD4','#E056A0','#8BC34A','#FF5722'];

    // Letter sound hints: phonetic sound for each letter
    const LETTER_SOUNDS = {
        A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fff', G: 'guh', H: 'huh',
        I: 'ih', J: 'juh', K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'oh', P: 'puh',
        Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh', U: 'uh', V: 'vvv', W: 'wuh',
        X: 'ks', Y: 'yuh', Z: 'zzz'
    };

    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 8, targetLetter = '';
    let roundCorrect = 0, roundTotal = 0;
    let useLowercase = false; // alternates: show upper, match lower (or vice versa)

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
        const stats = Progress.getStats('letter-web');
        const available = stats.lettersLearned || ['A','B','C','O'];
        targetLetter = available[Math.floor(Math.random() * available.length)];
        const targetColor = LETTER_COLORS[ALL_LETTERS.indexOf(targetLetter) % LETTER_COLORS.length];
        const distractors = available.filter(l => l !== targetLetter).sort(() => Math.random() - 0.5);
        const choices = [targetLetter, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);

        // Uppercase/lowercase mode: after player knows 6+ letters, alternate
        // Even rounds show uppercase target with lowercase choices, odd rounds normal
        useLowercase = available.length >= 6 && currentRound % 3 === 2;

        const displayTarget = useLowercase ? targetLetter.toLowerCase() : targetLetter;
        const displayChoices = useLowercase
            ? choices.map(l => l.toLowerCase())
            : choices;

        // Use sound hint every 3rd round to reinforce phonics
        const useSoundHint = currentRound % 3 === 1;

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="letter-web-display">
                <div class="letter-web-frame">
                    <svg class="web-bg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
                        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="30" y1="30" x2="170" y2="170" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
                        <line x1="170" y1="30" x2="30" y2="170" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
                    </svg>
                    <div class="letter-web-target" style="color:${targetColor}">${displayTarget}</div>
                </div>
            </div>
            <div class="letter-choices">
                ${displayChoices.map((l, i) => {
                    const origLetter = choices[i];
                    const color = LETTER_COLORS[ALL_LETTERS.indexOf(origLetter) % LETTER_COLORS.length];
                    return `<button class="letter-choice-btn" data-letter="${origLetter}" style="--letter-color:${color}"><span class="letter-text">${l}</span></button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onChoice(btn)));

        // Voice prompt: sound hint or letter name
        setTimeout(() => {
            if (useSoundHint) {
                const sound = LETTER_SOUNDS[targetLetter] || targetLetter;
                Voice.speak(`Find the letter that says "${sound}"!`);
            } else if (useLowercase) {
                Voice.speak(`Find the lowercase ${targetLetter}!`);
            } else {
                Voice.speak(`Find the letter ${targetLetter}!`);
            }
        }, 400);
    }

    function _onChoice(btn) {
        const chosen = btn.dataset.letter;
        roundTotal++;
        if (chosen === targetLetter) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            const sound = LETTER_SOUNDS[targetLetter] || '';
            Voice.speak(`Yes! ${targetLetter} says "${sound}"!`);
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
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You found all the letters! Super!');
        _maybeUnlock();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeUnlock() {
        const stats = Progress.getStats('letter-web');
        // Faster unlock: 3 new letters after 2 good plays (was 2 letters)
        if (stats.played >= 2 && stats.lettersLearned.length < ALL_LETTERS.length) {
            const toAdd = ALL_LETTERS.filter(l => !stats.lettersLearned.includes(l)).slice(0, 3);
            toAdd.forEach(l => Progress.expandContent('letter-web', l));
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
