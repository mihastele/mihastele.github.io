document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DUMMY DATABASE (10 Models) ---
    const modelsData = [
        {
            id: 'mistral-7b',
            title: 'Mistral-7B-v0.1',
            provider: 'Mistral AI',
            license: 'Apache 2.0',
            desc: 'A 7-billion-parameter language model engineered for superior performance and efficiency. Fully open source.',
            task: 'Text Generation',
            params: '3B - 10B',
            language: 'English',
            iconClass: '',
            updated: '2 days ago'
        },
        {
            id: 'olmo-7b',
            title: 'OLMo-7B',
            provider: 'Allen AI',
            license: 'Apache 2.0',
            desc: 'A truly open language model with open data, open code, and open weights. Designed for advancing research.',
            task: 'Text Generation',
            params: '3B - 10B',
            language: 'English',
            iconClass: 'alt-icon-1',
            updated: '1 week ago'
        },
        {
            id: 'pythia-12b',
            title: 'Pythia-12B',
            provider: 'EleutherAI',
            license: 'Apache 2.0',
            desc: 'A suite of models designed to facilitate interpretability research, trained on public data with full checkpoints.',
            task: 'Interpretability',
            params: '10B - 40B',
            language: 'English',
            iconClass: 'alt-icon-2',
            updated: '1 month ago'
        },
        {
            id: 'falcon-40b',
            title: 'Falcon-40B',
            provider: 'TII',
            license: 'Apache 2.0',
            desc: 'A highly performant foundational LLM trained on a massive web dataset. Fully open source and commercially viable.',
            task: 'Text Generation',
            params: '10B - 40B',
            language: 'Multilingual',
            iconClass: 'alt-icon-3',
            updated: '3 weeks ago'
        },
        {
            id: 'llama-3-8b',
            title: 'Llama-3-8B',
            provider: 'Meta',
            license: 'Llama 3',
            desc: 'A powerful 8B parameter model from Meta, highly capable in text generation and instruction following.',
            task: 'Text Generation',
            params: '3B - 10B',
            language: 'English',
            iconClass: '',
            updated: '5 days ago'
        },
        {
            id: 'qwen-1.5-7b',
            title: 'Qwen1.5-7B',
            provider: 'Alibaba',
            license: 'Apache 2.0',
            desc: 'A robust multilingual model with strong general capabilities, open-sourced under Apache 2.0.',
            task: 'Text Generation',
            params: '3B - 10B',
            language: 'Multilingual',
            iconClass: 'alt-icon-1',
            updated: '1 month ago'
        },
        {
            id: 'starcoder-15b',
            title: 'StarCoder-15B',
            provider: 'BigCode',
            license: 'Apache 2.0',
            desc: 'A state-of-the-art fully open code generation model trained on 80+ programming languages.',
            task: 'Code Generation',
            params: '10B - 40B',
            language: 'English',
            iconClass: 'alt-icon-2',
            updated: '2 months ago'
        },
        {
            id: 'bloom-176b',
            title: 'BLOOM',
            provider: 'BigScience',
            license: 'Apache 2.0', // simplified for demo
            desc: 'A massive 176B parameter open-access multilingual language model created by hundreds of researchers.',
            task: 'Text Generation',
            params: '> 40B',
            language: 'Multilingual',
            iconClass: 'alt-icon-3',
            updated: '1 year ago'
        },
        {
            id: 'nllb-200',
            title: 'NLLB-200',
            provider: 'Meta',
            license: 'MIT',
            desc: 'A machine translation model capable of translating directly between 200 different languages.',
            task: 'Translation',
            params: '10B - 40B',
            language: 'Multilingual',
            iconClass: '',
            updated: '6 months ago'
        },
        {
            id: 'slo-t5',
            title: 'Slo-T5-Base',
            provider: 'CJVT',
            license: 'MIT',
            desc: 'A sequence-to-sequence model optimized for standard Slovenian natural language processing tasks like summarization.',
            task: 'Summarization',
            params: '< 3B',
            language: 'Slovenian',
            iconClass: 'alt-icon-1',
            updated: '2 weeks ago'
        }
    ];

    // --- 2. FACETED SEARCH LOGIC ---
    const traditionalResultsGrid = document.getElementById('traditional-results');
    const resultsCountSpan = document.getElementById('results-count');
    const checkboxes = document.querySelectorAll('.sidebar.filters input[type="checkbox"]');
    const searchInput = document.getElementById('traditional-search-input');

    function renderModels(models) {
        traditionalResultsGrid.innerHTML = '';
        resultsCountSpan.textContent = `Showing ${models.length} results`;

        if (models.length === 0) {
            traditionalResultsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--clr-text-muted);">No models match your filters.</p>';
            return;
        }

        models.forEach(model => {
            const iconHTML = model.iconClass ? `<div class="model-icon ${model.iconClass}"><i class="fa-solid fa-cube"></i></div>` : `<div class="model-icon"><i class="fa-solid fa-language"></i></div>`;

            const cardHTML = `
                <div class="model-card">
                    <div class="card-header">
                        ${iconHTML}
                        <div class="model-title-group">
                            <h3 class="model-title">${model.title}</h3>
                            <span class="provider">${model.provider}</span>
                        </div>
                        <div class="badge badge-license">${model.license}</div>
                    </div>
                    <p class="model-desc">${model.desc}</p>
                    <div class="card-tags">
                        <span class="tag">${model.task}</span>
                        <span class="tag">${model.params}</span>
                        <span class="tag">${model.language}</span>
                    </div>
                    <div class="card-footer">
                        <span class="update-time"><i class="fa-regular fa-clock"></i> Updated ${model.updated}</span>
                        <button class="btn-primary btn-sm">View Model Card</button>
                    </div>
                </div>
            `;
            traditionalResultsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    function applyFilters() {
        // Collect active filters
        const activeFilters = {
            task: [],
            license: [],
            parameters: [],
            language: []
        };

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const facet = cb.getAttribute('data-facet');
                const val = cb.getAttribute('value');
                if (facet && activeFilters[facet]) {
                    activeFilters[facet].push(val);
                }
            }
        });

        const query = searchInput.value.toLowerCase().trim();

        const filtered = modelsData.filter(model => {
            // Text search
            if (query && !model.title.toLowerCase().includes(query) && !model.desc.toLowerCase().includes(query) && !model.provider.toLowerCase().includes(query)) {
                return false;
            }

            // Facet filtering (OR within group, AND across groups)
            if (activeFilters.task.length > 0 && !activeFilters.task.includes(model.task)) return false;
            if (activeFilters.license.length > 0 && !activeFilters.license.includes(model.license)) return false;
            if (activeFilters.parameters.length > 0 && !activeFilters.parameters.includes(model.params)) return false;
            if (activeFilters.language.length > 0 && !activeFilters.language.includes(model.language)) return false;

            return true;
        });

        renderModels(filtered);
    }

    // Attach listeners
    checkboxes.forEach(cb => cb.addEventListener('change', applyFilters));
    searchInput.addEventListener('input', applyFilters);

    // Initial render
    applyFilters();


    // --- 3. VIEW TOGGLING ---
    const btnTraditional = document.getElementById('btn-traditional');
    const btnAgentic = document.getElementById('btn-agentic');
    const viewTraditional = document.getElementById('view-traditional');
    const viewAgentic = document.getElementById('view-agentic');

    function switchView(viewName) {
        if (viewName === 'traditional') {
            btnTraditional.classList.add('active');
            btnAgentic.classList.remove('active');
            viewTraditional.classList.add('active');
            viewAgentic.classList.remove('active');
        } else {
            btnAgentic.classList.add('active');
            btnTraditional.classList.remove('active');
            viewAgentic.classList.add('active');
            viewTraditional.classList.remove('active');
            document.getElementById('agent-input').focus();
        }
    }

    btnTraditional.addEventListener('click', () => switchView('traditional'));
    btnAgentic.addEventListener('click', () => switchView('agentic'));

    // --- Search Suggestion UI ---
    const querySuggestions = document.getElementById('query-suggestions');
    searchInput.addEventListener('focus', () => { querySuggestions.style.display = 'block'; });
    searchInput.addEventListener('blur', () => { setTimeout(() => { querySuggestions.style.display = 'none'; }, 200); });
    querySuggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            searchInput.value = item.textContent.trim();
            querySuggestions.style.display = 'none';
            applyFilters();
        }
    });

    // --- 4. AGENTIC SEARCH WITH OPENROUTER ---
    const agentInput = document.getElementById('agent-input');
    const agentSendBtn = document.getElementById('agent-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const apiKeyInput = document.getElementById('api-key-input');

    // Load API Key from local storage if exists
    const storedKey = localStorage.getItem('openrouter_key');
    if (storedKey) {
        apiKeyInput.value = storedKey;
    }

    apiKeyInput.addEventListener('change', (e) => {
        localStorage.setItem('openrouter_key', e.target.value.trim());
    });

    // Conversation History for context
    let chatHistory = [
        {
            role: "system",
            content: "You are the LLMs4EU Assistant, a helpful catalogue agent. Briefly guide the user to find language models based on their needs. The database only contains: Mistral-7B, OLMo-7B, Pythia-12B, Falcon-40B, Llama-3-8B, Qwen1.5-7B, StarCoder-15B, BLOOM, NLLB-200, Slo-T5-Base. Keep responses short and conversational. When you have enough requirements to recommend one of these models, make a recommendation."
        }
    ];

    async function handleSend() {
        const text = agentInput.value.trim();
        if (!text) return;
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            addUserMessage(text);
            addAIMessage("Please provide your OpenRouter API Key in the upper right input field first.");
            agentInput.value = '';
            return;
        }

        // Add user message
        addUserMessage(text);
        agentInput.value = '';
        chatHistory.push({ role: "user", content: text });

        // Trigger AI reply
        showTypingIndicator();

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": window.location.href, // Optional, for OpenRouter rankings
                    "X-Title": "LLMs4EU Demo", // Optional
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "nvidia/nemotron-nano-12b-v2-vl:free", // using a reliable free model
                    "messages": chatHistory
                })
            });

            removeTypingIndicator();

            if (!response.ok) {
                const errResult = await response.json();
                console.error(errResult);
                addAIMessage("Error reaching OpenRouter API. Please check your API key or try again later.");
                return;
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content;

            chatHistory.push({ role: "assistant", content: aiText });
            addAIMessage(aiText);

        } catch (err) {
            console.error(err);
            removeTypingIndicator();
            addAIMessage("Failed to reach the API. Check the console for networking errors.");
        }
    }

    agentSendBtn.addEventListener('click', handleSend);
    agentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message user-message';
        msg.innerHTML = `
            <div class="msg-avatar">U</div>
            <div class="msg-content"><p>${escapeHTML(text)}</p></div>
        `;
        chatMessages.appendChild(msg);
        scrollToBottom();
    }

    function addAIMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'message ai-message';
        // Basic markdown bold/italic parsing for nicer output
        let formattedText = escapeHTML(text)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        msg.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-content"><p>${formattedText}</p></div>
        `;
        chatMessages.appendChild(msg);
        scrollToBottom();
    }

    const typingId = 'typing-indicator-active';
    function showTypingIndicator() {
        const msg = document.createElement('div');
        msg.className = 'message ai-message';
        msg.id = typingId;
        msg.innerHTML = `
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-content">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(msg);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.remove();
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
});
