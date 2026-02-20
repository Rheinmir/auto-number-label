// --- Properties Panel Updates ---
function updatePropertiesPanel() {
  const panel = document.getElementById("props-panel");
  const nameDisplay = document.getElementById("selected-element-name");
  const textProps = document.getElementById("text-props");
  const imgProps = document.getElementById("img-props");

  if (selectedElements.size === 0) {
    panel.classList.add("opacity-50", "pointer-events-none");
    panel.classList.remove("opacity-100");
    nameDisplay.innerText = "Select an element";
    return;
  }

  panel.classList.remove("opacity-50", "pointer-events-none");
  panel.classList.add("opacity-100");

  if (selectedElements.size === 1) {
    const el = selectedElements.values().next().value;
    nameDisplay.innerText = el.id.replace("el-", "");

    const isImage =
      el.querySelector("img") !== null || el.querySelector("svg") !== null;

    if (isImage) {
      textProps.classList.add("hidden");
      imgProps.classList.remove("hidden");
      syncImagePanelValues(el);
    } else {
      imgProps.classList.add("hidden");
      textProps.classList.remove("hidden");
      syncPanelValues(el);
    }
  } else {
    nameDisplay.innerText = `${selectedElements.size} items selected`;
    imgProps.classList.add("hidden");
    textProps.classList.remove("hidden");
  }
}

function syncPanelValues(el) {
  const style = window.getComputedStyle(el);
  document.getElementById("prop-size").value = parseInt(style.fontSize) || 16;

  const isBold =
    parseInt(style.fontWeight) > 500 || style.fontWeight === "bold";
  const boldBtn = document.getElementById("prop-bold");
  if (isBold) {
    boldBtn.classList.add(
      "bg-indigo-100",
      "text-indigo-700",
      "border-indigo-200",
    );
  } else {
    boldBtn.classList.remove(
      "bg-indigo-100",
      "text-indigo-700",
      "border-indigo-200",
    );
  }

  const hexColor = rgb2hex(style.color);
  document.getElementById("prop-color").value = hexColor;
  document.getElementById("color-preview").style.backgroundColor = hexColor;
}

function syncImagePanelValues(el) {
  const style = window.getComputedStyle(el);
  const width = parseInt(style.width) || el.offsetWidth;
  const opacity = style.opacity || 1;

  document.getElementById("prop-width").value = width;
  document.getElementById("prop-opacity").value = Math.round(opacity * 100);
}

const rgb2hex = (rgb) => {
  if (!rgb) return "#000000";
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return "#000000";
  return `#${match
    .slice(1)
    .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
    .join("")}`;
};

// --- Bulk Editing Event Listeners ---
// Initialize listeners once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const propSize = document.getElementById("prop-size");
  if (propSize)
    propSize.oninput = (e) => {
      selectedElements.forEach(
        (el) => (el.style.fontSize = e.target.value + "px"),
      );
    };

  const propFont = document.getElementById("prop-font");
  if (propFont)
    propFont.onchange = (e) => {
      selectedElements.forEach((el) => (el.style.fontFamily = e.target.value));
    };

  const propColor = document.getElementById("prop-color");
  if (propColor)
    propColor.oninput = (e) => {
      selectedElements.forEach((el) => (el.style.color = e.target.value));
      document.getElementById("color-preview").style.backgroundColor =
        e.target.value;
    };

  const propBold = document.getElementById("prop-bold");
  if (propBold)
    propBold.onclick = () => {
      if (selectedElements.size === 0) return;
      const firstEl = selectedElements.values().next().value;
      const currentWeight = window.getComputedStyle(firstEl).fontWeight;
      const isBold = parseInt(currentWeight) > 500 || currentWeight === "bold";
      const newWeight = isBold ? "400" : "900";

      selectedElements.forEach((el) => (el.style.fontWeight = newWeight));

      propBold.classList.toggle("bg-indigo-100", !isBold);
      propBold.classList.toggle("text-indigo-700", !isBold);
      propBold.classList.toggle("border-indigo-200", !isBold);
    };

  const propWidth = document.getElementById("prop-width");
  if (propWidth)
    propWidth.oninput = (e) => {
      selectedElements.forEach(
        (el) => (el.style.width = e.target.value + "px"),
      );
    };

  const propOpacity = document.getElementById("prop-opacity");
  if (propOpacity)
    propOpacity.oninput = (e) => {
      selectedElements.forEach(
        (el) => (el.style.opacity = e.target.value / 100),
      );
    };

  // Add event listeners to sync A4 preview on any style change release
  const propsPanel = document.getElementById("props-panel");
  if (propsPanel) {
    propsPanel.addEventListener("change", syncA4Preview);
    propsPanel.addEventListener("mouseup", syncA4Preview);
    propsPanel.addEventListener("keyup", syncA4Preview);
  }
});

function setTextAlign(align) {
  selectedElements.forEach((el) => {
    el.style.textAlign = align;
    el.style.justifyContent =
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start";
  });
}

// --- Dynamic Elements Logic ---
function addText() {
  const id = "el-text-" + Date.now();
  const el = document.createElement("div");
  el.id = id;
  el.className = "draggable active";
  el.innerText = "New Text";
  el.style.top = "100px";
  el.style.left = "100px";
  el.style.width = "200px";
  el.style.fontSize = "24px";
  el.style.fontWeight = "700";
  el.setAttribute("data-x", 0);
  el.setAttribute("data-y", 0);

  document.getElementById("label-canvas").appendChild(el);
  clearSelection();
  addToSelection(el);
}

function addImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const id = "el-img-" + Date.now();
      const el = document.createElement("div");
      el.id = id;
      el.className = "draggable active";
      el.style.top = "100px";
      el.style.left = "100px";
      el.style.width = "150px";
      el.setAttribute("data-x", 0);
      el.setAttribute("data-y", 0);

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100%";
      img.style.pointerEvents = "none";

      el.appendChild(img);
      document.getElementById("label-canvas").appendChild(el);

      clearSelection();
      addToSelection(el);
      input.value = "";
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// --- Zoom & Fit ---
function fitToScreen() {
  const canvas = document.getElementById("a4-preview-page");
  const wrapper = document.getElementById("canvas-wrapper");
  if (!canvas || !wrapper) return;
  setTimeout(() => {
    const availableWidth = wrapper.clientWidth - 80;
    const availableHeight = wrapper.clientHeight - 80;
    const canvasWidth = 210 * 3.78; // A4 Width in mm approx to px
    const canvasHeight = 297 * 3.78; // A4 Height in mm
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    let scale = Math.min(scaleX, scaleY, 1);
    scale = Math.max(scale, 0.3);
    setZoom(scale);
  }, 100);
}

function zoomCanvas(delta) {
  setZoom(currentZoom + delta);
}
function setZoom(lvl) {
  currentZoom = Math.min(Math.max(lvl, 0.2), 3.0);
  document.getElementById("a4-preview-page").style.transform =
    `scale(${currentZoom})`;
  document.getElementById("zoom-level").innerText =
    Math.round(currentZoom * 100) + "%";
}

// --- A4 Preview Sync ---
// --- A4 Preview Sync ---
function syncA4Preview() {
  const sourceCanvas = document.getElementById("label-canvas");
  if (!sourceCanvas) return;
  const content = sourceCanvas.innerHTML;

  [2, 3, 4].forEach((slot) => {
    const copy = document.getElementById(`label-copy-${slot}`);
    if (copy) {
      copy.innerHTML = content;

      // Remove visual editing cues from copies
      const draggables = copy.querySelectorAll(".draggable");
      draggables.forEach((d) => {
        d.classList.remove("active");
        d.style.border = "none";
        d.style.background = "none";
      });

      // Inject sequential data if records exist
      if (
        typeof records !== "undefined" &&
        typeof currentIndex !== "undefined"
      ) {
        const recordIdx = currentIndex + (slot - 1);

        if (recordIdx < records.length) {
          const record = records[recordIdx];
          const elBoxNum = copy.querySelector("#el-boxnum");
          const elFrom = copy.querySelector("#el-from");
          const elTo = copy.querySelector("#el-to");

          if (elBoxNum) elBoxNum.innerText = record["Hộp số"];
          if (elFrom)
            elFrom.innerText = "Từ hồ sơ số: " + record["Từ hồ sơ số"];
          if (elTo) elTo.innerText = "Đến hồ sơ số: " + record["Đến hồ sơ số"];
        } else {
          // Clear text or hide if there's no data for this slot
          const textsToClear = copy.querySelectorAll(
            "#el-boxnum, #el-from, #el-to",
          );
          textsToClear.forEach((t) => (t.innerText = ""));
        }
      }
    }
  });
}
window.syncA4Preview = syncA4Preview;

async function printAllLabels() {
  if (typeof records === "undefined" || records.length === 0) {
    alert("Vui lòng Import Excel/Dữ liệu trước khi in!");
    return;
  }

  const printArea = document.getElementById("print-area");
  const mainCanvas = document.getElementById("label-canvas");
  const loadingOverlay = document.getElementById("loading-overlay");
  const loadingBar = document.getElementById("loading-bar");
  const loadingProgress = document.getElementById("loading-progress");
  const loadingCard = document.getElementById("loading-card");

  if (!printArea || !mainCanvas || !loadingOverlay) return;

  // Show Loading
  loadingOverlay.classList.remove("hidden");
  setTimeout(() => {
    loadingOverlay.classList.remove("opacity-0");
    loadingCard.classList.remove("scale-95");
  }, 10);

  // Clear previous print jobs
  printArea.innerHTML = "";
  printArea.classList.remove("hidden");

  const templateHtml = mainCanvas.innerHTML;
  const totalRecords = records.length;

  // Apply filtering range if provided
  const fromVal = document.getElementById("print-from")?.value.trim();
  const toVal = document.getElementById("print-to")?.value.trim();

  let processingRecords = records;
  if (fromVal || toVal) {
    let startIdx = 0;
    let endIdx = totalRecords - 1;

    if (fromVal) {
      const fromNum = parseInt(fromVal);
      const idx = records.findIndex((r) => {
        const rEnd = parseInt(r["Đến hồ sơ số"]);
        return !isNaN(fromNum) && !isNaN(rEnd)
          ? rEnd >= fromNum
          : String(r["Đến hồ sơ số"]).includes(fromVal);
      });
      if (idx !== -1) startIdx = idx;
    }

    if (toVal) {
      const toNum = parseInt(toVal);
      const idx = [...records].reverse().findIndex((r) => {
        const rStart = parseInt(r["Từ hồ sơ số"]);
        return !isNaN(toNum) && !isNaN(rStart)
          ? rStart <= toNum
          : String(r["Từ hồ sơ số"]).includes(toVal);
      });
      if (idx !== -1) endIdx = totalRecords - 1 - idx;
    }
    processingRecords = records.slice(startIdx, endIdx + 1);
  }

  const total = processingRecords.length;
  if (total === 0) {
    alert("Không tìm thấy dữ liệu trong phạm vi đã chọn!");
    loadingOverlay.classList.add("hidden");
    return;
  }

  // Helper to fill a single label element with record data
  function fillLabelNode(node, record) {
    const elBoxNum = node.querySelector("#el-boxnum");
    const elFrom = node.querySelector("#el-from");
    const elTo = node.querySelector("#el-to");
    if (elBoxNum) elBoxNum.innerText = record ? record["Hộp số"] : "";
    if (elFrom)
      elFrom.innerText = record ? "Từ hồ sơ số: " + record["Từ hồ sơ số"] : "";
    if (elTo)
      elTo.innerText = record ? "Đến hồ sơ số: " + record["Đến hồ sơ số"] : "";
    // Strip edit decorations
    node.querySelectorAll(".draggable").forEach((d) => {
      d.classList.remove("active");
      d.style.outline = "none";
      d.style.background = "none";
    });
  }

  // Save original content of the live preview to restore afterwards
  const livePreview = document.getElementById("a4-preview-page");
  const savedTransform = livePreview.style.transform;

  // Remove zoom and shadow so html2pdf gets 1:1 A4
  livePreview.style.transform = "scale(1)";
  livePreview.style.boxShadow = "none";
  livePreview.style.margin = "0";

  // Get the 4 live slot inner containers
  const slot1 = document.getElementById("label-canvas");
  const slot2 = document.getElementById("label-copy-2");
  const slot3 = document.getElementById("label-copy-3");
  const slot4 = document.getElementById("label-copy-4");
  const slots = [slot1, slot2, slot3, slot4];

  // Populate slot1 from templateHtml so it has the correct layout
  slot1.innerHTML = templateHtml;

  try {
    const chunkSize = 4;
    const totalPages = Math.ceil(total / chunkSize);

    const opt = {
      margin: 0,
      filename: `Nhan_PVFCCo_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    const worker = html2pdf().set(opt);

    for (let p = 0; p < totalPages; p++) {
      // Fill the 4 live slots with this page's data
      for (let i = 0; i < chunkSize; i++) {
        const recIdx = p * chunkSize + i;
        const rec = recIdx < total ? processingRecords[recIdx] : null;
        if (slots[i]) {
          // Reset inner HTML to template for slot 1
          if (i === 0) {
            slots[0].innerHTML = templateHtml;
          } else {
            slots[i].innerHTML = templateHtml;
          }
          // Fill data into the node
          fillLabelNode(slots[i], rec);
          // If no data, blank out the slot visually
          if (!rec) slots[i].style.opacity = "0";
          else slots[i].style.opacity = "1";
        }
      }

      // Wait a frame for the browser to render
      await new Promise((r) => setTimeout(r, 200));

      // Capture the live preview page
      if (p === 0) {
        await worker.from(livePreview).toContainer().toCanvas().toImg().toPdf();
      } else {
        await worker.get("pdf").then((pdf) => pdf.addPage());
        await worker.from(livePreview).toContainer().toCanvas().toImg().toPdf();
      }

      // Update progress
      const percent = Math.round(((p + 1) / totalPages) * 100);
      loadingBar.style.width = percent + "%";
      loadingProgress.innerText = `Đang xuất PDF: ${percent}%`;
    }

    await worker.save();
  } finally {
    // Restore zoom and view
    livePreview.style.transform = savedTransform;
    livePreview.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1)";
    livePreview.style.margin = "auto";

    // Restore display to current record
    if (typeof updateDisplay === "function") updateDisplay();
    else if (window.syncA4Preview) window.syncA4Preview();
  }

  loadingBar.style.width = "100%";
  loadingProgress.innerText = "Hoàn tất!";
  setTimeout(() => {
    loadingOverlay.classList.add("opacity-0");
    loadingCard.classList.add("scale-95");
    setTimeout(() => loadingOverlay.classList.add("hidden"), 300);
  }, 1000);
}
