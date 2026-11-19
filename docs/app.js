const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {}
    }
};
tg.ready();
tg.expand();

// --- БАЗА ДАННЫХ ---
const database = {
    'H2': { sym: 'H₂', name: 'Водород', color: '#a0e6a0', cat: 'gas', type: 'Газ', desc: 'Самый легкий газ.', reacts: ['O2', 'Cl2'] },
    'O2': { sym: 'O₂', name: 'Кислород', color: '#e67e22', cat: 'gas', type: 'Газ', desc: 'Поддерживает горение.', reacts: ['H2', 'Fe', 'Cu'] },
    'Cl2': { sym: 'Cl₂', name: 'Хлор', color: '#f1c40f', cat: 'gas', type: 'Газ', desc: 'Ядовитый газ.', reacts: ['H2', 'Na'] },
    'C': { sym: 'C', name: 'Углерод', color: '#7f8c8d', cat: 'nonmetal', type: 'Неметалл', desc: 'Основа жизни.', reacts: ['O2'] },
    'S': { sym: 'S', name: 'Сера', color: '#f1c40f', cat: 'nonmetal', type: 'Неметалл', desc: 'Желтый порошок.', reacts: ['Fe', 'O2'] },
    'Na': { sym: 'Na', name: 'Натрий', color: '#f5b041', cat: 'metal', type: 'Металл', desc: 'Взрывается в воде.', reacts: ['H2O', 'Cl2'] },
    'K': { sym: 'K', name: 'Калий', color: '#f5b041', cat: 'metal', type: 'Металл', desc: 'Активный металл.', reacts: ['H2O'] },
    'Fe': { sym: 'Fe', name: 'Железо', color: '#95a5a6', cat: 'metal', type: 'Металл', desc: 'Ржавеет.', reacts: ['O2', 'HCl'] },
    'Cu': { sym: 'Cu', name: 'Медь', color: '#b87333', cat: 'metal', type: 'Металл', desc: 'Красноватый металл.', reacts: ['O2', 'H2SO4'] },
    'Zn': { sym: 'Zn', name: 'Цинк', color: '#bdc3c7', cat: 'metal', type: 'Металл', desc: 'Растворяется в кислотах.', reacts: ['H2SO4', 'HCl'] },
    'Al': { sym: 'Al', name: 'Алюминий', color: '#ecf0f1', cat: 'metal', type: 'Металл', desc: 'Легкий металл.', reacts: ['O2', 'HCl'] },
    'H2SO4': { sym: 'H₂SO₄', name: 'Серная к-та', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Сильная кислота.', reacts: ['NaOH', 'Cu', 'Zn'] },
    'HCl': { sym: 'HCl', name: 'Соляная к-та', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Желудочный сок.', reacts: ['NaOH', 'Zn', 'Fe'] },
    'NaOH': { sym: 'NaOH', name: 'Гидроксид натрия', color: '#9b59b6', cat: 'base', type: 'Щелочь', desc: 'Едкий натр.', reacts: ['H2SO4', 'HCl', 'CuSO4'] },
    'KOH': { sym: 'KOH', name: 'Гидроксид калия', color: '#9b59b6', cat: 'base', type: 'Щелочь', desc: 'Едкое кали.', reacts: ['H2SO4'] },
    'H2O': { sym: 'H₂O', name: 'Вода', color: '#3498db', cat: 'salt', type: 'Растворитель', desc: 'Универсальный растворитель.', reacts: ['Na', 'K'] },
    'CuSO4': { sym: 'CuSO₄', name: 'Медный купорос', color: '#1e90ff', cat: 'salt', type: 'Соль', desc: 'Синий раствор.', reacts: ['NaOH', 'Fe'] },
    'AgNO3': { sym: 'AgNO₃', name: 'Нитрат серебра', color: '#dfe6e9', cat: 'salt', type: 'Соль', desc: 'Дает осадки.', reacts: ['NaCl', 'HCl'] },
    'NaCl': { sym: 'NaCl', name: 'Соль', color: '#ecf0f1', cat: 'salt', type: 'Соль', desc: 'Поваренная соль.', reacts: ['AgNO3'] }
};

const reactions = {
    'H2O+Na': { title: 'Взрыв!', desc: 'Натрий сгорает в воде.', color: '#f1c40f', bubbles: true, precip: false },
    'H2O+K': { title: 'Взрыв!', desc: 'Калий вспыхивает.', color: '#9b59b6', bubbles: true, precip: false },
    'H2SO4+Zn': { title: 'Выделение газа', desc: 'Цинк растворяется.', color: '#bdc3c7', bubbles: true, precip: false },
    'HCl+Zn': { title: 'Выделение газа', desc: 'Цинк растворяется.', color: '#bdc3c7', bubbles: true, precip: false },
    'HCl+Fe': { title: 'Растворение', desc: 'Железо растворяется.', color: '#2ecc71', bubbles: true, precip: false },
    'H2SO4+Cu': { title: 'Окисление', desc: 'Раствор синеет.', color: '#1e90ff', bubbles: true, precip: false },
    'H2SO4+NaOH': { title: 'Нейтрализация', desc: 'Соль и вода.', color: '#2ecc71', bubbles: false, precip: false },
    'HCl+NaOH': { title: 'Нейтрализация', desc: 'Соль и вода.', color: '#ecf0f1', bubbles: false, precip: false },
    'AgNO3+NaCl': { title: 'Белый осадок!', desc: 'Выпал хлорид серебра.', color: '#ecf0f1', bubbles: false, precip: true, precipColor: '#ffffff' },
    'AgNO3+HCl': { title: 'Белый осадок!', desc: 'Выпал хлорид серебра.', color: '#ecf0f1', bubbles: false, precip: true, precipColor: '#ffffff' },
    'CuSO4+NaOH': { title: 'Голубой осадок!', desc: 'Выпал гидроксид меди.', color: '#1e90ff', bubbles: false, precip: true, precipColor: '#3498db' },
    'CuSO4+Fe': { title: 'Замещение', desc: 'Осадок меди.', color: '#b87333', bubbles: false, precip: true, precipColor: '#b87333' },
    'H2+O2': { title: 'Гремучий газ', desc: 'Взрыв! Вода.', color: '#3498db', bubbles: true, precip: false },
    'Fe+O2': { title: 'Ржавчина', desc: 'Железо окислилось.', color: '#d35400', bubbles: false, precip: true, precipColor: '#d35400' },
    'Cu+O2': { title: 'Окисление', desc: 'Медь почернела.', color: '#2c3e50', bubbles: false, precip: true, precipColor: '#2c3e50' }
};

let flask = [];
let currentFilter = 'all';
let currentSearch = '';

const liquidEl = document.getElementById('liquid');
const precipEl = document.getElementById('precipitate');
const bubblesEl = document.getElementById('bubbles');
const titleEl = document.getElementById('reaction-title');
const descEl = document.getElementById('reaction-desc');
const gridEl = document.getElementById('elements-grid');

function switchView(viewId) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    document.getElementById(`nav-${viewId === 'info' ? 'elements' : viewId}`).classList.add('active');
}

function renderGrid() {
    gridEl.innerHTML = '';
    
    for (const [key, data] of Object.entries(database)) {
        if (currentFilter !== 'all' && data.cat !== currentFilter) continue;
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

function filterCategory(cat, btn) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid();
}

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

function addToFlask(key) {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    if (flask.length >= 2) resetLab();

    flask.push(key);
    const data = database[key];

    liquidEl.style.height = `${flask.length * 35}%`;
    liquidEl.style.backgroundColor = data.color;

    if (flask.length === 1) {
        titleEl.innerText = `В колбе: ${data.name}`;
        titleEl.style.color = data.color;
        descEl.innerText = "Добавьте второй компонент.";
    } else if (flask.length === 2) {
        const mixKey = [...flask].sort().join('+');
        const reaction = reactions[mixKey];

        setTimeout(() => {
            if (reaction) {
                titleEl.innerText = reaction.title;
                titleEl.style.color = reaction.color;
                descEl.innerText = reaction.desc;
                liquidEl.style.backgroundColor = reaction.color;

                if (reaction.bubbles) spawnBubbles();
                if (reaction.precip) {
                    precipEl.style.height = '30%';
                    precipEl.style.backgroundColor = reaction.precipColor || '#95a5a6';
                }
                if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
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
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
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

document.getElementById('reset-btn').onclick = resetLab;
document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderGrid();
});

// Запуск
renderGrid();
