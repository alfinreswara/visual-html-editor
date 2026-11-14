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
  var SESSION_TOKEN = (function () {
    try {
      return window.__KANVAS_SESSION_TOKEN__ || "";
    } catch (e) {
      return "";
    }
  })();
  var PARENT_ORIGIN = (function () {
    try {
      if (window.__KANVAS_PARENT_ORIGIN__ && window.__KANVAS_PARENT_ORIGIN__ !== "*") {
        return window.__KANVAS_PARENT_ORIGIN__;
      }
    } catch (e) {}
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
  var originalEditingHtml = "";
  var label = null;
  var toolbar = null;
  var richTextToolbar = null;
  var savedRange = null;
  var contextMenu = null;
  var dropIndicator = null;
  var dropBadge = null;
  var resizeBox = null;
  var sizeBadge = null;
  var resizeObserver = null;
  var liveStyle = null;
  var liveRules = {};

  var isDragging = false;
  var dragCandidate = null;
  var dragPosition = null;
  var dragStartPoint = null;

  var isResizing = false;
  var resizeHandleType = null;
  var resizeStartPoint = null;
  var resizeStartRect = null;
  var resizeAspectRatio = 1;

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

  var RESIZE_TAGS = {
    img: true,
    video: true,
    iframe: true,
    canvas: true,
    svg: true,
    div: true,
    section: true,
    article: true,
    header: true,
    footer: true,
    aside: true,
    nav: true,
    main: true
  };

  var CONTAINER_TAGS = {
    body: true,
    div: true,
    section: true,
    article: true,
    main: true,
    header: true,
    footer: true,
    nav: true,
    aside: true,
    ul: true,
    ol: true,
    li: true,
    dl: true,
    form: true,
    fieldset: true,
    figure: true,
    blockquote: true
  };

  var STYLE_PROPERTIES = {
    // Layout
    display: "display",
    flexDirection: "flex-direction",
    flexWrap: "flex-wrap",
    justifyContent: "justify-content",
    alignItems: "align-items",
    alignSelf: "align-self",
    gap: "gap",
    direction: "direction",
    gridTemplateColumns: "grid-template-columns",
    gridTemplateRows: "grid-template-rows",

    // Size
    width: "width",
    height: "height",
    minWidth: "min-width",
    maxWidth: "max-width",
    minHeight: "min-height",
    maxHeight: "max-height",

    // Spacing
    margin: "margin",
    marginTop: "margin-top",
    marginRight: "margin-right",
    marginBottom: "margin-bottom",
    marginLeft: "margin-left",
    padding: "padding",
    paddingTop: "padding-top",
    paddingRight: "padding-right",
    paddingBottom: "padding-bottom",
    paddingLeft: "padding-left",

    // Typography
    fontFamily: "font-family",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    letterSpacing: "letter-spacing",
    textAlign: "text-align",
    textDecoration: "text-decoration",
    textTransform: "text-transform",
    color: "color",

    // Background
    backgroundColor: "background-color",
    backgroundImage: "background-image",
    backgroundSize: "background-size",
    backgroundPosition: "background-position",
    backgroundRepeat: "background-repeat",

    // Border
    borderWidth: "border-width",
    borderStyle: "border-style",
    borderColor: "border-color",
    borderRadius: "border-radius",
    borderTopLeftRadius: "border-top-left-radius",
    borderTopRightRadius: "border-top-right-radius",
    borderBottomRightRadius: "border-bottom-right-radius",
    borderBottomLeftRadius: "border-bottom-left-radius",

    // Effects
    boxShadow: "box-shadow",
    opacity: "opacity",
    transform: "transform",
    transition: "transition",
    filter: "filter",

    // Position
    position: "position",
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    zIndex: "z-index"
  };

  var STYLE_KEYS = [
    // Layout
    "display",
    "flexDirection",
    "flexWrap",
    "justifyContent",
    "alignItems",
    "alignSelf",
    "gap",
    "direction",
    "gridTemplateColumns",
    "gridTemplateRows",

    // Size
    "width",
    "height",
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",

    // Spacing
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",

    // Typography
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textDecoration",
    "textTransform",
    "color",

    // Background
    "backgroundColor",
    "backgroundImage",
    "backgroundSize",
    "backgroundPosition",
    "backgroundRepeat",

    // Border
    "borderWidth",
    "borderStyle",
    "borderColor",
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomRightRadius",
    "borderBottomLeftRadius",

    // Effects
    "boxShadow",
    "opacity",
    "transform",
    "transition",
    "filter",

    // Position
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "zIndex"
  ];

  function post(type, payload) {
    var message = { channel: CHANNEL, type: type };
    if (SESSION_TOKEN) message.sessionToken = SESSION_TOKEN;
    if (payload !== undefined) message.payload = payload;
    try {
      window.parent.postMessage(message, PARENT_ORIGIN || "*");
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
      "[data-ve-dragging]{opacity:0.45 !important;pointer-events:none !important;}",
      "[data-ve-editing-text]{outline:2px solid #10b981 !important;outline-offset:2px !important;cursor:text !important;}",
      "#__ve_label{position:fixed;z-index:2147483647;display:none;align-items:center;max-width:300px;height:20px;padding:0 7px;border-radius:4px;background:#18181b;color:#93c5fd;border:1px solid rgba(59,130,246,0.4);font:600 10.5px/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(0,0,0,.5);pointer-events:none;}",
      "#__ve_toolbar{position:fixed;z-index:2147483647;display:none;align-items:center;gap:2px;padding:3px;border-radius:7px;background:rgba(24,24,27,0.95);color:#d4d4d8;border:1px solid rgba(255,255,255,0.15);box-shadow:0 8px 24px rgba(0,0,0,0.6);backdrop-filter:blur(10px);pointer-events:auto;user-select:none;}",
      "#__ve_toolbar button{all:unset;display:grid;place-items:center;width:22px;height:22px;border-radius:4px;color:#a1a1aa;cursor:pointer;transition:all 120ms ease;}",
      "#__ve_toolbar button:hover{background:rgba(255,255,255,0.12);color:#f4f4f5;}",
      "#__ve_toolbar button.danger:hover{background:rgba(239,68,68,0.22);color:#f87171;}",
      "#__ve_toolbar .sep{width:1px;height:12px;background:rgba(255,255,255,0.14);margin:0 1px;}",
      "#__ve_context_menu{position:fixed;z-index:2147483647;display:none;min-width:185px;padding:4px;border-radius:8px;background:rgba(24,24,27,0.98);color:#d4d4d8;border:1px solid rgba(255,255,255,0.14);box-shadow:0 12px 32px rgba(0,0,0,0.7);backdrop-filter:blur(12px);font:500 11.5px/1 -apple-system,BlinkMacSystemFont,Inter,sans-serif;user-select:none;}",
      "#__ve_context_menu button{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:between;width:100%;height:26px;padding:0 8px;border-radius:4px;color:#d4d4d8;cursor:pointer;transition:background 100ms ease;}",
      "#__ve_context_menu button:hover{background:rgba(255,255,255,0.1);color:#ffffff;}",
      "#__ve_context_menu button.danger:hover{background:rgba(239,68,68,0.25);color:#fca5a5;}",
      "#__ve_context_menu kbd{font:500 9.5px monospace;color:#71717a;background:rgba(255,255,255,0.06);padding:2px 4px;border-radius:3px;}",
      "#__ve_context_menu .sep{height:1px;background:rgba(255,255,255,0.1);margin:3px 0;}",
      "#__ve_drop_indicator{position:fixed;pointer-events:none;z-index:2147483645;display:none;}",
      "#__ve_drop_indicator.line{height:3px;background:#3b82f6;border-radius:2px;box-shadow:0 0 10px rgba(59,130,246,0.9);}",
      "#__ve_drop_indicator.box{border:2px dashed #3b82f6;background:rgba(59,130,246,0.14);border-radius:6px;box-shadow:inset 0 0 12px rgba(59,130,246,0.2);}",
      "#__ve_drop_badge{position:fixed;pointer-events:none;z-index:2147483647;display:none;align-items:center;height:20px;padding:0 8px;background:#2563eb;color:#ffffff;border-radius:4px;font:600 10.5px/1 monospace;box-shadow:0 4px 14px rgba(0,0,0,0.5);white-space:nowrap;}",
      "#__ve_resize_box{position:fixed;pointer-events:none;z-index:2147483644;display:none;border:1px dashed rgba(59,130,246,0.7);}",
      ".__ve_resize_handle{position:absolute;width:9px;height:9px;background:#ffffff;border:1.5px solid #3b82f6;border-radius:2px;pointer-events:auto;box-shadow:0 1px 4px rgba(0,0,0,0.4);}",
      ".__ve_handle_e{right:-5px;top:50%;transform:translateY(-50%);cursor:ew-resize;}",
      ".__ve_handle_s{bottom:-5px;left:50%;transform:translateX(-50%);cursor:ns-resize;}",
      ".__ve_handle_se{right:-5px;bottom:-5px;cursor:nwse-resize;}",
      ".__ve_handle_w{left:-5px;top:50%;transform:translateY(-50%);cursor:ew-resize;}",
      "#__ve_size_badge{position:fixed;pointer-events:none;z-index:2147483647;display:none;align-items:center;height:18px;padding:0 6px;border-radius:4px;background:#18181b;color:#93c5fd;border:1px solid rgba(59,130,246,0.4);font:600 10px monospace;box-shadow:0 3px 10px rgba(0,0,0,0.5);}",
      "#__ve_rich_text_toolbar{position:fixed;z-index:2147483647;display:none;align-items:center;gap:3px;padding:3px 5px;border-radius:8px;background:rgba(24,24,27,0.96);color:#e4e4e7;border:1px solid rgba(255,255,255,0.15);box-shadow:0 12px 30px rgba(0,0,0,0.7);backdrop-filter:blur(12px);pointer-events:auto;user-select:none;font:500 11px/1 -apple-system,BlinkMacSystemFont,Inter,sans-serif;}",
      "#__ve_rich_text_toolbar button{all:unset;box-sizing:border-box;display:grid;place-items:center;width:22px;height:22px;border-radius:4px;color:#a1a1aa;cursor:pointer;transition:all 100ms ease;}",
      "#__ve_rich_text_toolbar button:hover{background:rgba(255,255,255,0.12);color:#ffffff;}",
      "#__ve_rich_text_toolbar button.active{background:rgba(59,130,246,0.3);color:#60a5fa;}",
      "#__ve_rich_text_toolbar select{all:unset;box-sizing:border-box;height:20px;padding:0 3px;border-radius:4px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#d4d4d8;font:500 10.5px/1 monospace;cursor:pointer;}",
      "#__ve_rich_text_toolbar select:hover{background:rgba(255,255,255,0.1);color:#ffffff;}",
      "#__ve_rich_text_toolbar select option{background:#18181b;color:#f4f4f5;}",
      "#__ve_rich_text_toolbar .sep{width:1px;height:12px;background:rgba(255,255,255,0.14);margin:0 1px;}",
      "#__ve_rich_text_toolbar .color-wrap{position:relative;display:grid;place-items:center;width:22px;height:22px;border-radius:4px;cursor:pointer;}",
      "#__ve_rich_text_toolbar .color-wrap:hover{background:rgba(255,255,255,0.1);}",
      "#__ve_rich_text_toolbar .color-wrap input[type=color]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;padding:0;border:0;}"
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
      '<button type="button" data-cmd="drag" title="Tarik untuk memindahkan elemen" style="cursor:grab;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="select-parent" title="Pilih parent (Esc)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>',
      '<button type="button" data-cmd="select-child" title="Pilih elemen anak"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="duplicate" title="Duplikat (Ctrl/Cmd+D)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>',
      '<button type="button" data-cmd="move-up" title="Pindahkan ke atas"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></button>',
      '<button type="button" data-cmd="move-down" title="Pindahkan ke bawah"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="delete" class="danger" title="Hapus (Delete)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>'
    ].join("");

    toolbar.addEventListener("mousedown", function (e) {
      var dragBtn = e.target.closest('button[data-cmd="drag"]');
      if (dragBtn && selected) {
        e.preventDefault();
        e.stopPropagation();
        startDragging(e);
        return;
      }
      e.stopPropagation();
    });

    toolbar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var btn = e.target.closest("button");
      if (!btn || !selected) return;
      var cmd = btn.getAttribute("data-cmd");
      if (cmd === "drag") {
        return;
      } else if (cmd === "select-parent") {
        selectParent({ id: selected.getAttribute("data-ve-id") || "" });
      } else if (cmd === "select-child") {
        selectChild({ id: selected.getAttribute("data-ve-id") || "" });
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

  function installContextMenu() {
    contextMenu = document.createElement("div");
    contextMenu.id = "__ve_context_menu";
    contextMenu.setAttribute("data-ve-ui", "");
    contextMenu.innerHTML = [
      '<button type="button" data-cmd="cut"><span>Potong</span><kbd>Ctrl+X</kbd></button>',
      '<button type="button" data-cmd="copy"><span>Salin</span><kbd>Ctrl+C</kbd></button>',
      '<button type="button" data-cmd="paste"><span>Tempel</span><kbd>Ctrl+V</kbd></button>',
      '<button type="button" data-cmd="duplicate"><span>Duplikat</span><kbd>Ctrl+D</kbd></button>',
      '<div class="sep"></div>',
      '<button type="button" data-cmd="select-parent"><span>Pilih Parent</span><kbd>Esc</kbd></button>',
      '<button type="button" data-cmd="select-child"><span>Pilih Child</span><kbd></kbd></button>',
      '<div class="sep"></div>',
      '<button type="button" data-cmd="move-up"><span>Pindahkan ke Atas</span><kbd>Alt+\u2191</kbd></button>',
      '<button type="button" data-cmd="move-down"><span>Pindahkan ke Bawah</span><kbd>Alt+\u2193</kbd></button>',
      '<div class="sep"></div>',
      '<button type="button" data-cmd="save-section"><span>Simpan Section</span><kbd></kbd></button>',
      '<div class="sep"></div>',
      '<button type="button" data-cmd="delete" class="danger"><span>Hapus</span><kbd>Del</kbd></button>'
    ].join("");

    contextMenu.addEventListener("mousedown", function (e) {
      e.stopPropagation();
    });

    contextMenu.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var btn = e.target.closest("button");
      if (!btn || !selected) return;
      var cmd = btn.getAttribute("data-cmd");
      hideContextMenu();

      if (cmd === "select-parent") {
        selectParent({ id: selected.getAttribute("data-ve-id") || "" });
      } else if (cmd === "select-child") {
        selectChild({ id: selected.getAttribute("data-ve-id") || "" });
      } else {
        post("command", { name: cmd });
      }
    });

    document.documentElement.appendChild(contextMenu);
  }

  function showContextMenu(x, y) {
    if (!contextMenu) return;
    contextMenu.style.display = "block";
    var width = contextMenu.offsetWidth || 185;
    var height = contextMenu.offsetHeight || 260;
    var left = Math.max(6, Math.min(x, window.innerWidth - width - 6));
    var top = Math.max(6, Math.min(y, window.innerHeight - height - 6));
    contextMenu.style.left = left + "px";
    contextMenu.style.top = top + "px";
  }

  function hideContextMenu() {
    if (contextMenu) contextMenu.style.display = "none";
  }

  function installDropIndicator() {
    dropIndicator = document.createElement("div");
    dropIndicator.id = "__ve_drop_indicator";
    dropIndicator.setAttribute("data-ve-ui", "");
    document.documentElement.appendChild(dropIndicator);

    dropBadge = document.createElement("div");
    dropBadge.id = "__ve_drop_badge";
    dropBadge.setAttribute("data-ve-ui", "");
    document.documentElement.appendChild(dropBadge);
  }

  function installResizeBox() {
    resizeBox = document.createElement("div");
    resizeBox.id = "__ve_resize_box";
    resizeBox.setAttribute("data-ve-ui", "");
    resizeBox.innerHTML = [
      '<div class="__ve_resize_handle __ve_handle_e" data-handle="e" title="Ubah lebar"></div>',
      '<div class="__ve_resize_handle __ve_handle_s" data-handle="s" title="Ubah tinggi"></div>',
      '<div class="__ve_resize_handle __ve_handle_se" data-handle="se" title="Ubah ukuran"></div>',
      '<div class="__ve_resize_handle __ve_handle_w" data-handle="w" title="Ubah lebar"></div>'
    ].join("");

    resizeBox.addEventListener("mousedown", function (e) {
      var handle = e.target.closest(".__ve_resize_handle");
      if (!handle || !selected) return;
      e.preventDefault();
      e.stopPropagation();
      startResizing(handle.getAttribute("data-handle"), e);
    });

    document.documentElement.appendChild(resizeBox);

    sizeBadge = document.createElement("div");
    sizeBadge.id = "__ve_size_badge";
    sizeBadge.setAttribute("data-ve-ui", "");
    document.documentElement.appendChild(sizeBadge);
  }

  function saveCurrentRange() {
    var sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      try {
        savedRange = sel.getRangeAt(0).cloneRange();
      } catch (e) {}
    }
  }

  function restoreSavedRange() {
    if (!savedRange) return null;
    var sel = window.getSelection();
    if (sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange);
        return sel;
      } catch (e) {}
    }
    return null;
  }

  function getContainingVeElement(node) {
    if (!node) return selected || document.body;
    var el = node.nodeType === 1 ? node : node.parentElement;
    while (el && el !== document.body) {
      if (el.hasAttribute && el.hasAttribute("data-ve-id") && !el.hasAttribute("data-ve-ui")) {
        return el;
      }
      el = el.parentElement;
    }
    return selected || document.body;
  }

  function notifyRichTextCommit(container) {
    if (!container) return;
    var id = container.getAttribute("data-ve-id");
    if (!id) return;
    var html = container.innerHTML || "";
    post("html", { id: id, html: html });
    updateLabel();
  }

  function wrapRangeWithTag(range, tagName) {
    var wrapper = document.createElement(tagName);
    try {
      var frag = range.extractContents();
      wrapper.appendChild(frag);
      range.insertNode(wrapper);
      var sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        var nr = document.createRange();
        nr.selectNodeContents(wrapper);
        sel.addRange(nr);
        savedRange = nr.cloneRange();
      }
    } catch (err) {
      try {
        var cmd = tagName === "strong" ? "bold" : (tagName === "em" ? "italic" : tagName);
        document.execCommand(cmd, false, null);
      } catch (e2) {}
    }
  }

  function wrapRangeWithSpan(range, styleObj) {
    var span = document.createElement("span");
    for (var k in styleObj) {
      span.style[k] = styleObj[k];
    }
    try {
      var frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
      var sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        var nr = document.createRange();
        nr.selectNodeContents(span);
        sel.addRange(nr);
        savedRange = nr.cloneRange();
      }
    } catch (err) {}
  }

  function unwrapElement(element) {
    var p = element.parentNode;
    if (!p) return;
    while (element.firstChild) {
      p.insertBefore(element.firstChild, element);
    }
    p.removeChild(element);
    p.normalize();
  }

  function findBlockContainer(node) {
    if (!node) return null;
    var el = node.nodeType === 1 ? node : node.parentElement;
    var BLOCK_REGEX = /^(p|h[1-6]|div|section|article|li|blockquote|header|footer|aside|main|td|th)$/i;
    while (el && el !== document.body) {
      if (BLOCK_REGEX.test(el.tagName)) return el;
      el = el.parentElement;
    }
    return el || document.body;
  }

  function getEffectiveRange() {
    restoreSavedRange();
    var sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      return sel.getRangeAt(0);
    }
    if (savedRange && !savedRange.collapsed) {
      return savedRange;
    }
    return null;
  }

  function isSafeLinkUrl(url) {
    if (!url) return false;
    var trimmed = url.trim();
    if (!trimmed) return false;
    return !/^\s*(?:javascript|data|vbscript):/i.test(trimmed);
  }

  function execBold() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);

    var parent = range.commonAncestorContainer;
    var el = parent.nodeType === 1 ? parent : parent.parentElement;
    var strongEl = el ? el.closest("strong, b") : null;
    if (strongEl && container && container.contains(strongEl)) {
      unwrapElement(strongEl);
    } else {
      wrapRangeWithTag(range, "strong");
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function execItalic() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);

    var parent = range.commonAncestorContainer;
    var el = parent.nodeType === 1 ? parent : parent.parentElement;
    var emEl = el ? el.closest("em, i") : null;
    if (emEl && container && container.contains(emEl)) {
      unwrapElement(emEl);
    } else {
      wrapRangeWithTag(range, "em");
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function execUnderline() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);

    var parent = range.commonAncestorContainer;
    var el = parent.nodeType === 1 ? parent : parent.parentElement;
    var uEl = el ? el.closest("u") : null;
    if (uEl && container && container.contains(uEl)) {
      unwrapElement(uEl);
    } else {
      wrapRangeWithTag(range, "u");
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function execStrikethrough() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);

    var parent = range.commonAncestorContainer;
    var el = parent.nodeType === 1 ? parent : parent.parentElement;
    var sEl = el ? el.closest("s, del, strike") : null;
    if (sEl && container && container.contains(sEl)) {
      unwrapElement(sEl);
    } else {
      wrapRangeWithTag(range, "s");
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function execTextAlign(align) {
    var range = getEffectiveRange();
    if (!range) return;
    var block = findBlockContainer(range.commonAncestorContainer);
    if (block) {
      block.style.textAlign = align;
      var ve = getContainingVeElement(block);
      notifyRichTextCommit(ve);
    }
    saveCurrentRange();
  }

  function execFontFamily(family) {
    if (!family) return;
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);
    wrapRangeWithSpan(range, { fontFamily: family });
    notifyRichTextCommit(container);
    saveCurrentRange();
  }

  function execFontSize(size) {
    if (!size) return;
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);
    wrapRangeWithSpan(range, { fontSize: size });
    notifyRichTextCommit(container);
    saveCurrentRange();
  }

  function execColor(color) {
    if (!color) return;
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);
    wrapRangeWithSpan(range, { color: color });
    notifyRichTextCommit(container);
    saveCurrentRange();
  }

  function execHighlight(bgColor) {
    if (!bgColor) return;
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);
    wrapRangeWithSpan(range, { backgroundColor: bgColor });
    notifyRichTextCommit(container);
    saveCurrentRange();
  }

  function execLink() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);
    var parent = range.commonAncestorContainer;
    var el = parent.nodeType === 1 ? parent : parent.parentElement;
    var aEl = el ? el.closest("a") : null;
    if (aEl && container && container.contains(aEl)) {
      var currentHref = aEl.getAttribute("href") || "";
      var newHref = window.prompt("Ubah URL Tautan (kosongkan untuk melepas tautan):", currentHref);
      if (newHref === null) return;
      if (newHref.trim() === "") {
        unwrapElement(aEl);
      } else {
        if (!isSafeLinkUrl(newHref)) {
          window.alert("Protokol URL tidak aman (hanya http, https, mailto, tel, atau tautan relatif diizinkan).");
          return;
        }
        aEl.setAttribute("href", newHref.trim());
      }
    } else {
      var href = window.prompt("Masukkan URL Tautan:", "https://");
      if (!href || !href.trim()) return;
      if (!isSafeLinkUrl(href)) {
        window.alert("Protokol URL tidak aman (hanya http, https, mailto, tel, atau tautan relatif diizinkan).");
        return;
      }
      var a = document.createElement("a");
      a.setAttribute("href", href.trim());
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      try {
        var frag = range.extractContents();
        a.appendChild(frag);
        range.insertNode(a);
        var s = window.getSelection();
        if (s) {
          s.removeAllRanges();
          var nr = document.createRange();
          nr.selectNodeContents(a);
          s.addRange(nr);
          savedRange = nr.cloneRange();
        }
      } catch (err) {}
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function execRemoveFormat() {
    var range = getEffectiveRange();
    if (!range) return;
    var container = getContainingVeElement(range.commonAncestorContainer);

    var text = range.toString();
    try {
      range.deleteContents();
      var textNode = document.createTextNode(text);
      range.insertNode(textNode);
      var s = window.getSelection();
      if (s) {
        s.removeAllRanges();
        var nr = document.createRange();
        nr.selectNodeContents(textNode);
        s.addRange(nr);
        savedRange = nr.cloneRange();
      }
    } catch (err) {
      try {
        document.execCommand("removeFormat", false, null);
      } catch (e2) {}
    }
    notifyRichTextCommit(container);
    saveCurrentRange();
    updateRichTextToolbar();
  }

  function showRichTextToolbarAt(rect) {
    if (!richTextToolbar) return;
    richTextToolbar.style.display = "flex";
    var barW = richTextToolbar.offsetWidth || 380;
    var barH = richTextToolbar.offsetHeight || 32;

    var top = rect.top - barH - 8;
    if (top < 10) {
      top = rect.bottom + 8;
    }
    var left = rect.left + (rect.width / 2) - (barW / 2);
    left = Math.max(8, Math.min(window.innerWidth - barW - 8, left));

    richTextToolbar.style.top = Math.round(top) + "px";
    richTextToolbar.style.left = Math.round(left) + "px";
  }

  function hideRichTextToolbar() {
    if (richTextToolbar) {
      richTextToolbar.style.display = "none";
    }
  }

  function updateRichTextToolbar() {
    if (!editing) {
      hideRichTextToolbar();
      return;
    }
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      hideRichTextToolbar();
      return;
    }
    var text = sel.toString().trim();
    if (!text) {
      hideRichTextToolbar();
      return;
    }

    var anchorNode = sel.anchorNode;
    var focusNode = sel.focusNode;
    if (!anchorNode || !focusNode) {
      hideRichTextToolbar();
      return;
    }
    var anchorEl = anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement;
    var focusEl = focusNode.nodeType === 1 ? focusNode : focusNode.parentElement;
    if (!anchorEl || !focusEl) {
      hideRichTextToolbar();
      return;
    }
    if (anchorEl.closest("[data-ve-ui]") || focusEl.closest("[data-ve-ui]")) {
      return;
    }

    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hideRichTextToolbar();
      return;
    }

    showRichTextToolbarAt(rect);
  }

  function installRichTextToolbar() {
    richTextToolbar = document.createElement("div");
    richTextToolbar.id = "__ve_rich_text_toolbar";
    richTextToolbar.setAttribute("data-ve-ui", "");
    richTextToolbar.innerHTML = [
      '<button type="button" data-cmd="bold" title="Tebal (Bold)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h9a4 4 0 0 1 0 8H6v-8zm0-8h8a3.5 3.5 0 0 1 0 7H6V4z"/></svg></button>',
      '<button type="button" data-cmd="italic" title="Miring (Italic)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg></button>',
      '<button type="button" data-cmd="underline" title="Garis Bawah (Underline)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg></button>',
      '<button type="button" data-cmd="strikethrough" title="Coret (Strikethrough)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/></svg></button>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="align-left" title="Rata Kiri"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg></button>',
      '<button type="button" data-cmd="align-center" title="Rata Tengah"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg></button>',
      '<button type="button" data-cmd="align-right" title="Rata Kanan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg></button>',
      '<button type="button" data-cmd="align-justify" title="Rata Penuh (Justify)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg></button>',
      '<span class="sep"></span>',
      '<select data-cmd="font-family" title="Jenis Font">',
      '<option value="">Font</option>',
      '<option value="Inter, sans-serif">Inter</option>',
      '<option value="Plus Jakarta Sans, sans-serif">Jakarta</option>',
      '<option value="Poppins, sans-serif">Poppins</option>',
      '<option value="Roboto, sans-serif">Roboto</option>',
      '<option value="Playfair Display, serif">Playfair</option>',
      '<option value="Arial, sans-serif">Arial</option>',
      '<option value="Georgia, serif">Georgia</option>',
      '<option value="Courier New, monospace">Courier</option>',
      '</select>',
      '<select data-cmd="font-size" title="Ukuran Font">',
      '<option value="">Ukuran</option>',
      '<option value="12px">12px</option>',
      '<option value="14px">14px</option>',
      '<option value="16px">16px</option>',
      '<option value="18px">18px</option>',
      '<option value="20px">20px</option>',
      '<option value="24px">24px</option>',
      '<option value="28px">28px</option>',
      '<option value="32px">32px</option>',
      '<option value="36px">36px</option>',
      '<option value="48px">48px</option>',
      '</select>',
      '<span class="sep"></span>',
      '<div class="color-wrap" title="Warna Teks">',
      '<span style="display:grid;place-items:center;pointer-events:none;color:#ef4444;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg></span>',
      '<input type="color" data-cmd="text-color" value="#ef4444" />',
      '</div>',
      '<div class="color-wrap" title="Warna Sorotan (Highlight)">',
      '<span style="display:grid;place-items:center;pointer-events:none;color:#f59e0b;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 2-2.5 2.5a2.12 2.12 0 0 1-3 0l-3-3a2.12 2.12 0 0 1 0-3L16 2"/></svg></span>',
      '<input type="color" data-cmd="highlight-color" value="#fef08a" />',
      '</div>',
      '<span class="sep"></span>',
      '<button type="button" data-cmd="link" title="Sisipkan / Edit Tautan"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>',
      '<button type="button" data-cmd="remove-format" title="Hapus Format"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>'
    ].join("");

    richTextToolbar.addEventListener("mousedown", function (e) {
      if (e.target.tagName !== "SELECT" && e.target.tagName !== "INPUT") {
        e.preventDefault();
      }
      e.stopPropagation();
    });

    richTextToolbar.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var cmd = btn.getAttribute("data-cmd");
      if (!cmd) return;
      if (cmd === "bold") execBold();
      else if (cmd === "italic") execItalic();
      else if (cmd === "underline") execUnderline();
      else if (cmd === "strikethrough") execStrikethrough();
      else if (cmd === "align-left") execTextAlign("left");
      else if (cmd === "align-center") execTextAlign("center");
      else if (cmd === "align-right") execTextAlign("right");
      else if (cmd === "align-justify") execTextAlign("justify");
      else if (cmd === "link") execLink();
      else if (cmd === "remove-format") execRemoveFormat();
    });

    richTextToolbar.addEventListener("change", function (e) {
      e.stopPropagation();
      var target = e.target;
      var cmd = target.getAttribute("data-cmd");
      if (!cmd) return;
      if (cmd === "font-family") {
        execFontFamily(target.value);
        target.selectedIndex = 0;
      } else if (cmd === "font-size") {
        execFontSize(target.value);
        target.selectedIndex = 0;
      } else if (cmd === "text-color") {
        execColor(target.value);
      } else if (cmd === "highlight-color") {
        execHighlight(target.value);
      }
    });

    richTextToolbar.addEventListener("input", function (e) {
      e.stopPropagation();
      var target = e.target;
      if (!target || target.tagName !== "INPUT") return;
      var cmd = target.getAttribute("data-cmd");
      if (cmd === "text-color") {
        execColor(target.value);
      } else if (cmd === "highlight-color") {
        execHighlight(target.value);
      }
    });

    document.documentElement.appendChild(richTextToolbar);
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
      var prop = STYLE_PROPERTIES[key];
      style[key] = (computed && (computed.getPropertyValue(prop) || computed[key])) || "";
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

  function canResize(element) {
    if (!element || !element.isConnected) return false;
    var tag = String(element.tagName).toLowerCase();
    return Boolean(RESIZE_TAGS[tag]);
  }

  function updateResizeBox() {
    if (!resizeBox) return;
    if (!selected || !selected.isConnected || !editing || editingText || !canResize(selected)) {
      resizeBox.style.display = "none";
      if (sizeBadge) sizeBadge.style.display = "none";
      return;
    }

    var rect = selected.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      resizeBox.style.display = "none";
      return;
    }

    resizeBox.style.display = "block";
    resizeBox.style.left = rect.left + "px";
    resizeBox.style.top = rect.top + "px";
    resizeBox.style.width = rect.width + "px";
    resizeBox.style.height = rect.height + "px";
  }

  function updateLabel() {
    if (!label) return;
    if (!selected || !selected.isConnected || !editing) {
      label.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      if (resizeBox) resizeBox.style.display = "none";
      return;
    }

    var rect = selected.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      label.style.display = "none";
      if (toolbar) toolbar.style.display = "none";
      if (resizeBox) resizeBox.style.display = "none";
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
      var tbWidth = toolbar.offsetWidth || 160;
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

    updateResizeBox();
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
    if (resizeBox) resizeBox.style.display = "none";
    if (sizeBadge) sizeBadge.style.display = "none";
    hideContextMenu();
    hideRichTextToolbar();
    if (notify) post("deselect");
  }

  function canEditText(element) {
    if (!element || SKIP_TAGS[String(element.tagName).toLowerCase()]) return false;
    var tag = String(element.tagName).toLowerCase();
    if (tag === "img" || tag === "video" || tag === "audio" || tag === "hr" || tag === "input" || tag === "textarea" || tag === "select") {
      return false;
    }
    return true;
  }

  function cancelTextEditing() {
    if (!editingText) return;
    var element = editingText;
    editingText = null;
    element.removeEventListener("blur", finishTextEditing);
    element.removeAttribute("contenteditable");
    element.removeAttribute("data-ve-editing-text");
    if (originalEditingHtml) {
      element.innerHTML = originalEditingHtml;
    } else {
      element.textContent = originalEditingText;
    }
    originalEditingHtml = "";
    originalEditingText = "";
    updateLabel();
  }

  function finishTextEditing() {
    if (!editingText) return;
    var element = editingText;
    editingText = null;
    element.removeEventListener("blur", finishTextEditing);
    element.removeAttribute("contenteditable");
    element.removeAttribute("data-ve-editing-text");
    var html = element.innerHTML || "";
    if (originalEditingHtml && html !== originalEditingHtml) {
      post("html", { id: element.getAttribute("data-ve-id") || "", html: html });
    } else {
      var text = element.textContent || "";
      if (text !== originalEditingText) {
        post("text", { id: element.getAttribute("data-ve-id") || "", text: text });
      }
    }
    originalEditingHtml = "";
    originalEditingText = "";
    updateLabel();
  }

  function beginTextEditing(element) {
    if (!canEditText(element) || editingText === element) return;
    if (editingText) finishTextEditing();

    selectElement(element, true);
    editingText = element;
    originalEditingHtml = element.innerHTML || "";
    originalEditingText = element.textContent || "";
    element.setAttribute("contenteditable", "true");
    element.setAttribute("data-ve-editing-text", "");
    element.focus({ preventScroll: true });
    element.addEventListener("blur", finishTextEditing);
    updateLabel();
  }

  function canAcceptChildren(element) {
    if (!element || !element.isConnected) return false;
    var tag = String(element.tagName).toLowerCase();
    return Boolean(CONTAINER_TAGS[tag]);
  }

  function startDragging(e) {
    if (!selected || isDragging || !editing || editingText) return;
    isDragging = true;
    dragCandidate = null;
    dragPosition = null;
    dragStartPoint = { x: e.clientX, y: e.clientY };

    selected.setAttribute("data-ve-dragging", "");
    document.body.style.cursor = "grabbing";

    function onPointerMove(moveEvent) {
      if (!isDragging || !selected) return;
      var candidate = resolveElement(document.elementFromPoint(moveEvent.clientX, moveEvent.clientY));

      if (!candidate || candidate === selected || selected.contains(candidate)) {
        if (dropIndicator) dropIndicator.style.display = "none";
        if (dropBadge) dropBadge.style.display = "none";
        dragCandidate = null;
        dragPosition = null;
        return;
      }

      var isContainer = canAcceptChildren(candidate);
      var cRect = candidate.getBoundingClientRect();
      var pos = "inside";

      if (isContainer) {
        var topThreshold = Math.max(14, cRect.height * 0.22);
        var bottomThreshold = Math.max(14, cRect.height * 0.22);
        if (moveEvent.clientY < cRect.top + topThreshold && candidate.tagName.toLowerCase() !== "body") {
          pos = "before";
        } else if (moveEvent.clientY > cRect.bottom - bottomThreshold && candidate.tagName.toLowerCase() !== "body") {
          pos = "after";
        } else {
          pos = "inside";
        }
      } else {
        if (moveEvent.clientY < cRect.top + cRect.height * 0.5) {
          pos = "before";
        } else {
          pos = "after";
        }
      }

      dragCandidate = candidate;
      dragPosition = pos;

      if (dropIndicator && dropBadge) {
        dropIndicator.style.display = "block";
        dropBadge.style.display = "flex";
        var cTag = candidate.tagName.toLowerCase();

        if (pos === "before") {
          dropIndicator.className = "line";
          dropIndicator.style.left = cRect.left + "px";
          dropIndicator.style.top = Math.max(2, cRect.top - 2) + "px";
          dropIndicator.style.width = cRect.width + "px";
          dropIndicator.style.height = "3px";
          dropBadge.textContent = "Sisipkan sebelum <" + cTag + ">";
          dropBadge.style.left = cRect.left + "px";
          dropBadge.style.top = Math.max(4, cRect.top - 24) + "px";
        } else if (pos === "after") {
          dropIndicator.className = "line";
          dropIndicator.style.left = cRect.left + "px";
          dropIndicator.style.top = (cRect.bottom - 1) + "px";
          dropIndicator.style.width = cRect.width + "px";
          dropIndicator.style.height = "3px";
          dropBadge.textContent = "Sisipkan setelah <" + cTag + ">";
          dropBadge.style.left = cRect.left + "px";
          dropBadge.style.top = Math.min(window.innerHeight - 24, cRect.bottom + 4) + "px";
        } else {
          dropIndicator.className = "box";
          dropIndicator.style.left = cRect.left + "px";
          dropIndicator.style.top = cRect.top + "px";
          dropIndicator.style.width = cRect.width + "px";
          dropIndicator.style.height = cRect.height + "px";
          dropBadge.textContent = "Masukkan ke dalam <" + cTag + ">";
          dropBadge.style.left = (cRect.left + 8) + "px";
          dropBadge.style.top = (cRect.top + 8) + "px";
        }
      }
    }

    function onPointerUp() {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);

      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = "";
      if (selected) selected.removeAttribute("data-ve-dragging");
      if (dropIndicator) dropIndicator.style.display = "none";
      if (dropBadge) dropBadge.style.display = "none";

      if (dragCandidate && dragPosition && selected) {
        var sourceId = selected.getAttribute("data-ve-id");
        var targetId = dragCandidate.getAttribute("data-ve-id");
        if (sourceId && targetId && sourceId !== targetId) {
          post("move-to", {
            sourceId: sourceId,
            targetId: targetId,
            position: dragPosition
          });
        }
      }

      dragCandidate = null;
      dragPosition = null;
    }

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
  }

  function startResizing(handle, e) {
    if (!selected || isResizing || !editing) return;
    isResizing = true;
    resizeHandleType = handle;
    resizeStartPoint = { x: e.clientX, y: e.clientY };

    var rect = selected.getBoundingClientRect();
    resizeStartRect = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
    resizeAspectRatio = rect.height > 0 ? rect.width / rect.height : 1;

    if (sizeBadge) {
      sizeBadge.style.display = "flex";
      sizeBadge.textContent = Math.round(rect.width) + " \u00d7 " + Math.round(rect.height) + " px";
      sizeBadge.style.left = Math.max(6, rect.right - 80) + "px";
      sizeBadge.style.top = (rect.bottom + 6) + "px";
    }

    var isImg = String(selected.tagName).toLowerCase() === "img";
    var currentW = rect.width;
    var currentH = rect.height;

    function onPointerMove(moveEvent) {
      if (!isResizing || !selected) return;
      var deltaX = moveEvent.clientX - resizeStartPoint.x;
      var deltaY = moveEvent.clientY - resizeStartPoint.y;

      if (resizeHandleType === "e") {
        currentW = Math.max(24, resizeStartRect.width + deltaX);
        selected.style.width = Math.round(currentW) + "px";
      } else if (resizeHandleType === "w") {
        currentW = Math.max(24, resizeStartRect.width - deltaX);
        selected.style.width = Math.round(currentW) + "px";
      } else if (resizeHandleType === "s") {
        currentH = Math.max(24, resizeStartRect.height + deltaY);
        selected.style.height = Math.round(currentH) + "px";
      } else if (resizeHandleType === "se") {
        currentW = Math.max(24, resizeStartRect.width + deltaX);
        if (isImg && resizeAspectRatio > 0) {
          currentH = Math.max(24, currentW / resizeAspectRatio);
        } else {
          currentH = Math.max(24, resizeStartRect.height + deltaY);
        }
        selected.style.width = Math.round(currentW) + "px";
        selected.style.height = Math.round(currentH) + "px";
      }

      var curRect = selected.getBoundingClientRect();
      if (sizeBadge) {
        sizeBadge.textContent = Math.round(curRect.width) + " \u00d7 " + Math.round(curRect.height) + " px";
        sizeBadge.style.left = Math.max(6, curRect.right - 80) + "px";
        sizeBadge.style.top = (curRect.bottom + 6) + "px";
      }

      updateLabel();
      updateResizeBox();
    }

    function onPointerUp() {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);

      if (!isResizing) return;
      isResizing = false;
      if (sizeBadge) sizeBadge.style.display = "none";

      if (selected) {
        var id = selected.getAttribute("data-ve-id");
        var styles = {};
        if (resizeHandleType === "e" || resizeHandleType === "w") {
          styles.width = Math.round(currentW) + "px";
        } else if (resizeHandleType === "s") {
          styles.height = Math.round(currentH) + "px";
        } else if (resizeHandleType === "se") {
          styles.width = Math.round(currentW) + "px";
          styles.height = Math.round(currentH) + "px";
        }
        if (id) {
          post("set-style", { id: id, styles: styles });
        }
      }
    }

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
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
    if (payload.name === "href" && value && !isSafeLinkUrl(value)) return;
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

  function applyHtml(payload) {
    if (!isRecord(payload) || !isSafeId(payload.id)) return;
    var element = findElement(payload.id);
    if (!element) return;
    if (typeof payload.html !== "string" || payload.html.length > 500000) return;
    element.innerHTML = payload.html;
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

  function selectChild(payload) {
    var id = isRecord(payload) && isSafeId(payload.id) ? payload.id : (selected ? selected.getAttribute("data-ve-id") : null);
    if (!id) return;
    var element = findElement(id);
    if (!element) return;
    for (var i = 0; i < element.children.length; i++) {
      var child = element.children[i];
      if (child.closest("[data-ve-ui]")) continue;
      var candidate = resolveElement(child);
      if (candidate && candidate !== element) {
        selectElement(candidate, true);
        return;
      }
    }
  }

  function setMode(payload) {
    if (!isRecord(payload) || (payload.mode !== "editing" && payload.mode !== "viewing")) return;
    editing = payload.mode === "editing";
    if (!editing) {
      finishTextEditing();
      clearHover();
      hideRichTextToolbar();
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

    if (raw === "" || raw.charAt(0) === "#") {
      scrollToHash(raw.charAt(0) === "#" ? raw : "#");
      return true;
    }

    var trimmed = raw.trim();
    var external = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(trimmed);
    post("link", { href: trimmed.slice(0, 2000), external: external });
    return true;
  }

  function isOwnMessage(event) {
    if (event.source !== window.parent) return false;
    if (PARENT_ORIGIN !== "*" && event.origin === PARENT_ORIGIN) return true;
    if (PARENT_ORIGIN === "*") return true;
    return event.origin === "null";
  }

  window.addEventListener("message", function (event) {
    if (!isOwnMessage(event)) return;
    var data = event.data;
    if (!isRecord(data) || data.channel !== CHANNEL || typeof data.type !== "string") return;
    if (SESSION_TOKEN && data.sessionToken && data.sessionToken !== SESSION_TOKEN) return;

    if (data.type === "set-mode") setMode(data.payload);
    else if (data.type === "set-style") applyStyles(data.payload);
    else if (data.type === "set-text") applyText(data.payload);
    else if (data.type === "set-html") applyHtml(data.payload);
    else if (data.type === "set-attribute") applyAttribute(data.payload);
    else if (data.type === "delete-element") deleteSelected(data.payload);
    else if (data.type === "select-parent") selectParent(data.payload);
    else if (data.type === "select-child") selectChild(data.payload);
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
      if (!editing || editingText || isDragging) return;
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
    "mousedown",
    function (event) {
      if (!editing) return;
      if (event.target.closest && event.target.closest("[data-ve-ui]")) return;

      if (event.button === 0 && selected && !editingText) {
        var target = resolveElement(event.target);
        if (target === selected) {
          var startX = event.clientX;
          var startY = event.clientY;
          var dragThresholdCrossed = false;

          function onMouseMoveCheck(moveEvt) {
            var dx = moveEvt.clientX - startX;
            var dy = moveEvt.clientY - startY;
            if (Math.hypot(dx, dy) > 5) {
              dragThresholdCrossed = true;
              window.removeEventListener("mousemove", onMouseMoveCheck);
              window.removeEventListener("mouseup", onMouseUpCheck);
              startDragging(moveEvt);
            }
          }

          function onMouseUpCheck() {
            window.removeEventListener("mousemove", onMouseMoveCheck);
            window.removeEventListener("mouseup", onMouseUpCheck);
          }

          window.addEventListener("mousemove", onMouseMoveCheck);
          window.addEventListener("mouseup", onMouseUpCheck);
        }
      }
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

      hideContextMenu();
      if (editingText && editingText.contains(event.target)) return;
      if (editingText) finishTextEditing();

      var element = resolveElement(event.target);
      if (!element) {
        deselect(true);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      selectElement(element, true, false, event.shiftKey);
    },
    true
  );

  document.addEventListener(
    "contextmenu",
    function (event) {
      if (!editing) return;
      event.preventDefault();
      event.stopPropagation();

      var element = resolveElement(event.target);
      if (element && element !== selected) {
        selectElement(element, true);
      }
      if (selected) {
        showContextMenu(event.clientX, event.clientY);
      }
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
      if (event.key === "Escape") {
        event.preventDefault();
        cancelTextEditing();
        return;
      }
      var isSingleLine = /^(h[1-6]|button|a|span|label)$/i.test(editingText.tagName);
      if (isSingleLine && event.key === "Enter") {
        event.preventDefault();
        finishTextEditing();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        finishTextEditing();
        return;
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
    if (command === "c" && selected) {
      event.preventDefault();
      post("command", { name: "copy" });
      return;
    }
    if (command === "x" && selected) {
      event.preventDefault();
      post("command", { name: "cut" });
      return;
    }
    if (command === "v") {
      event.preventDefault();
      post("command", { name: "paste" });
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selected) {
      event.preventDefault();
      post("command", { name: "delete" });
      return;
    }

    if (event.key === "Escape") {
      if (richTextToolbar && richTextToolbar.style.display !== "none") {
        hideRichTextToolbar();
        return;
      }
      if (contextMenu && contextMenu.style.display !== "none") {
        hideContextMenu();
        return;
      }
      if (selected) {
        event.preventDefault();
        deselect(true);
      }
    }
  });

  window.addEventListener("resize", function () {
    updateLabel();
    updateRichTextToolbar();
  });
  window.addEventListener("scroll", function () {
    updateLabel();
    updateRichTextToolbar();
  }, true);
  document.addEventListener("scroll", function () {
    updateLabel();
    updateRichTextToolbar();
  }, true);

  document.addEventListener("selectionchange", function () {
    saveCurrentRange();
    updateRichTextToolbar();
  });
  document.addEventListener("mouseup", function () {
    saveCurrentRange();
    updateRichTextToolbar();
  });
  document.addEventListener("keyup", function () {
    saveCurrentRange();
    updateRichTextToolbar();
  });

  installStyles();
  installLabel();
  installToolbar();
  installContextMenu();
  installDropIndicator();
  installResizeBox();
  installRichTextToolbar();

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
