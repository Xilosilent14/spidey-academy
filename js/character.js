/**
 * Character — Spidey and Webby animations & reactions
 * Pure CSS/HTML character system with emotional states.
 */
const Character = (() => {
    let spideyEl = null;
    let webbyEl = null;
    let currentState = 'idle';
    let stateTimeout = null;

    function init() {
        spideyEl = document.getElementById('spidey-character');
        webbyEl = document.getElementById('webby-character');
    }

    function setState(state, duration = 1500) {
        if (!spideyEl) return;
        // Clear previous state
        if (stateTimeout) clearTimeout(stateTimeout);
        spideyEl.className = 'spidey-char spidey-' + state;
        if (webbyEl) webbyEl.className = 'webby-char webby-' + state;
        currentState = state;

        if (state !== 'idle') {
            stateTimeout = setTimeout(() => {
                setState('idle');
            }, duration);
        }
    }

    function happy() { setState('happy', 1200); }
    function excited() { setState('excited', 1500); }
    function encourage() { setState('encourage', 2000); }
    function celebrate() { setState('celebrate', 2500); }
    function idle() { setState('idle'); }
    function wave() { setState('wave', 2000); }

    // Point Webby toward an element (for hint on wrong answer)
    function webbyPoint(targetEl) {
        if (!webbyEl || !targetEl) return;
        webbyEl.className = 'webby-char webby-point';
        // Determine direction
        const webbyRect = webbyEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        if (targetRect.left < webbyRect.left) {
            webbyEl.classList.add('point-left');
        } else {
            webbyEl.classList.add('point-right');
        }
        setTimeout(() => {
            webbyEl.className = 'webby-char webby-idle';
        }, 2500);
    }

    return { init, happy, excited, encourage, celebrate, idle, wave, webbyPoint, setState };
})();
