const APP_STATE = {
    situations: [],
    currentIndex: 0,
    phase: 'SPLASH', // 'SPLASH', 'ONBOARDING', 'INTERACT', 'REFLECT', 'CONCLUSION', 'COMPLETED'
    sessionId: 'session_' + Date.now(),
    markers: [] // Array of { time, x, y, screenshot, answer }
};

const UI = {
    overlay: document.getElementById('orientation-overlay'),
    rotateMessage: document.getElementById('rotate-message'),
    rotateSubmessage: document.getElementById('rotate-submessage'),
    
    splashPhase: document.getElementById('splash-phase'),
    onboardingPhase: document.getElementById('onboarding-phase'),
    
    interactionPhase: document.getElementById('interaction-phase'),
    interactionVideo: document.getElementById('interaction-video'),
    markerOverlay: document.getElementById('marker-overlay'),
    scrubber: document.getElementById('video-scrubber'),
    finishInteractionBtn: document.getElementById('finish-interaction-btn'),
    videoPlayOverlay: document.getElementById('video-play-overlay'),
    manualPlayBtn: document.getElementById('manual-play-btn'),
    
    reflectionPhase: document.getElementById('reflection-phase'),
    carouselContainer: document.getElementById('carousel-container'),
    reflectionForm: document.getElementById('reflection-form'),
    
    conclusionPhase: document.getElementById('conclusion-phase'),
    conclusionVideo: document.getElementById('conclusion-video'),
    conclusionControls: document.getElementById('conclusion-controls'),
    nextSituationBtn: document.getElementById('next-situation-btn'),
    conclusionPlayOverlay: document.getElementById('conclusion-play-overlay'),
    conclusionManualPlayBtn: document.getElementById('conclusion-manual-play-btn'),
    
    completedPhase: document.getElementById('completed-phase'),
    startBtn: document.getElementById('start-btn')
};

let isScrubbing = false;

// Initialize App
async function init() {
    try {
        APP_STATE.situations = CONFIG.situations;
        setupEventListeners();
        checkOrientation();
        
        UI.splashPhase.classList.remove('hidden');
        setTimeout(() => {
            APP_STATE.phase = 'ONBOARDING';
            hideAllPhases();
            UI.onboardingPhase.classList.remove('hidden');
            checkOrientation();
        }, 2000);

    } catch (e) {
        console.error("Failed to load config", e);
    }
}

function setupEventListeners() {
    window.matchMedia("(orientation: portrait)").addEventListener("change", checkOrientation);
    
    UI.startBtn.addEventListener('click', startInteractionPhase);
    
    // Scrubber Logic
    UI.scrubber.addEventListener('input', () => {
        isScrubbing = true;
        if (UI.interactionVideo.duration) {
            UI.interactionVideo.currentTime = (UI.scrubber.value / 100) * UI.interactionVideo.duration;
        }
    });

    UI.scrubber.addEventListener('change', () => {
        isScrubbing = false;
        UI.interactionVideo.pause();
    });

    UI.interactionVideo.addEventListener('timeupdate', () => {
        if (!isScrubbing && UI.interactionVideo.duration) {
            UI.scrubber.value = (UI.interactionVideo.currentTime / UI.interactionVideo.duration) * 100;
        }
    });

    // Placing a marker
    UI.markerOverlay.addEventListener('touchstart', handleMarkerPlacement, {passive: false});
    UI.markerOverlay.addEventListener('click', handleMarkerPlacement);

    UI.finishInteractionBtn.addEventListener('click', startReflectionPhase);
    
    UI.reflectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveAnswersAndContinue();
    });

    UI.nextSituationBtn.addEventListener('click', nextSituation);

    UI.conclusionVideo.addEventListener('ended', () => {
        UI.conclusionControls.classList.remove('hidden');
    });

    // Fallback Play Buttons
    UI.manualPlayBtn.addEventListener('click', () => {
        UI.videoPlayOverlay.classList.add('hidden');
        UI.interactionVideo.muted = true;
        UI.interactionVideo.play().catch(e => {
            alert("Video kon niet afspelen: " + e.message);
            UI.videoPlayOverlay.classList.remove('hidden');
        });
    });

    UI.conclusionManualPlayBtn.addEventListener('click', () => {
        UI.conclusionPlayOverlay.classList.add('hidden');
        UI.conclusionVideo.muted = true;
        UI.conclusionVideo.play().catch(e => {
            UI.conclusionPlayOverlay.classList.remove('hidden');
        });
    });
}

function handleMarkerPlacement(e) {
    if (e.type === 'touchstart') e.preventDefault();
    
    UI.interactionVideo.pause();
    
    const rect = UI.markerOverlay.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;
    const time = UI.interactionVideo.currentTime;
    
    // Capture screenshot instantly
    const canvas = document.createElement('canvas');
    canvas.width = UI.interactionVideo.videoWidth || 640;
    canvas.height = UI.interactionVideo.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(UI.interactionVideo, 0, 0, canvas.width, canvas.height);
    const screenshot = canvas.toDataURL('image/jpeg', 0.6);
    
    APP_STATE.markers.push({ time, x: xPct, y: yPct, screenshot, answer: '' });
    
    // Draw visual marker
    const dot = document.createElement('div');
    dot.className = 'braindance-marker';
    dot.style.left = xPct + '%';
    dot.style.top = yPct + '%';
    UI.markerOverlay.appendChild(dot);
}

function checkOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    
    if (APP_STATE.phase === 'INTERACT' || APP_STATE.phase === 'CONCLUSION') {
        if (isPortrait) {
            showRotationOverlay("Draai naar Landscape", "De video wordt horizontaal afgespeeld.");
            if (APP_STATE.phase === 'INTERACT') UI.interactionVideo.pause();
            if (APP_STATE.phase === 'CONCLUSION') UI.conclusionVideo.pause();
        } else {
            hideRotationOverlay();
        }
    } else if (APP_STATE.phase === 'REFLECT' || APP_STATE.phase === 'ONBOARDING') {
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
    UI.splashPhase.classList.add('hidden');
    UI.onboardingPhase.classList.add('hidden');
    UI.interactionPhase.classList.add('hidden');
    UI.reflectionPhase.classList.add('hidden');
    UI.conclusionPhase.classList.add('hidden');
    UI.completedPhase.classList.add('hidden');
}

function startInteractionPhase() {
    APP_STATE.phase = 'INTERACT';
    APP_STATE.markers = [];
    UI.markerOverlay.innerHTML = '';
    UI.scrubber.value = 0;
    
    hideAllPhases();
    UI.interactionPhase.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.interactionVideo.src = situation.videoA;
    UI.interactionVideo.load();
    UI.interactionVideo.muted = true;
    
    // Auto-play attempt
    let playPromise = UI.interactionVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            if (isPortrait) UI.interactionVideo.pause();
        }).catch(e => {
            UI.videoPlayOverlay.classList.remove('hidden');
        });
    }
    checkOrientation();
}

function startReflectionPhase() {
    if (APP_STATE.markers.length === 0) {
        alert("Je hebt nog geen gevaren gemarkeerd. Tik op het scherm om een gevaar aan te wijzen!");
        return;
    }

    APP_STATE.phase = 'REFLECT';
    hideAllPhases();
    UI.reflectionPhase.classList.remove('hidden');
    
    document.querySelectorAll('.current-sit-num').forEach(el => el.innerText = (APP_STATE.currentIndex + 1));
    
    buildCarousel();
    checkOrientation();
}

function buildCarousel() {
    UI.carouselContainer.innerHTML = '';
    
    APP_STATE.markers.forEach((marker, index) => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        
        card.innerHTML = `
            <div class="screenshot-container">
                <img src="${marker.screenshot}" class="screenshot-img" alt="Gevaar snapshot">
                <div class="carousel-marker" style="left: ${marker.x}%; top: ${marker.y}%;"></div>
            </div>
            <div class="card-input-section">
                <label>Markering ${index + 1} (${marker.time.toFixed(1)}s)</label>
                <input type="text" class="marker-answer-input" placeholder="Wat dacht je hier te zien?" required data-index="${index}">
            </div>
        `;
        
        UI.carouselContainer.appendChild(card);
    });
}

function saveAnswersAndContinue() {
    const inputs = document.querySelectorAll('.marker-answer-input');
    inputs.forEach(input => {
        const idx = input.getAttribute('data-index');
        APP_STATE.markers[idx].answer = input.value;
    });
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    const data = {
        sessionId: APP_STATE.sessionId,
        situationId: situation.id,
        markers: APP_STATE.markers,
        timestamp: new Date().toISOString()
    };
    
    const stored = JSON.parse(localStorage.getItem('blikveld_braindance') || '[]');
    stored.push(data);
    localStorage.setItem('blikveld_braindance', JSON.stringify(stored));
    
    startConclusionPhase();
}

function startConclusionPhase() {
    APP_STATE.phase = 'CONCLUSION';
    hideAllPhases();
    UI.conclusionPhase.classList.remove('hidden');
    UI.conclusionControls.classList.add('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.conclusionVideo.src = situation.videoB;
    UI.conclusionVideo.load();
    UI.conclusionVideo.muted = true;
    
    let playPromise = UI.conclusionVideo.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            if (isPortrait) UI.conclusionVideo.pause();
        }).catch(e => {
            UI.conclusionPlayOverlay.classList.remove('hidden');
        });
    }
    
    checkOrientation();
}

function nextSituation() {
    APP_STATE.currentIndex++;
    if (APP_STATE.currentIndex >= APP_STATE.situations.length) {
        APP_STATE.phase = 'COMPLETED';
        hideAllPhases();
        UI.completedPhase.classList.remove('hidden');
        checkOrientation();
    } else {
        startInteractionPhase();
    }
}

document.addEventListener("DOMContentLoaded", init);
