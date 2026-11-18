const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// --- МЕГА-БАЗА ДАННЫХ ---
// category: metal, nonmetal, acid, base, salt, gas
const database = {
    // --- НЕМЕТАЛЛЫ И ГАЗЫ ---
    'H2': { sym: 'H₂', name: 'Водород', color: '#a0e6a0', cat: 'gas', type: 'Газ', desc: 'Самый легкий газ. Взрывоопасен.', reacts: ['O2', 'Cl2'] },
    'O2': { sym: 'O₂', name: 'Кислород', color: '#e67e22', cat: 'gas', type: 'Газ', desc: 'Поддерживает горение.', reacts: ['H2', 'Fe', 'Cu'] },
    'Cl2': { sym: 'Cl₂', name: 'Хлор', color: '#f1c40f', cat: 'gas', type: 'Газ', desc: 'Ядовитый желто-зеленый газ.', reacts: ['H2', 'Na'] },
    'C': { sym: 'C', name: 'Углерод', color: '#7f8c8d', cat: 'nonmetal', type: 'Неметалл', desc: 'Основа жизни.', reacts: ['O2'] },
    'S': { sym: 'S', name: 'Сера', color: '#f1c40f', cat: 'nonmetal', type: 'Неметалл', desc: 'Желтый порошок.', reacts: ['Fe', 'O2'] },

    // --- МЕТАЛЛЫ ---
    'Na': { sym: 'Na', name: 'Натрий', color: '#f5b041', cat: 'metal', type: 'Металл', desc: 'Взрывается в воде.', reacts: ['H2O', 'Cl2'] },
    'K': { sym: 'K', name: 'Калий', color: '#f5b041', cat: 'metal', type: 'Металл', desc: 'Еще активнее натрия.', reacts: ['H2O'] },
    'Fe': { sym: 'Fe', name: 'Железо', color: '#95a5a6', cat: 'metal', type: 'Металл', desc: 'Ржавеет.', reacts: ['O2', 'HCl', 'CuSO4'] },
    'Cu': { sym: 'Cu', name: 'Медь', color: '#b87333', cat: 'metal', type: 'Металл', desc: 'Красноватый металл.', reacts: ['O2', 'H2SO4'] },
    'Zn': { sym: 'Zn', name: 'Цинк', color: '#bdc3c7', cat: 'metal', type: 'Металл', desc: 'Растворяется в кислотах.', reacts: ['H2SO4', 'HCl'] },
    'Al': { sym: 'Al', name: 'Алюминий', color: '#ecf0f1', cat: 'metal', type: 'Металл', desc: 'Легкий металл.', reacts: ['O2', 'HCl'] },
    'Ag': { sym: 'Ag', name: 'Серебро', color: '#d5d8dc', cat: 'metal', type: 'Металл', desc: 'Благородный металл.', reacts: ['HNO3'] },

    // --- КИСЛОТЫ ---
    'H2SO4': { sym: 'H₂SO₄', name: 'Серная к-та', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Сильная кислота.', reacts: ['NaOH', 'Cu', 'Zn'] },
    'HCl': { sym: 'HCl', name: 'Соляная к-та', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Желудочный сок.', reacts: ['NaOH', 'Zn', 'Fe'] },
    'HNO3': { sym: 'HNO₃', name: 'Азотная к-та', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Растворяет даже серебро.', reacts: ['NaOH', 'Ag', 'Cu'] },

    // --- ОСНОВАНИЯ (ЩЕЛОЧИ) ---
    'NaOH': { sym: 'NaOH', name: 'Гидроксид натрия', color: '#9b59b6', cat: 'base', type: 'Щелочь', desc: 'Едкий натр.', reacts: ['H2SO4', 'HCl', 'CuSO4'] },
    'KOH': { sym: 'KOH', name: 'Гидроксид калия', color: '#9b59b6', cat: 'base', type: 'Щелочь', desc: 'Едкое кали.', reacts: ['H2SO4'] },

    // --- СОЛИ И РАСТВОРЫ ---
    'H2O': { sym: 'H₂O', name: 'Вода', color: '#3498db', cat: 'salt', type: 'Растворитель', desc: 'Универсальный растворитель.', reacts: ['Na', 'K'] },
    'CuSO4': { sym: 'CuSO₄', name: 'Медный купорос', color: '#1e90ff', cat: 'salt', type: 'Соль', desc: 'Синий раствор.', reacts: ['NaOH', 'Fe'] },
    'AgNO3': { sym: 'AgNO₃', name: 'Нитрат серебра', color: '#dfe6e9', cat: 'salt', type: 'Соль', desc: 'Ляпис. Дает осадки.', reacts: ['NaCl', 'HCl'] },
    'NaCl': { sym: 'NaCl', name: 'Соль (Хлорид натрия)', color: '#ecf0f1', cat: 'salt', type: 'Соль', desc: 'Поваренная соль.', reacts: ['AgNO3'] }
};

// --- МЕГА-БАЗА РЕАКЦИЙ ---
// precip: true = выпадает осадок, bubbles: true = идут пузырьки
const reactions = {
    // Реакции металлов с водой
    'H2O+Na': { title: 'Взрыв!', desc: 'Натрий сгорает в воде.', color: '#f1c40f', bubbles: true, precip: false },
    'H2O+K': { title: 'Взрыв!', desc: 'Калий вспыхивает фиолетовым пламенем.', color: '#9b59b6', bubbles: true, precip: false },
    
    // Металл + Кислота
    'H2SO4+Zn': { title: 'Выделение газа', desc: 'Цинк растворяется, выделяется водород.', color: '#bdc3c7', bubbles: true, precip: false },
    'HCl+Zn': { title: 'Выделение газа', desc: 'Цинк растворяется в соляной кислоте.', color: '#bdc3c7', bubbles: true, precip: false },
    'HCl+Fe': { title: 'Растворение', desc: 'Железо растворяется, раствор зеленеет.', color: '#2ecc71', bubbles: true, precip: false },
    'H2SO4+Cu': { title: 'Окисление', desc: 'Медь растворяется, раствор синеет.', color: '#1e90ff', bubbles: true, precip: false },
    'HNO3+Ag': { title: 'Растворение серебра', desc: 'Серебро растворяется в азотной кислоте.', color: '#dfe6e9', bubbles: true, precip: false },

    // Нейтрализация (Кислота + Щелочь)
    'H2SO4+NaOH': { title: 'Нейтрализация', desc: 'Образовалась соль и вода. Тепло!', color: '#2ecc71', bubbles: false, precip: false },
    'HCl+NaOH': { title: 'Нейтрализация', desc: 'Образовалась поваренная соль.', color: '#ecf0f1', bubbles: false, precip: false },
    'HNO3+NaOH': { title: 'Нейтрализация', desc: 'Образовалась селитра.', color: '#2ecc71', bubbles: false, precip: false },

    // РЕАКЦИИ С ОСАДКОМ (Соли)
    'AgNO3+NaCl': { title: 'Белый осадок!', desc: 'Выпал хлорид серебра (AgCl).', color: '#ecf0f1', bubbles: false, precip: true, precipColor: '#ffffff' },
    'AgNO3+HCl': { title: 'Белый осадок!', desc: 'Выпал хлорид серебра (AgCl).', color: '#ecf0f1', bubbles: false, precip: true, precipColor: '#ffffff' },
    'CuSO4+NaOH': { title: 'Голубой осадок!', desc: 'Выпал гидроксид меди (Cu(OH)₂).', color: '#1e90ff', bubbles: false, precip: true, precipColor: '#3498db' },
    'CuSO4+Fe': { title: 'Замещение', desc: 'Железо вытеснило медь. Осадок меди.', color: '#b87333', bubbles: false, precip: true, precipColor: '#b87333' },
    
    // Оксиды
    'H2+O2': { title: 'Гремучий газ', desc: 'Мощный взрыв! Образовалась вода.', color: '#3498db', bubbles: true, precip: false },
    'Fe+O2': { title: 'Ржавчина', desc: 'Железо окислилось.', color: '#d35400', bubbles: false, precip: true, precipColor: '#d35400' },
    'Cu+O2': { title: 'Окисление', desc: 'Медь почернела.', color: '#2c3e50', bubbles: false, precip: true, precipColor: '#2c3e50' }
};

// --- СОСТОЯНИЕ ---
let flask = [];
let currentFilter = 'all';
let currentSearch = '';

// --- DOM ---
const liquidEl = document.getElementById('liquid');
const precipEl = document.getElementById('precipitate');
const bubblesEl = document.getElementById('bubbles');
const titleEl = document.getElementById('reaction-title');
const descEl = document.getElementById('reaction-desc');
const gridEl = document.getElementById('elements-grid');

// --- НАВИГАЦИЯ ---
function switchView(viewId) {
    tg.HapticFeedback.impactOccurred('light');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    document.getElementById(`nav-${viewId === 'info' ? 'elements' : viewId}`).classList.add('active');
}

// --- РЕНДЕР И ФИЛЬТРАЦИЯ БАЗЫ ---
function renderGrid() {
    gridEl.innerHTML = '';
    
    for (const [key, data] of Object.entries(database)) {
        // Фильтр по категории
        if (currentFilter !== 'all' && data.cat !== currentFilter) continue;
        
        // Поиск
        if (currentSearch && !data.name.toLowerCase().includes(currentSearch) && !data.sym.toLowerCase().includes(currentSearch)) continue;

        const card = document.createElement('div');
        card.className = 'chem-card';
        card.style.setProperty('--color', data.color);
        card.innerHTML = `<div class="sym">${data.sym}</div><div class="name">${data.name}</div>`;
        card.onclick = () => openInfo(key);
        gridEl.appendChild(card);
    }

    if (gridEl.innerHTML === '') {
        gridEl.innerHTML = '<div style="text-align:center; color:var(--hint); grid-column: 1/-1; padding: 20px;">Ничего не найдено</div>';
    }
}

function filterCategory(cat) {
    tg.HapticFeedback.impactOccurred('light');
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderGrid();
}

// --- ИНФО ---
function openInfo(key) {
    const data = database[key];
    document.getElementById('info-symbol').innerText = data.sym;
    document.getElementById('info-symbol').style.color = data.color;
    document.getElementById('info-name').innerText = data.name;
    document.getElementById('info-type').innerText = data.type;
    document.getElementById('info-desc').innerText = data.desc;

    const reactsContainer = document.getElementById('info-reacts');
    reactsContainer.innerHTML = '';
    if (data.reacts && data.reacts.length > 0) {
        data.reacts.forEach(r => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = database[r]?.name || r;
            reactsContainer.appendChild(tag);
        });
    } else {
        reactsContainer.innerHTML = '<span class="tag">Нет данных</span>';
    }

    document.getElementById('add-to-flask-btn').onclick = () => {
        addToFlask(key);
        switchView('lab');
    };
    switchView('info');
}

// --- ЛОГИКА ЛАБОРАТОРИИ ---
function addToFlask(key) {
    tg.HapticFeedback.impactOccurred('medium');
    if (flask.length >= 2) resetLab();

    flask.push(key);
    const data = database[key];

    // Визуал жидкости
    liquidEl.style.height = `${flask.length * 35}%`;
    liquidEl.style.backgroundColor = data.color;

    if (flask.length === 1) {
        titleEl.innerText = `В колбе: ${data.name}`;
        titleEl.style.color = data.color;
        descEl.innerText = "Добавьте второй компонент.";
    } 
    else if (flask.length === 2) {
        const mixKey = [...flask].sort().join('+');
        const reaction = reactions[mixKey];

        setTimeout(() => {
            if (reaction) {
                titleEl.innerText = reaction.title;
                titleEl.style.color = reaction.color;
                descEl.innerText = reaction.desc;
                
                // Красим жидкость
                liquidEl.style.backgroundColor = reaction.color;

                // Пузырьки
                if (reaction.bubbles) spawnBubbles();

                // Осадок
                if (reaction.precip) {
                    precipEl.style.height = '30%';
                    precipEl.style.backgroundColor = reaction.precipColor || '#95a5a6';
                }

                tg.HapticFeedback.notificationOccurred('success');
            } else {
                titleEl.innerText = "Инертная смесь";
                titleEl.style.color = "#7f8c8d";
                descEl.innerText = "Вещества не реагируют.";
                liquidEl.style.backgroundColor = "#7f8c8d";
            }
        }, 300);
    }
}

function resetLab() {
    flask = [];
    liquidEl.style.height = '0%';
    precipEl.style.height = '0%';
    bubblesEl.innerHTML = '';
    titleEl.innerText = "Пустая колба";
    titleEl.style.color = "var(--accent)";
    descEl.innerText = "Добавьте два компонента для реакции.";
    tg.HapticFeedback.impactOccurred('heavy');
}

function spawnBubbles() {
    bubblesEl.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const b = document.createElement('div');
        b.className = 'bubble';
        const size = Math.random() * 10 + 5;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${Math.random() * 90}%`;
        b.style.animationDuration = `${Math.random() * 0.8 + 0.4}s`;
        bubblesEl.appendChild(b);
    }
}

// --- СЛУШАТЕЛИ ---
document.getElementById('reset-btn').onclick = resetLab;
document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderGrid();
});

// --- ИНИЦИАЛИЗАЦИЯ ---
renderGrid();
