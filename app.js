const APP_STATE = {
    situations: [],
    currentIndex: 0,
    phase: 'SPLASH', // 'SPLASH', 'USER_INFO', 'CATEGORY_SELECT', 'ONBOARDING', 'INTERACT', 'REFLECT', 'CONCLUSION', 'COMPLETED'
    sessionId: 'session_' + Date.now(),
    userName: '',
    userAge: '',
    selectedCategory: null,
    markers: [] // Array of { time, x, y, screenshot, answer }
};

const UI = {
    overlay: document.getElementById('orientation-overlay'),
    rotateMessage: document.getElementById('rotate-message'),
    rotateSubmessage: document.getElementById('rotate-submessage'),
    
    splashPhase: document.getElementById('splash-phase'),
    userInfoPhase: document.getElementById('user-info-phase'),
    categorySelectPhase: document.getElementById('category-select-phase'),
    dynamicCategoryGrid: document.getElementById('dynamic-category-grid'),
    userInfoForm: document.getElementById('user-info-form'),
    userNameInput: document.getElementById('user-name'),
    userAgeInput: document.getElementById('user-age'),
    onboardingPhase: document.getElementById('onboarding-phase'),
    
    interactionPhase: document.getElementById('interaction-phase'),
    interactionVideo: document.getElementById('interaction-video'),
    markerOverlay: document.getElementById('marker-overlay'),
    scrubber: document.getElementById('video-scrubber'),
    playPauseBtn: document.getElementById('play-pause-btn'),
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
        setupEventListeners();
        checkOrientation();
        
        UI.splashPhase.classList.remove('hidden');
        setTimeout(() => {
            APP_STATE.phase = 'USER_INFO';
            hideAllPhases();
            UI.userInfoPhase.classList.remove('hidden');
            checkOrientation();
        }, 2000);

    } catch (e) {
        console.error("Failed to load init", e);
    }
}

function setupEventListeners() {
    window.matchMedia("(orientation: portrait)").addEventListener("change", checkOrientation);
    
    renderCategories();

    // Menu Form Submission
    UI.userInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        APP_STATE.userName = UI.userNameInput.value;
        APP_STATE.userAge = UI.userAgeInput.value;
        
        APP_STATE.phase = 'CATEGORY_SELECT';
        hideAllPhases();
        UI.categorySelectPhase.classList.remove('hidden');
        checkOrientation();
    });

    UI.startBtn.addEventListener('click', startInteractionPhase);
    
    // Dismiss keyboard on carousel swipe
    UI.carouselContainer.addEventListener('scroll', () => {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
            document.activeElement.blur();
        }
    }, {passive: true});
    
    // Scrubber Logic
    UI.scrubber.addEventListener('input', () => {
        isScrubbing = true;
        if (!UI.interactionVideo.paused) {
            UI.interactionVideo.pause();
        }
        if (UI.interactionVideo.duration) {
            UI.interactionVideo.currentTime = (UI.scrubber.value / 100) * UI.interactionVideo.duration;
        }
    });

    UI.scrubber.addEventListener('change', () => {
        isScrubbing = false;
        // Optionally resume playing if they were playing before, but pausing is safer for interaction
    });

    UI.interactionVideo.addEventListener('timeupdate', () => {
        if (!isScrubbing && UI.interactionVideo.duration) {
            UI.scrubber.value = (UI.interactionVideo.currentTime / UI.interactionVideo.duration) * 100;
        }
        renderVisibleMarkers(UI.interactionVideo.currentTime);
    });
    
    // Play/Pause button
    UI.playPauseBtn.addEventListener('click', () => {
        if (UI.interactionVideo.paused) {
            UI.interactionVideo.play();
        } else {
            UI.interactionVideo.pause();
        }
    });

    UI.interactionVideo.addEventListener('play', () => {
        UI.playPauseBtn.innerText = 'Pauzeer';
    });

    UI.interactionVideo.addEventListener('pause', () => {
        UI.playPauseBtn.innerText = 'Speel af';
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
            // Keep hidden if it plays, or show if it fails (not likely since user gesture)
        });
    });
}

function renderCategories() {
    UI.dynamicCategoryGrid.innerHTML = '';
    
    if (!CONFIG.categories || !Array.isArray(CONFIG.categories)) {
        console.error("CONFIG.categories is invalid");
        return;
    }
    
    CONFIG.categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = `training-card theme-${cat.theme} ${cat.bgImage ? 'has-image' : ''}`;
        
        if (cat.bgImage) {
            // Check if user uploaded a file, otherwise we fall back to generic CSS bg if path fails
            card.style.backgroundImage = `url('${cat.bgImage}')`;
        }
        
        card.innerHTML = `
            <div class="training-card-content">
                <span class="tc-duration">${cat.duration}</span>
                <span class="tc-subtitle">${cat.subtitle}</span>
                <h3 class="tc-title">${cat.title}</h3>
                <button class="tc-btn">start training</button>
            </div>
        `;
        
        card.addEventListener('click', () => {
            APP_STATE.selectedCategory = cat.id;
            APP_STATE.situations = cat.videos;
            
            APP_STATE.phase = 'ONBOARDING';
            hideAllPhases();
            UI.onboardingPhase.classList.remove('hidden');
            checkOrientation();
        });
        
        UI.dynamicCategoryGrid.appendChild(card);
    });
}

function handleMarkerPlacement(e) {
    if (e.type === 'touchstart') e.preventDefault();
    
    // Check Max Markers
    if (APP_STATE.markers.length >= 9) {
        alert("Je hebt het maximum van 9 markeringen bereikt. Verwijder er één om een nieuwe te plaatsen.");
        return;
    }

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
    
    // Re-render markers for the current time
    renderVisibleMarkers(time);
}

function renderVisibleMarkers(currentTime) {
    UI.markerOverlay.innerHTML = '';
    
    APP_STATE.markers.forEach((marker, index) => {
        // Show marker if we are within 1.0 second of its placement time
        if (Math.abs(marker.time - currentTime) <= 1.0) {
            const dot = document.createElement('div');
            dot.className = 'braindance-marker';
            dot.style.left = marker.x + '%';
            dot.style.top = marker.y + '%';
            
            // Allow removal by clicking on the marker
            dot.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent placing new marker
                APP_STATE.markers.splice(index, 1);
                renderVisibleMarkers(UI.interactionVideo.currentTime);
            });
            dot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                APP_STATE.markers.splice(index, 1);
                renderVisibleMarkers(UI.interactionVideo.currentTime);
            }, {passive: false});

            UI.markerOverlay.appendChild(dot);
        }
    });
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
    } else if (APP_STATE.phase === 'REFLECT' || APP_STATE.phase === 'ONBOARDING' || APP_STATE.phase === 'USER_INFO' || APP_STATE.phase === 'CATEGORY_SELECT') {
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
    UI.userInfoPhase.classList.add('hidden');
    UI.categorySelectPhase.classList.add('hidden');
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
    APP_STATE.phase = 'REFLECT';
    hideAllPhases();
    UI.reflectionPhase.classList.remove('hidden');
    
    document.querySelectorAll('.current-sit-num').forEach(el => el.innerText = (APP_STATE.currentIndex + 1));
    
    buildCarousel();
    checkOrientation();
}

function buildCarousel() {
    UI.carouselContainer.innerHTML = '';
    
    if (APP_STATE.markers.length === 0) {
        // Fallback: Generic Card when no markers were placed
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.innerHTML = `
            <div class="card-input-section" style="justify-content: center;">
                <label style="font-size: 1.2rem; margin-bottom: 1rem;">Je hebt niks gemarkeerd. Wat denk je dat er kan gebeuren?</label>
                <div id="generic-inputs-container" style="display:flex; flex-direction:column; gap:0.5rem;">
                    <input type="text" class="generic-answer-input" placeholder="Mogelijkheid 1..." required>
                </div>
                <button type="button" id="add-generic-answer-btn" class="btn secondary-btn" style="margin-top: 1rem;">+ Voeg nog een antwoord toe</button>
            </div>
        `;
        UI.carouselContainer.appendChild(card);
        
        document.getElementById('add-generic-answer-btn').addEventListener('click', () => {
            const container = document.getElementById('generic-inputs-container');
            const num = container.children.length + 1;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'generic-answer-input';
            input.placeholder = 'Mogelijkheid ' + num + '...';
            container.appendChild(input);
        });
        return;
    }

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
    if (APP_STATE.markers.length === 0) {
        const genericInputs = document.querySelectorAll('.generic-answer-input');
        const answers = [];
        genericInputs.forEach(input => { if(input.value) answers.push(input.value); });
        APP_STATE.genericAnswers = answers;
    } else {
        const inputs = document.querySelectorAll('.marker-answer-input');
        inputs.forEach(input => {
            const idx = input.getAttribute('data-index');
            APP_STATE.markers[idx].answer = input.value;
        });
    }
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    const data = {
        sessionId: APP_STATE.sessionId,
        userName: APP_STATE.userName,
        userAge: APP_STATE.userAge,
        category: APP_STATE.selectedCategory,
        situationId: situation.id,
        markers: APP_STATE.markers,
        genericAnswers: APP_STATE.genericAnswers || [],
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
    
    // Always show the intermediate "Bekijk wat er daadwerkelijk gebeurde" overlay
    UI.conclusionPlayOverlay.classList.remove('hidden');
    
    const situation = APP_STATE.situations[APP_STATE.currentIndex];
    UI.conclusionVideo.src = situation.videoB;
    UI.conclusionVideo.load();
    UI.conclusionVideo.muted = true;
    
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
