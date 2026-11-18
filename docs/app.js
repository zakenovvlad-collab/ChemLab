const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// --- НАСТРОЙКИ ЭЛЕМЕНТОВ ---
const liquidEl = document.getElementById('liquid');
const bubblesEl = document.getElementById('bubbles');
const reactionTextEl = document.getElementById('reaction-text');
const resetBtn = document.getElementById('reset-btn');
const guideListEl = document.getElementById('guide-list');

// --- СОСТОЯНИЕ КОЛБЫ ---
let flaskContents = []; 
let liquidLevel = 0;    

// --- БАЗА РЕАГЕНТОВ (Обновленная) ---
const chemicals = {
    water: { name: 'Вода', color: '#3498db', formula: 'H₂O', desc: 'Универсальный растворитель. Без цвета и запаха.' },
    acid:  { name: 'Серная кислота', color: '#e74c3c', formula: 'H₂SO₄', desc: 'Сильная кислота. Очень едкая, требует осторожности.' },
    base:  { name: 'Гидроксид натрия', color: '#9b59b6', formula: 'NaOH', desc: 'Сильная щелочь (едкий натр). Мылкая на ощупь, разъедает кожу.' },
    metal: { name: 'Натрий', color: '#bdc3c7', formula: 'Na', desc: 'Активный щелочной металл. Реагирует с водой со взрывом.' },
    peroxide: { name: 'Перекись водорода', color: '#00d2d3', formula: 'H₂O₂', desc: 'Антисептик. При контакте с кровью или катализаторами пенится.' },
    copper: { name: 'Медь', color: '#b87333', formula: 'Cu', desc: 'Металл красноватого цвета. Не реагирует с водой, но растворяется в кислотах.' },
    indicator: { name: 'Фенолфталеин', color: '#f368e0', formula: 'C₂₀H₁₄O₄', desc: 'Индикатор. В кислой среде бесцветен, в щелочной — малиновый.' }
};

// --- БАЗА РЕАКЦИЙ ---
const reactions = {
    'acid+base': { result: 'Реакция нейтрализации! Соль + Вода.', color: '#2ecc71', level: 60, bubbles: false },
    'metal+water': { result: 'БУМ! Натрий сгорает в воде!', color: '#f1c40f', level: 70, bubbles: true },
    'acid+metal': { result: 'Выделяется водород! Металл растворяется.', color: '#e67e22', level: 50, bubbles: true },
    'copper+acid': { result: 'Медь окисляется. Раствор синеет!', color: '#1e90ff', level: 60, bubbles: false },
    'base+indicator': { result: 'Фенолфталеин дал малиновую окраску!', color: '#e84393', level: 50, bubbles: false },
    'acid+indicator': { result: 'Индикатор остался бесцветным. Среда кислая.', color: '#dfe6e9', level: 50, bubbles: false },
    'metal+peroxide': { result: 'Бурное разложение перекиси! Выделение O₂.', color: '#00cec9', level: 80, bubbles: true }
};

// --- ФУНКЦИИ ЛАБОРАТОРИИ ---
function createBubbles() {
    bubblesEl.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        const size = Math.random() * 12 + 4;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 90}%`;
        bubble.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
        bubble.style.animationDelay = `${Math.random()}s`;
        bubblesEl.appendChild(bubble);
    }
}

function resetFlask() {
    flaskContents = [];
    liquidLevel = 0;
    liquidEl.style.height = '0%';
    liquidEl.style.backgroundColor = 'transparent';
    reactionTextEl.innerText = 'Добавь реагенты...';
    reactionTextEl.style.color = '#f1c40f';
    bubblesEl.innerHTML = '';
    tg.HapticFeedback.notificationOccurred('success');
}

function addChemical(chemId) {
    tg.HapticFeedback.impactOccurred('light');
    const chem = chemicals[chemId];
    if (!chem) return;

    if (flaskContents.length >= 2) resetFlask();

    flaskContents.push(chemId);

    liquidLevel += 25; 
    if (liquidLevel > 80) liquidLevel = 80;
    
    liquidEl.style.height = `${liquidLevel}%`;
    liquidEl.style.backgroundColor = chem.color;

    if (flaskContents.length === 2) {
        checkReaction();
    } else {
        reactionTextEl.innerText = `Добавлено: ${chem.name}`;
    }
}

function checkReaction() {
    const mixKey = [...flaskContents].sort().join('+');
    const reaction = reactions[mixKey];

    if (reaction) {
        setTimeout(() => {
            liquidEl.style.backgroundColor = reaction.color;
            liquidEl.style.height = `${reaction.level}%`;
            reactionTextEl.innerText = reaction.result;
            reactionTextEl.style.color = reaction.color;

            if (reaction.bubbles) {
                createBubbles();
                tg.HapticFeedback.notificationOccurred('warning');
            } else {
                tg.HapticFeedback.notificationOccurred('success');
            }
        }, 400);
    } else {
        setTimeout(() => {
            liquidEl.style.backgroundColor = '#7f8c8d'; 
            reactionTextEl.innerText = 'Ничего не произошло. Смесь инертна.';
            reactionTextEl.style.color = '#95a5a6';
        }, 400);
    }
}

// --- ЛОГИКА ВКЛАДОК И СПРАВОЧНИКА ---
function switchTab(tabId) {
    tg.HapticFeedback.impactOccurred('light');
    
    // Сброс активных классов
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));

    // Установка новых
    if (tabId === 'lab') {
        document.getElementById('tab-lab').classList.add('active');
        document.getElementById('view-lab').classList.add('active-view');
        document.getElementById('header-title').innerText = '🧪 Лаборатория';
    } else {
        document.getElementById('tab-guide').classList.add('active');
        document.getElementById('view-guide').classList.add('active-view');
        document.getElementById('header-title').innerText = '📖 Справочник';
    }
}

function renderGuide() {
    guideListEl.innerHTML = ''; // Очищаем перед заполнением
    
    // Проходимся по всем нашим реагентам и создаем карточки
    for (const [key, chem] of Object.entries(chemicals)) {
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.style.setProperty('--card-color', chem.color);
        
        card.innerHTML = `
            <h3>${chem.name} <span class="formula">${chem.formula}</span></h3>
            <p>${chem.desc}</p>
        `;
        guideListEl.appendChild(card);
    }
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---
document.querySelectorAll('.chem-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const chemId = e.target.getAttribute('data-chem');
        addChemical(chemId);
    });
});
resetBtn.addEventListener('click', resetFlask);

// Инициализация при загрузке
renderGuide(); // Сразу заполняем справочник