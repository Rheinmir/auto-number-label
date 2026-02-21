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

// --- Export & Import Layout ---
window.exportLayout = function () {
  const canvas = document.getElementById("label-canvas");
  if (!canvas) return;

  const draggables = Array.from(canvas.querySelectorAll(".draggable"));
  const layout = draggables.map((el) => {
    const styles = {};
    const propsToSave = [
      "top",
      "left",
      "width",
      "height",
      "fontSize",
      "fontWeight",
      "color",
      "textAlign",
      "justifyContent",
      "lineHeight",
      "transform",
    ];
    for (const prop of propsToSave) {
      if (el.style[prop]) styles[prop] = el.style[prop];
    }

    return {
      id: el.id || "",
      className: el.className.replace("active", "").trim(),
      styles: styles,
      dataX: el.getAttribute("data-x") || "0",
      dataY: el.getAttribute("data-y") || "0",
      innerHTML: el.innerHTML,
    };
  });

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(layout, null, 2));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "label_layout.json");
  dlAnchorElem.click();
};

window.importLayout = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const layoutData = JSON.parse(e.target.result);
      const canvas = document.getElementById("label-canvas");
      if (!canvas) return;

      // Clear existing layout (leaving the .printable-border intact if possible)
      const oldDraggables = canvas.querySelectorAll(".draggable");
      oldDraggables.forEach((el) => el.remove());

      layoutData.forEach((item) => {
        const el = document.createElement("div");
        if (item.id) el.id = item.id;
        el.className = item.className;
        el.innerHTML = item.innerHTML;

        el.setAttribute("data-x", item.dataX);
        el.setAttribute("data-y", item.dataY);

        // Restore styles
        if (item.styles) {
          Object.keys(item.styles).forEach((prop) => {
            el.style[prop] = item.styles[prop];
          });
        }

        canvas.appendChild(el);
      });

      if (typeof clearSelection === "function") clearSelection();
      if (window.syncA4Preview) window.syncA4Preview();

      alert("Đã tải layout thành công!");
    } catch (err) {
      console.error(err);
      alert("File layout không hợp lệ!");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
};

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
          const elBotCopy = copy.querySelector("#el-bottom");
          if (elBotCopy) {
            const thbqCopy = (record["THBQ"] || "").toLowerCase();
            elBotCopy.innerText = thbqCopy.includes("vĩnh viễn")
              ? "Vĩnh Viễn"
              : "Có thời hạn bảo quản";
          }
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
    processingRecords = records.filter((r) => {
      const hop = parseInt(r["Hộp số"]);
      if (isNaN(hop)) return true; // keep rows with non-numeric box numbers
      if (fromVal && !isNaN(parseInt(fromVal)) && hop < parseInt(fromVal))
        return false;
      if (toVal && !isNaN(parseInt(toVal)) && hop > parseInt(toVal))
        return false;
      return true;
    });
  }

  const total = processingRecords.length;
  if (total === 0) {
    alert("Không tìm thấy dữ liệu trong phạm vi đã chọn!");
    loadingOverlay.classList.add("hidden");
    return;
  }

  // Helper: build a flat pre-scaled A6 label that html2canvas can render accurately.
  // Reads computed styles from the LIVE canvas elements to avoid guess-work.
  function buildLabelNode(record) {
    const liveCanvas = document.getElementById("label-canvas");
    const scaleFactor = 0.709; // A5 (148mm x 210mm) -> A6 (105mm x 148.5mm)

    // Create a completely flat container at A6 pixel dimensions — NO parent transforms
    const container = document.createElement("div");
    container.style.cssText = [
      "position:fixed",
      "top:0",
      "left:-9999px",
      "width:396px", // 105mm * 3.78 ≈ 396px
      "height:562px", // 148.5mm * 3.78 ≈ 562px
      "background:white",
      "overflow:hidden",
      "font-family:'Times New Roman',Times,serif",
    ].join(";");

    // Copy each live draggable element with pre-scaled geometry
    const liveDraggables = liveCanvas.querySelectorAll(".draggable");
    liveDraggables.forEach((origEl) => {
      const copy = origEl.cloneNode(true);
      const cs = getComputedStyle(origEl);

      // Bake drag offsets into base position
      const dx = parseFloat(origEl.getAttribute("data-x")) || 0;
      const dy = parseFloat(origEl.getAttribute("data-y")) || 0;
      const baseLeft = parseFloat(origEl.style.left) || 0;
      const baseTop = parseFloat(origEl.style.top) || 0;
      const finalLeft = baseLeft + dx;
      const finalTop = baseTop + dy;

      // Scale position, size, font metrics
      copy.style.left = finalLeft * scaleFactor + "px";
      copy.style.top = finalTop * scaleFactor + "px";

      const w = parseFloat(origEl.style.width);
      if (w) copy.style.width = w * scaleFactor + "px";

      const h = parseFloat(origEl.style.height);
      if (h) copy.style.height = h * scaleFactor + "px";

      // Use COMPUTED font-size so we catch values from CSS classes too
      const fsPx = parseFloat(cs.fontSize);
      if (fsPx) copy.style.fontSize = fsPx * scaleFactor + "px";

      // Use COMPUTED line-height in px for accurate vertical spacing
      const lhPx = parseFloat(cs.lineHeight);
      if (!isNaN(lhPx)) copy.style.lineHeight = lhPx * scaleFactor + "px";

      copy.style.padding = 4 * scaleFactor + "px";
      copy.style.transform = "none";
      copy.classList.remove("active");
      copy.style.border = "none";
      copy.style.background = "none";
      copy.style.outline = "none";
      copy.style.cursor = "default";

      container.appendChild(copy);
    });

    // Inject record data into the container's copies
    if (record) {
      const elBoxNum = container.querySelector("#el-boxnum");
      const elFrom = container.querySelector("#el-from");
      const elTo = container.querySelector("#el-to");
      if (elBoxNum) elBoxNum.innerText = record["Hộp số"];
      if (elFrom) elFrom.innerText = "Từ hồ sơ số: " + record["Từ hồ sơ số"];
      if (elTo) elTo.innerText = "Đến hồ sơ số: " + record["Đến hồ sơ số"];
      const elBotPdf = container.querySelector("#el-bottom");
      if (elBotPdf) {
        const thbqPdf = (record["THBQ"] || "").toLowerCase();
        elBotPdf.innerText = thbqPdf.includes("vĩnh viễn")
          ? "Vĩnh Viễn"
          : "Có thời hạn bảo quản";
      }
    }

    // Copy the printable border (scaled)
    const liveBorder = liveCanvas.querySelector(".printable-border");
    if (liveBorder) {
      const border = document.createElement("div");
      border.style.cssText = [
        "position:absolute",
        `top:${10 * scaleFactor}mm`,
        `left:${10 * scaleFactor}mm`,
        `right:${10 * scaleFactor}mm`,
        `bottom:${10 * scaleFactor}mm`,
        `border:${4 * scaleFactor}px double #0054a6`,
        "pointer-events:none",
      ].join(";");
      container.appendChild(border);
    }

    return container;
  }

  try {
    const { jsPDF } = window.jspdf;
    const chunkSize = 4;
    const totalPages = Math.ceil(total / chunkSize);
    const filename = `Nhan_PVFCCo_${new Date().getTime()}.pdf`;

    // Initialize jsPDF
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    // A4 grid: 2 x 2, each cell = A6 (105 x 148.5mm)
    const LABEL_W_MM = 105;
    const LABEL_H_MM = 148.5;
    const positions = [
      { x: 0, y: 0 },
      { x: LABEL_W_MM, y: 0 },
      { x: 0, y: LABEL_H_MM },
      { x: LABEL_W_MM, y: LABEL_H_MM },
    ];

    let pageCreated = false;

    for (let i = 0; i < total; i++) {
      const slot = i % chunkSize;
      if (slot === 0) {
        if (pageCreated) pdf.addPage();
        pageCreated = true;
      }

      const rec = processingRecords[i];
      const container = buildLabelNode(rec);
      document.body.appendChild(container);

      await new Promise((r) => setTimeout(r, 40));

      const capturedCanvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const imgData = capturedCanvas.toDataURL("image/jpeg", 0.95);
      const pos = positions[slot];
      pdf.addImage(imgData, "JPEG", pos.x, pos.y, LABEL_W_MM, LABEL_H_MM);

      // Dashed separator lines
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineDashPattern([2, 2], 0);
      if (slot === 0 || slot === 2)
        pdf.line(LABEL_W_MM, pos.y, LABEL_W_MM, pos.y + LABEL_H_MM);
      if (slot === 0 || slot === 1) pdf.line(0, LABEL_H_MM, 210, LABEL_H_MM);

      const percent = Math.round(((i + 1) / total) * 100);
      loadingBar.style.width = percent + "%";
      loadingProgress.innerText = `Đang xuất PDF: ${percent}%`;
    }

    pdf.save(filename);

    loadingBar.style.width = "100%";
    loadingProgress.innerText = "Hoàn tất!";
    setTimeout(() => {
      loadingOverlay.classList.add("opacity-0");
      loadingCard.classList.add("scale-95");
      setTimeout(() => loadingOverlay.classList.add("hidden"), 300);
    }, 1000);
  } catch (error) {
    console.error("PDF Export failed:", error);
    alert("Có lỗi khi xuất PDF: " + error.message);
    loadingOverlay.classList.add("hidden");
    const stray = document.querySelector("div[style*='z-index:99']");
    if (stray) document.body.removeChild(stray);
  }
}
