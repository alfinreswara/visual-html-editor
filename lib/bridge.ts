/**
 * Script ini hanya disuntikkan ke srcDoc saat preview dirender.
 * Jangan pernah menyimpannya di HTML project atau hasil export.
 */
export const PREVIEW_CHANNEL = "kanvas-preview-v1";

export const BRIDGE_SCRIPT = String.raw`
(function () {
  "use strict";

  if (window.__KANVAS_BRIDGE_READY__) return;
  window.__KANVAS_BRIDGE_READY__ = true;

  var CHANNEL = "kanvas-preview-v1";
  var PARENT_ORIGIN = (function () {
    try {
      if (window.parent.location.origin && window.parent.location.origin !== "null") {
        return window.parent.location.origin;
      }
    } catch (error) {
      /* akses parent dibatasi */
    }
    try {
      if (document.referrer) return new URL(document.referrer).origin;
    } catch (error) {
      /* referrer tidak tersedia */
    }
    return "*";
  })();
  var editing = true;
  var selected = null;
  var multiSelected = [];
  var hovered = null;
  var editingText = null;
  var originalEditingText = "";
  var label = null;
  var toolbar = null;
  var resizeObserver = null;
  var liveStyle = null;
  var liveRules = {};

  var SKIP_TAGS = {
    html: true,
    head: true,
    body: true,
    script: true,
    style: true,
    link: true,
    meta: true,
    title: true,
    base: true,
    noscript: true
  };

  var STYLE_PROPERTIES = {
    color: "color",
    backgroundColor: "background-color",
    fontSize: "font-size",
    fontWeight: "font-weight",
    padding: "padding",
    margin: "margin",
    borderRadius: "border-radius",
    display: "display",
    flexDirection: "flex-direction",
    flexWrap: "flex-wrap",
    alignItems: "align-items",
    justifyContent: "justify-content",
    gap: "gap",
    gridTemplateColumns: "grid-template-columns"
  };

  var STYLE_KEYS = [
    "color",
    "backgroundColor",
    "fontSize",
    "fontWeight",
    "padding",
    "margin",
    "borderRadius",
    "display",
    "flexDirection",
    "flexWrap",
    "alignItems",
    "justifyContent",
    "gap",
    "gridTemplateColumns"
  ];

  function post(type, payload) {
    var message = { channel: CHANNEL, type: type };
    if (payload !== undefined) message.payload = payload;
    try {
      window.parent.postMessage(message, PARENT_ORIGIN);
    } catch (error) {
      /* parent tidak tersedia */
    }
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isSafeId(value) {
    return typeof value === "string" && /^ve-\d{1,8}$/.test(value);
  }

  function installStyles() {
    var style = document.createElement("style");
    style.setAttribute("data-ve-ui", "");
    style.textContent = [
      "[data-ve-hovered]{outline:1.5px dashed #60a5fa !important;outline-offset:2px !important;cursor:crosshair !important;}",
      "[data-ve-selected]{outline:2px solid #3b82f6 !important;outline-offset:2px !important;}",
      "#__ve_label{position:fixed;z-index:2147483647;display:none;align-items:center;max-width:300px;height:20px;padding:0 7px;border-radius:4px;background:#18181b;color:#93c5fd;border:1px solid rgba(59,130,246,0.4);font:600 10.5px/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(0,0,0,.5);pointer-events:none;}",
      "#__ve_toolbar{position:fixed;z-index:2147483647;display:none;align-items:center;gap:2px;padding:3px;border-radius:7px;background:rgba(24,24,27,0.95);color:#d4d4d8;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 24px rgba(0,0,0,0.6);backdrop-filter:blur(10px);pointer-events:auto;user-select:none;}",
      "#__ve_toolbar button{all:unset;display:grid;place-items:center;width:22px;height:22px;border-radius:4px;color:#a1a1aa;cursor:pointer;transition:all 120ms ease;}",
      "#__ve_toolbar button:hover{background:rgba(255,255,255,0.12);color:#f4f4f5;}",
      "#__ve_toolbar button.danger:hover{background:rgba(239,68,68,0.22);color:#f87171;}",
      "#__ve_toolbar .sep{width:1px;height:12px;background:rgba(255,255,255,0.14);margin:0 1px;}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(style);
  }

  function installLabel() {
    label = document.createElement("div");
    label.id = "__ve_label";
    label.setAttribute("data-ve-ui", "");
    document.documentElement.appendChild(label);
  }

  function installToolbar() {
    toolbar = document.createElement("div");
    toolbar.id = "__ve_toolbar";
    toolbar.setAttribute("data-ve-ui", "");
    toolbar.innerHTML = [
      '<button type="button" data-cmd="select-parent" title="Pilih parent"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="duplicate" title="Duplikat (Ctrl/Cmd+D)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>',
      '<button type="button" data-cmd="move-up" title="Pindahkan ke atas"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></button>',
      '<button type="button" data-cmd="move-down" title="Pindahkan ke bawah"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="delete" class="danger" title="Hapus (Delete)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>'
    ].join("");

    toolbar.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    toolbar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var btn = e.target.closest("button");
      if (!btn || !selected) return;
      var cmd = btn.getAttribute("data-cmd");
      if (cmd === "select-parent") {
        selectParent({ id: selected.getAttribute("data-ve-id") || "" });
      } else if (cmd === "duplicate") {
        post("command", { name: "duplicate" });
      } else if (cmd === "move-up") {
        post("command", { name: "move-up" });
      } else if (cmd === "move-down") {
        post("command", { name: "move-down" });
      } else if (cmd === "delete") {
        post("command", { name: "delete" });
      }
    });

    document.documentElement.appendChild(toolbar);
  }

  function findElement(id) {
    if (!isSafeId(id)) return null;
    return document.querySelector('[data-ve-id="' + id + '"]');
  }

  function resolveElement(target) {
    if (!target) return null;
    var element = target.nodeType === 1 ? target : target.parentElement;
    if (!element) return null;
    if (element.closest("[data-ve-ui]")) return null;

    var candidate = element.closest("[data-ve-id]");
    while (candidate) {
      if (!SKIP_TAGS[String(candidate.tagName).toLowerCase()]) return candidate;
      candidate = candidate.parentElement
        ? candidate.parentElement.closest("[data-ve-id]")
        : null;
    }
    return null;
  }

  function getClassName(element) {
    var value = element.getAttribute("class");
    return typeof value === "string" ? value : "";
  }

  function getElementText(element) {
    var value = typeof element.innerText === "string" ? element.innerText : element.textContent;
    return (value || "").replace(/\u00a0/g, " ").trim().slice(0, 200000);
  }

  function buildElementInfo(element) {
    var computed = window.getComputedStyle(element);
    var style = {};
    STYLE_KEYS.forEach(function (key) {
      style[key] = computed[STYLE_PROPERTIES[key]] || "";
    });

    var href = element.getAttribute("href");
    if (href === null) href = element.getAttribute("data-href");
    var sourceSrc = element.getAttribute("data-ve-source-src");

    return {
      id: element.getAttribute("data-ve-id") || "",
      tag: String(element.tagName).toLowerCase(),
      className: getClassName(element),
      text: getElementText(element),
      href: typeof href === "string" ? href : "",
      src:
        sourceSrc !== null
          ? sourceSrc
          : element.getAttribute("src") || "",
      hasChildren: element.children.length > 0,
      style: style
    };
  }

  function updateLabel() {
    if (!label) return;
    if (!selected || !selected.isConnected || !editing) {
      label.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      return;
    }

    var rect = selected.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      label.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      return;
    }

    var tag = String(selected.tagName).toLowerCase();
    var classes = getClassName(selected).trim();
    label.textContent = classes ? tag + " \u00b7 " + classes : tag;
    label.style.display = "flex";

    var labelWidth = Math.min(label.offsetWidth || 120, Math.max(window.innerWidth - 16, 40));
    var left = Math.max(6, Math.min(rect.left, window.innerWidth - labelWidth - 6));
    var top = rect.top > 24 ? rect.top - 22 : Math.min(rect.top + 4, window.innerHeight - 26);
    label.style.left = left + "px";
    label.style.top = Math.max(top, 4) + "px";

    if (toolbar) {
      toolbar.style.display = "flex";
      var tbWidth = toolbar.offsetWidth || 140;
      var tbLeft = Math.max(6, Math.min(rect.left, window.innerWidth - tbWidth - 6));
      var tbTop = 0;
      if (rect.bottom + 36 < window.innerHeight) {
        tbTop = rect.bottom + 6;
      } else if (rect.top > 54) {
        tbTop = rect.top - 52;
      } else {
        tbTop = Math.max(4, rect.bottom - 32);
      }
      toolbar.style.left = tbLeft + "px";
      toolbar.style.top = Math.max(tbTop, 4) + "px";
    }
  }

  function clearHover() {
    if (hovered) hovered.removeAttribute("data-ve-hovered");
    hovered = null;
  }

  function syncLabelTap() {
    updateLabel();
    if (selected && "ResizeObserver" in window) {
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(function () {
        updateLabel();
      });
      resizeObserver.observe(selected);
    }
  }

  function selectElement(element, notify, scroll, isShift) {
    if (!element || !element.isConnected) return;
    if (editingText && editingText !== element) finishTextEditing();

    if (isShift) {
      if (selected && multiSelected.indexOf(selected) < 0) {
        multiSelected.push(selected);
      }
      var idx = multiSelected.indexOf(element);
      if (idx >= 0) {
        multiSelected.splice(idx, 1);
        element.removeAttribute("data-ve-selected");
        selected = multiSelected[multiSelected.length - 1] || null;
      } else {
        multiSelected.push(element);
        element.setAttribute("data-ve-selected", "");
        selected = element;
      }
    } else {
      multiSelected.forEach(function (el) {
        el.removeAttribute("data-ve-selected");
      });
      if (selected) selected.removeAttribute("data-ve-selected");
      multiSelected = [element];
      selected = element;
      selected.setAttribute("data-ve-selected", "");
    }

    clearHover();
    syncLabelTap();
    updateLabel();

    if (scroll && selected) {
      try {
        selected.scrollIntoView({ block: "center", inline: "nearest" });
      } catch (error) {
        selected.scrollIntoView();
      }
      updateLabel();
    }

    if (notify) {
      if (multiSelected.length > 1) {
        post("multi-select", { elements: multiSelected.map(buildElementInfo) });
      } else if (selected) {
        post("select", buildElementInfo(selected));
      } else {
        post("deselect");
      }
    }
  }

  function deselect(notify) {
    multiSelected.forEach(function (el) {
      el.removeAttribute("data-ve-selected");
    });
    multiSelected = [];
    if (selected) selected.removeAttribute("data-ve-selected");
    selected = null;
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (label) label.style.display = "none";
    if (toolbar) toolbar.style.display = "none";
    if (notify) post("deselect");
  }

  function canEditText(element) {
    if (!element || SKIP_TAGS[String(element.tagName).toLowerCase()]) return false;
    if (!(element.textContent || "").trim()) return false;

    for (var i = 0; i < element.childNodes.length; i += 1) {
      var node = element.childNodes[i];
      if (node.nodeType === 3 || node.nodeType === 8) continue;
      if (node.nodeType === 1 && String(node.tagName).toLowerCase() === "br") continue;
      return false;
    }
    return true;
  }

  function finishTextEditing() {
    if (!editingText) return;
    var element = editingText;
    editingText = null;
    element.removeEventListener("blur", finishTextEditing);
    element.removeAttribute("contenteditable");
    var text = element.textContent || "";
    if (text !== originalEditingText) {
      post("text", { id: element.getAttribute("data-ve-id") || "", text: text });
    }
    originalEditingText = "";
  }

  function beginTextEditing(element) {
    if (!canEditText(element) || editingText === element) return;
    if (editingText) finishTextEditing();

    selectElement(element, true);
    editingText = element;
    originalEditingText = element.textContent || "";
    element.setAttribute("contenteditable", "true");
    element.focus({ preventScroll: true });
    element.addEventListener("blur", finishTextEditing);
  }

  function applyStyles(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element || element !== selected) return;
    if (!isRecord(payload.styles)) return;

    STYLE_KEYS.forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(payload.styles, key)) return;
      var value = payload.styles[key];
      if (typeof value !== "string" || value.length > 2000) return;
      var property = STYLE_PROPERTIES[key];
      value = value.trim();
      if (value) {
        try {
          element.style.setProperty(property, value);
        } catch (error) {
          /* nilai CSS tidak valid */
        }
      } else {
        element.style.removeProperty(property);
      }
    });

    updateLabel();
  }

  function applyAttribute(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element || element !== selected) return;
    if (payload.name !== "href" && payload.name !== "src") return;
    if (typeof payload.value !== "string" || payload.value.length > 4000) return;
    var value = payload.value.trim();
    if (value) element.setAttribute(payload.name, value);
    else element.removeAttribute(payload.name);
    updateLabel();
  }

  function ensureLiveStyle() {
    if (liveStyle && liveStyle.isConnected) return liveStyle;
    liveStyle = document.createElement("style");
    liveStyle.setAttribute("data-ve-ui", "");
    liveStyle.setAttribute("data-ve-live-css", "");
    (document.head || document.documentElement).appendChild(liveStyle);
    return liveStyle;
  }

  function renderLiveCss() {
    var style = ensureLiveStyle();
    var scopes = ["desktop", "tablet", "mobile"];
    var medias = {
      tablet: "(max-width: 1024px) and (min-width: 641px)",
      mobile: "(max-width: 640px)"
    };
    var chunks = [];

    scopes.forEach(function (scope) {
      var rules = [];
      Object.keys(liveRules).forEach(function (key) {
        var entry = liveRules[key];
        if (!entry || entry.scope !== scope) return;
        var declarations = [];
        STYLE_KEYS.forEach(function (styleKey) {
          var value = entry.styles[styleKey];
          if (typeof value !== "string" || !value) return;
          var suffix =
            scope !== "desktop" && !/!important/i.test(value)
              ? " !important"
              : "";
          declarations.push(
            STYLE_PROPERTIES[styleKey] + ": " + value + suffix + ";"
          );
        });
        if (!declarations.length) return;
        rules.push(entry.selector + " { " + declarations.join(" ") + " }");
      });
      if (!rules.length) return;
      if (scope === "desktop") chunks.push(rules.join("\n"));
      else chunks.push("@media " + medias[scope] + " {\n  " + rules.join("\n  ") + "\n}");
    });

    style.textContent = chunks.join("\n");
  }

  function applyCss(payload) {
    if (!isRecord(payload)) return;
    if (typeof payload.selector !== "string") return;
    var selector = payload.selector.trim();
    if (!selector || selector.length > 4000) return;
    if (/[{}]/.test(selector)) return;
    if (
      payload.scope !== "desktop" &&
      payload.scope !== "tablet" &&
      payload.scope !== "mobile"
    ) {
      return;
    }
    if (!isRecord(payload.styles)) return;

    var key = payload.scope + "\u0000" + selector;
    var entry = liveRules[key] || {
      selector: selector,
      scope: payload.scope,
      styles: {}
    };

    STYLE_KEYS.forEach(function (styleKey) {
      if (!Object.prototype.hasOwnProperty.call(payload.styles, styleKey)) return;
      var value = payload.styles[styleKey];
      if (typeof value !== "string" || value.length > 2000) return;
      value = value.replace(/[;{}]/g, "").replace(/\s+/g, " ").trim();
      if (value) entry.styles[styleKey] = value;
      else delete entry.styles[styleKey];
    });

    liveRules[key] = entry;
    renderLiveCss();
    updateLabel();
  }

  function applyText(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element || element !== selected) return;
    if (typeof payload.text !== "string" || payload.text.length > 200000) return;
    element.textContent = payload.text;
    updateLabel();
  }

  function deleteSelected(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element || element !== selected) return;
    element.remove();
    deselect(true);
  }

  function selectParent(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element || element !== selected) return;
    var parent = element.parentElement;
    if (!parent || SKIP_TAGS[String(parent.tagName).toLowerCase()]) return;
    var target = resolveElement(parent);
    if (target) selectElement(target, true);
  }

  function setMode(payload) {
    if (!isRecord(payload) || (payload.mode !== "editing" && payload.mode !== "viewing")) return;
    editing = payload.mode === "editing";
    if (!editing) {
      finishTextEditing();
      clearHover();
      deselect(false);
    }
  }

  function scrollToHash(href) {
    var id = href.slice(1);
    var target = null;
    if (id) {
      target = document.getElementById(id);
      if (!target) {
        try {
          target = document.querySelector('[name="' + id.replace(/"/g, '\\"') + '"]');
        } catch (error) {
          target = null;
        }
      }
    }
    if (target) {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        target.scrollIntoView();
      }
      return;
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }

  function handleViewingLink(anchor) {
    var raw = anchor.getAttribute("href");
    if (raw === null) raw = anchor.getAttribute("data-href");
    if (raw === null) return false;

    // Tautan jangkar di srcdoc akan mengarah ke URL app induk bila dibiarkan.
    // Tangani sendiri agar preview tidak berpindah ke halaman editor.
    if (raw === "" || raw.charAt(0) === "#") {
      scrollToHash(raw.charAt(0) === "#" ? raw : "#");
      return true;
    }

    // Kirim href mentah agar editor dapat membedakan halaman project lokal
    // dari URL eksternal. anchor.href pada srcdoc tidak bisa dijadikan acuan
    // karena relatif terhadap dokumen preview, bukan file HTML sumber.
    var trimmed = raw.trim();
    var external = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(trimmed);
    post("link", { href: trimmed.slice(0, 2000), external: external });
    return true;
  }

  function isOwnMessage(event) {
    if (event.source !== window.parent) return false;
    if (PARENT_ORIGIN !== "*" && event.origin === PARENT_ORIGIN) return true;
    if (PARENT_ORIGIN === "*") return true;
    // srcdoc dengan sandbox dapat melaporkan origin "null" di sebagian browser.
    return event.origin === "null";
  }

  window.addEventListener("message", function (event) {
    if (!isOwnMessage(event)) return;
    var data = event.data;
    if (!isRecord(data) || data.channel !== CHANNEL || typeof data.type !== "string") return;

    if (data.type === "set-mode") setMode(data.payload);
    else if (data.type === "set-style") applyStyles(data.payload);
    else if (data.type === "set-text") applyText(data.payload);
    else if (data.type === "set-attribute") applyAttribute(data.payload);
    else if (data.type === "delete-element") deleteSelected(data.payload);
    else if (data.type === "select-parent") selectParent(data.payload);
    else if (data.type === "set-css") applyCss(data.payload);
    else if (data.type === "select") {
      if (isRecord(data.payload) && isSafeId(data.payload.id)) {
        var target = findElement(data.payload.id);
        if (target) {
          selectElement(target, true, data.payload.scroll === true);
        }
      }
    }
  });

  document.addEventListener(
    "mouseover",
    function (event) {
      if (!editing || editingText) return;
      var element = resolveElement(event.target);
      if (hovered === element) return;
      clearHover();
      if (element && element !== selected) {
        hovered = element;
        hovered.setAttribute("data-ve-hovered", "");
      }
    },
    true
  );

  document.addEventListener(
    "mouseout",
    function (event) {
      if (!event.relatedTarget) clearHover();
    },
    true
  );

  document.addEventListener(
    "click",
    function (event) {
      if (!editing) {
        var anchor =
          event.target && event.target.closest
            ? event.target.closest("a[href], button[href], [data-href]")
            : null;
        if (anchor && handleViewingLink(anchor)) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }
      if (editingText && editingText.contains(event.target)) return;
      if (editingText) finishTextEditing();

      var element = resolveElement(event.target);
      if (!element) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      selectElement(element, true, false, event.shiftKey);
    },
    true
  );

  document.addEventListener(
    "dblclick",
    function (event) {
      if (!editing) return;
      var element = resolveElement(event.target);
      if (!element || !canEditText(element)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      beginTextEditing(element);
    },
    true
  );

  document.addEventListener("keydown", function (event) {
    if (!editing) return;

    if (editingText) {
      if (event.key === "Escape" || ((event.metaKey || event.ctrlKey) && event.key === "Enter")) {
        event.preventDefault();
        editingText.blur();
      }
      return;
    }

    var command = (event.metaKey || event.ctrlKey) ? event.key.toLowerCase() : "";
    if (command === "z") {
      event.preventDefault();
      post("command", { name: event.shiftKey ? "redo" : "undo" });
      return;
    }
    if (command === "y") {
      event.preventDefault();
      post("command", { name: "redo" });
      return;
    }
    if (command === "d" && selected) {
      event.preventDefault();
      post("command", { name: "duplicate" });
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selected) {
      event.preventDefault();
      post("command", { name: "delete" });
      return;
    }

    if (event.key === "Escape" && selected) {
      event.preventDefault();
      deselect(true);
    }
  });

  window.addEventListener("resize", updateLabel);
  window.addEventListener("scroll", updateLabel, true);
  document.addEventListener("scroll", updateLabel, true);

  installStyles();
  installLabel();
  installToolbar();

  function announceReady() {
    post("ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", announceReady, { once: true });
  } else {
    announceReady();
  }

  window.setTimeout(announceReady, 250);
  window.setTimeout(announceReady, 900);
})();
`;
