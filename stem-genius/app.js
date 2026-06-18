const MODELS = [
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nvidia Nemotron 3 Nano (temporary Free)', vision: true, free: true },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', vision: true, free: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)', vision: true, free: true },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (Free)', vision: true, free: true },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (Free)', vision: true, free: true },
  { id: 'qwen/qwen3-235b-a22b', name: 'Qwen3 235B', vision: false, free: false },
  { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', vision: true, free: false },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', vision: false, free: false },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', vision: true, free: false },
  { id: 'openai/gpt-4o', name: 'GPT-4o', vision: true, free: false },
  { id: 'openai/o3-mini', name: 'o3-mini', vision: false, free: false },
  { id: 'qwen/qwen3-vl-32b-instruct', name: 'Qwen 3 Vision 32BN', vision: true, free: false },
];

const SYSTEM_PROMPT = `You are STEM Genius, an expert AI tutor specializing in mathematics, physics, chemistry, and engineering. Your role is to help students understand and solve problems across all STEM subjects with clarity and precision.

CRITICAL FORMATTING RULES — always follow these:
1. Use LaTeX for ALL mathematical expressions:
   - Inline math: wrap with single dollar signs → $E = mc^2$
   - Display/block math: wrap with double dollar signs → $$\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$$
2. NEVER use Unicode math symbols (like ², ∫, ∑, etc.) when LaTeX is more appropriate — prefer LaTeX.
3. For code, use fenced code blocks with the language specified: \`\`\`python
4. Break complex solutions into numbered steps.
5. After solving, verify your answer when possible.
6. When a user sends an image, carefully analyze it, identify the problem, and solve it step-by-step.

Remember: beautiful math rendering depends on your LaTeX. Always use proper LaTeX notation so formulas render correctly.`;

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

let state = {
  apiKey: localStorage.getItem('stemgenius_api_key') || '',
  model: localStorage.getItem('stemgenius_model') || MODELS[0].id,
  customVision: false,
  messages: [],
  isStreaming: false,
  pendingImage: null,
  pendingImageName: null,
  abortController: null,
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  populateModelSelect();
  restoreSettings();
  setupEventListeners();
  updateModelInfo();
  focusInput();
}

function populateModelSelect() {
  var select = document.getElementById('modelSelect');
  select.innerHTML = '';
  MODELS.forEach(function(m) {
    var opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
  var customOpt = document.createElement('option');
  customOpt.value = '__custom__';
  customOpt.textContent = '✏ Custom model…';
  select.appendChild(customOpt);
}

function restoreSettings() {
  var apiKeyInput = document.getElementById('apiKeyInput');
  var modelSelect = document.getElementById('modelSelect');
  var customModelInput = document.getElementById('customModelInput');
  var customModelVision = document.getElementById('customModelVision');
  if (state.apiKey) apiKeyInput.value = state.apiKey;

  var isPreset = MODELS.some(function(m) { return m.id === state.model; });
  if (isPreset) {
    modelSelect.value = state.model;
  } else if (state.model) {
    modelSelect.value = '__custom__';
    customModelInput.value = state.model;
    var customData = JSON.parse(localStorage.getItem('stemgenius_custom_model') || '{}');
    customModelVision.checked = customData.vision || false;
    document.getElementById('customModelGroup').style.display = 'block';
  }

  if (state.customVision) {
    customModelVision.checked = true;
  }

  updateModelBadge();
}

function setupEventListeners() {
  var apiKeyInput = document.getElementById('apiKeyInput');
  var modelSelect = document.getElementById('modelSelect');
  var customModelInput = document.getElementById('customModelInput');
  var customModelVision = document.getElementById('customModelVision');
  var customModelGroup = document.getElementById('customModelGroup');

  apiKeyInput.addEventListener('input', debounce(function() {
    state.apiKey = apiKeyInput.value.trim();
    localStorage.setItem('stemgenius_api_key', state.apiKey);
  }, 500));

  modelSelect.addEventListener('change', function() {
    if (modelSelect.value === '__custom__') {
      customModelGroup.style.display = 'block';
      customModelInput.focus();
      var savedCustom = localStorage.getItem('stemgenius_model');
      var isPreset = MODELS.some(function(m) { return m.id === savedCustom; });
      if (!isPreset && savedCustom) {
        customModelInput.value = savedCustom;
      }
      var customData = JSON.parse(localStorage.getItem('stemgenius_custom_model') || '{}');
      customModelVision.checked = customData.vision || false;
    } else {
      customModelGroup.style.display = 'none';
      state.model = modelSelect.value;
      state.customVision = false;
      localStorage.setItem('stemgenius_model', state.model);
      updateModelBadge();
      updateModelInfo();
    }
  });

  customModelInput.addEventListener('input', debounce(function() {
    var val = customModelInput.value.trim();
    if (val) {
      state.model = val;
      localStorage.setItem('stemgenius_model', val);
      localStorage.setItem('stemgenius_custom_model', JSON.stringify({
        id: val,
        vision: customModelVision.checked
      }));
      updateModelBadge();
      updateModelInfo();
    }
  }, 400));

  customModelVision.addEventListener('change', function() {
    state.customVision = customModelVision.checked;
    localStorage.setItem('stemgenius_custom_model', JSON.stringify({
      id: state.model,
      vision: customModelVision.checked
    }));
    updateModelInfo();
  });

  document.getElementById('messageInput').addEventListener('paste', function(e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/') === 0) {
        e.preventDefault();
        processImageFile(items[i].getAsFile());
        break;
      }
    }
  });
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function updateModelBadge() {
  var model = MODELS.find(function(m) { return m.id === state.model; });
  if (model) {
    document.getElementById('modelBadge').textContent = model.name;
  } else {
    document.getElementById('modelBadge').textContent = state.model;
  }
}

function getEffectiveModel() {
  var model = MODELS.find(function(m) { return m.id === state.model; });
  if (model) return model;
  return { id: state.model, name: state.model, vision: state.customVision, free: false };
}

function updateModelInfo() {
  var model = getEffectiveModel();
  var info = document.getElementById('modelInfo');
  var isCustom = !MODELS.some(function(m) { return m.id === state.model; });

  var html = '<strong>' + escapeHtml(model.name) + '</strong>';
  if (isCustom) {
    html += ' <span style="color:var(--accent); font-size:11px; font-weight:500;">Custom</span>';
  }
  html += '<div style="margin-top:6px;">';
  if (model.vision) html += '<span class="vision-badge">📷 Vision</span>';
  if (model.free) html += '<span class="free-badge">✦ Free tier</span>';
  html += '</div>';
  info.innerHTML = html;

  var attachBtn = document.getElementById('attachBtn');
  attachBtn.style.opacity = model.vision ? '1' : '0.4';
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  const icon = document.getElementById('apiKeyToggleIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🔒';
  } else {
    input.type = 'password';
    icon.textContent = '👁';
  }
}

function newChat() {
  state.messages = [];
  const messagesEl = document.getElementById('messages');
  messagesEl.innerHTML = '';
  const welcome = createWelcomeHTML();
  messagesEl.innerHTML = welcome;
  state.pendingImage = null;
  state.pendingImageName = null;
  document.getElementById('imagePreview').style.display = 'none';
  focusInput();
}

function createWelcomeHTML() {
  return '<div class="welcome" id="welcome">' +
    '<div class="welcome-icon">∑</div>' +
    '<h2>Welcome to STEM Genius</h2>' +
    '<p>Your AI tutor for mathematics, physics, chemistry &amp; engineering.</p>' +
    '<p class="welcome-hint">Beautiful math rendering · Vision support · Step-by-step solutions</p>' +
    '<div class="suggestions">' +
      '<button class="suggestion-btn" onclick="useSuggestion(\'Explain the derivation of the quadratic formula step by step\')">' +
        '<span class="suggestion-icon">📐</span> Derive the quadratic formula' +
      '</button>' +
      '<button class="suggestion-btn" onclick="useSuggestion(\'Solve the integral: ∫(sin²x)dx\')">' +
        '<span class="suggestion-icon">∫</span> Solve ∫sin²(x)dx' +
      '</button>' +
      '<button class="suggestion-btn" onclick="useSuggestion(\'Explain Schrödinger\\\'s equation and its physical meaning\')">' +
        '<span class="suggestion-icon">⚛</span> Schrödinger\'s equation' +
      '</button>' +
      '<button class="suggestion-btn" onclick="useSuggestion(\'Derive Newton\\\'s laws of motion from first principles\')">' +
        '<span class="suggestion-icon">🍎</span> Newton\'s laws' +
      '</button>' +
    '</div>' +
  '</div>';
}

function useSuggestion(text) {
  document.getElementById('messageInput').value = text;
  autoResize(document.getElementById('messageInput'));
  sendMessage();
}

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
}

function focusInput() {
  setTimeout(function() { document.getElementById('messageInput').focus(); }, 100);
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  processImageFile(file);
  e.target.value = '';
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) return;
  if (file.size > 20 * 1024 * 1024) {
    alert('Image must be under 20 MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(ev) {
    state.pendingImage = ev.target.result;
    state.pendingImageName = file.name;
    var preview = document.getElementById('imagePreview');
    document.getElementById('previewImg').src = ev.target.result;
    document.getElementById('previewLabel').textContent = file.name;
    preview.style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  state.pendingImage = null;
  state.pendingImageName = null;
  document.getElementById('imagePreview').style.display = 'none';
}

async function sendMessage() {
  if (state.isStreaming) {
    state.abortController?.abort();
    return;
  }

  var input = document.getElementById('messageInput');
  var text = input.value.trim();
  if (!text && !state.pendingImage) return;

  if (!state.apiKey) {
    toggleSidebar();
    document.getElementById('apiKeyInput').focus();
    return;
  }

  var welcome = document.getElementById('welcome');
  if (welcome) welcome.remove();

  var userContent = buildUserContent(text);
  state.messages.push({ role: 'user', content: userContent });

  appendUserMessage(text, state.pendingImage);

  input.value = '';
  input.style.height = 'auto';

  removeImage();

  setStreaming(true);

  var assistantMsgEl = createAssistantMessage();
  var bodyEl = assistantMsgEl.querySelector('.message-body');

  try {
    var fullContent = await streamResponse(bodyEl);
    state.messages.push({ role: 'assistant', content: fullContent });
    bodyEl.innerHTML = renderMarkdownWithMath(fullContent);
    addCopyButtons(bodyEl);
    highlightCodeBlocks(bodyEl);
  } catch (err) {
    if (err.name === 'AbortError') {
      bodyEl.innerHTML = '<em style="color:var(--text-tertiary)">Stopped</em>';
    } else {
      bodyEl.innerHTML = '<div class="error-message"><div class="error-title">Error</div>' + escapeHtml(err.message) + '</div>';
    }
  }

  setStreaming(false);
  scrollToBottom();
}

function buildUserContent(text) {
  if (state.pendingImage) {
    return [
      { type: 'text', text: text || 'Please solve the problem shown in this image.' },
      { type: 'image_url', image_url: { url: state.pendingImage } },
    ];
  }
  return text;
}

function appendUserMessage(text, imageUrl) {
  var messagesEl = document.getElementById('messages');
  var div = document.createElement('div');
  div.className = 'message user';

  var imageHtml = '';
  if (imageUrl) {
    imageHtml = '<div class="message-image-container"><img src="' + escapeAttr(imageUrl) + '" class="message-image" onclick="showImageOverlay(this.src)" alt="Uploaded image"></div>';
  }

  div.innerHTML =
    '<div class="message-avatar">👤</div>' +
    '<div class="message-content">' +
      '<div class="message-header">' +
        '<span class="message-role">You</span>' +
      '</div>' +
      '<div class="message-body">' + imageHtml + escapeHtml(text || 'Image uploaded') + '</div>' +
    '</div>';
  messagesEl.appendChild(div);
  scrollToBottom();
}

function createAssistantMessage() {
  var messagesEl = document.getElementById('messages');
  var div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'streaming-message-wrapper';
  div.innerHTML =
    '<div class="message-avatar">∑</div>' +
    '<div class="message-content">' +
      '<div class="message-header">' +
        '<span class="message-role">STEM Genius</span>' +
      '</div>' +
      '<div class="message-body" id="streaming-body">' +
        '<div class="typing-indicator"><span></span><span></span><span></span></div>' +
      '</div>' +
    '</div>';
  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

async function streamResponse(bodyEl) {
  state.abortController = new AbortController();

  var apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ].concat(state.messages);

  var response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.apiKey,
      'HTTP-Referer': window.location.href,
      'X-Title': 'STEM Genius',
    },
    body: JSON.stringify({
      model: state.model,
      messages: apiMessages,
      stream: true,
      max_tokens: 4096,
    }),
    signal: state.abortController.signal,
  });

  if (!response.ok) {
    var errBody = await response.json().catch(function() { return {}; });
    throw new Error(errBody.error?.message || 'API error: ' + response.status + ' ' + response.statusText);
  }

  var reader = response.body.getReader();
  var decoder = new TextDecoder();
  var buffer = '';
  var fullContent = '';
  var renderTimer = null;

  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function() {
      try {
        bodyEl.innerHTML = renderMarkdownWithMath(fullContent);
      } catch (e) {
        bodyEl.innerHTML = '<p>' + escapeHtml(fullContent).replace(/\n/g, '<br>') + '</p>';
      }
      scrollToBottom();
    }, 80);
  }

  while (true) {
    var result = await reader.read();
    if (result.done) break;

    buffer += decoder.decode(result.value, { stream: true });
    var lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (var i = 0; i < lines.length; i++) {
      var trimmed = lines[i].trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.indexOf('data: ') !== 0) continue;

      try {
        var parsed = JSON.parse(trimmed.slice(6));
        var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
        if (delta) {
          fullContent += delta;
          scheduleRender();
        }
      } catch (e) {}
    }
  }

  if (renderTimer) clearTimeout(renderTimer);
  return fullContent;
}

function setStreaming(streaming) {
  state.isStreaming = streaming;
  var btn = document.getElementById('sendBtn');
  if (streaming) {
    btn.classList.add('streaming');
    btn.title = 'Stop generating';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>';
  } else {
    btn.classList.remove('streaming');
    btn.title = 'Send message';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
  }
}

function renderMarkdownWithMath(text) {
  if (!text) return '';

  var mathBlocks = [];
  var processed = text;

  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
    mathBlocks.push({ formula: formula.trim(), display: true });
    return 'MATHBLOCK' + (mathBlocks.length - 1) + 'ENDMATH';
  });

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, function(match, formula) {
    mathBlocks.push({ formula: formula.trim(), display: true });
    return 'MATHBLOCK' + (mathBlocks.length - 1) + 'ENDMATH';
  });

  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, function(match, formula) {
    mathBlocks.push({ formula: formula.trim(), display: false });
    return 'MATHBLOCK' + (mathBlocks.length - 1) + 'ENDMATH';
  });

  processed = processed.replace(/\$([^\$\n]+?)\$/g, function(match, formula) {
    mathBlocks.push({ formula: formula.trim(), display: false });
    return 'MATHBLOCK' + (mathBlocks.length - 1) + 'ENDMATH';
  });

  var html;
  try {
    html = marked.parse(processed, { breaks: true, gfm: true });
  } catch (e) {
    html = '<p>' + escapeHtml(processed).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
  }

  html = html.replace(/<p>\s*MATHBLOCK(\d+)ENDMATH\s*<\/p>/g, 'MATHBLOCK$1ENDMATH');
  html = html.replace(/<li>\s*MATHBLOCK(\d+)ENDMATH\s*<\/li>/g, '<li>MATHBLOCK$1ENDMATH</li>');

  for (var i = 0; i < mathBlocks.length; i++) {
    var block = mathBlocks[i];
    var placeholder = 'MATHBLOCK' + i + 'ENDMATH';
    try {
      var rendered = katex.renderToString(block.formula, {
        displayMode: block.display,
        throwOnError: false,
        trust: true,
      });
      if (block.display) {
        html = html.replace(placeholder,
          '<div class="math-display" data-latex="' + escapeAttr(block.formula) + '">' +
            rendered +
          '</div>'
        );
      } else {
        html = html.replace(placeholder, '<span class="math-inline">' + rendered + '</span>');
      }
    } catch (e) {
      html = html.replace(placeholder, '<code>' + escapeHtml(block.formula) + '</code>');
    }
  }

  return html;
}

function addCopyButtons(container) {
  container.querySelectorAll('pre').forEach(function(pre) {
    if (pre.querySelector('.copy-btn')) return;
    var code = pre.querySelector('code');
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.title = 'Copy code';
    btn.textContent = 'Copy';
    btn.onclick = function() {
      var text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    };
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });

  container.querySelectorAll('.math-display').forEach(function(mathBlock) {
    if (mathBlock.querySelector('.copy-btn')) return;
    var latex = mathBlock.getAttribute('data-latex');
    if (!latex) return;
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.title = 'Copy LaTeX';
    btn.textContent = 'Copy';
    btn.onclick = function() {
      var rawLatex = decodeHtmlEntities(latex);
      navigator.clipboard.writeText(rawLatex).then(function() {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    };
    mathBlock.appendChild(btn);
  });
}

function highlightCodeBlocks(container) {
  container.querySelectorAll('pre code').forEach(function(block) {
    hljs.highlightElement(block);
  });
}

function showImageOverlay(src) {
  var overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  overlay.innerHTML = '<img src="' + escapeAttr(src) + '" alt="Full size image">';
  overlay.onclick = function() { overlay.remove(); };
  document.body.appendChild(overlay);
}

function scrollToBottom() {
  var el = document.getElementById('messages');
  requestAnimationFrame(function() {
    el.scrollTop = el.scrollHeight;
  });
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;');
}

function decodeHtmlEntities(text) {
  var textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function clearChat() {
  newChat();
}