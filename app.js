const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// --- НАСТРОЙКИ ЭЛЕМЕНТОВ ---
const liquidEl = document.getElementById('liquid');
const bubblesEl = document.getElementById('bubbles');
const reactionTextEl = document.getElementById('reaction-text');
const resetBtn = document.getElementById('reset-btn');

// --- СОСТОЯНИЕ КОЛБЫ ---
let flaskContents = []; // Массив того, что налито
let liquidLevel = 0;    // Уровень жидкости в %

// --- БАЗА РЕАГЕНТОВ ---
const chemicals = {
    water: { name: 'Вода', color: '#3498db' },
    acid:  { name: 'Кислота', color: '#e74c3c' },
    base:  { name: 'Щелочь', color: '#9b59b6' },
    metal: { name: 'Металл', color: '#bdc3c7' }
};

// --- БАЗА РЕАКЦИЙ ---
// Ключ формируется из отсортированных названий реагентов (чтобы порядок не имел значения)
const reactions = {
    'acid+base': {
        result: 'Реакция нейтрализации! Получилась соль и вода.',
        color: '#2ecc71', // Зеленый
        level: 60,
        bubbles: false
    },
    'metal+water': {
        result: 'БУМ! Натрий бурно реагирует с водой!',
        color: '#f1c40f', // Желтый/Оранжевый
        level: 70,
        bubbles: true
    },
    'acid+metal': {
        result: 'Выделяется водород! Металл растворяется.',
        color: '#e67e22',
        level: 50,
        bubbles: true
    }
};

// --- ФУНКЦИИ ---

function createBubbles() {
    bubblesEl.innerHTML = ''; // Очищаем старые
    for (let i = 0; i < 10; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        // Рандомный размер и позиция
        const size = Math.random() * 15 + 5;
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
    // Вибрация для приятного отклика (если поддерживается)
    tg.HapticFeedback.impactOccurred('light');

    const chem = chemicals[chemId];
    if (!chem) return;

    // Если колба уже полная или реакция прошла - сбрасываем
    if (flaskContents.length >= 2) {
        resetFlask();
    }

    flaskContents.push(chemId);

    // 1. Заливаем жидкость (визуал)
    liquidLevel += 30; 
    if (liquidLevel > 80) liquidLevel = 80;
    
    liquidEl.style.height = `${liquidLevel}%`;
    liquidEl.style.backgroundColor = chem.color;

    // 2. Проверяем на реакцию
    if (flaskContents.length === 2) {
        checkReaction();
    } else {
        reactionTextEl.innerText = `Добавлено: ${chem.name}`;
    }
}

function checkReaction() {
    // Сортируем названия, чтобы "acid+base" и "base+acid" считались одинаково
    const mixKey = [...flaskContents].sort().join('+');

    if (reactions[mixKey]) {
        const reaction = reactions[mixKey];
        
        // Применяем эффекты реакции с небольшой задержкой (эффект "смешивания")
        setTimeout(() => {
            liquidEl.style.backgroundColor = reaction.color;
            liquidEl.style.height = `${reaction.level}%`;
            
            reactionTextEl.innerText = reaction.result;
            reactionTextEl.style.color = reaction.color;

            if (reaction.bubbles) {
                createBubbles();
                tg.HapticFeedback.notificationOccurred('warning'); // Сильная вибрация
            } else {
                tg.HapticFeedback.notificationOccurred('success');
            }
        }, 500);
    } else {
        // Если реакции нет
        setTimeout(() => {
            // Смешиваем цвета (грубый визуальный эффект)
            liquidEl.style.backgroundColor = '#7f8c8d'; // Серый цвет
            reactionTextEl.innerText = 'Ничего не произошло. Смесь инертна.';
            reactionTextEl.style.color = '#95a5a6';
        }, 500);
    }
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---

// Вешаем обработчик на все кнопки реагентов
document.querySelectorAll('.chem-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const chemId = e.target.getAttribute('data-chem');
        addChemical(chemId);
    });
});

// Кнопка очистки
resetBtn.addEventListener('click', resetFlask);