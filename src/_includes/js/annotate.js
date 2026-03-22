(function () {
  'use strict';

  // Config: set data-annotate-repo and data-annotate-url on <body> to enable GitHub issue submission
  var body = document.body;
  var REPO = body.getAttribute('data-annotate-repo') || '';
  var STORAGE_PREFIX = 'cairns-annotations:';

  var articleBody = document.querySelector('.article-body');
  var articleLead = document.querySelector('.article-header__lead');
  if (!articleBody) return;

  var permalink = window.location.pathname;
  var titleEl = document.querySelector('.article-header__title');
  var articleTitle = titleEl ? titleEl.textContent.trim() : document.title;
  var siteUrl = body.getAttribute('data-annotate-url') || window.location.origin;
  var fullUrl = siteUrl + permalink;

  var annotations = loadAnnotations();
  var editingIndex = -1;

  // ── DOM Elements ──

  var toolbar = document.createElement('div');
  toolbar.className = 'annotate-toolbar';
  toolbar.innerHTML = '<button type="button"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Add Note</button>';
  document.body.appendChild(toolbar);

  var inputBox = document.createElement('div');
  inputBox.className = 'annotate-input';
  inputBox.innerHTML =
    '<div class="annotate-input__preview"></div>' +
    '<textarea placeholder="What should change here\u2026"></textarea>' +
    '<div class="annotate-input__actions">' +
    '<button type="button" class="annotate-cancel">Cancel</button>' +
    '<button type="button" class="annotate-save">Save</button>' +
    '</div>';
  document.body.appendChild(inputBox);

  var tray = document.createElement('div');
  tray.className = 'annotate-tray';
  tray.innerHTML =
    '<div class="annotate-tray__bar">' +
    '<span class="annotate-tray__count"></span>' +
    '<span class="annotate-tray__toggle-icon"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg></span>' +
    '</div>' +
    '<div class="annotate-tray__body">' +
    '<div class="annotate-tray__list"></div>' +
    '<div class="annotate-tray__actions">' +
    '<button type="button" class="annotate-tray__clear"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear All</button>' +
    '<button type="button" class="annotate-tray__submit"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> Create Issue</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(tray);

  var pendingSelection = null;

  // ── Text selection handling — always active on article body ──

  document.addEventListener('mouseup', function (e) {
    // Don't interfere if user is interacting with the input box
    if (inputBox.classList.contains('visible')) return;
    if (toolbar.contains(e.target) || inputBox.contains(e.target) || tray.contains(e.target)) return;

    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      hideToolbar();
      return;
    }

    // Only handle selections within the article body or lead
    var range = sel.getRangeAt(0);
    var ancestor = range.commonAncestorContainer;
    if (!articleBody.contains(ancestor) && !(articleLead && articleLead.contains(ancestor))) {
      hideToolbar();
      return;
    }

    pendingSelection = {
      text: sel.toString().trim(),
      range: range.cloneRange()
    };

    var rect = range.getBoundingClientRect();
    toolbar.style.top = (window.scrollY + rect.top - 44) + 'px';
    toolbar.style.left = Math.max(8, Math.min(
      window.scrollX + rect.left + rect.width / 2 - 55,
      window.innerWidth - 130
    )) + 'px';
    toolbar.classList.add('visible');

  });

  // Hide toolbar on click outside
  document.addEventListener('mousedown', function (e) {
    if (!toolbar.contains(e.target) && !inputBox.contains(e.target)) {
      hideToolbar();
    }
  });

  // ── Add Note button ──

  toolbar.querySelector('button').addEventListener('click', function () {
    if (!pendingSelection) return;
    hideToolbar();

    var rect = pendingSelection.range.getBoundingClientRect();
    inputBox.querySelector('.annotate-input__preview').textContent =
      truncate(pendingSelection.text, 120);
    inputBox.querySelector('textarea').value = '';
    positionInputBox(rect);
    inputBox.classList.add('visible');
    inputBox.querySelector('textarea').focus();
  });

  // ── Save / Cancel ──

  inputBox.querySelector('.annotate-cancel').addEventListener('click', function () {
    hideInput();
    pendingSelection = null;
    editingIndex = -1;
  });

  inputBox.querySelector('.annotate-save').addEventListener('click', function () {
    var comment = inputBox.querySelector('textarea').value.trim();
    if (!comment) return;

    if (editingIndex >= 0 && annotations[editingIndex]) {
      // Editing existing annotation
      annotations[editingIndex].comment = comment;
      editingIndex = -1;
    } else if (pendingSelection) {
      // New annotation
      var section = findSection(pendingSelection.range);
      var annotation = {
        selectedText: pendingSelection.text,
        comment: comment,
        sectionTitle: section.title,
        sectionAnchor: section.anchor,
        timestamp: Date.now()
      };
      annotations.push(annotation);
      highlightRange(pendingSelection.range, annotations.length - 1);
    } else {
      return;
    }

    saveAnnotations();
    hideInput();
    pendingSelection = null;
    renderTray();
  });

  // ── Keyboard: Escape to close input ──

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideToolbar();
      hideInput();
      pendingSelection = null;
    }
  });

  // ── Tray interactions ──

  var trayBar = tray.querySelector('.annotate-tray__bar');
  trayBar.setAttribute('role', 'button');
  trayBar.setAttribute('tabindex', '0');
  trayBar.setAttribute('aria-expanded', 'false');

  function toggleTray() {
    var expanded = tray.classList.toggle('expanded');
    trayBar.setAttribute('aria-expanded', String(expanded));
  }

  trayBar.addEventListener('click', toggleTray);
  trayBar.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTray();
    }
  });

  tray.querySelector('.annotate-tray__clear').addEventListener('click', function () {
    annotations = [];
    saveAnnotations();
    removeHighlights();
    renderTray();
  });

  tray.querySelector('.annotate-tray__submit').addEventListener('click', function () {
    submitAnnotations();
  });

  tray.querySelector('.annotate-tray__list').addEventListener('click', function (e) {
    // Delete button
    var btn = e.target.closest('.annotate-tray__item-delete');
    if (btn) {
      var idx = parseInt(btn.dataset.index, 10);
      annotations.splice(idx, 1);
      saveAnnotations();
      rebuildHighlights(idx);
      renderTray();
      return;
    }

    // Click on item row → edit
    var item = e.target.closest('.annotate-tray__item');
    if (!item) return;
    var editIdx = parseInt(item.dataset.index, 10);
    if (isNaN(editIdx) || !annotations[editIdx]) return;
    editingIndex = editIdx;

    var a = annotations[editIdx];
    inputBox.querySelector('.annotate-input__preview').textContent =
      truncate(a.selectedText, 120);
    inputBox.querySelector('textarea').value = a.comment;

    // Position near the tray
    var trayRect = tray.getBoundingClientRect();
    positionInputBox({ top: trayRect.top - 160, bottom: trayRect.top - 140, left: window.innerWidth / 2, right: window.innerWidth / 2 });
    inputBox.classList.add('visible');
    inputBox.querySelector('textarea').focus();
  });

  // ── Helpers ──

  function hideToolbar() {
    toolbar.classList.remove('visible');
  }

  function hideInput() {
    inputBox.classList.remove('visible');
  }

  function positionInputBox(rect) {
    var inputWidth = 300;
    var gap = 16;
    var articleEl = document.querySelector('.article-content') || articleBody;
    var articleRect = articleEl.getBoundingClientRect();
    var rightEdge = articleRect.right;
    var spaceRight = window.innerWidth - rightEdge;

    var top = window.scrollY + rect.top;
    var left;

    if (spaceRight >= inputWidth + gap) {
      // Position to the right of the article content
      left = rightEdge + gap;
    } else {
      // Not enough space on right — fall back to inline below selection
      top = window.scrollY + rect.bottom + 8;
      left = Math.max(8, Math.min(
        window.scrollX + rect.left,
        window.innerWidth - inputWidth - 8
      ));
    }

    // Ensure not off-screen vertically
    var maxTop = window.scrollY + window.innerHeight - 200;
    if (top > maxTop) top = maxTop;
    if (top < window.scrollY + 8) top = window.scrollY + 8;

    // Ensure not off-screen horizontally
    if (left + inputWidth > window.innerWidth - 8) {
      left = window.innerWidth - inputWidth - 8;
    }
    if (left < 8) left = 8;

    inputBox.style.top = top + 'px';
    inputBox.style.left = left + 'px';
  }

  function findSection(range) {
    var node = range.startContainer;
    if (node.nodeType === 3) node = node.parentElement;

    // Check if selection is in the lead paragraph
    if (articleLead && articleLead.contains(node)) {
      return { title: 'Introduction', anchor: '' };
    }

    while (node && node !== articleBody) {
      if (node.tagName === 'SECTION' && node.id) {
        var h2 = node.querySelector('h2');
        return {
          title: h2 ? h2.textContent.trim() : node.id,
          anchor: node.id
        };
      }
      if (node.tagName === 'H2') {
        return {
          title: node.textContent.trim(),
          anchor: node.id || ''
        };
      }
      node = node.parentElement;
    }
    // Fall back: find the previous h2 sibling/ancestor
    var allH2s = articleBody.querySelectorAll('h2');
    var rangeTop = range.getBoundingClientRect().top;
    var best = null;
    allH2s.forEach(function (h2) {
      if (h2.getBoundingClientRect().top <= rangeTop) {
        best = h2;
      }
    });
    if (best) {
      return { title: best.textContent.trim(), anchor: best.id || '' };
    }
    return { title: '', anchor: '' };
  }

  function highlightRange(range, annotationIndex) {
    try {
      var mark = document.createElement('mark');
      mark.className = 'annotate-highlight';
      if (typeof annotationIndex === 'number') mark.dataset.annotationIndex = annotationIndex;
      range.surroundContents(mark);
    } catch (e) {
      try {
        var fragment = range.extractContents();
        var mark2 = document.createElement('mark');
        mark2.className = 'annotate-highlight';
        if (typeof annotationIndex === 'number') mark2.dataset.annotationIndex = annotationIndex;
        mark2.appendChild(fragment);
        range.insertNode(mark2);
      } catch (e2) {
        // silently skip highlight if DOM prevents it
      }
    }
  }

  function removeHighlights() {
    var containers = [articleBody];
    if (articleLead) containers.push(articleLead);
    containers.forEach(function (container) {
      var marks = container.querySelectorAll('mark.annotate-highlight');
      marks.forEach(function (mark) {
        var parent = mark.parentNode;
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      });
    });
  }

  // ── Click on highlight to edit ──
  document.addEventListener('click', function (e) {
    var mark = e.target.closest('mark.annotate-highlight');
    if (!mark || !mark.dataset.annotationIndex) return;
    var idx = parseInt(mark.dataset.annotationIndex, 10);
    if (isNaN(idx) || !annotations[idx]) return;

    editingIndex = idx;
    var a = annotations[idx];
    inputBox.querySelector('.annotate-input__preview').textContent =
      truncate(a.selectedText, 120);
    inputBox.querySelector('textarea').value = a.comment;

    var rect = mark.getBoundingClientRect();
    positionInputBox(rect);
    inputBox.classList.add('visible');
    inputBox.querySelector('textarea').focus();
  });

  function rebuildHighlights(removedIndex) {
    var containers = [articleBody];
    if (articleLead) containers.push(articleLead);
    containers.forEach(function (container) {
      var marks = container.querySelectorAll('mark.annotate-highlight');
      marks.forEach(function (mark) {
        var idx = parseInt(mark.dataset.annotationIndex, 10);
        if (idx === removedIndex) {
          var parent = mark.parentNode;
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
          parent.normalize();
        } else if (idx > removedIndex) {
          mark.dataset.annotationIndex = idx - 1;
        }
      });
    });
  }

  function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max) + '\u2026';
  }

  // ── Storage ──

  function loadAnnotations() {
    try {
      var data = localStorage.getItem(STORAGE_PREFIX + permalink);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAnnotations() {
    try {
      if (annotations.length === 0) {
        localStorage.removeItem(STORAGE_PREFIX + permalink);
      } else {
        localStorage.setItem(STORAGE_PREFIX + permalink, JSON.stringify(annotations));
      }
    } catch (e) {}
  }

  // ── Tray rendering ──

  function renderTray() {
    if (annotations.length === 0) {
      tray.classList.remove('visible', 'expanded');
      trayBar.setAttribute('aria-expanded', 'false');
      return;
    }

    tray.classList.add('visible');
    tray.classList.add('expanded');
    trayBar.setAttribute('aria-expanded', 'true');
    var countEl = tray.querySelector('.annotate-tray__count');
    countEl.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> <span>' + annotations.length + '</span> annotation' +
      (annotations.length === 1 ? '' : 's');

    var list = tray.querySelector('.annotate-tray__list');
    list.innerHTML = '';

    annotations.forEach(function (a, i) {
      var item = document.createElement('div');
      item.className = 'annotate-tray__item';
      item.dataset.index = i;

      var content = document.createElement('div');
      content.className = 'annotate-tray__item-content';

      var quote = document.createElement('div');
      quote.className = 'annotate-tray__item-quote';
      quote.textContent = '\u201C' + truncate(a.selectedText, 80) + '\u201D';
      content.appendChild(quote);

      if (a.sectionTitle) {
        var sec = document.createElement('div');
        sec.className = 'annotate-tray__item-section';
        sec.textContent = '\u00A7 ' + a.sectionTitle;
        content.appendChild(sec);
      }

      var comment = document.createElement('div');
      comment.className = 'annotate-tray__item-comment';
      comment.textContent = a.comment;
      content.appendChild(comment);

      var del = document.createElement('button');
      del.className = 'annotate-tray__item-delete';
      del.dataset.index = i;
      del.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      del.setAttribute('aria-label', 'Remove annotation ' + (i + 1));
      del.title = 'Remove annotation';

      item.appendChild(content);
      item.appendChild(del);
      list.appendChild(item);
    });
  }

  // ── GitHub Issue submission ──

  function buildIssueBody() {
    var lines = [];
    lines.push('**Article:** [' + articleTitle + '](' + fullUrl + ')');
    lines.push('');
    lines.push('---');

    annotations.forEach(function (a, i) {
      lines.push('');
      lines.push('### Annotation ' + (i + 1));
      var quoted = truncate(a.selectedText, 200);
      lines.push('> ' + quoted);
      lines.push('');
      if (a.sectionTitle && a.sectionAnchor) {
        lines.push('**Section:** [' + a.sectionTitle + '](' + fullUrl + '#' + a.sectionAnchor + ')');
      } else if (a.sectionTitle) {
        lines.push('**Section:** ' + a.sectionTitle);
      }
      lines.push('');
      lines.push(a.comment);
      lines.push('');
      lines.push('---');
    });

    return lines.join('\n');
  }

  function submitAnnotations() {
    var title = 'Feedback: ' + articleTitle;
    var body = buildIssueBody();
    var url = 'https://github.com/' + REPO + '/issues/new' +
      '?title=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(body) +
      '&labels=content-feedback';

    if (url.length > 8000) {
      showCopyFallback(body);
    } else {
      window.open(url, '_blank');
      annotations = [];
      saveAnnotations();
      removeHighlights();
      renderTray();
    }
  }

  function showCopyFallback(body) {
    var overlay = document.createElement('div');
    overlay.className = 'annotate-overlay';

    var modal = document.createElement('div');
    modal.className = 'annotate-copy-msg';
    modal.innerHTML =
      '<p>Your annotations are too long for an auto-generated link. ' +
      'Copy the content below and paste it into a ' +
      '<a href="https://github.com/' + REPO + '/issues/new?labels=content-feedback" target="_blank">new GitHub issue</a>.</p>' +
      '<div class="annotate-copy-msg__actions">' +
      '<button type="button" class="annotate-copy-msg__close">Close</button>' +
      '<button type="button" class="annotate-copy-msg__copy">Copy to Clipboard</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    modal.querySelector('.annotate-copy-msg__copy').addEventListener('click', function () {
      navigator.clipboard.writeText(body).then(function () {
        modal.querySelector('.annotate-copy-msg__copy').textContent = 'Copied!';
        setTimeout(function () {
          cleanup();
          annotations = [];
          saveAnnotations();
          removeHighlights();
          renderTray();
        }, 800);
      }, function () {
        modal.querySelector('.annotate-copy-msg__copy').textContent = 'Copy failed — select manually';
      });
    });

    modal.querySelector('.annotate-copy-msg__close').addEventListener('click', cleanup);
    overlay.addEventListener('click', cleanup);

    function cleanup() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }
  }

  // ── Initial render ──
  renderTray();
})();
