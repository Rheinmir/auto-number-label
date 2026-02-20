// Global State
let records = [];
let currentRecordIndex = 0;
let selectedElements = new Set(); // Store Multiple Selected Elements
let currentZoom = 1;

// --- AGENT API (For Programmatic Control) ---
window.LabelDesignerAPI = {
  // Get all elements with their current state
  getElements: () => {
    return Array.from(document.querySelectorAll(".draggable")).map((el) => ({
      id: el.id,
      text: el.innerText,
      x: parseFloat(el.getAttribute("data-x")) || 0,
      y: parseFloat(el.getAttribute("data-y")) || 0,
      style: {
        fontSize: el.style.fontSize,
        fontWeight: el.style.fontWeight,
        color: el.style.color,
        textAlign: el.style.textAlign,
        width: el.style.width,
        top: el.style.top,
        left: el.style.left,
      },
    }));
  },

  // Select elements by ID (pass single ID string or array of strings)
  selectIds: (ids) => {
    clearSelection();
    const idArray = Array.isArray(ids) ? ids : [ids];
    idArray.forEach((id) => {
      const el = document.getElementById(id);
      if (el) addToSelection(el);
    });
    return selectedElements.size;
  },

  // Move an element to absolute/relative position
  moveElement: (id, x, y, isRelative = false) => {
    const el = document.getElementById(id);
    if (!el) return false;

    let newX = x;
    let newY = y;

    if (isRelative) {
      const curX = parseFloat(el.getAttribute("data-x")) || 0;
      const curY = parseFloat(el.getAttribute("data-y")) || 0;
      newX = curX + x;
      newY = curY + y;
    }

    el.style.transform = `translate(${newX}px, ${newY}px)`;
    el.setAttribute("data-x", newX);
    el.setAttribute("data-y", newY);
    return true;
  },

  // Set style properties on an element
  setElementStyle: (id, styleObj) => {
    const el = document.getElementById(id);
    if (!el) return false;
    Object.assign(el.style, styleObj);
    // Refresh selection panel if this element is selected
    if (selectedElements.has(el) && selectedElements.size === 1) {
      syncPanelValues(el);
    }
    return true;
  },

  // Auto-Layout Helper (Simple Stack)
  stackElementsVertical: (ids, startY = 50, gap = 20) => {
    // Implementation left minimal as requested previously
    console.log(
      "Agent should use getElements() and moveElement() manually for control.",
    );
  },
};

// --- Initialization ---
window.onload = () => {
  fitToScreen();
  // Select title by default
  clearSelection();
  const titleEl = document.getElementById("el-title");
  if (titleEl) {
    addToSelection(titleEl);
  }
};

window.onresize = fitToScreen;
