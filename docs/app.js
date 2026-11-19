const tg = window.Telegram?.WebApp || { ready: () => {}, expand: () => {}, HapticFeedback: { impactOccurred: () => {} } };
tg.ready();
tg.expand();

const database = {
    'H2O': { sym: 'H₂O', name: 'Вода', color: '#3498db', cat: 'salt', type: 'Растворитель', desc: 'Вода' },
    'Na': { sym: 'Na', name: 'Натрий', color: '#f5b041', cat: 'metal', type: 'Металл', desc: 'Металл' },
    'Cu': { sym: 'Cu', name: 'Медь', color: '#b87333', cat: 'metal', type: 'Металл', desc: 'Металл' },
    'HCl': { sym: 'HCl', name: 'Кислота', color: '#e74c3c', cat: 'acid', type: 'Кислота', desc: 'Кислота' }
};

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active-view');
    if (viewId === 'elements' || viewId === 'lab' || viewId === 'info') {
        document.getElementById(`nav-${viewId === 'info' ? 'elements' : viewId}`).classList.add('active');
    }
}

function renderGrid() {
    const gridEl = document.getElementById('elements-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    for (const [key, data] of Object.entries(database)) {
        const card = document.createElement('div');
        card.className = 'chem-card';
        card.style.setProperty('--color', data.color);
        card.innerHTML = `<div class="sym">${data.sym}</div><div class="name">${data.name}</div>`;
        gridEl.appendChild(card);
    }
}

renderGrid();
