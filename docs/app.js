const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// --- НАСТРОЙКИ ЭЛЕМЕНТОВ ---
const liquidEl = document.getElementById('liquid');
const bubblesEl = document.getElementById('bubbles');
const reactionTextEl = document.getElementById('reaction-text');
const resetBtn = document.getElementById('reset-btn');
const guideListEl = document.getElementById('guide-list');
const periodicTableEl = document.getElementById('periodic-table');
const guideDetailEl = document.getElementById('guide-detail');
const guideListContainer = document.querySelector('.guide-list');

let flaskContents = []; 
let liquidLevel = 0;    

// --- БАЗА ЭЛЕМЕНТОВ (Основные элементы) ---
// g = group (колонка), p = period (строка)
const elements = {
    'H': { symbol: 'H', name: 'Водород', number: 1, g: 1, p: 1, cat: 'nonmetal', color: '#a0e6a0', desc: 'Самый легкий газ. Взрывоопасен в смеси с кислородом.', reactsWith: ['O', 'Cl'] },
    'He': { symbol: 'He', name: 'Гелий', number: 2, g: 18, p: 1, cat: 'noble', color: '#d7bde2', desc: 'Инертный газ. Не реагирует ни с чем.', reactsWith: [] },
    'Li': { symbol: 'Li', name: 'Литий', number: 3, g: 1, p: 2, cat: 'alkali', color: '#f5b041', desc: 'Щелочной металл. Бурно реагирует с водой.', reactsWith: ['H2O', 'O'] },
    'Be': { symbol: 'Be', name: 'Бериллий', number: 4, g: 2, p: 2, cat: 'alkaline', color: '#f9e79f', desc: 'Токсичный металл.', reactsWith: ['O'] },
    'B': { symbol: 'B', name: 'Бор', number: 5, g: 13, p: 2, cat: 'metalloid', color: '#85c1e9', desc: 'Полупроводник.', reactsWith: ['O'] },
    'C': { symbol: 'C', name: 'Углерод', number: 6, g: 14, p: 2, cat: 'nonmetal', color: '#a0e6a0', desc: 'Основа жизни. Горит в кислороде.', reactsWith: ['O'] },
    'N': { symbol: 'N', name: 'Азот', number: 7, g: 15, p: 2, cat: 'nonmetal', color: '#a0e6a0', desc: 'Инертный газ, основа атмосферы.', reactsWith: ['H'] },
    'O': { symbol: 'O', name: 'Кислород', number: 8, g: 16, p: 2, cat: 'nonmetal', color: '#a0e6a0', desc: 'Газ, поддерживающий горение.', reactsWith: ['H', 'C', 'Fe', 'Cu'] },
    'F': { symbol: 'F', name: 'Фтор', number: 9, g: 17, p: 2, cat: 'halogen', color: '#f1948a', desc: 'Самый активный неметалл.', reactsWith: ['Na', 'H'] },
    'Ne': { symbol: 'Ne', name: 'Неон', number: 10, g: 18, p: 2, cat: 'noble', color: '#d7bde2', desc: 'Инертный газ.', reactsWith: [] },
    'Na': { symbol: 'Na', name: 'Натрий', number: 11, g: 1, p: 3, cat: 'alkali', color: '#f5b041', desc: 'Мягкий металл, реагирует с водой со взрывом.', reactsWith: ['H2O', 'Cl', 'O'] },
    'Mg': { symbol: 'Mg', name: 'Магний', number: 12, g: 2, p: 3, cat: 'alkaline', color: '#f9e79f', desc: 'Горит ярким белым пламенем.', reactsWith: ['O'] },
    'Al': { symbol: 'Al', name: 'Алюминий', number: 13, g: 13, p: 3, cat: 'post-transition', color: '#aeb6bf', desc: 'Легкий металл, покрывается оксидной пленкой.', reactsWith: ['O', 'Cl'] },
    'Si': { symbol: 'Si', name: 'Кремний', number: 14, g: 14, p: 3, cat: 'metalloid', color: '#85c1e9', desc: 'Основа микроэлектроники.', reactsWith: ['O'] },
    'P': { symbol: 'P', name: 'Фосфор', number: 15, g: 15, p: 3, cat: 'nonmetal', color: '#a0e6a0', desc: 'Белый фосфор светится в темноте.', reactsWith: ['O'] },
    'S': { symbol: 'S', name: 'Сера', number: 16, g: 16, p: 3, cat: 'nonmetal', color: '#a0e6a0', desc: 'Желтое кристаллическое вещество.', reactsWith: ['O', 'Fe'] },
    'Cl': { symbol: 'Cl', name: 'Хлор', number: 17, g: 17, p: 3, cat: 'halogen', color: '#f1948a', desc: 'Ядовитый желто-зеленый газ.', reactsWith: ['Na', 'Fe'] },
    'Ar': { symbol: 'Ar', name: 'Аргон', number: 18, g: 18, p: 3, cat: 'noble', color: '#d7bde2', desc: 'Инертный газ для сварки.', reactsWith: [] },
    'K': { symbol: 'K', name: 'Калий', number: 19, g: 1, p: 4, cat: 'alkali', color: '#f5b041', desc: 'Реагирует с водой еще активнее натрия.', reactsWith: ['H2O'] },
    'Ca': { symbol: 'Ca', name: 'Кальций', number: 20, g: 2, p: 4, cat: 'alkaline', color: '#f9e79f', desc: 'Основа костей и ракушек.', reactsWith: ['H2O', 'O'] },
    'Fe': { symbol: 'Fe', name: 'Железо', number: 26, g: 8, p: 4, cat: 'transition', color: '#d5d8dc', desc: 'Ржавеет во влажном воздухе.', reactsWith: ['O', 'Cl', 'S'] },
    'Cu': { symbol: 'Cu', name: 'Медь', number: 29, g: 11, p: 4, cat: 'transition', color: '#d5d8dc', desc: 'Хороший проводник. Синеет в кислоте.', reactsWith: ['O', 'H2SO4'] },
    'Zn': { symbol: 'Zn', name: 'Цинк', number: 30, g: 12, p: 4, cat: 'transition', color: '#d5d8dc', desc: 'Используется для оцинковки.', reactsWith: ['O', 'H2SO4'] },
    'Ag': { symbol: 'Ag', name: 'Серебро', number: 47, g: 11, p: 5, cat: 'transition', color: '#d5d8dc', desc: 'Благородный металл, чернеет со временем.', reactsWith: ['S'] },
    'Au': { symbol: 'Au', name: 'Золото', number: 79, g: 11, p: 6, cat: 'transition', color: '#d5d8dc', desc: 'Самый инертный металл.', reactsWith: [] }
};

// Добавляем базовые реагенты из прошлой версии для колбы
const reagents = {
    'H2O': { name: 'Вода', color: '#3498db', formula: 'H₂O' },
    'H2SO4': { name: 'Серная кислота', color: '#e74c3c', formula: 'H₂SO₄' },
    'NaOH': { name: 'Гидроксид натрия', color: '#9b59b6', formula: 'NaOH' }
};

// --- БАЗА РЕАКЦИЙ ---
const reactionDB = {
    // Реакции с участием элементов
    'H+O': { result: 'Гремучий газ! Образовалась вода (H₂O).', color: '#3498db', bubbles: true },
    'Na+Cl': { result: 'Яркая вспышка! Образовалась поваренная соль (NaCl).', color: '#f1c40f', bubbles: false },
    'Fe+O': { result: 'Железо ржавеет. Образовался оксид железа (Fe₂O₃).', color: '#e67e22', bubbles: false },
    'Cu+O': { result: 'Медь окисляется. Появился черный налет (CuO).', color: '#2c3e50', bubbles: false },
    'Cu+H2SO4': { result: 'Медь растворяется. Раствор синеет (CuSO₄).', color: '#1e90ff', bubbles: true },
    'Zn+H2SO4': { result: 'Выделяется водород! Цинк растворяется.', color: '#bdc3c7', bubbles: true },
    'Na+H2O': { result: 'БУМ! Натрий сгорает в воде с выделением водорода.', color: '#f1c40f', bubbles: true },
    'H2SO4+NaOH': { result: 'Реакция нейтрализации. Образовалась соль и вода.', color: '#2ecc71', bubbles: false },
    'HCl+NaOH': { result: 'Нейтрализация. Образовалась соль NaCl.', color: '#2ecc71', bubbles: false }
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

function addToFlask(chemId, chemColor) {
    tg.HapticFeedback.impactOccurred('light');

    if (flaskContents.length >= 2) resetFlask();

    flaskContents.push(chemId);

    liquidLevel += 25; 
    if (liquidLevel > 80) liquidLevel = 80;
    
    liquidEl.style.height = `${liquidLevel}%`;
    liquidEl.style.backgroundColor = chemColor;

    if (flaskContents.length === 2) {
        checkReaction();
    } else {
        // Ищем имя для текста
        let name = reagents[chemId]?.name || elements[chemId]?.name || chemId;
        reactionTextEl.innerText = `Добавлено: ${name}`;
    }
}

function checkReaction() {
    const mixKey = [...flaskContents].sort().join('+');
    const reaction = reactionDB[mixKey];

    if (reaction) {
        setTimeout(() => {
            liquidEl.style.backgroundColor = reaction.color;
            reactionTextEl.innerText = reaction.result;
            reactionTextEl.style.color = reaction.color;
            if (reaction.bubbles) {
                createBubbles();
                tg.HapticFeedback.notificationOccurred('warning');
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

// --- ЛОГИКА ВКЛАДОК ---
function switchTab(tabId) {
    tg.HapticFeedback.impactOccurred('light');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));

    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`view-${tabId}`).classList.add('active-view');
    
    if(tabId === 'lab') document.getElementById('header-title').innerText = '🧪 Лаборатория';
    if(tabId === 'table') document.getElementById('header-title').innerText = '⚛️ Таблица Менделеева';
    if(tabId === 'guide') {
        document.getElementById('header-title').innerText = '📖 Справочник';
        closeGuideDetail(); // Сбрасываем детальный просмотр при входе
    }
}

// --- РЕНДЕР ТАБЛИЦЫ МЕНДЕЛЕЕВА ---
function renderTable() {
    periodicTableEl.innerHTML = '';
    
    for (const [key, el] of Object.entries(elements)) {
        const cell = document.createElement('div');
        cell.className = `element-cell cat-${el.cat}`;
        
        // Позиционирование в CSS Grid
        cell.style.gridColumn = el.g;
        cell.style.gridRow = el.p;
        
        cell.innerHTML = `
            <div class="number">${el.number}</div>
            <div class="symbol">${el.symbol}</div>
            <div class="name">${el.name}</div>
        `;
        
        // Клик по элементу в таблице открывает его в справочнике
        cell.addEventListener('click', () => {
            showGuideDetail(key);
        });
        
        periodicTableEl.appendChild(cell);
    }
}

// --- РЕНДЕР СПРАВОЧНИКА ---
function renderGuideList() {
    guideListEl.innerHTML = '';
    
    // Объединяем базовые реагенты и элементы для списка
    const allItems = { ...reagents, ...elements };

    for (const [key, item] of Object.entries(allItems)) {
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.style.setProperty('--card-color', item.color || '#ffffff');
        
        const name = item.name;
        const formula = item.formula || item.symbol;
        
        card.innerHTML = `
            <h3>${name} <span class="formula">${formula}</span></h3>
            <p>${item.desc || 'Вещество для химических реакций.'}</p>
        `;
        
        // Клик открывает детали
        card.addEventListener('click', () => {
            showGuideDetail(key);
        });
        
        guideListEl.appendChild(card);
    }
}

// --- ДЕТАЛЬНЫЙ ПРОСМОТР ЭЛЕМЕНТА ---
function showGuideDetail(key) {
    tg.HapticFeedback.impactOccurred('light');
    
    // Переключаемся на вкладку справочника, если еще не там
    if (!document.getElementById('tab-guide').classList.contains('active')) {
        switchTab('guide');
    }

    guideListContainer.style.display = 'none';
    guideDetailEl.style.display = 'block';

    const item = elements[key] || reagents[key];
    const isElement = !!elements[key];

    // Формируем список реакций
    let reactionsHtml = '<span class="reaction-tag">Нет данных</span>';
    if (isElement && item.reactsWith && item.reactsWith.length > 0) {
        reactionsHtml = item.reactsWith.map(r => {
            let name = elements[r]?.name || reagents[r]?.name || r;
            return `<span class="reaction-tag">${name}</span>`;
        }).join('');
    } else if (!isElement) {
        // Для реагентов типа кислоты/воды
        reactionsHtml = '<span class="reaction-tag">Основа для реакций</span>';
    }

    document.getElementById('detail-content').innerHTML = `
        <div class="detail-header">
            <div class="detail-symbol" style="color: ${item.color}">${item.symbol || '🧪'}</div>
            <div class="detail-title">
                <h2>${item.name}</h2>
                <p>${item.formula || (isElement ? 'Химический элемент' : 'Вещество')}</p>
            </div>
        </div>
        <div class="detail-section">
            <h4>Описание</h4>
            <p>${item.desc || 'Химическое вещество, используемое в экспериментах.'}</p>
        </div>
        <div class="detail-section">
            <h4>Взаимодействует с:</h4>
            <div>${reactionsHtml}</div>
        </div>
        <button class="chem-btn" style="margin-top: 15px; width: 100%; --color: ${item.color}" onclick="addToFlask('${key}', '${item.color}')">
            ➕ Добавить в колбу
        </button>
    `;
}

function closeGuideDetail() {
    guideDetailEl.style.display = 'none';
    guideListContainer.style.display = 'flex';
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---
document.querySelectorAll('.chem-btn[data-chem]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const chemId = e.target.getAttribute('data-chem');
        const color = e.target.style.getPropertyValue('--color') || '#ffffff';
        addToFlask(chemId, color);
    });
});
resetBtn.addEventListener('click', resetFlask);

// --- ИНИЦИАЛИЗАЦИЯ ---
renderTable();
renderGuideList();