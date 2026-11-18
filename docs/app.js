const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// --- БАЗА ДАННЫХ ---
// Все, что можно закинуть в колбу
const database = {
    // Реагенты
    'H2O': { sym: 'H₂O', name: 'Вода', color: '#3498db', type: 'Растворитель', desc: 'Универсальная жидкость. Основа всех растворов.', reacts: ['Na', 'K'] },
    'H2SO4': { sym: 'H₂SO₄', name: 'Кислота', color: '#e74c3c', type: 'Кислота', desc: 'Сильная серная кислота. Разъедает металлы.', reacts: ['Cu', 'Zn', 'NaOH'] },
    'NaOH': { sym: 'NaOH', name: 'Щелочь', color: '#9b59b6', type: 'Основание', desc: 'Едкий натр. Нейтрализует кислоты.', reacts: ['H2SO4'] },

    // Металлы и элементы
    'Na': { sym: 'Na', name: 'Натрий', color: '#f1c40f', type: 'Щелочной металл', desc: 'Мягкий металл. Взрывается при контакте с водой.', reacts: ['H2O'] },
    'Cu': { sym: 'Cu', name: 'Медь', color: '#b87333', type: 'Переходный металл', desc: 'Красноватый металл. Окисляется в кислоте.', reacts: ['H2SO4', 'O2'] },
    'Fe': { sym: 'Fe', name: 'Железо', color: '#95a5a6', type: 'Переходный металл', desc: 'Ржавеет. Реагирует с кислородом.', reacts: ['O2'] },
    'Zn': { sym: 'Zn', name: 'Цинк', color: '#bdc3c7', type: 'Переходный металл', desc: 'Выделяет водород в кислоте.', reacts: ['H2SO4'] },
    'O2': { sym: 'O₂', name: 'Кислород', color: '#e67e22', type: 'Газ', desc: 'Поддерживает горение. Окисляет металлы.', reacts: ['Cu', 'Fe'] }
};

// --- БАЗА РЕАКЦИЙ ---
// Ключ: два элемента в алфавитном порядке (напр. 'H2O+Na')
const reactions = {
    'H2O+Na': { title: 'Взрыв!', desc: 'Натрий бурно реагирует с водой с выделением водорода.', color: '#f1c40f', bubbles: true },
    'H2SO4+NaOH': { title: 'Нейтрализация', desc: 'Кислота и щелочь образовали соль и воду.', color: '#2ecc71', bubbles: false },
    'Cu+H2SO4': { title: 'Растворение меди', desc: 'Медь растворилась. Раствор стал синим.', color: '#1e90ff', bubbles: true },
    'H2SO4+Zn': { title: 'Выделение газа', desc: 'Цинк растворился в кислоте, выделился водород.', color: '#bdc3c7', bubbles: true },
    'Cu+O2': { title: 'Окисление', desc: 'Медь покрылась черным налетом оксида меди.', color: '#2c3e50', bubbles: false },
    'Fe+O2': { title: 'Ржавчина', desc: 'Железо окислилось и покрылось ржавчиной.', color: '#d35400', bubbles: false }
};

// --- СОСТОЯНИЕ ---
let flask = [];
let currentElementKey = null;

// --- DOM ---
const liquidEl = document.getElementById('liquid');
const bubblesEl = document.getElementById('bubbles');
const titleEl = document.getElementById('reaction-title');
const descEl = document.getElementById('reaction-desc');
const gridEl = document.getElementById('elements-grid');

// --- НАВИГАЦИЯ ---
function switchView(viewId) {
    tg.HapticFeedback.impactOccurred('light');
    
    // Скрываем все экраны и убираем активные кнопки
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    // Показываем нужный
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    document.getElementById(`nav-${viewId === 'info' ? 'elements' : viewId}`).classList.add('active');
}

// --- РЕНДЕР СЕТКИ ---
function renderGrid() {
    gridEl.innerHTML = '';
    for (const [key, data] of Object.entries(database)) {
        const card = document.createElement('div');
        card.className = 'chem-card';
        card.style.setProperty('--color', data.color);
        card.innerHTML = `
            <div class="sym">${data.sym}</div>
            <div class="name">${data.name}</div>
        `;
        
        card.onclick = () => {
            tg.HapticFeedback.impactOccurred('light');
            openInfo(key);
        };
        gridEl.appendChild(card);
    }
}

// --- ОТКРЫТИЕ ИНФО ---
function openInfo(key) {
    currentElementKey = key;
    const data = database[key];

    document.getElementById('info-symbol').innerText = data.sym;
    document.getElementById('info-symbol').style.color = data.color;
    document.getElementById('info-name').innerText = data.name;
    document.getElementById('info-type').innerText = data.type;
    document.getElementById('info-desc').innerText = data.desc;

    // Рендер тегов "С чем реагирует"
    const reactsContainer = document.getElementById('info-reacts');
    reactsContainer.innerHTML = '';
    if (data.reacts.length > 0) {
        data.reacts.forEach(r => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = database[r]?.name || r;
            reactsContainer.appendChild(tag);
        });
    } else {
        reactsContainer.innerHTML = '<span class="tag">Инертен</span>';
    }

    // Кнопка "В колбу"
    const addBtn = document.getElementById('add-to-flask-btn');
    addBtn.onclick = () => {
        addToFlask(key);
        switchView('lab');
    };

    switchView('info');
}

// --- ЛОГИКА КОЛБЫ ---
function addToFlask(key) {
    tg.HapticFeedback.impactOccurred('medium');
    
    // Если в колбе уже 2 элемента - очищаем (чтобы начать новую реакцию)
    if (flask.length >= 2) resetLab();

    flask.push(key);
    const data = database[key];

    // Заливаем визуально
    liquidEl.style.height = `${flask.length * 35}%`;
    liquidEl.style.backgroundColor = data.color;

    if (flask.length === 1) {
        titleEl.innerText = `В колбе: ${data.name}`;
        titleEl.style.color = data.color;
        descEl.innerText = "Добавьте второй компонент.";
    } 
    else if (flask.length === 2) {
        // Проверяем реакцию
        const mixKey = [...flask].sort().join('+');
        const reaction = reactions[mixKey];

        setTimeout(() => {
            if (reaction) {
                // Реакция есть
                titleEl.innerText = reaction.title;
                titleEl.style.color = reaction.color;
                descEl.innerText = reaction.desc;
                liquidEl.style.backgroundColor = reaction.color;

                if (reaction.bubbles) spawnBubbles();
                tg.HapticFeedback.notificationOccurred('success');
            } else {
                // Реакции нет
                titleEl.innerText = "Инертная смесь";
                titleEl.style.color = "#7f8c8d";
                descEl.innerText = "Эти вещества не реагируют друг с другом.";
                liquidEl.style.backgroundColor = "#7f8c8d";
                tg.HapticFeedback.notificationOccurred('error');
            }
        }, 300);
    }
}

function resetLab() {
    flask = [];
    liquidEl.style.height = '0%';
    liquidEl.style.backgroundColor = 'transparent';
    bubblesEl.innerHTML = '';
    titleEl.innerText = "Пустая колба";
    titleEl.style.color = "var(--accent)";
    descEl.innerText = "Добавьте два компонента для реакции.";
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
document.getElementById('reset-btn').onclick = () => {
    tg.HapticFeedback.impactOccurred('heavy');
    resetLab();
};

// --- ИНИЦИАЛИЗАЦИЯ ---
renderGrid();