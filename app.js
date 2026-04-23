const APP_STATE = {
    situations: [],
    currentIndex: 0,
    phase: 'START', // 'START', 'A', 'INPUT', 'B', 'COMPLETED'
    sessionId: 'session_' + Date.now()
};

const UI = {
    overlay: document.getElementById('orientation-overlay'),
    rotateMessage: document.getElementById('rotate-message'),
    rotateSubmessage: document.getElementById('rotate-submessage'),
    
    videoPhase: document.getElementById('video-phase'),
    videoPlayer: document.getElementById('main-video'),
    videoOverlay: document.getElementById('video-overlay'),
    startBtn: document.getElementById('start-btn'),
    videoControls: document.getElementById('video-controls'),
    nextPhaseBtn: document.getElementById('next-phase-btn'),
    
    inputPhase: document.getElementById('input-phase'),
    form: document.getElementById('reflection-form'),
    sitNumIndicator: document.getElementById('current-sit-num'),
    q1: document.getElementById('q1'),
    q2: document.getElementById('q2'),
    
    completedPhase: document.getElementById('completed-phase')
};

// Initialize App
async function init() {
    try {
        APP_STATE.situations = CONFIG.situations;
        
        UI.videoPhase.classList.remove('hidden'); // Show initial screen with start button
        setupEventListeners();
        checkOrientation(); // Initial check
    } catch (e) {
        console.error("Failed to load config", e);
        alert("Configuratie kon niet worden geladen.");
    }
}

function setupEventListeners() {
    // Orientation change listener
    window.matchMedia("(orientation: portrait)").addEventListener("change", checkOrientation);
    
    // UI interactions
    UI.startBtn.addEventListener('click', () => {
        UI.videoOverlay.classList.add('hidden');
        startPhaseA();
    });
    
    UI.nextPhaseBtn.addEventListener('click', () => {
        UI.videoControls.classList.add('hidden');
        if (APP_STATE.phase === 'A') {
            transitionToInputPhase();
        } else if (APP_STATE.phase === 'B') {
            nextSituation();
        }
    });

    UI.videoPlayer.addEventListener('ended', () => {
        UI.videoControls.classList.remove('hidden');
    });

    UI.form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveInputAndContinue();
    });
}

function checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    
    if (APP_STATE.phase === 'A' || APP_STATE.phase === 'B' || APP_STATE.phase === 'START') {
        if (isPortrait) {
            showRotationOverlay("Draai naar Landscape", "De video wordt horizontaal afgespeeld.");
            UI.videoPlayer.pause();
        } else {
            hideRotationOverlay();
            // Resume if it was playing and not ended
            if (!UI.videoPlayer.paused && !UI.videoPlayer.ended && APP_STATE.phase !== 'START') {
                 UI.videoPlayer.play();
            }
        }
    } else if (APP_STATE.phase === 'INPUT') {
        if (!isPortrait) {
            showRotationOverlay("Draai naar Portrait", "Hou je telefoon verticaal om te typen.");
        } else {
            hideRotationOverlay();
        }
    } else {
        hideRotationOverlay();
    }
}

function showRotationOverlay(title, subtitle) {
    UI.rotateMessage.innerText = title;
    UI.rotateSubmessage.innerText = subtitle;
    UI.overlay.classList.remove('hidden');
}

function hideRotationOverlay() {
    UI.overlay.classList.add('hidden');
}

function hideAllPhases() {
    UI.videoPhase.classList.add('hidden');
    UI.inputPhase.classList.add('hidden');
    UI.completedPhase.classList.add('hidden');
}

function startPhaseA() {
    APP_STATE.phase = 'A';
    hideAllPhases();
    UI.videoPhase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.videoPlayer.src = situation.videoA;
    UI.videoPlayer.load();
    
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (!isPortrait) {
        UI.videoPlayer.play().catch(e => console.log("Autoplay prevented", e));
    }
    checkOrientation();
}

function transitionToInputPhase() {
    APP_STATE.phase = 'INPUT';
    hideAllPhases();
    UI.inputPhase.classList.remove('hidden');
    
    UI.sitNumIndicator.innerText = (APP_STATE.currentIndex + 1);
    UI.form.reset();
    checkOrientation();
}

function saveInputAndContinue() {
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    
    const answerData = {
        sessionId: APP_STATE.sessionId,
        situationId: situation.id,
        q1: UI.q1.value,
        q2: UI.q2.value,
        timestamp: new Date().toISOString()
    };
    
    // Save to LocalStorage (mocking database)
    const storedAnswers = JSON.parse(localStorage.getItem('blikveld_answers') || '[]');
    storedAnswers.push(answerData);
    localStorage.setItem('blikveld_answers', JSON.stringify(storedAnswers));
    
    console.log("Saved answer:", answerData);
    
    startPhaseB();
}

function startPhaseB() {
    APP_STATE.phase = 'B';
    hideAllPhases();
    UI.videoPhase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.videoPlayer.src = situation.videoB;
    UI.videoPlayer.load();
    
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (!isPortrait) {
        UI.videoPlayer.play().catch(e => console.log("Autoplay prevented", e));
    }
    checkOrientation();
}

function nextSituation() {
    APP_STATE.currentIndex++;
    
    if (APP_STATE.currentIndex >= APP_STATE.situations.length) {
        showCompleted();
    } else {
        startPhaseA();
    }
}

function showCompleted() {
    APP_STATE.phase = 'COMPLETED';
    hideAllPhases();
    UI.completedPhase.classList.remove('hidden');
    checkOrientation();
}

// Start application
document.addEventListener("DOMContentLoaded", init);
