/**
 * Progress — Save system for Spidey Academy
 * Tracks stickers earned, activity stats, and adaptive content progression.
 */
const Progress = (() => {
    const STORAGE_KEY = 'spidey-academy-save';
    const VERSION = 1;

    const DEFAULTS = {
        version: VERSION,
        playerName: 'Asher',
        totalCorrect: 0,
        totalAttempts: 0,
        correctSinceLastSticker: 0,
        stickers: [],
        activityStats: {
            'color-catch': { played: 0, correct: 0, bestStreak: 0, currentStreak: 0, colorsLearned: ['red', 'blue'] },
            'shape-builder': { played: 0, correct: 0, bestStreak: 0, currentStreak: 0, shapesLearned: ['circle', 'square', 'triangle'] },
            'number-bugs': { played: 0, correct: 0, bestStreak: 0, currentStreak: 0, maxNumber: 3 },
            'letter-web': { played: 0, correct: 0, bestStreak: 0, currentStreak: 0, lettersLearned: ['A', 'B', 'C', 'O'] },
            'sort-sweep': { played: 0, correct: 0, bestStreak: 0, currentStreak: 0 }
        },
        sessionCount: 0,
        lastPlayDate: null,
        createdAt: Date.now()
    };

    let data = null;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                data = JSON.parse(JSON.stringify(DEFAULTS));
                save();
                return data;
            }
            const saved = JSON.parse(raw);
            // Merge with defaults for forward compat
            data = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), saved);
            // Ensure all activity stat keys exist
            for (const key of Object.keys(DEFAULTS.activityStats)) {
                if (!data.activityStats[key]) {
                    data.activityStats[key] = JSON.parse(JSON.stringify(DEFAULTS.activityStats[key]));
                }
            }
            return data;
        } catch (e) {
            console.warn('[Progress] Failed to load, using defaults:', e);
            data = JSON.parse(JSON.stringify(DEFAULTS));
            return data;
        }
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[Progress] Failed to save:', e);
        }
    }

    function recordAnswer(activityId, correct) {
        if (!data) load();
        data.totalAttempts++;
        const stats = data.activityStats[activityId];
        if (correct) {
            data.totalCorrect++;
            data.correctSinceLastSticker++;
            if (stats) {
                stats.correct++;
                stats.currentStreak++;
                if (stats.currentStreak > stats.bestStreak) {
                    stats.bestStreak = stats.currentStreak;
                }
            }
        } else {
            if (stats) stats.currentStreak = 0;
        }
        save();
        return correct;
    }

    function recordActivityPlayed(activityId) {
        if (!data) load();
        const stats = data.activityStats[activityId];
        if (stats) {
            stats.played++;
            stats.currentStreak = 0;
        }
        data.lastPlayDate = new Date().toISOString().slice(0, 10);
        save();
    }

    function shouldAwardSticker() {
        if (!data) load();
        // Award a sticker every 4 correct answers
        return data.correctSinceLastSticker >= 4;
    }

    function awardSticker(stickerId) {
        if (!data) load();
        if (!data.stickers.includes(stickerId)) {
            data.stickers.push(stickerId);
        }
        data.correctSinceLastSticker = 0;
        save();
        // Also report to OTB ecosystem
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.addXP(15, 'spidey-academy');
            OTBEcosystem.addCoins(5, 'spidey-academy');
        }
        return stickerId;
    }

    function getStats(activityId) {
        if (!data) load();
        return data.activityStats[activityId] || {};
    }

    function getStickers() {
        if (!data) load();
        return data.stickers;
    }

    function getStickerCount() {
        if (!data) load();
        return data.stickers.length;
    }

    function getPlayerName() {
        if (!data) load();
        return data.playerName;
    }

    function setPlayerName(name) {
        if (!data) load();
        data.playerName = name;
        save();
    }

    // Expand what content the child has unlocked in an activity
    function expandContent(activityId, item) {
        if (!data) load();
        const stats = data.activityStats[activityId];
        if (!stats) return;
        if (activityId === 'color-catch' && !stats.colorsLearned.includes(item)) {
            stats.colorsLearned.push(item);
        } else if (activityId === 'shape-builder' && !stats.shapesLearned.includes(item)) {
            stats.shapesLearned.push(item);
        } else if (activityId === 'letter-web' && !stats.lettersLearned.includes(item)) {
            stats.lettersLearned.push(item);
        } else if (activityId === 'number-bugs') {
            stats.maxNumber = Math.min(10, Math.max(stats.maxNumber, item));
        }
        save();
    }

    return {
        load, save, recordAnswer, recordActivityPlayed,
        shouldAwardSticker, awardSticker,
        getStats, getStickers, getStickerCount,
        getPlayerName, setPlayerName, expandContent,
        get data() { return data; }
    };
})();
