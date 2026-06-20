/**
 * ============================================================
 * SMART BROWSER HOME v2.0 - COMPLETE JAVASCRIPT
 * ============================================================
 * Features:
 * - Dynamic rendering of Tools & AI sections
 * - Add new items via modal popup
 * - Edit mode with drag-and-drop reordering
 * - Delete items in edit mode
 * - LocalStorage persistence
 * - Export/Import configuration as JSON
 * - Reset to defaults
 * - Multi-engine search (Bing, Google, DuckDuckGo)
 * - Toast notifications
 * - Keyboard shortcuts
 * - Particle animations
 * - Live clock
 * ============================================================
 */

// ============================================================
// 1. DEFAULT DATA
// ============================================================
const defaultTools = [
    { id: 't1', name: "Gmail", url: "https://mail.google.com", color: "#EA4335", icon: "fas fa-envelope" },
    { id: 't2', name: "YouTube", url: "https://youtube.com", color: "#FF0000", icon: "fab fa-youtube" },
    { id: 't3', name: "Code With Harry", url: "https://www.codewithharry.com", color: "#a435f0", icon: "fa-solid fa-circle-nodes" },
    { id: 't4', name: "Udemy Courses", url: "https://www.udemy.com/home/my-courses/learning/", color: "#22c55e", icon: "fas fa-graduation-cap" },
    { id: 't5', name: "Instagram", url: "https://instagram.com", color: "#E4405F", icon: "fab fa-instagram" },
    { id: 't6', name: "LinkedIn", url: "https://linkedin.com", color: "#0A66C2", icon: "fab fa-linkedin" },
    { id: 't7', name: "Moodle", url: "https://elearn.apsit.edu.in/moodle/my/courses.php", color: "#FF42FE", icon: "fa-solid fa-book" },
    { id: 't8', name: "GitHub", url: "https://github.com", color: "#181717", icon: "fab fa-github" },
    { id: 't9', name: "Twitter (X)", url: "https://twitter.com", color: "#000000", icon: "fab fa-twitter" },
    { id: 't10', name: "Excalidraw", url: "https://excalidraw.com", color: "#FF725E", icon: "fas fa-pen-fancy" },
    { id: 't11', name: "Google Classroom", url: "https://classroom.google.com", color: "#0F9D58", icon: "fas fa-chalkboard-teacher" },
    { id: 't12', name: "Notion", url: "https://notion.so", color: "#000000", icon: "fas fa-sticky-note" },
    { id: 't13', name: "Discord", url: "https://discord.com", color: "#5865F2", icon: "fab fa-discord" },
    { id: 't14', name: "Figma", url: "https://figma.com", color: "#F24E1E", icon: "fab fa-figma" },
    { id: 't15', name: "Calendar", url: "https://calendar.google.com", color: "#4285F4", icon: "fas fa-calendar-alt" }
];

const defaultAI = [
    { id: 'a1', name: "ChatGPT", url: "https://chat.openai.com", color: "#10A37F", icon: "fas fa-comment-dots", stats: { usage: "∞", cost: "Free" } },
    { id: 'a2', name: "DeepSeek", url: "https://chat.deepseek.com", color: "#6366F1", icon: "fas fa-brain", stats: { usage: "∞", cost: "Free" } },
    { id: 'a3', name: "Gemini", url: "https://gemini.google.com", color: "#4285F4", icon: "fas fa-gem", stats: { usage: "∞", cost: "Free" } },
    { id: 'a4', name: "Copilot", url: "https://copilot.microsoft.com", color: "#0078D4", icon: "fas fa-robot", stats: { usage: "∞", cost: "Free" } },
    { id: 'a5', name: "Perplexity", url: "https://www.perplexity.ai", color: "#8B5CF6", icon: "fas fa-search", stats: { usage: "∞", cost: "Free" } },
    { id: 'a6', name: "Claude", url: "https://claude.ai", color: "#10B981", icon: "fas fa-user-robot", stats: { usage: "∞", cost: "Free" } },
    { id: 'a7', name: "Midjourney", url: "https://www.midjourney.com", color: "#000000", icon: "fas fa-palette", stats: { usage: "25/mo", cost: "$10" } },
    { id: 'a8', name: "HuggingFace", url: "https://huggingface.co", color: "#FFD21E", icon: "fas fa-hands-helping", stats: { usage: "∞", cost: "Free" } }
];

// ============================================================
// 2. STATE MANAGEMENT
// ============================================================
const STORAGE_KEY_TOOLS = 'sb_tools_v2';
const STORAGE_KEY_AI = 'sb_ai_v2';

let toolsData = loadFromStorage(STORAGE_KEY_TOOLS, defaultTools);
let aiData = loadFromStorage(STORAGE_KEY_AI, defaultAI);
let isEditMode = false;
let currentSearchEngine = 'bing';
let itemToDelete = null;

/**
 * Load data from localStorage or fall back to defaults
 */
function loadFromStorage(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn(`Failed to parse ${key} from localStorage, using defaults.`);
    }
    return JSON.parse(JSON.stringify(fallback)); // Deep clone
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        showToast('Storage full. Please clear some items.', 'error');
    }
}

// ============================================================
// 3. DOM REFERENCES
// ============================================================
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
const growingCircle = $('#growingCircle');
const particlesContainer = $('#particlesContainer');

// ============================================================
// 4. RENDERING
// ============================================================
function renderAll() {
    renderTools();
    renderAI();
    updateCounts();
    updateEmptyStates();
}

function renderTools() {
    toolsContainer.innerHTML = '';
    toolsData.forEach(item => {
        toolsContainer.appendChild(createToolCard(item));
    });
    if (isEditMode) enableDragForContainer(toolsContainer);
}

function renderAI() {
    aiContainer.innerHTML = '';
    aiData.forEach(item => {
        aiContainer.appendChild(createAICard(item));
    });
    if (isEditMode) enableDragForContainer(aiContainer);
}

function createToolCard(tool) {
    const el = document.createElement('a');
    el.className = 'tool-item';
    el.href = isEditMode ? 'javascript:void(0)' : tool.url;
    if (!isEditMode) el.target = '_blank';
    el.dataset.id = tool.id;
    el.dataset.name = tool.name;
    el.title = tool.name + (isEditMode ? ' (Drag to reorder, click × to delete)' : '');
    el.draggable = isEditMode;

    el.innerHTML = `
        <div class="tool-icon" style="background: linear-gradient(135deg, ${tool.color}, ${lightenColor(tool.color, 30)})">
            <i class="${tool.icon}"></i>
        </div>
        <span class="tool-name">${tool.name}</span>
        ${isEditMode ? '<button class="delete-btn" title="Delete this item">&times;</button>' : ''}
    `;

    if (isEditMode) {
        const deleteBtn = el.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal(tool, 'tools');
            });
        }
        el.addEventListener('click', (e) => e.preventDefault());
    }

    return el;
}

function createAICard(ai) {
    const el = document.createElement('a');
    el.className = 'ai-item';
    el.href = isEditMode ? 'javascript:void(0)' : ai.url;
    if (!isEditMode) el.target = '_blank';
    el.dataset.id = ai.id;
    el.dataset.name = ai.name;
    el.title = ai.name + (isEditMode ? ' (Drag to reorder, click × to delete)' : '');
    el.draggable = isEditMode;

    el.innerHTML = `
        <div class="ai-icon" style="background: linear-gradient(135deg, ${ai.color}, ${lightenColor(ai.color, 30)})">
            <i class="${ai.icon}"></i>
        </div>
        <span class="ai-name">${ai.name}</span>
        <div class="ai-stats">
            <div class="stat">
                <span class="stat-value">${ai.stats.usage}</span>
                <span class="stat-label">Usage</span>
            </div>
            <div class="stat">
                <span class="stat-value">${ai.stats.cost}</span>
                <span class="stat-label">Cost</span>
            </div>
        </div>
        ${isEditMode ? '<button class="delete-btn" title="Delete this item">&times;</button>' : ''}
    `;

    if (isEditMode) {
        const deleteBtn = el.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal(ai, 'ai');
            });
        }
        el.addEventListener('click', (e) => e.preventDefault());
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

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ============================================================
// 5. DRAG & DROP SYSTEM
// ============================================================
function enableDragForContainer(container) {
    const cards = container.querySelectorAll('.tool-item, .ai-item');

    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragenter', (e) => e.preventDefault());
    container.addEventListener('drop', handleDrop);
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('item-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    // Set a ghost image (optional, for cleaner look)
    const ghost = this.cloneNode(true);
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    ghost.style.opacity = '0.6';
    ghost.style.width = this.offsetWidth + 'px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(ghost), 0);
}

function handleDragEnd(e) {
    this.classList.remove('item-dragging');
    draggedItem = null;
    // Remove drag-over highlight from all containers
    $$('.grid-drag-over').forEach(el => el.classList.remove('grid-drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('grid-drag-over');

    if (!draggedItem) return;

    const containerType = this.dataset.type;
    const draggedType = toolsData.some(t => t.id === draggedItem.dataset.id) ? 'tools' : 'ai';

    // Prevent cross-category drops
    if (containerType !== draggedType) {
        e.dataTransfer.dropEffect = 'none';
        return;
    }

    // Find the card we're hovering closest to
    const afterElement = getClosestCard(this, e.clientX, e.clientY);
    if (afterElement) {
        this.insertBefore(draggedItem, afterElement);
    } else {
        this.appendChild(draggedItem);
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('grid-drag-over');
}

/**
 * Find the card closest to the cursor within a container
 */
function getClosestCard(container, x, y) {
    const cards = [...container.querySelectorAll('.tool-item:not(.item-dragging), .ai-item:not(.item-dragging)')];
    let closest = null;
    let minDistance = Infinity;

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance < minDistance) {
            minDistance = distance;
            closest = card;
        }
    });

    return closest;
}

// ============================================================
// 6. EDIT MODE TOGGLE
// ============================================================
function enterEditMode() {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    showToast('Edit mode enabled. Drag items to reorder, click × to delete.', 'info');
    renderAll();
}

function exitEditMode(saveChanges = true) {
    if (saveChanges) {
        // Extract order from DOM
        toolsData = extractOrderFromDOM(toolsContainer, toolsData);
        aiData = extractOrderFromDOM(aiContainer, aiData);
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
        saveToStorage(STORAGE_KEY_AI, aiData);
        showToast('Layout saved successfully!', 'success');
    }
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    saveBtn.style.display = 'none';
    editBtn.style.display = 'inline-flex';
    renderAll();
}

function extractOrderFromDOM(container, dataArray) {
    const cardElements = container.querySelectorAll('.tool-item, .ai-item');
    const ordered = [];
    cardElements.forEach(card => {
        const found = dataArray.find(item => item.id === card.dataset.id);
        if (found) ordered.push(found);
    });
    // Append any items not in DOM (shouldn't happen, but safety)
    dataArray.forEach(item => {
        if (!ordered.find(o => o.id === item.id)) ordered.push(item);
    });
    return ordered;
}

// ============================================================
// 7. MODAL HANDLERS
// ============================================================
function openAddModal() {
    $('#modalName').value = '';
    $('#modalUrl').value = '';
    $('#modalIcon').value = 'fas fa-link';
    $('#modalColor').value = '#3b82f6';
    $('#modalCategory').value = 'tools';
    // Reset color dot selection
    $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
    const firstDot = $('#colorPresets .color-dot[data-color="#3B82F6"]');
    if (firstDot) firstDot.classList.add('selected');
    addModal.classList.add('active');
    setTimeout(() => $('#modalName').focus(), 150);
}

function closeAddModal() {
    addModal.classList.remove('active');
}

function openDeleteModal(item, category) {
    itemToDelete = { item, category };
    deleteItemName.textContent = item.name;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    itemToDelete = null;
}

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

    // Validation
    if (!name) { showToast('Please enter a name.', 'error'); $('#modalName').focus(); return; }
    if (!url) { showToast('Please enter a URL.', 'error'); $('#modalUrl').focus(); return; }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        showToast('Please enter a valid URL (include http:// or https://).', 'error');
        $('#modalUrl').focus();
        return;
    }

    const newItem = {
        id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name,
        url,
        color,
        icon,
        stats: { usage: 'New', cost: '--' }
    };

    if (category === 'tools') {
        toolsData.push(newItem);
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
    } else {
        aiData.push(newItem);
        saveToStorage(STORAGE_KEY_AI, aiData);
    }

    showToast(`"${name}" added to ${category === 'tools' ? 'Tools' : 'AI Hub'}!`, 'success');
    closeAddModal();
    renderAll();

    // Scroll to new item
    setTimeout(() => {
        const container = category === 'tools' ? toolsContainer : aiContainer;
        const lastCard = container.lastElementChild;
        if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
}

// ============================================================
// 8. EXPORT / IMPORT / RESET
// ============================================================
function exportConfig() {
    const config = { tools: toolsData, ai: aiData, version: '2.0', exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-home-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration exported!', 'success');
}

function importConfig(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            if (!config.tools || !config.ai) throw new Error('Invalid format');
            toolsData = config.tools;
            aiData = config.ai;
            saveToStorage(STORAGE_KEY_TOOLS, toolsData);
            saveToStorage(STORAGE_KEY_AI, aiData);
            renderAll();
            showToast(`Imported ${toolsData.length} tools & ${aiData.length} AI items.`, 'success');
        } catch (err) {
            showToast('Invalid configuration file.', 'error');
        }
    };
    reader.readAsText(file);
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all shortcuts to defaults? This cannot be undone.')) {
        toolsData = JSON.parse(JSON.stringify(defaultTools));
        aiData = JSON.parse(JSON.stringify(defaultAI));
        saveToStorage(STORAGE_KEY_TOOLS, toolsData);
        saveToStorage(STORAGE_KEY_AI, aiData);
        if (isEditMode) exitEditMode(false);
        renderAll();
        showToast('Reset to defaults complete!', 'success');
    }
}

// ============================================================
// 9. SEARCH SYSTEM
// ============================================================
function performSearch() {
    const query = searchInput.value.trim();
    if (!query) { searchInput.focus(); return; }

    const searchUrls = {
        bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
    };

    window.open(searchUrls[currentSearchEngine], '_blank');
    searchInput.value = '';
    searchInput.focus();
}

function performLuckySearch() {
    const query = searchInput.value.trim();
    if (!query) { searchInput.focus(); return; }
    // "I'm Feeling Lucky" via Google
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`, '_blank');
    searchInput.value = '';
}

function setSearchEngine(engine) {
    currentSearchEngine = engine;
    $$('.engine-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = $(`.engine-btn[data-engine="${engine}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// ============================================================
// 10. TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    toastContainer.appendChild(toast);
    // Auto-remove after animation
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ============================================================
// 11. PARTICLE SYSTEM (for animation container)
// ============================================================
function createParticles() {
    if (!particlesContainer) return;
    particlesContainer.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 10) + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// ============================================================
// 12. CLOCK
// ============================================================
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
}

// ============================================================
// 13. EVENT LISTENERS
// ============================================================
function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', performSearch);
    luckyBtn.addEventListener('click', performLuckySearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
    });

    // Search engine buttons
    $$('.engine-btn').forEach(btn => {
        btn.addEventListener('click', () => setSearchEngine(btn.dataset.engine));
    });

    // Edit mode
    editBtn.addEventListener('click', enterEditMode);
    saveBtn.addEventListener('click', () => exitEditMode(true));

    // Add modal
    addBtn.addEventListener('click', openAddModal);
    $('#modalCloseBtn').addEventListener('click', closeAddModal);
    $('#cancelModalBtn').addEventListener('click', closeAddModal);
    $('#submitModalBtn').addEventListener('click', submitNewItem);
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) closeAddModal();
    });

    // Delete modal
    $('#deleteModalCloseBtn').addEventListener('click', closeDeleteModal);
    $('#cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    $('#confirmDeleteBtn').addEventListener('click', confirmDelete);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    // Export / Import / Reset
    exportBtn.addEventListener('click', exportConfig);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) importConfig(e.target.files[0]);
        importFileInput.value = '';
    });
    resetBtn.addEventListener('click', resetToDefaults);

    // Color presets in modal
    $$('#colorPresets .color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            $('#modalColor').value = this.dataset.color;
        });
    });

    // Sync color picker with dots
    $('#modalColor').addEventListener('input', function() {
        $$('#colorPresets .color-dot').forEach(d => d.classList.remove('selected'));
        const matching = $(`#colorPresets .color-dot[data-color="${this.value.toUpperCase()}"]`);
        if (matching) matching.classList.add('selected');
    });

    // Growing circle hover
    if (growingCircle) {
        growingCircle.addEventListener('mouseenter', () => {
            growingCircle.style.animationPlayState = 'paused';
        });
        growingCircle.addEventListener('mouseleave', () => {
            growingCircle.style.animationPlayState = 'running';
        });
    }

    // Card click feedback (scale effect)
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.tool-item, .ai-item');
        if (card && !isEditMode) {
            card.style.transform = 'scale(0.94)';
            setTimeout(() => { card.style.transform = ''; }, 180);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Close modals with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addModal.classList.contains('active')) closeAddModal();
            if (deleteModal.classList.contains('active')) closeDeleteModal();
            if (document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
        }
    });
}

function handleKeyboardShortcuts(e) {
    // Ctrl+E or Ctrl+Shift+E = toggle edit mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !e.shiftKey) {
        e.preventDefault();
        if (isEditMode) exitEditMode(true);
        else enterEditMode();
        return;
    }
    // Ctrl+S = save in edit mode
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditMode) {
        e.preventDefault();
        exitEditMode(true);
        return;
    }
    // Ctrl+N = add new item
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
        return;
    }
    // / = focus search (when not in input)
    if (e.key === '/' && document.activeElement !== searchInput &&
        !addModal.classList.contains('active') && !deleteModal.classList.contains('active')) {
        e.preventDefault();
        searchInput.focus();
        return;
    }
}


function init() {
    setupEventListeners();
    renderAll();
    createParticles();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    searchInput.focus();
    console.log('🚀 Smart Browser Home v2.0 initialized');
    console.log(`   ${toolsData.length} tools, ${aiData.length} AI items loaded`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}