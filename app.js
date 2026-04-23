const APP_STATE = {
    situations: [],
    currentIndex: 0,
    phase: 'SPLASH', // 'SPLASH', 'ONBOARDING', 'A', 'INPUT_Q1', 'INPUT_Q2', 'B', 'COMPLETED'
    sessionId: 'session_' + Date.now(),
    currentAnswersQ1: [],
    currentAnswersQ2: []
};

const UI = {
    overlay: document.getElementById('orientation-overlay'),
    rotateMessage: document.getElementById('rotate-message'),
    rotateSubmessage: document.getElementById('rotate-submessage'),
    
    splashPhase: document.getElementById('splash-phase'),
    onboardingPhase: document.getElementById('onboarding-phase'),
    
    videoPhase: document.getElementById('video-phase'),
    videoPlayer: document.getElementById('main-video'),
    videoControls: document.getElementById('video-controls'),
    nextPhaseBtn: document.getElementById('next-phase-btn'),
    startBtn: document.getElementById('start-btn'),
    
    inputQ1Phase: document.getElementById('input-q1-phase'),
    formQ1: document.getElementById('form-q1'),
    q1SituationImg: document.getElementById('q1-situation-img'),
    q1InputsContainer: document.getElementById('q1-inputs-container'),
    addQ1Btn: document.getElementById('add-q1-btn'),
    
    inputQ2Phase: document.getElementById('input-q2-phase'),
    formQ2: document.getElementById('form-q2'),
    q2SituationImg: document.getElementById('q2-situation-img'),
    q2DynamicList: document.getElementById('q2-dynamic-list'),
    
    completedPhase: document.getElementById('completed-phase')
};

// Initialize App
async function init() {
    try {
        APP_STATE.situations = CONFIG.situations;
        
        setupEventListeners();
        checkOrientation(); // Initial check
        
        // Show splash screen for 2 seconds, then onboarding
        UI.splashPhase.classList.remove('hidden');
        setTimeout(() => {
            APP_STATE.phase = 'ONBOARDING';
            hideAllPhases();
            UI.onboardingPhase.classList.remove('hidden');
            checkOrientation();
        }, 2000);

    } catch (e) {
        console.error("Failed to load config", e);
        alert("Configuratie kon niet worden geladen.");
    }
}

function setupEventListeners() {
    // Orientation change listener
    window.matchMedia("(orientation: portrait)").addEventListener("change", checkOrientation);
    
    // Start from onboarding
    UI.startBtn.addEventListener('click', () => {
        startPhaseA();
    });
    
    UI.nextPhaseBtn.addEventListener('click', () => {
        UI.videoControls.classList.add('hidden');
        if (APP_STATE.phase === 'A') {
            transitionToInputQ1Phase();
        } else if (APP_STATE.phase === 'B') {
            nextSituation();
        }
    });

    UI.videoPlayer.addEventListener('ended', () => {
        UI.videoControls.classList.remove('hidden');
    });

    // Form Q1 Submit
    UI.formQ1.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQ1AndContinue();
    });

    // Form Q2 Submit
    UI.formQ2.addEventListener('submit', (e) => {
        e.preventDefault();
        saveQ2AndContinue();
    });

    // Add more inputs logic
    UI.addQ1Btn.addEventListener('click', () => addDynamicInput(UI.q1InputsContainer, 'q1[]', 'Nog een mogelijkheid...'));
}

function addDynamicInput(container, name, placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.placeholder = placeholder;
    input.required = true;
    container.appendChild(input);
    input.focus();
}

function updateSituationIndicators() {
    const indicators = document.querySelectorAll('.current-sit-num');
    indicators.forEach(el => el.innerText = (APP_STATE.currentIndex + 1));
}

function checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    
    if (APP_STATE.phase === 'A' || APP_STATE.phase === 'B') {
        if (isPortrait) {
            showRotationOverlay("Draai naar Landscape", "De video wordt horizontaal afgespeeld.");
            UI.videoPlayer.pause();
        } else {
            hideRotationOverlay();
            if (!UI.videoPlayer.ended) {
                 UI.videoPlayer.play().catch(e => console.log("Play failed on rotate", e));
            }
        }
    } else if (APP_STATE.phase === 'INPUT_Q1' || APP_STATE.phase === 'INPUT_Q2' || APP_STATE.phase === 'ONBOARDING') {
        if (!isPortrait) {
            showRotationOverlay("Draai naar Portrait", "Hou je telefoon verticaal.");
        } else {
            hideRotationOverlay();
        }
    } else {
        hideRotationOverlay(); // For splash or completed, any orientation is fine for now
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
    UI.splashPhase.classList.add('hidden');
    UI.onboardingPhase.classList.add('hidden');
    UI.videoPhase.classList.add('hidden');
    UI.inputQ1Phase.classList.add('hidden');
    UI.inputQ2Phase.classList.add('hidden');
    UI.completedPhase.classList.add('hidden');
}

function startPhaseA() {
    APP_STATE.phase = 'A';
    hideAllPhases();
    UI.videoPhase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.videoPlayer.src = situation.videoA;
    UI.videoPlayer.load();
    
    let playPromise = UI.videoPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            if (isPortrait) {
                UI.videoPlayer.pause();
            }
        }).catch(e => console.log("Autoplay prevented", e));
    }
    
    checkOrientation();
}

function transitionToInputQ1Phase() {
    APP_STATE.phase = 'INPUT_Q1';
    hideAllPhases();
    UI.inputQ1Phase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    if (situation.image) {
        UI.q1SituationImg.src = situation.image;
        UI.q1SituationImg.classList.remove('hidden');
        UI.q2SituationImg.src = situation.image;
        UI.q2SituationImg.classList.remove('hidden');
    } else {
        UI.q1SituationImg.classList.add('hidden');
        UI.q2SituationImg.classList.add('hidden');
    }
    
    updateSituationIndicators();
    
    // Reset forms and dynamic inputs to default 1 input
    UI.formQ1.reset();
    UI.formQ2.reset();
    UI.q1InputsContainer.innerHTML = '<input type="text" name="q1[]" placeholder="Mogelijkheid 1..." required>';
    UI.q2DynamicList.innerHTML = '';
    
    checkOrientation();
}

function saveQ1AndContinue() {
    // Collect all Q1 inputs
    const inputs = UI.q1InputsContainer.querySelectorAll('input[type="text"]');
    APP_STATE.currentAnswersQ1 = Array.from(inputs).map(i => i.value).filter(val => val.trim() !== '');
    
    // Build Q2 inputs based on Q1 answers
    UI.q2DynamicList.innerHTML = '';
    
    if (APP_STATE.currentAnswersQ1.length === 0) {
        APP_STATE.currentAnswersQ1.push("Ik weet het niet");
    }
    
    APP_STATE.currentAnswersQ1.forEach((answer, index) => {
        const block = document.createElement('div');
        block.className = 'q2-answer-block';
        
        const label = document.createElement('label');
        label.className = 'q1-reference-text';
        label.innerText = `Bij: "${answer}"`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'q2[]';
        input.placeholder = 'Hoe zou jij dit vermijden?';
        input.required = true;
        
        block.appendChild(label);
        block.appendChild(input);
        UI.q2DynamicList.appendChild(block);
    });
    
    APP_STATE.phase = 'INPUT_Q2';
    hideAllPhases();
    UI.inputQ2Phase.classList.remove('hidden');
    checkOrientation();
}

function saveQ2AndContinue() {
    // Collect all Q2 inputs
    const inputs = UI.q2DynamicList.querySelectorAll('input[type="text"]');
    APP_STATE.currentAnswersQ2 = Array.from(inputs).map(i => i.value).filter(val => val.trim() !== '');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    const answerData = {
        sessionId: APP_STATE.sessionId,
        situationId: situation.id,
        q1_answers: APP_STATE.currentAnswersQ1,
        q2_answers: APP_STATE.currentAnswersQ2,
        timestamp: new Date().toISOString()
    };
    
    // Save to LocalStorage
    const storedAnswers = JSON.parse(localStorage.getItem('blikveld_answers') || '[]');
    storedAnswers.push(answerData);
    localStorage.setItem('blikveld_answers', JSON.stringify(storedAnswers));
    
    console.log("Saved answers array:", answerData);
    
    startPhaseB();
}

function startPhaseB() {
    APP_STATE.phase = 'B';
    hideAllPhases();
    UI.videoPhase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.videoPlayer.src = situation.videoB;
    UI.videoPlayer.load();
    
    let playPromise = UI.videoPlayer.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            if (isPortrait) {
                UI.videoPlayer.pause();
            }
        }).catch(e => console.log("Autoplay prevented", e));
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
