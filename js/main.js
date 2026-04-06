/**
 * Main — App controller for Spidey Academy
 * Handles screen navigation, activity launching, and session management.
 */
const Main = (() => {
    let currentScreen = 'splash';
    let currentActivity = null;
    let sessionStartTime = null;
    const SESSION_MAX_MS = 12 * 60 * 1000; // 12 minutes

    const ACTIVITIES = [
        { id: 'color-catch', icon: '🎨', label: 'Color Catch', module: () => ColorCatch },
        { id: 'shape-builder', icon: '🔷', label: 'Shape Builder', module: () => ShapeBuilder },
        { id: 'number-bugs', icon: '🔢', label: 'Number Bugs', module: () => NumberBugs },
        { id: 'letter-web', icon: '🔤', label: 'Letter Web', module: () => LetterWeb },
        { id: 'sort-sweep', icon: '🧹', label: 'Sort Sweep', module: () => SortSweep }
    ];

    function init() {
        Progress.load();
        Voice.init();
        Character.init();
        Celebration.init(document.getElementById('celebration-canvas'));

        // Unlock audio on first touch
        document.addEventListener('click', () => Audio.unlock(), { once: true });
        document.addEventListener('touchstart', () => Audio.unlock(), { once: true });

        _bindButtons();
        _showSplash();

        // OTB ecosystem integration
        if (typeof OTBEcosystem !== 'undefined' && OTBEcosystem.updateStreak) {
            OTBEcosystem.updateStreak();
        }
    }

    function _showSplash() {
        _showScreen('splash');
        const name = Progress.getPlayerName();

        setTimeout(() => {
            Voice.speak(`Welcome to Spidey Academy, ${name}!`);
        }, 800);

        setTimeout(() => {
            _showScreen('home');
        }, 3000);
    }

    function _showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-' + screenId);
        if (screen) {
            screen.classList.add('active');
            currentScreen = screenId;
        }

        // Update home screen content
        if (screenId === 'home') {
            _updateHome();
        } else if (screenId === 'stickers') {
            StickerBook.render(document.getElementById('sticker-container'));
        } else if (screenId === 'activities') {
            _renderActivities();
        }
    }

    function _updateHome() {
        const name = Progress.getPlayerName();
        const nameEl = document.getElementById('home-player-name');
        if (nameEl) nameEl.textContent = name;

        const stickerCountEl = document.getElementById('home-sticker-count');
        if (stickerCountEl) {
            stickerCountEl.textContent = `${StickerBook.getTotalEarned()} / ${StickerBook.getTotalAvailable()}`;
        }

        // Update OTB badge if ecosystem available
        const levelEl = document.getElementById('home-level');
        if (levelEl && typeof OTBEcosystem !== 'undefined') {
            const profile = OTBEcosystem.getProfile();
            levelEl.textContent = `Level ${profile.globalLevel}`;
        }
    }

    function _renderActivities() {
        const grid = document.getElementById('activity-grid');
        if (!grid) return;

        grid.innerHTML = ACTIVITIES.map(act => `
            <button class="activity-card" data-activity="${act.id}">
                <span class="activity-icon">${act.icon}</span>
                <span class="activity-label">${act.label}</span>
            </button>
        `).join('');

        grid.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', () => {
                Audio.playTap();
                _startActivity(card.dataset.activity);
            });
            // Speak label on focus/hover for pre-readers
            card.addEventListener('mouseenter', () => {
                const act = ACTIVITIES.find(a => a.id === card.dataset.activity);
                if (act) Voice.speak(act.label);
            });
        });

        // Speak instruction
        setTimeout(() => Voice.speak('Pick a game!'), 300);
    }

    function _startActivity(activityId) {
        const act = ACTIVITIES.find(a => a.id === activityId);
        if (!act) return;

        currentActivity = act;
        sessionStartTime = sessionStartTime || Date.now();

        Audio.playWhoosh();
        _showScreen('activity');

        const container = document.getElementById('activity-container');
        container.innerHTML = '';

        // Show back button and activity info
        const header = document.createElement('div');
        header.className = 'activity-header';
        header.innerHTML = `
            <button class="back-btn" id="activity-back">◀</button>
            <span class="activity-title">${act.icon} ${act.label}</span>
        `;
        container.prepend(header);

        document.getElementById('activity-back').addEventListener('click', () => {
            _stopActivity();
            Audio.playTap();
            _showScreen('activities');
        });

        const gameArea = document.createElement('div');
        gameArea.className = 'game-area';
        gameArea.id = 'game-area';
        container.appendChild(gameArea);

        // Launch the activity
        const mod = act.module();
        mod.start(gameArea, () => _onActivityComplete());
    }

    function _onActivityComplete() {
        // Check session time
        if (sessionStartTime && Date.now() - sessionStartTime > SESSION_MAX_MS) {
            _showSessionEnd();
            return;
        }

        // Show completion screen briefly then return to activity select
        setTimeout(() => {
            _showScreen('activities');
        }, 500);
    }

    function _showSessionEnd() {
        const container = document.getElementById('activity-container');
        container.innerHTML = `
            <div class="session-end">
                <div class="session-end-character">
                    <div class="spidey-char spidey-wave"></div>
                </div>
                <div class="session-end-text">Great job today!</div>
                <div class="session-end-stickers">
                    You earned ${StickerBook.getTotalEarned()} stickers! 🌟
                </div>
                <button class="big-btn" id="session-end-btn">Done!</button>
            </div>
        `;

        Voice.speak('Great job today! Time for a break!');
        Audio.playCelebration();

        document.getElementById('session-end-btn').addEventListener('click', () => {
            sessionStartTime = null;
            Audio.playTap();
            _showScreen('home');
        });
    }

    function _stopActivity() {
        if (currentActivity) {
            const mod = currentActivity.module();
            if (mod.stop) mod.stop();
            currentActivity = null;
        }
    }

    function _bindButtons() {
        // Home screen buttons
        document.getElementById('btn-play')?.addEventListener('click', () => {
            Audio.playTap();
            Audio.playWhoosh();
            _showScreen('activities');
        });

        document.getElementById('btn-stickers')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('stickers');
        });

        document.getElementById('btn-stickers-back')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });

        document.getElementById('btn-activities-back')?.addEventListener('click', () => {
            Audio.playTap();
            _showScreen('home');
        });

        // OTB Hub link
        document.getElementById('btn-hub')?.addEventListener('click', () => {
            window.location.href = OTBConfig.getHubUrl();
        });
    }

    return { init };
})();

// Boot
document.addEventListener('DOMContentLoaded', Main.init);
