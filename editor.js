/**
 * PortfolioEditor - Web-editable portfolio template engine
 * Makes the portfolio fully editable by non-developers.
 *
 * Features:
 *  - Edit mode toggle (floating button)
 *  - Inline text editing (contenteditable)
 *  - Image upload/generate overlays
 *  - Add/remove skills, projects, contacts, social links
 *  - localStorage persistence
 *  - Export as self-contained HTML file
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════
  let isEditMode = false;
  let isDeploying = false;
  let saveTimeout = null;
  const STORAGE_KEY = 'portfolio_template_data';

  const MIN_COUNTS = { skill: 3, contact: 1, project: 0, social: 0 };
  const SELECTORS = {
    skill: '.service-item',
    project: '.project-item',
    contact: '.contact-item',
    social: '.social-item'
  };

  // ═══════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════
  function init() {
    loadSavedData();
    createEditorUI();
    addSectionButtons();
    setupGlobalListeners();
    updateProjectsVisibility();
  }

  // ═══════════════════════════════════════
  // CREATE EDITOR UI
  // ═══════════════════════════════════════
  function createEditorUI() {
    // ── Edit toggle button (always visible) ──
    const toggle = document.createElement('button');
    toggle.id = 'edit-toggle-btn';
    toggle.innerHTML = '<span class="icon">✏️</span><span class="btn-text">Edit</span>';
    toggle.title = 'Toggle Edit Mode';
    toggle.addEventListener('click', toggleEditMode);
    document.body.appendChild(toggle);

    const exportBtn = document.createElement('button');
    exportBtn.id = 'export-btn';
    exportBtn.innerHTML = '<span class="icon">📦</span><span class="btn-text">Export</span>';
    exportBtn.title = 'Export Portfolio';
    exportBtn.addEventListener('click', exportAsZip);
    document.body.appendChild(exportBtn);

    const deployBtn = document.createElement('button');
    deployBtn.id = 'deploy-btn';
    deployBtn.innerHTML = '<span class="icon">🚀</span><span class="btn-text">Deploy</span>';
    deployBtn.title = '1-Click Deploy to Web';
    deployBtn.addEventListener('click', deployToNetlify);
    document.body.appendChild(deployBtn);

    const openLiveBtn = document.createElement('button');
    openLiveBtn.id = 'open-live-btn';
    openLiveBtn.innerHTML = '<span class="icon">🔗</span><span class="btn-text">Visit</span>';
    openLiveBtn.title = 'Visit Live Portfolio';
    
    // Only show if there's an existing deployment
    const savedLiveUrl = localStorage.getItem('NETLIFY_SITE_URL');
    if (savedLiveUrl && !isEditMode) {
      openLiveBtn.style.display = 'flex';
      openLiveBtn.onclick = () => window.open(savedLiveUrl, '_blank');
    } else {
      openLiveBtn.style.display = 'none';
    }
    document.body.appendChild(openLiveBtn);

    // ── Guide button (bottom-left) ──
    const guideBtn = document.createElement('button');
    guideBtn.id = 'guide-toggle-btn';
    guideBtn.innerHTML = '<span class="icon">❓</span><span class="btn-text">Guide</span>';
    guideBtn.title = 'User Guide';
    guideBtn.addEventListener('click', showGuide);
    document.body.appendChild(guideBtn);

    // ── Guide Modal ──
    const guideModal = document.createElement('div');
    guideModal.id = 'guide-modal';
    guideModal.innerHTML = `
      <div class="guide-modal-content">
        <button class="guide-close">&times;</button>
        <div class="guide-header">
          <h1>👋 Welcome to your Portfolio!</h1>
          <p>Let's walk you through how to personalize and launch your new website.</p>
        </div>
        
        <div class="guide-sections">
          <section>
            <h3>✏️ How to Edit</h3>
            <p>Click the <strong>Edit</strong> button at the bottom-right. Once active, you can click on any text to type your own details, or hover over images to upload your own photos and icons!</p>
          </section>

          <section>
            <h3>📦 Exporting</h3>
            <p>The <strong>Export</strong> button downloads your entire portfolio code as a <code>.zip</code> file. This is perfect for keeping a backup or manually hosting it anywhere you like. For e.g > GitHub pages.</p>
          </section>

          <section class="deployment-section">
            <h2 class="guide-main-heading">🚀 Deployment</h2>
            <p class="guide-sub-heading">Make your customize website live in seconds.</p>
            
            <div class="steps-container">
              <div class="guide-step">
                <div class="step-text">
                  <span>1</span>
                  <p>First, open the <strong>Deploy</strong> drawer. You'll see a link to get your <strong>Personal Access Token</strong>. This token lets our site talk to Netlify securely.</p>
                </div>
                <img src="./img/guide/step1.png" alt="Step 1" onerror="this.style.display='none'">
              </div>

              <div class="guide-step">
                <div class="step-text">
                  <span>2</span>
                  <p>Sign up with any account / Log in to your Netlify account, and you'll find the <strong>"New access token"</strong> button. Click it to start creating your key.</p>
                </div>
                <img src="./img/guide/step2.png" alt="Step 2" onerror="this.style.display='none'">
              </div>

              <div class="guide-step">
                <div class="step-text">
                  <span>3</span>
                  <p>Give your token a descriptive name (like "Portfolio") and select its validity. <br><b>Note: Your site deployment tool stays active only as long as this token is valid!</b></p>
                </div>
                <img src="./img/guide/step3.png" alt="Step 3" onerror="this.style.display='none'">
              </div>

              <div class="guide-step">
                <div class="step-text">
                  <span>4</span>
                  <p>Once generated, click the <strong>Copy</strong> icon next to your token. Keep this safe—you won't be able to see it again!</p>
                </div>
                <img src="./img/guide/step4.png" alt="Step 4" onerror="this.style.display='none'">
              </div>

              <div class="guide-step">
                <div class="step-text">
                  <span>5</span>
                  <p>Finally, go back to your portfolio, paste the token into the <strong>Netlify Token</strong> field, and hit <strong>"Launch Site"</strong>. Your portfolio is now live in 1 minute!</p>
                </div>
                <img src="./img/guide/step5.png" alt="Step 5" onerror="this.style.display='none'">
              </div>
            </div>
          </section>
        </div>
        
        <div class="guide-footer">
          <button class="guide-finish-btn">Got it, let's go!</button>
        </div>
      </div>
    `;
    document.body.appendChild(guideModal);

    guideModal.querySelector('.guide-close').addEventListener('click', hideGuide);
    guideModal.querySelector('.guide-finish-btn').addEventListener('click', hideGuide);
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) hideGuide();
    });

    // ── Deploy Modal ──
    const deployModal = document.createElement('div');
    deployModal.id = 'deploy-modal';
    deployModal.innerHTML = `
      <div class="modal-content">
        <h3>Deploy to Netlify</h3>
        <p>Enter your <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank">Personal Access Token</a> to securely publish your site.</p>
        <input type="password" id="deploy-token-input" placeholder="Netlify Token (e.g. nfp_...)" autocomplete="off">
        <div class="modal-actions">
          <button id="deploy-cancel">Cancel</button>
          <button id="deploy-save">Launch Site</button>
        </div>
      </div>
    `;
    document.body.appendChild(deployModal);

    deployModal.querySelector('#deploy-cancel').addEventListener('click', () => {
      deployModal.classList.remove('active');
    });
    deployModal.querySelector('#deploy-save').addEventListener('click', () => {
      const token = document.getElementById('deploy-token-input').value.trim();
      if (token) {
        localStorage.setItem('NETLIFY_TOKEN', token);
        deployModal.classList.remove('active');
        executeDeploy(token);
      } else {
        alert('Please enter a valid token.');
      }
    });

    // ── Deploy Success Modal ──
    const successModal = document.createElement('div');
    successModal.id = 'deploy-success-modal';
    successModal.innerHTML = `
      <div class="modal-content">
        <h3>🎉 Site is Live!</h3>
        <p>Your portfolio has been published successfully.</p>
        <div class="live-url-box">
          <input type="text" id="live-url-display" readonly>
          <button id="live-url-copy">Copy</button>
        </div>
      </div>
    `;
    document.body.appendChild(successModal);

    successModal.querySelector('#live-url-copy').addEventListener('click', () => {
      const urlInput = document.getElementById('live-url-display');
      navigator.clipboard.writeText(urlInput.value).then(() => {
        const btn = successModal.querySelector('#live-url-copy');
        btn.textContent = 'Copied!';
        btn.style.background = '#28a745';
        setTimeout(() => {
          successModal.classList.remove('active');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.background = '#00C7B7';
          }, 300); // reset after fade out
        }, 1200);
      });
    });

    // ── Editor toolbar (visible in edit mode) ──
    const toolbar = document.createElement('div');
    toolbar.id = 'editor-toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <span class="toolbar-title">✏️ Edit Mode</span>
      </div>
      <div class="toolbar-right">
        <button id="btn-reset" title="Reset to default template">🔄 Reset</button>
        <button id="btn-save" title="Save changes to browser">💾 Save</button>
      </div>
    `;
    document.body.appendChild(toolbar);

    toolbar.querySelector('#btn-reset').addEventListener('click', resetToDefault);
    toolbar.querySelector('#btn-save').addEventListener('click', () => saveToLocalStorage(true));

    // ── Modal for prompts ──
    const modal = document.createElement('div');
    modal.id = 'editor-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 id="modal-title">Enter Description</h3>
        <textarea id="modal-input" placeholder="Describe the image you want to generate..."></textarea>
        <div class="modal-actions">
          <button id="modal-cancel">Cancel</button>
          <button id="modal-confirm">✨ Generate</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // ── Single notification element ──
    const notif = document.createElement('div');
    notif.id = 'editor-notification';
    document.body.appendChild(notif);

    const deployWait = document.createElement('div');
    deployWait.id = 'deploy-wait-overlay';
    deployWait.innerHTML = '<div class="deploy-wait-text">Deploying the site..., please wait !</div>';
    document.body.appendChild(deployWait);
  }

  // ═══════════════════════════════════════
  // SECTION ADD/DELETE BUTTONS
  // ═══════════════════════════════════════
  function addSectionButtons() {
    // Add buttons
    const targets = [
      { container: '.service-bottom', label: '+ Add Skill', action: addSkill },
      { container: '.all-projects', label: '+ Add Project', action: addProject },
      { container: '.contact-items', label: '+ Add Contact', action: addContact },
      { container: '.social-icon', label: '+ Add Social Link', action: addSocial }
    ];

    targets.forEach(({ container, label, action }) => {
      const el = document.querySelector(container);
      if (el) {
        const btn = document.createElement('button');
        btn.className = 'editor-add-btn';
        btn.textContent = label;
        btn.addEventListener('click', action);
        el.parentElement.appendChild(btn);
      }
    });

    // Delete buttons on existing items
    refreshDeleteButtons();
  }

  function refreshDeleteButtons() {
    document.querySelectorAll('.service-item').forEach(el => addDeleteButton(el, 'skill'));
    document.querySelectorAll('.project-item').forEach(el => addDeleteButton(el, 'project'));
    document.querySelectorAll('.contact-item').forEach(el => addDeleteButton(el, 'contact'));
    document.querySelectorAll('.social-item').forEach(el => addDeleteButton(el, 'social'));
  }

  function addDeleteButton(element, type) {
    if (element.querySelector('.editor-delete-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'editor-delete-btn';
    btn.innerHTML = '×';
    btn.title = 'Remove this item';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeItem(element, type);
    });
    element.style.position = 'relative';
    element.appendChild(btn);
  }

  // ═══════════════════════════════════════
  // EDIT MODE TOGGLE
  // ═══════════════════════════════════════
  function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode', isEditMode);
    const toggle = document.getElementById('edit-toggle-btn');
    toggle.innerHTML = isEditMode ? '👁️' : '✏️';
    toggle.title = isEditMode ? 'Exit Edit Mode' : 'Toggle Edit Mode';

    if (isEditMode) {
      enableEditing();
      addResumeEditor();
      if (document.getElementById('guide-toggle-btn')) {
        document.getElementById('guide-toggle-btn').style.display = 'none';
      }
      showNotification('✏️ Edit mode ON — Click any text or image to edit');
    } else {
      disableEditing();
      removeResumeEditor();
      if (document.getElementById('guide-toggle-btn')) {
        document.getElementById('guide-toggle-btn').style.display = 'flex';
      }
      saveToLocalStorage(true);
    }
    updateProjectsVisibility();
  }

  function enableEditing() {
    makeTextEditable(true);
    addImageOverlays();
    addHeroBgOverlay();
    addLinkEditors();
    updateDeleteButtonStates();
  }

  function disableEditing() {
    makeTextEditable(false);
    removeImageOverlays();
    removeHeroBgOverlay();
    removeLinkEditors();
  }

  // ═══════════════════════════════════════
  // TEXT EDITING
  // ═══════════════════════════════════════
  const EDITABLE_SELECTORS = [
    '#header .brand h1',
    '#hero h1',
    '#hero .cta',
    '#services .section-title',
    '#services .service-top p',
    '#services .service-item h2',
    '#services .service-item p',
    '#projects .section-title',
    '#projects .project-info h1',
    '#projects .project-info h2',
    '#projects .project-info p',
    '#about .section-title',
    '#about .col-right h2',
    '#about .col-right p',
    '#about .col-right .cta',
    '#contact .section-title',
    '#contact .contact-info h1',
    '#contact .contact-info h2',
    '#footer .brand h1'
  ];

  function makeTextEditable(enable) {
    const joined = EDITABLE_SELECTORS.join(', ');
    document.querySelectorAll(joined).forEach(el => {
      if (enable) {
        el.setAttribute('contenteditable', 'true');
        el.classList.add('editable-active');
        el.addEventListener('input', debouncedSave);
        el.addEventListener('keydown', preventFormatting);
        el.addEventListener('paste', handlePaste);
      } else {
        el.removeAttribute('contenteditable');
        el.classList.remove('editable-active');
        el.removeEventListener('input', debouncedSave);
        el.removeEventListener('keydown', preventFormatting);
        el.removeEventListener('paste', handlePaste);
      }
    });
  }

  function preventFormatting(e) {
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    if (e.key === 'Enter' && !e.target.matches('p')) {
      e.preventDefault();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  // ═══════════════════════════════════════
  // IMAGE EDITING
  // ═══════════════════════════════════════
  function addImageOverlays() {
    document.querySelectorAll('img').forEach(img => {
      // Skip if overlay already exists
      if (img.parentElement.querySelector('.img-edit-overlay')) return;
      // Skip images inside editor UI
      if (img.closest('#editor-toolbar, #editor-modal')) return;

      const overlay = document.createElement('div');
      overlay.className = 'img-edit-overlay';
      const parentLink = img.closest('a');
      const isSocial = img.closest('.social-item');

      overlay.innerHTML = `
        <button class="img-upload-btn" title="Upload an image file">📁 Upload</button>
      `;

      overlay.querySelector('.img-upload-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        uploadImage(img);
      });

      if (parentLink) {
        const linkBtn = document.createElement('button');
        linkBtn.className = 'img-link-btn';
        linkBtn.textContent = '🔗 Link';
        linkBtn.title = isSocial ? 'Edit social link URL' : 'Edit this link URL';
        linkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const current = parentLink.getAttribute('href') || '#';
          const newHref = prompt(isSocial ? 'Enter the social link URL:' : 'Enter the link URL:', current);
          if (newHref !== null) {
            parentLink.setAttribute('href', newHref);
            debouncedSave();
            if (isSocial) showNotification('🔗 Social link updated');
          }
        });
        overlay.appendChild(linkBtn);
      }

      img.parentElement.style.position = 'relative';
      img.parentElement.appendChild(overlay);
    });
  }

  function removeImageOverlays() {
    document.querySelectorAll('.img-edit-overlay').forEach(el => el.remove());
  }

  function uploadImage(imgElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const isIcon = imgElement.closest('.icon, .social-item');
        const targetWidth = isIcon ? 400 : 1200; // Icons are resized smaller
        
        compressImage(ev.target.result, targetWidth, (dataUrl) => {
          imgElement.src = dataUrl;
          debouncedSave();
          showNotification(isIcon ? '🎨 Icon updated!' : '🖼️ Image uploaded!');
        }, isIcon);
      };
      reader.readAsDataURL(file);
    });
    input.click();
  }

  function compressImage(dataUrl, targetSize, callback, square = false) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;

      if (square) {
        // Crop to square for icons
        const size = Math.min(width, height);
        const x = (width - size) / 2;
        const y = (height - size) / 2;
        canvas.width = targetSize;
        canvas.height = targetSize;
        ctx.drawImage(img, x, y, size, size, 0, 0, targetSize, targetSize);
      } else {
        // Standard proportional resize
        if (width > targetSize) {
          const ratio = targetSize / width;
          width = targetSize;
          height = height * ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      callback(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  }

  // ═══════════════════════════════════════
  // HERO BACKGROUND EDITING
  // ═══════════════════════════════════════
  function addHeroBgOverlay() {
    const hero = document.getElementById('hero');
    if (!hero || hero.querySelector('.hero-bg-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'hero-bg-overlay';
    overlay.innerHTML = `
      <span class="hero-bg-label">🖼️ Background</span>
      <button class="hero-bg-upload" title="Upload background image">📁 Upload</button>
    `;

    overlay.querySelector('.hero-bg-upload').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          compressImage(ev.target.result, 1920, (dataUrl) => {
            hero.style.backgroundImage = `url(${dataUrl})`;
            debouncedSave();
            showNotification('🖼️ Hero background updated!');
          });
        };
        reader.readAsDataURL(file);
      });
      input.click();
    });

    hero.appendChild(overlay);
  }

  function removeHeroBgOverlay() {
    document.querySelectorAll('.hero-bg-overlay').forEach(el => el.remove());
  }

  // ═══════════════════════════════════════
  // RESUME MANAGEMENT
  // ═══════════════════════════════════════
  function addResumeEditor() {
    const cta = document.getElementById('resume-cta');
    if (!cta || cta.parentElement.querySelector('.resume-editor-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'resume-editor-controls';
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '8px';
    controls.style.marginTop = '15px';
    controls.style.alignItems = 'flex-start';

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'editor-resume-btn';
    uploadBtn.innerHTML = '📁 Upload PDF Resume';
    uploadBtn.onclick = () => uploadResume(cta);

    const showBtn = document.createElement('button');
    showBtn.className = 'editor-resume-btn editor-show-resume-btn';
    showBtn.innerHTML = '📄 Show Resume';
    showBtn.onclick = () => showResume(cta);

    controls.appendChild(showBtn);
    controls.appendChild(uploadBtn);
    cta.parentElement.appendChild(controls);
    updateResumeControlVisibility(cta);
  }

  function removeResumeEditor() {
    document.querySelectorAll('.resume-editor-controls').forEach(el => el.remove());
  }

  function updateResumeControlVisibility(cta) {
    const controls = cta?.parentElement?.querySelector('.resume-editor-controls');
    if (!controls) return;
    const showBtn = controls.querySelector('.editor-show-resume-btn');
    if (!showBtn) return;

    const hasPdf = Boolean(cta.dataset.pdf);
    showBtn.style.display = hasPdf ? 'flex' : 'none';
  }

  function showResume(cta) {
    const href = cta?.getAttribute('href') || '';
    const source = cta?.dataset?.pdf || (href && href !== '#' ? href : '');
    if (!source) return;

    if (source.startsWith('data:')) {
      try {
        const parts = source.split(',');
        const header = parts[0] || '';
        const body = parts[1] || '';
        const mime = (header.match(/data:(.*?);base64/) || [])[1] || 'application/pdf';
        const binary = atob(body);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      } catch (e) {
        console.error('Failed to preview PDF data URL:', e);
      }
    }

    window.open(source, '_blank', 'noopener,noreferrer');
  }

  function uploadResume(cta) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        alert('File is too large. Please upload a PDF under 3MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        // Store in the main data object (implicitly via Save process)
        cta.dataset.pdf = ev.target.result;
        cta.setAttribute('href', '#'); // We'll handle this in app.js
        updateResumeControlVisibility(cta);
        debouncedSave();
        showNotification('✅ Resume uploaded and renamed to resume.pdf');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ═══════════════════════════════════════
  // LINK EDITING (CTA buttons)
  // ═══════════════════════════════════════
  function addLinkEditors() {
    // Add link edit buttons to CTA links
    document.querySelectorAll('.cta').forEach(cta => {
      if (cta.id === 'resume-cta') return;
      if (cta.querySelector('.link-edit-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'link-edit-btn';
      btn.textContent = '🔗';
      btn.title = 'Edit link URL';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const current = cta.getAttribute('href') || '#';
        const newHref = prompt('Enter the link URL:', current);
        if (newHref !== null) {
          cta.setAttribute('href', newHref);
          debouncedSave();
        }
      });
      cta.style.position = 'relative';
      cta.appendChild(btn);
    });
  }

  function removeLinkEditors() {
    document.querySelectorAll('.link-edit-btn').forEach(el => el.remove());
  }

  function notifyContentUpdated() {
    document.dispatchEvent(new CustomEvent('portfolio:content-updated'));
  }

  // ═══════════════════════════════════════
  // SECTION MANAGEMENT — ADD
  // ═══════════════════════════════════════
  function addSkill() {
    const container = document.querySelector('.service-bottom');
    if (!container) return;

    const item = document.createElement('div');
    item.className = 'service-item';
    item.style.position = 'relative';
    item.innerHTML = `
      <div class="icon"><img src="https://img.icons8.com/bubbles/100/000000/services.png" /></div>
      <h2 contenteditable="true" class="editable-active">New Skill</h2>
      <p contenteditable="true" class="editable-active">Click to edit this skill description</p>
    `;
    container.appendChild(item);

    addDeleteButton(item, 'skill');
    // Add image overlay to new icon
    const newImg = item.querySelector('img');
    if (newImg) addSingleImageOverlay(newImg);
    updateDeleteButtonStates();
    debouncedSave();
    notifyContentUpdated();
    showNotification('➕ Skill added');
  }

  function addProject() {
    const container = document.querySelector('.all-projects');
    if (!container) return;

    const section = document.getElementById('projects');
    if (section) section.style.display = '';

    const item = document.createElement('div');
    item.className = 'project-item';
    item.style.position = 'relative';
    item.innerHTML = `
      <div class="project-info">
        <h1 contenteditable="true" class="editable-active">New Project</h1>
        <h2 contenteditable="true" class="editable-active">Project subtitle</h2>
        <p contenteditable="true" class="editable-active">Click to edit the project description</p>
      </div>
      <div class="project-img">
        <img src="./img/img-1.png" alt="project">
      </div>
    `;
    container.appendChild(item);

    addDeleteButton(item, 'project');
    const newImg = item.querySelector('.project-img img');
    if (newImg) addSingleImageOverlay(newImg);
    updateDeleteButtonStates();
    updateProjectsVisibility();
    debouncedSave();
    notifyContentUpdated();
    showNotification('➕ Project added');
  }

  function addContact() {
    const container = document.querySelector('.contact-items');
    if (!container) return;

    const item = document.createElement('div');
    item.className = 'contact-item';
    item.style.position = 'relative';
    item.innerHTML = `
      <div class="icon"><img src="https://img.icons8.com/bubbles/100/000000/phone.png" /></div>
      <div class="contact-info">
        <h1 contenteditable="true" class="editable-active">New Contact</h1>
        <h2 contenteditable="true" class="editable-active">Your contact detail here</h2>
      </div>
    `;
    container.appendChild(item);

    addDeleteButton(item, 'contact');
    const newImg = item.querySelector('img');
    if (newImg) addSingleImageOverlay(newImg);
    updateDeleteButtonStates();
    debouncedSave();
    notifyContentUpdated();
    showNotification('➕ Contact added');
  }

  function addSocial() {
    const container = document.querySelector('.social-icon');
    if (!container) return;

    const item = document.createElement('div');
    item.className = 'social-item';
    item.style.position = 'relative';
    item.innerHTML = `<a href="#"><img src="https://img.icons8.com/bubbles/100/000000/link.png" /></a>`;
    container.appendChild(item);

    addDeleteButton(item, 'social');
    const newImg = item.querySelector('img');
    if (newImg) addSingleImageOverlay(newImg);
    updateDeleteButtonStates();
    debouncedSave();
    showNotification('➕ Social link added');
  }

  /** Add an image overlay to a single newly-created image */
  function addSingleImageOverlay(img) {
    if (img.parentElement.querySelector('.img-edit-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'img-edit-overlay';
    overlay.innerHTML = `
      <button class="img-upload-btn" title="Upload">📁 Upload</button>
    `;
    overlay.querySelector('.img-upload-btn').addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      uploadImage(img);
    });

    const parentLink = img.closest('a');
    const isSocial = img.closest('.social-item');
    if (parentLink) {
      const linkBtn = document.createElement('button');
      linkBtn.className = 'img-link-btn';
      linkBtn.textContent = '🔗 Link';
      linkBtn.title = isSocial ? 'Edit social link URL' : 'Edit link URL';
      linkBtn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        const current = parentLink.getAttribute('href') || '#';
        const newHref = prompt(isSocial ? 'Enter social link URL:' : 'Enter link URL:', current);
        if (newHref !== null) {
          parentLink.setAttribute('href', newHref);
          debouncedSave();
        }
      });
      overlay.appendChild(linkBtn);
    }

    img.parentElement.style.position = 'relative';
    img.parentElement.appendChild(overlay);
  }

  // ═══════════════════════════════════════
  // SECTION MANAGEMENT — REMOVE
  // ═══════════════════════════════════════
  function removeItem(element, type) {
    const currentCount = document.querySelectorAll(SELECTORS[type]).length;
    if (currentCount <= (MIN_COUNTS[type] || 0)) {
      showNotification(`⚠️ Cannot remove: minimum ${MIN_COUNTS[type]} ${type}(s) required`);
      return;
    }

    // Animate out
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'scale(0.9)';

    setTimeout(() => {
      element.remove();
      updateDeleteButtonStates();
      updateProjectsVisibility();
      debouncedSave();
      notifyContentUpdated();
      showNotification(`🗑️ ${type.charAt(0).toUpperCase() + type.slice(1)} removed`);
    }, 300);
  }

  function updateDeleteButtonStates() {
    Object.keys(MIN_COUNTS).forEach(type => {
      const items = document.querySelectorAll(SELECTORS[type]);
      const atMin = items.length <= MIN_COUNTS[type];
      items.forEach(item => {
        const btn = item.querySelector('.editor-delete-btn');
        if (btn) {
          btn.disabled = atMin;
          btn.title = atMin
            ? `Minimum ${MIN_COUNTS[type]} ${type}(s) required`
            : 'Remove this item';
        }
      });
    });
  }

  function updateProjectsVisibility() {
    const section = document.getElementById('projects');
    if (!section) return;
    const count = document.querySelectorAll('.project-item').length;
    const header = section.querySelector('.projects-header');
    const container = section.querySelector('.projects');

    if (count === 0 && !isEditMode) {
      section.style.display = 'none';
    } else if (count === 0 && isEditMode) {
      section.style.display = '';
      if (container) {
        container.style.minHeight = 'auto';
        container.style.padding = '40px 0';
      }
      if (header) header.style.display = 'none';
    } else {
      section.style.display = '';
      if (container) {
        container.style.minHeight = '';
        container.style.padding = '';
      }
      if (header) header.style.display = '';
    }
  }

  // ═══════════════════════════════════════
  // MODAL
  // ═══════════════════════════════════════
  function showModal(title, defaultValue, callback) {
    const modal = document.getElementById('editor-modal');
    const titleEl = document.getElementById('modal-title');
    const input = document.getElementById('modal-input');

    titleEl.textContent = title;
    input.value = defaultValue || '';
    modal.classList.add('active');
    setTimeout(() => input.focus(), 100);

    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    function cleanup() {
      modal.classList.remove('active');
      confirmBtn.replaceWith(confirmBtn.cloneNode(true));
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    }

    document.getElementById('modal-confirm').addEventListener('click', () => {
      const value = input.value.trim();
      cleanup();
      callback(value || null);
    });

    document.getElementById('modal-cancel').addEventListener('click', () => {
      cleanup();
      callback(null);
    });
  }

  function showNotification(message) {
    const notif = document.getElementById('editor-notification');
    if (!notif) return;
    clearTimeout(notif._hideTimeout);
    notif.textContent = message;
    notif.classList.add('show');
    notif._hideTimeout = setTimeout(() => notif.classList.remove('show'), 3000);
  }

  // ═══════════════════════════════════════
  // PERSISTENCE — COLLECT
  // ═══════════════════════════════════════
  function collectData() {
    const data = {};

    // Brand
    data.brand = document.querySelector('#header .brand h1')?.innerHTML || '';

    // Hero
    const heroEl = document.getElementById('hero');
    data.hero = {
      bgImage: heroEl?.style.backgroundImage || '',
      lines: [],
      ctaText: document.querySelector('#hero .cta')?.textContent?.trim() || '',
      ctaHref: document.querySelector('#hero .cta')?.getAttribute('href') || '#'
    };
    document.querySelectorAll('#hero h1').forEach(h1 => {
      data.hero.lines.push(h1.innerHTML);
    });

    // Skills
    data.skills = {
      title: document.querySelector('#services .section-title')?.innerHTML || '',
      description: document.querySelector('#services .service-top p')?.innerHTML || '',
      items: []
    };
    document.querySelectorAll('.service-item').forEach(item => {
      data.skills.items.push({
        icon: item.querySelector('.icon img')?.getAttribute('src') || '',
        title: item.querySelector('h2')?.innerHTML || '',
        description: item.querySelector('p')?.innerHTML || ''
      });
    });

    // Projects
    data.projects = {
      title: document.querySelector('#projects .section-title')?.innerHTML || '',
      items: []
    };
    document.querySelectorAll('.project-item').forEach(item => {
      data.projects.items.push({
        title: item.querySelector('.project-info h1')?.innerHTML || '',
        subtitle: item.querySelector('.project-info h2')?.innerHTML || '',
        description: item.querySelector('.project-info p')?.innerHTML || '',
        image: item.querySelector('.project-img img')?.getAttribute('src') || ''
      });
    });

    // About
    data.about = {
      title: document.querySelector('#about .section-title')?.innerHTML || '',
      subtitle: document.querySelector('#about .col-right h2')?.innerHTML || '',
      description: document.querySelector('#about .col-right p')?.innerHTML || '',
      image: document.querySelector('#about .about-img img')?.getAttribute('src') || '',
      ctaText: document.querySelector('#about .col-right .cta')?.textContent?.trim() || '',
      ctaHref: '#'
    };

    data.resumePdf = document.querySelector('#resume-cta')?.dataset?.pdf || '';

    // Contact
    data.contact = {
      title: document.querySelector('#contact .section-title')?.innerHTML || '',
      items: []
    };
    document.querySelectorAll('.contact-item').forEach(item => {
      const info = {
        icon: item.querySelector('.icon img')?.getAttribute('src') || '',
        title: item.querySelector('.contact-info h1')?.innerHTML || '',
        details: []
      };
      item.querySelectorAll('.contact-info h2').forEach(h2 => {
        info.details.push(h2.innerHTML);
      });
      data.contact.items.push(info);
    });

    // Footer
    data.footer = {
      brand: document.querySelector('#footer .brand h1')?.innerHTML || '',
      socials: []
    };
    document.querySelectorAll('.social-item').forEach(item => {
      data.footer.socials.push({
        icon: item.querySelector('img')?.getAttribute('src') || '',
        link: item.querySelector('a')?.getAttribute('href') || '#'
      });
    });

    return data;
  }

  // ═══════════════════════════════════════
  // PERSISTENCE — SAVE / LOAD
  // ═══════════════════════════════════════
  function saveToLocalStorage(showMsg) {
    if (window._isResetting) return;
    try {
      const data = collectData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (showMsg) showNotification('💾 Changes saved!');
    } catch (e) {
      console.error('Failed to save:', e);
      showNotification('⚠️ Save failed — storage may be full');
    }
  }

  function debouncedSave() {
    if (window._isResetting) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (window._isResetting) return;
      try {
        const data = collectData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, 800);
  }

  function loadSavedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      applyData(data);
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
  }

  function applyData(data) {
    if (!data) return;

    // Brand
    if (data.brand) {
      const el = document.querySelector('#header .brand h1');
      if (el) el.innerHTML = data.brand;
    }

    // Hero
    if (data.hero) {
      const heroEl = document.getElementById('hero');
      if (heroEl && data.hero.bgImage) {
        heroEl.style.backgroundImage = data.hero.bgImage;
      }
      const heroLines = document.querySelectorAll('#hero h1');
      (data.hero.lines || []).forEach((html, i) => {
        if (heroLines[i]) heroLines[i].innerHTML = html;
      });
      const heroCta = document.querySelector('#hero .cta');
      if (heroCta) {
        if (data.hero.ctaText) heroCta.textContent = data.hero.ctaText;
        if (data.hero.ctaHref) heroCta.setAttribute('href', data.hero.ctaHref);
      }
    }

    // Skills
    if (data.skills) {
      const titleEl = document.querySelector('#services .section-title');
      if (titleEl && data.skills.title) titleEl.innerHTML = data.skills.title;
      const descEl = document.querySelector('#services .service-top p');
      if (descEl && data.skills.description) descEl.innerHTML = data.skills.description;

      if (data.skills.items && data.skills.items.length > 0) {
        const container = document.querySelector('.service-bottom');
        if (container) {
          container.innerHTML = '';
          data.skills.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'service-item';
            div.style.position = 'relative';
            div.innerHTML = `
              <div class="icon"><img src="${escapeAttr(item.icon)}" /></div>
              <h2>${item.title}</h2>
              <p>${item.description}</p>
            `;
            container.appendChild(div);
          });
        }
      }
    }

    // Projects
    if (data.projects) {
      const titleEl = document.querySelector('#projects .section-title');
      if (titleEl && data.projects.title) titleEl.innerHTML = data.projects.title;

      const container = document.querySelector('.all-projects');
      if (container) {
        container.innerHTML = '';
        (data.projects.items || []).forEach(item => {
          const div = document.createElement('div');
          div.className = 'project-item';
          div.style.position = 'relative';
          div.innerHTML = `
            <div class="project-info">
              <h1>${item.title}</h1>
              <h2>${item.subtitle}</h2>
              <p>${item.description}</p>
            </div>
            <div class="project-img">
              <img src="${escapeAttr(item.image)}" alt="project">
            </div>
          `;
          container.appendChild(div);
        });
      }
    }

    // About
    if (data.about) {
      const titleEl = document.querySelector('#about .section-title');
      if (titleEl && data.about.title) titleEl.innerHTML = data.about.title;
      const subEl = document.querySelector('#about .col-right h2');
      if (subEl && data.about.subtitle) subEl.innerHTML = data.about.subtitle;
      const pEl = document.querySelector('#about .col-right p');
      if (pEl && data.about.description) pEl.innerHTML = data.about.description;
      const imgEl = document.querySelector('#about .about-img img');
      if (imgEl && data.about.image) imgEl.src = data.about.image;
      const ctaEl = document.querySelector('#about .col-right .cta');
      if (ctaEl) {
        if (data.about.ctaText) ctaEl.textContent = data.about.ctaText;
        ctaEl.setAttribute('href', '#');
      }
    }

    const resumeCta = document.getElementById('resume-cta');
    if (resumeCta) {
      if (data.resumePdf) {
        resumeCta.dataset.pdf = data.resumePdf;
      } else {
        delete resumeCta.dataset.pdf;
      }
      resumeCta.setAttribute('href', '#');
      updateResumeControlVisibility(resumeCta);
    }

    // Contact
    if (data.contact) {
      const titleEl = document.querySelector('#contact .section-title');
      if (titleEl && data.contact.title) titleEl.innerHTML = data.contact.title;

      if (data.contact.items && data.contact.items.length > 0) {
        const container = document.querySelector('.contact-items');
        if (container) {
          container.innerHTML = '';
          data.contact.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.style.position = 'relative';
            const detailsHtml = (item.details || []).map(d => `<h2>${d}</h2>`).join('');
            div.innerHTML = `
              <div class="icon"><img src="${escapeAttr(item.icon)}" /></div>
              <div class="contact-info">
                <h1>${item.title}</h1>
                ${detailsHtml}
              </div>
            `;
            container.appendChild(div);
          });
        }
      }
    }

    // Footer
    if (data.footer) {
      const brandEl = document.querySelector('#footer .brand h1');
      if (brandEl && data.footer.brand) brandEl.innerHTML = data.footer.brand;

      if (data.footer.socials && data.footer.socials.length > 0) {
        const container = document.querySelector('.social-icon');
        if (container) {
          container.innerHTML = '';
          data.footer.socials.forEach(item => {
            const div = document.createElement('div');
            div.className = 'social-item';
            div.style.position = 'relative';
            div.innerHTML = `<a href="${escapeAttr(item.link)}"><img src="${escapeAttr(item.icon)}" /></a>`;
            container.appendChild(div);
          });
        }
      }
    }

    // Rebuild delete buttons since DOM was reconstructed
    refreshDeleteButtons();
    notifyContentUpdated();
  }

  function resetToDefault() {
    if (!confirm('⚠️ Reset all changes to the default template?\n\nThis cannot be undone.')) return;
    
    // Hard clamp to prevent race conditions during page reload
    window._isResetting = true;
    isEditMode = false;
    clearTimeout(saveTimeout);
    
    // Explicitly delete key and verify
    localStorage.removeItem(STORAGE_KEY);
    
    setTimeout(() => {
      location.reload();
    }, 50);
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ═══════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════
  async function generateZipBlob() {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library not loaded. Ensure you are connected to the internet.');
    }

    const zip = new JSZip();

    // 1. Fetch style.css and app.js
    try {
      const cssResp = await fetch('./style.css');
      if (cssResp.ok) zip.file('style.css', await cssResp.blob());
      
      const jsResp = await fetch('./app.js');
      if (jsResp.ok) zip.file('app.js', await jsResp.blob());
    } catch (e) {
      console.warn('Failed to fetch base css/js', e);
    }

    // Include Resume PDF if exists
    const resumeCta = document.getElementById('resume-cta');
    const resumeB64 = resumeCta?.dataset.pdf;
    if (resumeB64) {
      try {
        const parts = resumeB64.split(',');
        zip.file('resume.pdf', parts[1], {base64: true});
      } catch (e) { console.error('Failed to include resume.pdf', e); }
    }

    const imgFolder = zip.folder('img');
    let imageCounter = 1;

    // 2. Clone document for manipulation
    const clone = document.documentElement.cloneNode(true);
    
    // 3. Process Images
    const fetchedImgs = {};
    const liveImgs = clone.querySelectorAll('img');
    for (const img of liveImgs) {
      const src = img.getAttribute('src');
      if (!src) continue;
      
      if (src.startsWith('data:image')) {
        try {
          const arr = src.split(',');
          const match = arr[0].match(/:(.*?);/);
          const mime = match ? match[1] : 'image/png';
          const cleanExt = mime.split('/')[1].split('+')[0] || 'png';
          const filename = `custom_img_${imageCounter++}.${cleanExt}`;
          
          imgFolder.file(filename, arr[1], {base64: true});
          img.setAttribute('src', `./img/${filename}`);
        } catch(e) { console.error('Failed to parse data URL', e); }
      } else if (!src.startsWith('http')) {
        try {
          if (!fetchedImgs[src]) {
            const resp = await fetch(src);
            if (resp.ok) fetchedImgs[src] = await resp.blob();
          }
          if (fetchedImgs[src]) {
            let filename = src.split('/').pop() || `default_img_${imageCounter++}.png`;
            filename = `${imageCounter++}_${filename}`;
            imgFolder.file(filename, fetchedImgs[src]);
            img.setAttribute('src', `./img/${filename}`);
          }
        } catch(e) { console.warn('Could not fetch default image', src, e); }
      }
    }

    // Process Hero Background inline style if it's base64
    const cloneHero = clone.querySelector('#hero');
    if (cloneHero && cloneHero.style.backgroundImage && cloneHero.style.backgroundImage.includes('data:image')) {
      try {
        const bgStr = cloneHero.style.backgroundImage;
        const match = bgStr.match(/url\(['"]?(data:image[^'"]+)['"]?\)/);
        if (match && match[1]) {
          const arr = match[1].split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/png';
          const cleanExt = mime.split('/')[1].split('+')[0] || 'png';
          const filename = `custom_hero_bg.${cleanExt}`;
          imgFolder.file(filename, arr[1], {base64: true});
          cloneHero.style.backgroundImage = `url(./img/${filename})`;
        }
      } catch(e) { console.error('Failed to parse hero bg', e); }
    } else {
      try {
        const resp = await fetch('./img/hero-bg.png');
        if (resp.ok) imgFolder.file('hero-bg.png', await resp.blob());
      } catch(e) {}
    }

    // 4. Remove editor UI and Clean up artifacts
    const editorEls = clone.querySelectorAll(
      '#export-btn, #deploy-btn, #deploy-modal, #deploy-success-modal, #edit-toggle-btn, #open-live-btn, ' +
      '#guide-toggle-btn, #guide-modal, #editor-toolbar, #editor-modal, #editor-notification, #deploy-wait-overlay, ' +
      '.editor-add-btn, .editor-delete-btn, .img-edit-overlay, .hero-bg-overlay, .link-edit-btn'
    );
    editorEls.forEach(el => el.remove());

    const cloneBody = clone.querySelector('body');
    if (cloneBody) cloneBody.classList.remove('edit-mode');
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.editable-active').forEach(el => el.classList.remove('editable-active'));
    
    clone.querySelectorAll('script').forEach(s => {
      const src = (s.getAttribute('src') || '').trim();
      if (src === './app.js' || src.endsWith('/app.js')) return;
      if (src.includes('editor') || src.includes('generator') || src.includes('jszip')) {
        s.remove();
      }
    });

    // Reset transient reveal runtime state so shipped pages can animate on fresh load.
    clone.querySelectorAll('.reveal-ready').forEach((el) => {
      delete el.dataset.revealBound;
      el.classList.remove('revealed');
      el.style.removeProperty('transition-delay');
    });

    // 5. Build final HTML string
    // If resume was uploaded, ensure the CTA points to the file in the ZIP.
    const cloneResume = clone.querySelector('#resume-cta');
    if (cloneResume) {
      cloneResume.removeAttribute('data-pdf');
      cloneResume.setAttribute('href', resumeB64 ? './resume.pdf' : '#');
    }

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    zip.file('index.html', html);

    return await zip.generateAsync({ type: 'blob' });
  }

  async function exportAsZip() {
    try {
      showNotification('📦 Preparing Zip export…');
      const blob = await generateZipBlob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-portfolio.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('📦 Portfolio ZIP exported! Check your downloads.');
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + err.message);
    }
  }

  function deployToNetlify() {
    const token = localStorage.getItem('NETLIFY_TOKEN');
    if (!token) {
      document.getElementById('deploy-modal').classList.add('active');
    } else {
      executeDeploy(token);
    }
  }

  function setDeployLock(active) {
    isDeploying = active;
    document.body.classList.toggle('deploy-blocked', active);
    document.getElementById('deploy-wait-overlay')?.classList.toggle('active', active);
  }

  async function executeDeploy(token) {
    setDeployLock(true);
    try {
      showNotification('🚀 Compiling site for deployment...');
      const blob = await generateZipBlob();
      
      showNotification('🚀 Deploying securely to Netlify API...');
      
      let siteId = localStorage.getItem('NETLIFY_SITE_ID');
      let netlifyEndpoint = siteId ? `https://api.netlify.com/api/v1/sites/${siteId}/deploys` : 'https://api.netlify.com/api/v1/sites';
      
      // Use corsproxy to bypass Netlify's known API CORS header duplication bug (*, *)
      let endpoint = `https://corsproxy.io/?${encodeURIComponent(netlifyEndpoint)}`;

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/zip'
        },
        body: blob
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or expired Netlify token. Please re-enter a valid token.');
      }
      
      if (response.status === 404 && siteId) {
        // Site might have been deleted on Netlify, try creating a new one
        console.warn('Site ID not found, creating new site...');
        localStorage.removeItem('NETLIFY_SITE_ID');
        netlifyEndpoint = 'https://api.netlify.com/api/v1/sites';
        endpoint = `https://corsproxy.io/?${encodeURIComponent(netlifyEndpoint)}`;
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/zip'
          },
          body: blob
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Netlify API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      
      // Save ID if a new site was created
      if (data.site_id || data.id) {
        localStorage.setItem('NETLIFY_SITE_ID', data.site_id || data.id);
      }

      const liveUrl = data.url || data.deploy_url;
      localStorage.setItem('NETLIFY_SITE_URL', liveUrl);
      showNotification('✅ Site Live!');
      
      // Show Success Modal
      const successModal = document.getElementById('deploy-success-modal');
      const urlDisplay = document.getElementById('live-url-display');
      urlDisplay.value = liveUrl;
      successModal.classList.add('active');

      // Unhide and configure the new Visit Live Site Button
      const openLiveBtn = document.getElementById('open-live-btn');
      if (openLiveBtn) {
        openLiveBtn.style.display = 'flex';
        openLiveBtn.onclick = () => window.open(liveUrl, '_blank');
      }

    } catch (err) {
      console.error(err);
      if (err.message.includes('token')) {
        localStorage.removeItem('NETLIFY_TOKEN');
        document.getElementById('deploy-modal').classList.add('active');
        alert(err.message);
      } else {
        alert('Deploy failed: ' + err.message);
      }
    } finally {
      setDeployLock(false);
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ═══════════════════════════════════════
  // GLOBAL EVENT LISTENERS
  // ═══════════════════════════════════════
  function setupGlobalListeners() {
    // Prevent link navigation in edit mode
    document.addEventListener('click', (e) => {
      if (isDeploying) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!isEditMode) return;
      const link = e.target.closest('a');
      if (!link) return;
      // Allow editor UI clicks
      if (link.closest('#editor-toolbar, #editor-modal, .img-edit-overlay, .hero-bg-overlay, #guide-modal')) return;
      e.preventDefault();
    }, true);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (isDeploying) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditMode) saveToLocalStorage(true);
      }
      // Escape to exit edit mode
      if (e.key === 'Escape') {
        // If modal is open, close it instead
        const modal = document.getElementById('editor-modal');
        const guide = document.getElementById('guide-modal');
        if (modal?.classList.contains('active')) {
          document.getElementById('modal-cancel')?.click();
        } else if (guide?.classList.contains('active')) {
          hideGuide();
        } else if (isEditMode) {
          toggleEditMode();
        }
      }
    });
  }

  function showGuide() {
    document.getElementById('guide-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideGuide() {
    document.getElementById('guide-modal').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════
  // START
  // ═══════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
