// Initialize InteractJS for Dragging
interact(".draggable")
  .draggable({
    listeners: {
      start(event) {
        // Normalize target to the draggable element
        const target = event.target.closest(".draggable");
        if (!target) return;

        // If dragging an unselected element, clear others and select it
        if (!selectedElements.has(target)) {
          clearSelection();
          addToSelection(target);
        }
      },
      move(event) {
        if (selectedElements.size === 0) return;

        // The A4 page is scaled by currentZoom, AND the label-canvas is scaled by 0.709
        // We must divide by BOTH to get true local pixels for the draggable elements
        const totalScale = currentZoom * 0.709;
        const dx = event.dx / totalScale;
        const dy = event.dy / totalScale;

        selectedElements.forEach((el) => {
          const x = (parseFloat(el.getAttribute("data-x")) || 0) + dx;
          const y = (parseFloat(el.getAttribute("data-y")) || 0) + dy;

          el.style.transform = `translate(${x}px, ${y}px)`;
          el.setAttribute("data-x", x);
          el.setAttribute("data-y", y);
        });
      },
      end(event) {
        if (window.syncA4Preview) window.syncA4Preview();
      },
    },
  })
  .on("tap", function (event) {
    const target = event.currentTarget; // CurrentTarget is always the .draggable
    const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;

    if (isMultiSelect) {
      toggleSelection(target);
    } else {
      clearSelection();
      addToSelection(target);
    }
    event.stopPropagation(); // Prevent canvas click from clearing
  });

// Double Tap / Double Click to Edit Text
interact(".draggable").on("doubletap", function (event) {
  const target = event.currentTarget;
  if (!target.querySelector("img") && !target.querySelector("svg")) {
    const newText = prompt("Edit Text:", target.innerText);
    if (newText !== null) {
      target.innerText = newText;
      if (window.syncA4Preview) window.syncA4Preview();
    }
  }
  event.stopPropagation();
});

// Canvas Click to Clear Selection
document.getElementById("a4-preview-page").addEventListener("click", (e) => {
  if (
    e.target.id === "a4-preview-page" ||
    e.target.id === "label-canvas" ||
    e.target.classList.contains("printable-border") ||
    e.target.classList.contains("label-slot")
  ) {
    clearSelection();
  }
});

// Mouse Wheel to Zoom
const canvasWrapper = document.getElementById("canvas-wrapper");
if (canvasWrapper) {
  canvasWrapper.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // Determine zoom direction: scroll up (negative deltaY) zooms in
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        if (window.zoomCanvas) window.zoomCanvas(delta);
      }
    },
    { passive: false },
  );
}

// Keyboard Shortcuts (Global)
document.addEventListener("keydown", (e) => {
  const isInputActive =
    document.activeElement.tagName === "INPUT" ||
    document.activeElement.tagName === "TEXTAREA";

  // Deletion
  if ((e.key === "Delete" || e.key === "Backspace") && !isInputActive) {
    deleteSelected();
  }

  // Navigation and Selection
  if (!isInputActive) {
    if (e.key === "ArrowRight") nextRecord();
    if (e.key === "ArrowLeft") prevRecord();

    // Ctrl+A / Cmd+A
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      selectAll();
    }
  }
});

function deleteSelected() {
  if (selectedElements.size === 0) return;

  if (confirm(`Delete ${selectedElements.size} element(s)?`)) {
    selectedElements.forEach((el) => el.remove());
    selectedElements.clear();
    updatePropertiesPanel();
    if (window.syncA4Preview) window.syncA4Preview();
  }
}

// Selection Functions
function addToSelection(el) {
  selectedElements.add(el);
  el.classList.add("active");
  updatePropertiesPanel();
}

function removeFromSelection(el) {
  selectedElements.delete(el);
  el.classList.remove("active");
  updatePropertiesPanel();
}

function toggleSelection(el) {
  if (selectedElements.has(el)) {
    removeFromSelection(el);
  } else {
    addToSelection(el);
  }
}

function clearSelection() {
  selectedElements.forEach((el) => el.classList.remove("active"));
  selectedElements.clear();
  updatePropertiesPanel();
}

function selectAll() {
  const allDraggables = document.querySelectorAll(".draggable");
  allDraggables.forEach((el) => {
    selectedElements.add(el);
    el.classList.add("active");
  });
  updatePropertiesPanel();
}
