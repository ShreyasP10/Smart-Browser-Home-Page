// DEFAULT DATA 
const defaultTools = [
    { id: 't1', name: "Gmail", url: "https://mail.google.com", color: "#EA4335", icon: "fas fa-envelope" },
    { id: 't2', name: "YouTube", url: "https://youtube.com", color: "#FF0000", icon: "fab fa-youtube" },
    { id: 't3', name: "GitHub", url: "https://github.com", color: "#181717", icon: "fab fa-github" },
    { id: 't4', name: "Moodle", url: "https://elearn.apsit.edu.in/moodle/my/courses.php", color: "#FF42FE", icon: "fa-solid fa-book" },
    { id: 't5', name: "Instagram", url: "https://instagram.com", color: "#E4405F", icon: "fab fa-instagram" },
    { id: 't6', name: "LinkedIn", url: "https://linkedin.com", color: "#0A66C2", icon: "fab fa-linkedin" },
    { id: 't7', name: "Twitter", url: "https://twitter.com", color: "#000000", icon: "fab fa-twitter" },
    { id: 't8', name: "Notion", url: "https://notion.so", color: "#000000", icon: "fas fa-sticky-note" },
    { id: 't9', name: "Figma", url: "https://figma.com", color: "#F24E1E", icon: "fab fa-figma" },
    { id: 't10', name: "Calendar", url: "https://calendar.google.com", color: "#4285F4", icon: "fas fa-calendar-alt" }
];

const defaultAI = [
    { id: 'a1', name: "ChatGPT", url: "https://chat.openai.com", color: "#10A37F", icon: "fas fa-comment-dots" },
    { id: 'a2', name: "DeepSeek", url: "https://chat.deepseek.com", color: "#6366F1", icon: "fas fa-brain" },
    { id: 'a3', name: "Gemini", url: "https://gemini.google.com", color: "#4285F4", icon: "fas fa-gem" },
    { id: 'a4', name: "Copilot", url: "https://copilot.microsoft.com", color: "#0078D4", icon: "fas fa-robot" },
    { id: 'a5', name: "Perplexity", url: "https://www.perplexity.ai", color: "#8B5CF6", icon: "fas fa-search" },
    { id: 'a6', name: "Claude", url: "https://claude.ai", color: "#10B981", icon: "fas fa-user-robot" },
    { id: 'a7', name: "Midjourney", url: "https://www.midjourney.com", color: "#000000", icon: "fas fa-palette" },
    { id: 'a8', name: "HuggingFace", url: "https://huggingface.co", color: "#FFD21E", icon: "fas fa-hands-helping" }
];

// STORAGE & STATE 
const STORAGE_KEY_TOOLS = 'sb_tools_v3';
const STORAGE_KEY_AI = 'sb_ai_v3';

let toolsData = loadFromStorage(STORAGE_KEY_TOOLS, defaultTools);
let aiData = loadFromStorage(STORAGE_KEY_AI, defaultAI);
let isEditMode = false;
let currentSearchEngine = 'bing';
let itemToDelete = null;

// VALIDATION HELPERS 
function isValidHexColor(color) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
}

function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch { return false; }
}

function isValidIconClass(icon) {
    return /^[a-zA-Z0-9\s\-_]+$/.test(icon);   
}

function isValidItem(item) {
    return item && typeof item === 'object' &&
        typeof item.id === 'string' && item.id.trim() &&
        typeof item.name === 'string' && item.name.trim() &&
        typeof item.url === 'string' && isValidUrl(item.url) &&
        typeof item.icon === 'string' && isValidIconClass(item.icon) &&
        typeof item.color === 'string' && isValidHexColor(item.color);
}

function loadFromStorage(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.every(isValidItem)) return parsed;
        }
    } catch (e) {}
    return JSON.parse(JSON.stringify(fallback));
}

function saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { showToast('Storage full. Please clear some items.', 'error'); }
}

// DOM REFS 
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const toolsContainer = $('#toolsContainer');
const aiContainer = $('#aiContainer');
const toolsCount = $('#toolsCount');
const aiCount = $('#aiCount');
const toolsEmptyState = $('#toolsEmptyState');
const aiEmptyState = $('#aiEmptyState');
const searchInput = $('#searchInput');
const searchBtn = $('#searchBtn');
const luckyBtn = $('#luckyBtn');
const clearSearchBtn = $('#clearSearchBtn');
const addBtn = $('#addBtn');
const editBtn = $('#editBtn');
const saveBtn = $('#saveBtn');
const exportBtn = $('#exportBtn');
const importBtn = $('#importBtn');
const resetBtn = $('#resetBtn');
const importFileInput = $('#importFileInput');
const addModal = $('#addModal');
const deleteModal = $('#deleteModal');
const deleteItemName = $('#deleteItemName');
const dateTimeEl = $('#dateTime');
const toastContainer = $('#toastContainer');

// RENDERING 
function renderAll() {
    renderTools();
    renderAI();
    updateCounts();
    updateEmptyStates();
}

function renderTools() {
    toolsContainer.innerHTML = '';
    toolsData.forEach(item => toolsContainer.appendChild(createToolCard(item)));
    if (isEditMode) enableDragForContainer(toolsContainer);
}

function renderAI() {
    aiContainer.innerHTML = '';
    aiData.forEach(item => aiContainer.appendChild(createAICard(item)));
    if (isEditMode) enableDragForContainer(aiContainer);
}

function createToolCard(tool) {
    const el = document.createElement('a');
    el.className = 'tool-item';
    el.href = isEditMode ? 'javascript:void(0)' : tool.url;
    if (!isEditMode) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    }
    el.dataset.id = tool.id;
    el.dataset.name = tool.name;
    el.title = tool.name;

    const iconContainer = document.createElement('div');
    iconContainer.className = 'tool-icon';
    iconContainer.style.background = `linear-gradient(135deg, ${tool.color}, ${lightenColor(tool.color, 30)})`;

    const icon = document.createElement('i');
    icon.className = tool.icon;
    iconContainer.appendChild(icon);

    const nameEl = document.createElement('span');
    nameEl.className = 'tool-name';
    nameEl.textContent = tool.name;

    el.appendChild(iconContainer);
    el.appendChild(nameEl);

    if (isEditMode) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete this item';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            openDeleteModal(tool, 'tools');
        });
        el.appendChild(deleteBtn);
        el.addEventListener('click', (e) => e.preventDefault());
        el.draggable = true;
    }
    return el;
}

function createAICard(ai) {
    const el = document.createElement('a');
    el.className = 'ai-item';
    el.href = isEditMode ? 'javascript:void(0)' : ai.url;
    if (!isEditMode) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    }
    el.dataset.id = ai.id;
    el.dataset.name = ai.name;
    el.title = ai.name;

    const iconContainer = document.createElement('div');
    iconContainer.className = 'ai-icon';
    iconContainer.style.background = `linear-gradient(135deg, ${ai.color}, ${lightenColor(ai.color, 30)})`;

    const icon = document.createElement('i');
    icon.className = ai.icon;
    iconContainer.appendChild(icon);

    const nameEl = document.createElement('span');
    nameEl.className = 'ai-name';
    nameEl.textContent = ai.name;

    el.appendChild(iconContainer);
    el.appendChild(nameEl);

    if (isEditMode) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Delete this item';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            openDeleteModal(ai, 'ai');
        });
        el.appendChild(deleteBtn);
        el.addEventListener('click', (e) => e.preventDefault());
        el.draggable = true;
    }
    return el;
}

function updateCounts() {
    toolsCount.textContent = `${toolsData.length} item${toolsData.length !== 1 ? 's' : ''}`;
    aiCount.textContent = `${aiData.length} item${aiData.length !== 1 ? 's' : ''}`;
}

function updateEmptyStates() {
    toolsEmptyState.style.display = toolsData.length === 0 ? 'block' : 'none';
    aiEmptyState.style.display = aiData.length === 0 ? 'block' : 'none';
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// DRAG & DROP  
const FLIP_TRANSITION = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
let draggedItem = null;
let draggedType = null;

function enableDragForContainer(container) {
    const cards = container.querySelectorAll('.tool-item, .ai-item');
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    if (container.dataset.dragEnabled === 'true') return;
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', (e) => e.preventDefault());
    container.addEventListener('drop', handleDrop);
    container.dataset.dragEnabled = 'true';
}

function handleDragStart(e) {
    draggedItem = this;
    const owner = this.closest('[data-type]');
    draggedType = owner ? owner.dataset.type : null;
    this.classList.add('item-dragging');
    document.body.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    const ghost = this.cloneNode(true);
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.left = '-9999px';
    ghost.style.opacity = '0.6';
    ghost.style.width = this.offsetWidth + 'px';
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    try { e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2); }
    catch (err) {
        //
    }
    setTimeout(() => { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }, 0);
}

function handleDragEnd() {
    if (this) this.classList.remove('item-dragging');
    $$('.tool-item, .ai-item').forEach(c => {
        c.style.transition = '';
        c.style.transform = '';
        c.style.zIndex = '';
    });
    draggedItem = null;
    draggedType = null;
    document.body.classList.remove('is-dragging');
    $$('.grid-drag-over').forEach(el => el.classList.remove('grid-drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    if (!draggedItem) return;
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const container = this;
    if (container.dataset.type !== draggedType) {
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
        return;
    }
    container.classList.add('grid-drag-over');

    const afterElement = getCardAfterCursor(container, e.clientX, e.clientY);
    if (afterElement && afterElement.previousElementSibling === draggedItem) return;
    if (!afterElement && container.lastElementChild === draggedItem) return;

    const siblings = [...container.querySelectorAll('.tool-item:not(.item-dragging), .ai-item:not(.item-dragging)')];
    const firstPositions = new Map();
    siblings.forEach(c => firstPositions.set(c, c.getBoundingClientRect()));

    if (afterElement) container.insertBefore(draggedItem, afterElement);
    else container.appendChild(draggedItem);

    siblings.forEach(c => {
        const first = firstPositions.get(c);
        const last = c.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (!dx && !dy) return;
        c.classList.add('flip-move');
        c.style.transition = 'none';
        c.style.transform = `translate(${dx}px, ${dy}px)`;
        c.style.zIndex = '5';
        void c.offsetWidth;
        c.style.transition = FLIP_TRANSITION;
        c.style.transform = '';
        const cleanup = () => {
            c.classList.remove('flip-move');
            c.style.transition = '';
            c.style.zIndex = '';
            c.removeEventListener('transitionend', cleanup);
        };
        c.addEventListener('transitionend', cleanup);
    });
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('grid-drag-over');
}

function getCardAfterCursor(container, x, y) {
    const cards = [...container.querySelectorAll('.tool-item:not(.item-dragging), .ai-item:not(.item-dragging)')];
    for (const card of cards) {
        const box = card.getBoundingClientRect();
        const midX = box.left + box.width / 2;
        const midY = box.top + box.height / 2;
        if (y < midY || (y < box.bottom && x < midX)) return card;
    }
    return null;
}

function enterEditMode() {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    showToast('Edit mode enabled. Drag to reorder, × to delete.', 'info');
    renderAll();
}

function exitEditMode(saveChanges = true) {
    if (saveChanges) {
        toolsData = extractOrderFromDOM(toolsContainer, toolsData);
        aiData = extractOrderFromDOM(aiContainer, aiData);
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
        saveToStorage(STORAGE_KEY_AI, aiData);
        showToast('Layout saved.', 'success');
    }
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    saveBtn.style.display = 'none';
    editBtn.style.display = 'inline-flex';
    renderAll();
}

function extractOrderFromDOM(container, dataArray) {
    const cards = container.querySelectorAll('.tool-item, .ai-item');
    const ordered = [...cards].map(card => dataArray.find(item => item.id === card.dataset.id)).filter(Boolean);
    dataArray.forEach(item => { if (!ordered.find(o => o.id === item.id)) ordered.push(item); });
    return ordered;
}

// ==================== MODALS ====================
function openAddModal() {
    $('#modalName').value = '';
    $('#modalUrl').value = '';
    $('#modalIcon').value = 'fas fa-link';
    $('#modalColor').value = '#3b82f6';
    $('#modalCategory').value = 'tools';
    $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
    const dot = $('#colorPresets .color-dot[data-color="#3B82F6"]');
    if (dot) dot.classList.add('selected');
    addModal.classList.add('active');
    setTimeout(() => $('#modalName').focus(), 150);
}

function closeAddModal() { addModal.classList.remove('active'); }

function openDeleteModal(item, category) {
    itemToDelete = { item, category };
    deleteItemName.textContent = item.name;
    deleteModal.classList.add('active');
}

function closeDeleteModal() { deleteModal.classList.remove('active'); itemToDelete = null; }

function confirmDelete() {
    if (!itemToDelete) return;
    const { item, category } = itemToDelete;
    if (category === 'tools') {
        toolsData = toolsData.filter(t => t.id !== item.id);
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
    } else {
        aiData = aiData.filter(a => a.id !== item.id);
        saveToStorage(STORAGE_KEY_AI, aiData);
    }
    showToast(`"${item.name}" deleted.`, 'info');
    closeDeleteModal();
    renderAll();
}

function submitNewItem() {
    const category = $('#modalCategory').value;
    const name = $('#modalName').value.trim();
    const url = $('#modalUrl').value.trim();
    const icon = $('#modalIcon').value.trim() || 'fas fa-link';
    const color = $('#modalColor').value || '#3b82f6';
    if (!name) { showToast('Name required.', 'error'); $('#modalName').focus(); return; }
    if (!url) { showToast('URL required.', 'error'); $('#modalUrl').focus(); return; }
    try { new URL(url); } catch (e) { showToast('Valid URL required.', 'error'); return; }
    const newItem = { id: 'custom_' + Date.now(), name, url, color, icon };
    if (category === 'tools') {
        toolsData.push(newItem);
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
    } else {
        aiData.push(newItem);
        saveToStorage(STORAGE_KEY_AI, aiData);
    }
    showToast(`"${name}" added.`, 'success');
    closeAddModal();
    renderAll();
    setTimeout(() => {
        const container = category === 'tools' ? toolsContainer : aiContainer;
        if (container.lastElementChild) container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
}

// EXPORT / IMPORT / RESET 
function exportConfig() {
    const config = { tools: toolsData, ai: aiData, version: '3.0', exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `smart-home-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Exported!', 'success');
}

function importConfig(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            if (!config || !Array.isArray(config.tools) || !Array.isArray(config.ai)) throw new Error('Invalid');
            if (!config.tools.every(isValidItem) || !config.ai.every(isValidItem)) throw new Error('Invalid');
            toolsData = config.tools;
            aiData = config.ai;
            saveToStorage(STORAGE_KEY_TOOLS, toolsData);
            saveToStorage(STORAGE_KEY_AI, aiData);
            renderAll();
            showToast(`Imported ${toolsData.length} tools & ${aiData.length} AI.`, 'success');
        } catch (err) { showToast('Invalid file.', 'error'); }
    };
    reader.readAsText(file);
}

function resetToDefaults() {
    if (confirm('Reset all shortcuts to defaults?')) {
        toolsData = JSON.parse(JSON.stringify(defaultTools));
        aiData = JSON.parse(JSON.stringify(defaultAI));
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
        saveToStorage(STORAGE_KEY_AI, aiData);
        if (isEditMode) exitEditMode(false);
        renderAll();
        showToast('Reset complete.', 'success');
    }
}

// SEARCH 
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) { searchInput.focus(); return; }
    const engines = {
        bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        brave: `https://search.brave.com/search?q=${encodeURIComponent(query)}`
    };
    window.open(engines[currentSearchEngine], '_blank');
    searchInput.value = '';
    searchInput.focus();
}

function performLuckySearch() {
    const query = searchInput.value.trim();
    if (!query) { searchInput.focus(); return; }
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`, '_blank');
    searchInput.value = '';
}

function updateSearchPlaceholder() {
    const engineNames = { bing: 'Bing', google: 'Google', duckduckgo: 'DuckDuckGo', brave: 'Brave' };
    searchInput.placeholder = `Search the web with ${engineNames[currentSearchEngine]}...`;
}

function setSearchEngine(engine) {
    currentSearchEngine = engine;
    $$('.engine-btn').forEach(b => b.classList.remove('active'));
    const btn = $(`.engine-btn[data-engine="${engine}"]`);
    if (btn) btn.classList.add('active');
    updateSearchPlaceholder();
}

// TOASTS 
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

// UI UPDATES 
function updateClearButtonVisibility() {
    const hasText = searchInput.value.trim().length > 0;
    clearSearchBtn.style.opacity = hasText ? '1' : '0.4';
    clearSearchBtn.disabled = !hasText;          // <-- added disable state
}

function updateDateTime() {
    const now = new Date();
    dateTimeEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
}

// EVENT LISTENERS 
function setupEventListeners() {
    searchBtn.addEventListener('click', performSearch);
    luckyBtn.addEventListener('click', performLuckySearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); } });
    searchInput.addEventListener('input', updateClearButtonVisibility);
    clearSearchBtn.addEventListener('click', () => { searchInput.value = ''; searchInput.focus(); updateClearButtonVisibility(); });
    $$('.engine-btn').forEach(btn => btn.addEventListener('click', () => setSearchEngine(btn.dataset.engine)));
    editBtn.addEventListener('click', enterEditMode);
    saveBtn.addEventListener('click', () => exitEditMode(true));
    addBtn.addEventListener('click', openAddModal);
    $('#modalCloseBtn').addEventListener('click', closeAddModal);
    $('#cancelModalBtn').addEventListener('click', closeAddModal);
    $('#submitModalBtn').addEventListener('click', submitNewItem);
    addModal.addEventListener('click', e => { if (e.target === addModal) closeAddModal(); });
    $('#deleteModalCloseBtn').addEventListener('click', closeDeleteModal);
    $('#cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    $('#confirmDeleteBtn').addEventListener('click', confirmDelete);
    deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });
    exportBtn.addEventListener('click', exportConfig);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', e => {
        if (e.target.files[0]) { importConfig(e.target.files[0]); importFileInput.value = ''; }
    });
    resetBtn.addEventListener('click', resetToDefaults);
    $$('#colorPresets .color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            $('#modalColor').value = this.dataset.color;
        });
    });
    $('#modalColor').addEventListener('input', function() {
        $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
        const match = $(`#colorPresets .color-dot[data-color="${this.value.toUpperCase()}"]`);
        if (match) match.classList.add('selected');
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (addModal.classList.contains('active')) closeAddModal();
            if (deleteModal.classList.contains('active')) closeDeleteModal();
            if (document.activeElement === searchInput) { searchInput.value = ''; searchInput.blur(); updateClearButtonVisibility(); }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !e.shiftKey) {
            e.preventDefault(); isEditMode ? exitEditMode(true) : enterEditMode();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditMode) {
            e.preventDefault(); exitEditMode(true);
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault(); openAddModal();
            return;
        }
        const ignoreTags = ['INPUT', 'TEXTAREA', 'SELECT'];   // <-- skip when focus is on form elements
        const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isPrintable && document.activeElement !== searchInput &&
            !ignoreTags.includes(document.activeElement.tagName) &&
            !addModal.classList.contains('active') && !deleteModal.classList.contains('active')) {
            e.preventDefault();
            searchInput.focus();
            searchInput.value += e.key;
            updateClearButtonVisibility();
        }
    });
}

// SERVICE WORKER 
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').then((reg) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                showToast('Updated. Reload to apply changes.', 'info');
            });
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showToast('A new version is available.', 'info');
                    }
                });
            });
        }).catch((err) => console.warn('SW registration failed:', err));
    });
}

//  INIT 
function init() {
    setupEventListeners();
    renderAll();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateSearchPlaceholder();
    updateClearButtonVisibility();
    searchInput.focus();
    registerServiceWorker();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();