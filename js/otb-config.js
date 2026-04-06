/**
 * OTB Config — Environment detection and cross-game URL routing
 */
const OTBConfig = (() => {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    const PRODUCTION_URLS = {
        hub: 'https://otbgames.shutterbuzzent.com',
        'think-fast': 'https://thinkfast.shutterbuzzent.com',
        'word-mine': 'https://wordmine.shutterbuzzent.com',
        'rhythm-blast': 'https://rhythmblast.shutterbuzzent.com',
        'spidey-academy': 'https://spideyacademy.shutterbuzzent.com'
    };

    const LOCAL_URLS = {
        hub: 'http://localhost:8082',
        'think-fast': 'http://localhost:8080',
        'word-mine': 'http://localhost:8081',
        'rhythm-blast': 'http://localhost:8083',
        'spidey-academy': 'http://localhost:8085'
    };

    const urls = isLocal ? LOCAL_URLS : PRODUCTION_URLS;

    return {
        isLocal,
        urls,
        getGameUrl(gameId) {
            return urls[gameId] || '#';
        },
        getHubUrl() {
            return urls.hub;
        }
    };
})();
