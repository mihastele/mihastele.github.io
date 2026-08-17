/**
 * Main Application Logic for "Kdo da za pivo?" Decision Wheel
 */

// Color Swatch Palette
const memberColors = [
  '#f59e0b', '#3b82f6', '#10b981', '#ec4899',
  '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'
];

// Random Slovenian Beer Toasts for Winner Modal
const slovenianToasts = [
  "Na zdravje! 🍺",
  "Čin-čin! Za dobre prijatelje!",
  "Hvala za krog! 🍻",
  "Pivo bo še posebej sladko!",
  "Danes ne bomo žejni!",
  "Usoda je spregovorila!",
  "Pivo je rešeno!"
];

document.addEventListener('DOMContentLoaded', () => {
  // State Initialization
  let members = loadMembers();
  let history = loadHistory();

  // Initialize Wheel
  const wheel = new DecisionWheel('wheelCanvas', {
    onSpinComplete: (winner) => handleWinner(winner)
  });

  // Background Bubbles Animation Generator
  createBackgroundBubbles();

  // Initial UI Render
  renderMembersList();
  renderHistory();
  updateSoundUI();
  wheel.setMembers(members);

  // --- DOM Element References ---
  const addMemberForm = document.getElementById('addMemberForm');
  const memberNameInput = document.getElementById('memberNameInput');
  const memberWeightInput = document.getElementById('memberWeightInput');
  const spinBtn = document.getElementById('spinBtn');
  const bigSpinBtn = document.getElementById('bigSpinBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const clearAllMembersBtn = document.getElementById('clearAllMembersBtn');

  // Modal References
  const winnerModal = document.getElementById('winnerModal');
  const modalToast = document.getElementById('modalToast');
  const winnerNameBanner = document.getElementById('winnerNameBanner');
  const winnerStatsInfo = document.getElementById('winnerStatsInfo');
  const modalSpinAgainBtn = document.getElementById('modalSpinAgainBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const historyModal = document.getElementById('historyModal');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const closeHistoryFooterBtn = document.getElementById('closeHistoryFooterBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // --- Event Listeners ---

  // Add Member Handler
  function handleAddMember(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const name = (memberNameInput.value || '').trim();
    const weight = parseInt(memberWeightInput.value, 10) || 1;

    if (!name) {
      memberNameInput.focus();
      return;
    }

    const newMember = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6),
      name: name,
      weight: Math.max(1, Math.min(weight, 50)),
      active: true,
      color: memberColors[members.length % memberColors.length]
    };

    members.push(newMember);
    saveMembers();
    renderMembersList();
    wheel.setMembers(members);

    memberNameInput.value = '';
    memberWeightInput.value = '1';
    memberNameInput.focus();
  }

  addMemberForm.addEventListener('submit', handleAddMember);

  const addMemberBtn = document.getElementById('addMemberBtn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', (e) => {
      // If form doesn't automatically submit, trigger handleAddMember
      if (memberNameInput.value.trim()) {
        handleAddMember(e);
      }
    });
  }

  // Preset Buttons
  document.querySelectorAll('.btn-chip[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyPreset(preset);
    });
  });

  clearAllMembersBtn.addEventListener('click', () => {
    if (confirm('Ali res želiš izbrisati vse člane?')) {
      members = [];
      saveMembers();
      renderMembersList();
      wheel.setMembers(members);
    }
  });

  // Spin Actions
  spinBtn.addEventListener('click', triggerSpin);
  bigSpinBtn.addEventListener('click', triggerSpin);

  // Keyboard shortcut (Spacebar)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isInputFocused() && !winnerModal.classList.contains('hidden') === false) {
      e.preventDefault();
      triggerSpin();
    }
  });

  function triggerSpin() {
    const activeMembers = members.filter(m => m.active);
    if (activeMembers.length < 1) {
      alert('Prosimo, dodajte vsaj enega aktivnega člana za vrtenje kolesa!');
      return;
    }
    if (wheel.isSpinning) return;

    wheel.spin();
  }

  // Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    if (window.soundEngine) {
      window.soundEngine.toggleSound();
      updateSoundUI();
    }
  });

  function updateSoundUI() {
    const soundOn = window.soundEngine ? window.soundEngine.enabled : true;
    document.getElementById('soundOnIcon').classList.toggle('hidden', !soundOn);
    document.getElementById('soundOffIcon').classList.toggle('hidden', soundOn);
  }

  // History Modal Actions
  historyToggleBtn.addEventListener('click', () => {
    renderHistory();
    historyModal.classList.remove('hidden');
  });

  closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
  closeHistoryFooterBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
  
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Ali želiš počistiti celotno zgodovino?')) {
      history = [];
      saveHistory();
      renderHistory();
    }
  });

  // Winner Modal Actions
  modalSpinAgainBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
    triggerSpin();
  });

  modalCloseBtn.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
  });

  // --- Core Functions ---

  function handleWinner(winner) {
    // Record history entry
    const activeMembers = members.filter(m => m.active);
    const totalWeight = activeMembers.reduce((acc, m) => acc + Number(m.weight), 0);
    const probability = Math.round((winner.weight / totalWeight) * 100);

    const historyItem = {
      id: Date.now().toString(),
      name: winner.name,
      weight: winner.weight,
      totalWeight,
      probability,
      timestamp: new Date().toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString('sl-SI')
    };

    history.unshift(historyItem);
    saveHistory();
    renderHistory();

    // Populate Winner Modal UI
    const randomToast = slovenianToasts[Math.floor(Math.random() * slovenianToasts.length)];
    modalToast.textContent = randomToast;
    winnerNameBanner.textContent = winner.name;
    winnerStatsInfo.textContent = `Verjetnost izbire je bila ${probability}% (Teža ${winner.weight} od ${totalWeight})`;

    winnerModal.classList.remove('hidden');
  }

  function renderMembersList() {
    const listEl = document.getElementById('membersList');
    const memberCountText = document.getElementById('memberCountText');
    const activeMembers = members.filter(m => m.active);
    const totalWeight = activeMembers.reduce((acc, m) => acc + Number(m.weight), 0);

    memberCountText.textContent = `${activeMembers.length} aktivnih od ${members.length}`;
    listEl.innerHTML = '';

    if (members.length === 0) {
      listEl.innerHTML = `
        <li class="member-item disabled" style="justify-content: center; text-align: center; color: var(--text-dim); padding: 1.5rem;">
          Seznam je prazen. Vnesite ime zgoraj ali izberite prednastavitev.
        </li>
      `;
      return;
    }

    members.forEach((member, index) => {
      const li = document.createElement('li');
      li.className = `member-item ${!member.active ? 'disabled' : ''}`;

      const percentage = member.active && totalWeight > 0 
        ? Math.round((member.weight / totalWeight) * 100) 
        : 0;

      li.innerHTML = `
        <div class="member-info">
          <button class="btn-toggle-active" title="${member.active ? 'Onemogoči' : 'Omogoči'}" data-id="${member.id}">
            ${member.active ? '✅' : '⚪'}
          </button>
          <span class="color-swatch" style="background-color: ${member.color}; color: ${member.color}"></span>
          <div class="member-text-wrap">
            <span class="member-name" title="${escapeHTML(member.name)}">${escapeHTML(member.name)}</span>
            ${member.active ? `<span class="member-chance">(${percentage}%)</span>` : ''}
          </div>
        </div>
        <div class="member-controls">
          <div class="weight-adjuster">
            <button class="btn-adj btn-minus" data-id="${member.id}" title="Zmanjšaj težo" aria-label="Zmanjšaj">-</button>
            <span class="weight-val">${member.weight}</span>
            <button class="btn-adj btn-plus" data-id="${member.id}" title="Povečaj težo" aria-label="Povečaj">+</button>
          </div>
          <button class="btn-remove-member" data-id="${member.id}" title="Odstrani člana" aria-label="Odstrani">
            🗑️
          </button>
        </div>
      `;

      // Event handlers for list items
      li.querySelector('.btn-toggle-active').addEventListener('click', () => {
        member.active = !member.active;
        saveMembers();
        renderMembersList();
        wheel.setMembers(members);
      });

      li.querySelector('.btn-minus').addEventListener('click', () => {
        if (member.weight > 1) {
          member.weight--;
          saveMembers();
          renderMembersList();
          wheel.setMembers(members);
        }
      });

      li.querySelector('.btn-plus').addEventListener('click', () => {
        member.weight++;
        saveMembers();
        renderMembersList();
        wheel.setMembers(members);
      });

      li.querySelector('.btn-remove-member').addEventListener('click', () => {
        members = members.filter(m => m.id !== member.id);
        saveMembers();
        renderMembersList();
        wheel.setMembers(members);
      });

      listEl.appendChild(li);
    });
  }

  function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historySummary = document.getElementById('historySummary');
    const historyBadge = document.getElementById('historyBadge');

    historyBadge.textContent = history.length;
    historyList.innerHTML = '';
    historySummary.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = `
        <li class="history-item" style="justify-content: center; color: var(--text-dim); padding: 1.5rem;">
          Zgodovina je še prazna. Zavrtite kolesce!
        </li>
      `;
      return;
    }

    // Tally counter logic
    const tallies = {};
    history.forEach(item => {
      tallies[item.name] = (tallies[item.name] || 0) + 1;
    });

    Object.entries(tallies)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        const chip = document.createElement('div');
        chip.className = 'tally-chip';
        chip.innerHTML = `<span>🍺 ${escapeHTML(name)}:</span> <span class="tally-count">${count}x</span>`;
        historySummary.appendChild(chip);
      });

    // Detailed history items
    history.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = `
        <div>
          <span>Plačnik: </span><span class="history-name">${escapeHTML(item.name)}</span>
        </div>
        <div class="history-time">
          ${item.date} ob ${item.timestamp} (${item.probability}%)
        </div>
      `;
      historyList.appendChild(li);
    });
  }

  function applyPreset(presetType) {
    if (presetType === 'standard') {
      members = [
        { id: '1', name: 'Luka', weight: 3, active: true, color: memberColors[0] },
        { id: '2', name: 'Jan', weight: 2, active: true, color: memberColors[1] },
        { id: '3', name: 'Anja', weight: 2, active: true, color: memberColors[2] },
        { id: '4', name: 'Matej', weight: 3, active: true, color: memberColors[3] },
        { id: '5', name: 'Nika', weight: 2, active: true, color: memberColors[4] }
      ];
    } else if (presetType === 'equalize') {
      members.forEach(m => m.weight = 1);
    } else if (presetType === 'boss') {
      members = [
        { id: '101', name: '👑 Šef / Direktore', weight: 10, active: true, color: memberColors[0] },
        { id: '102', name: 'Miha', weight: 1, active: true, color: memberColors[1] },
        { id: '103', name: 'Tanja', weight: 1, active: true, color: memberColors[2] },
        { id: '104', name: 'David', weight: 1, active: true, color: memberColors[3] }
      ];
    }

    saveMembers();
    renderMembersList();
    wheel.setMembers(members);
  }

  function loadMembers() {
    const saved = localStorage.getItem('decisionWheel_members');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default initial list
    return [
      { id: '1', name: 'Luka', weight: 3, active: true, color: memberColors[0] },
      { id: '2', name: 'Jan', weight: 2, active: true, color: memberColors[1] },
      { id: '3', name: 'Anja', weight: 2, active: true, color: memberColors[2] },
      { id: '4', name: 'Matej', weight: 3, active: true, color: memberColors[3] },
      { id: '5', name: 'Nika', weight: 2, active: true, color: memberColors[4] }
    ];
  }

  function saveMembers() {
    localStorage.setItem('decisionWheel_members', JSON.stringify(members));
  }

  function loadHistory() {
    const saved = localStorage.getItem('decisionWheel_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  }

  function saveHistory() {
    localStorage.setItem('decisionWheel_history', JSON.stringify(history));
  }

  function isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function createBackgroundBubbles() {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;

    for (let i = 0; i < 18; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';

      const size = Math.floor(Math.random() * 16 + 6);
      const left = Math.random() * 100;
      const speed = (Math.random() * 12 + 10).toFixed(1);
      const delay = (Math.random() * 10).toFixed(1);

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.setProperty('--speed', `${speed}s`);
      bubble.style.animationDelay = `${delay}s`;

      container.appendChild(bubble);
    }
  }
});
