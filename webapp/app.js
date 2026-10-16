const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Профиль и аватар
const tgUser = tg.initDataUnsafe?.user;
if (tgUser) {
    const profileAvatar = document.getElementById("profile-avatar");
    const avatarBig = document.getElementById("profile-avatar-big");
    const profileName = document.getElementById("profile-name");
    const profileSub = document.getElementById("profile-sub");

    if (tgUser.photo_url) {
        profileAvatar.innerHTML = `<img src="${tgUser.photo_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
        avatarBig.innerHTML = `<img src="${tgUser.photo_url}" alt="" />`;
    }

    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ");
    profileName.textContent = fullName || "Пользователь";
    profileSub.textContent = tgUser.username ? "@" + tgUser.username : `ID: ${tgUser.id}`;
}

// ===== ИСТОРИЯ =====
const HISTORY_KEY = "chemlab_history_v1";

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.warn("Не удалось сохранить историю:", e);
    }
}

function addToHistory(reaction) {
    const history = loadHistory();
    const key = [...reaction.reactants].sort().join("|");

    // убираем старую запись с этой же реакцией (чтобы не было дублей)
    const filtered = history.filter(h => h.key !== key);

    filtered.unshift({
        key,
        name: reaction.name,
        emoji: reaction.emoji,
        equation: reaction.equation,
        reactants: reaction.reactants,
        time: Date.now(),
    });

    // храним максимум 100 записей
    saveHistory(filtered.slice(0, 100));
}

function renderHistory() {
    const list = document.getElementById("history-list");
    const history = loadHistory();

    // статистика
    const total = history.length;
    const unique = new Set(history.map(h => h.key)).size;
    const totalReactions = reactions.length || 1;
    const progress = Math.round((unique / totalReactions) * 100);

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-unique").textContent = unique;
    document.getElementById("stat-progress").textContent = progress + "%";

    if (history.length === 0) {
        list.innerHTML = '<div class="history-empty">Здесь появятся твои реакции</div>';
        return;
    }

    list.innerHTML = "";
    history.forEach(h => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
            <div class="history-emoji">${h.emoji}</div>
            <div class="history-info">
                <div class="history-name">${h.name}</div>
                <div class="history-eq">${h.equation}</div>
            </div>
            <div class="history-time">${timeAgo(h.time)}</div>
        `;
        item.addEventListener("click", () => {
            reactor.length = 0;
            h.reactants.forEach(r => reactor.push(r));
            renderReactor();
            closeProfile();
            // переключаемся на лабораторию
            document.querySelector('.tab[data-tab="lab"]').click();
        });
        list.appendChild(item);
    });
}

function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "только что";
    if (diff < 3600) return Math.floor(diff / 60) + " мин";
    if (diff < 86400) return Math.floor(diff / 3600) + " ч";
    return Math.floor(diff / 86400) + " дн";
}

function openProfile() {
    renderHistory();
    document.getElementById("profile-modal").classList.remove("hidden");
}
function closeProfile() {
    document.getElementById("profile-modal").classList.add("hidden");
}

document.getElementById("profile-btn").addEventListener("click", openProfile);
document.getElementById("profile-close").addEventListener("click", closeProfile);
document.getElementById("profile-modal").addEventListener("click", (e) => {
    if (e.target.id === "profile-modal") closeProfile();
});
document.getElementById("clear-history").addEventListener("click", () => {
    if (confirm("Удалить всю историю?")) {
        saveHistory([]);
        renderHistory();
    }
});

const user = tg.initDataUnsafe?.user;
const userInfo = document.getElementById("user-info");
if (user) {
    userInfo.textContent = `Привет, ${user.first_name}!`;
} else {
    userInfo.textContent = "Открой меня через Telegram 👋";
}

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
        document.querySelectorAll("[data-view]").forEach(v => {
            v.classList.toggle("hidden", v.dataset.view !== tab.dataset.tab);
        });
    });
});

let elements = [];
let reactions = [];
let molecules = [];

const CATEGORY_LABELS = {
    alkali: "Щелочной металл", alkaline: "Щелочноземельный металл",
    transition: "Переходный металл", "post-transition": "Постпереходный металл",
    metalloid: "Полуметалл", nonmetal: "Неметалл",
    halogen: "Галоген", noble: "Благородный газ"
};

Promise.all([
    fetch("elements.json").then(r => r.json()),
    fetch("reactions.json").then(r => r.json()),
    fetch("molecules.json").then(r => r.json())
]).then(([els, rxs, mols]) => {
    elements = els;
    reactions = rxs;
    molecules = mols;
    renderTable();
    renderPalette();
}).catch(err => {
    document.getElementById("periodic-table").textContent = "Ошибка: " + err.message;
});

const tableEl = document.getElementById("periodic-table");
const detailsPanel = document.getElementById("details-panel");
const detailsContent = document.getElementById("details-content");

function renderTable() {
    tableEl.innerHTML = "";
    elements.forEach(el => {
        const div = document.createElement("div");
        div.className = `element ${el.category}`;
        div.style.gridColumn = el.xpos;
        div.style.gridRow = el.ypos;
        div.innerHTML = `<span class="num">${el.number}</span><span class="sym">${el.symbol}</span><span class="name">${el.name}</span>`;
        div.addEventListener("click", () => showDetails(el));
        tableEl.appendChild(div);
    });
}

function showDetails(el) {
    detailsContent.innerHTML = `
        <div><span class="symbol-large">${el.symbol}</span><span class="element-name">${el.name}</span></div>
        <div class="row"><span>Атомный номер</span><span>${el.number}</span></div>
        <div class="row"><span>Атомная масса</span><span>${el.mass}</span></div>
        <div class="row"><span>Категория</span><span>${CATEGORY_LABELS[el.category] || el.category}</span></div>
        <div class="row"><span>Группа / период</span><span>${el.group} / ${el.period}</span></div>
        <div class="row"><span>Конфигурация</span><span>${el.config}</span></div>
        <div class="desc">${el.desc}</div>
    `;
    detailsPanel.classList.remove("hidden");
}

document.getElementById("close-details").addEventListener("click", () => {
    detailsPanel.classList.add("hidden");
});

const reactor = [];
const reactorItems = document.getElementById("reactor-items");
const palette = document.getElementById("palette");
const resultArea = document.getElementById("result-area");

function renderPalette() {
    palette.innerHTML = "";
    elements.forEach(el => {
        const btn = document.createElement("button");
        btn.className = `palette-btn ${el.category}`;
        btn.textContent = el.symbol;
        btn.dataset.symbol = el.symbol;
        btn.addEventListener("click", () => addToReactor(el.symbol));
        palette.appendChild(btn);
    });

    const molPalette = document.getElementById("molecules-palette");
    molPalette.innerHTML = "";
    molecules.forEach(mol => {
        const btn = document.createElement("button");
        btn.className = `palette-btn molecule mol-${mol.category}`;
        btn.textContent = mol.formula;
        btn.title = mol.name;
        btn.dataset.symbol = mol.symbol;
        btn.addEventListener("click", () => addToReactor(mol.symbol));
        molPalette.appendChild(btn);
    });

    updateHints();
}

function addToReactor(symbol) {
    if (reactor.length >= 4) {
        flashResult("error", "Максимум 4 реагента");
        return;
    }
    reactor.push(symbol);
    renderReactor();
}

function renderReactor() {
    if (reactor.length === 0) {
        reactorItems.innerHTML = '<div class="reactor-empty">Добавь реагенты из палитры ↓</div>';
    } else {
        reactorItems.innerHTML = "";
        reactor.forEach((sym, i) => {
            const chip = document.createElement("div");
            chip.className = "chip";

            let idx = "";
            const el = elements.find(e => e.symbol === sym);
            if (el) {
                idx = el.number;
            } else {
                const mol = molecules.find(m => m.symbol === sym);
                if (mol) idx = mol.formula;
            }

            chip.innerHTML = `<span class="chip-index">${idx}</span>${sym}`;
            chip.addEventListener("click", () => {
                reactor.splice(i, 1);
                renderReactor();
            });
            reactorItems.appendChild(chip);
        });
    }
    updateHints();
}

function updateHints() {
    document.querySelectorAll(".palette-btn").forEach(btn => {
        const sym = btn.dataset.symbol;
        if (!sym) return;
        let reacts = false;
        if (reactor.length > 0) {
            const key = [...reactor, sym].sort().join("|");
            reacts = reactions.some(r => [...r.reactants].sort().join("|") === key);
        }
        btn.classList.toggle("hint", reacts);
    });
}

document.getElementById("clear-btn").addEventListener("click", () => {
    reactor.length = 0;
    renderReactor();
    resultArea.innerHTML = "";
});

document.getElementById("mix-btn").addEventListener("click", () => {
    if (reactor.length < 2) {
        flashResult("error", "Добавь хотя бы 2 реагента");
        return;
    }
    const key = [...reactor].sort().join("|");
    const reaction = reactions.find(r => [...r.reactants].sort().join("|") === key);
    if (reaction) {
        showReaction(reaction);
    } else {
        showNothing();
    }
});

function showReaction(r) {
    fireReaction();
    addToHistory(r);  // ← добавили запись в историю
    resultArea.innerHTML = `
        <div class="result-card success">
            <span class="emoji-big">${r.emoji}</span>
            <div class="reaction-name">${r.name}</div>
            <div class="reaction-eq">${r.equation}</div>
            <div class="reaction-effect">⚡ ${r.effect}</div>
            <div class="reaction-desc">${r.desc}</div>
        </div>
    `;
}

function showNothing() {
    fireNothing();
    resultArea.innerHTML = `
        <div class="result-card nothing">
            <span class="emoji-big">🤷</span>
            <div class="reaction-name">Ничего не произошло</div>
            <div class="reaction-desc">Эти реагенты не реагируют друг с другом напрямую.</div>
        </div>
    `;
}

function flashResult(type, text) {
    if (type === "error") fireError();
    resultArea.innerHTML = `<div class="result-card ${type}"><div class="reaction-name">${text}</div></div>`;
}

const quickInput = document.getElementById("quick-input");
const quickBtn = document.getElementById("quick-btn");

function quickAdd() {
    const val = quickInput.value.trim();
    if (!val) return;

    const mol = molecules.find(m =>
        m.symbol.toLowerCase() === val.toLowerCase() ||
        m.formula.toLowerCase() === val.toLowerCase() ||
        m.name.toLowerCase() === val.toLowerCase()
    );
    if (mol) {
        addToReactor(mol.symbol);
        quickInput.value = "";
        return;
    }

    let el;
    if (/^\d+$/.test(val)) {
        const num = parseInt(val, 10);
        el = elements.find(e => e.number === num);
    } else {
        const norm = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        el = elements.find(e => e.symbol === norm);
    }

    if (!el) {
        flashResult("error", `"${val}" не найден`);
        return;
    }
    addToReactor(el.symbol);
    quickInput.value = "";
}

quickBtn.addEventListener("click", quickAdd);
quickInput.addEventListener("keydown", e => {
    if (e.key === "Enter") quickAdd();
});

const effectsLayer = document.getElementById("effects-layer");

function screenFlash(color = "#5fa8ff") {
    const flash = document.createElement("div");
    flash.className = "flash";
    flash.style.background = `radial-gradient(circle at center, ${color} 0%, ${color}66 30%, transparent 70%)`;
    effectsLayer.appendChild(flash);
    setTimeout(() => flash.remove(), 650);
}

function shakeScreen() {
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 500);
}

function explodeParticles(count = 30, color = "#5fa8ff") {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.background = color;
        p.style.color = color;
        p.style.left = cx + "px";
        p.style.top = cy + "px";

        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 250;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const dur = 600 + Math.random() * 600;
        const size = 4 + Math.random() * 8;

        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.transition = `transform ${dur}ms cubic-bezier(0.2, 0.8, 0.4, 1), opacity ${dur}ms ease-out`;

        effectsLayer.appendChild(p);

        requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
            p.style.opacity = "0";
        });

        setTimeout(() => p.remove(), dur + 50);
    }
}

function fireReaction() {
    const reactorEl = document.querySelector(".reactor");
    reactorEl.classList.add("active");
    screenFlash("#5fa8ff");
    setTimeout(shakeScreen, 50);
    explodeParticles(40, "#5fa8ff");
    explodeParticles(20, "#a56bff");
    explodeParticles(15, "#ffffff");
    setTimeout(() => reactorEl.classList.remove("active"), 1500);
}

function fireNothing() {
    screenFlash("#868e96");
    setTimeout(shakeScreen, 50);
}

function fireError() {
    screenFlash("#ff6b6b");
    explodeParticles(15, "#ff6b6b");
}