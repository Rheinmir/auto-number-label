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
  const canvas = document.getElementById("label-canvas");
  const wrapper = document.getElementById("canvas-wrapper");
  if (!canvas || !wrapper) return;
  setTimeout(() => {
    const availableWidth = wrapper.clientWidth - 80;
    const availableHeight = wrapper.clientHeight - 80;
    const canvasWidth = 148 * 3.78; // assuming 1mm approx 3.78px
    const canvasHeight = 210 * 3.78;
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    let scale = Math.min(scaleX, scaleY, 1);
    scale = Math.max(scale, 0.4);
    setZoom(scale);
  }, 100);
}

function zoomCanvas(delta) {
  setZoom(currentZoom + delta);
}
function setZoom(lvl) {
  currentZoom = Math.min(Math.max(lvl, 0.2), 3.0);
  document.getElementById("label-canvas").style.transform =
    `scale(${currentZoom})`;
  document.getElementById("zoom-level").innerText =
    Math.round(currentZoom * 100) + "%";
}

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

  const opt = {
    margin: 0,
    filename: `Nhan_PVFCCo_${new Date().getTime()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    // Process in chunks of 4 for A4 (2x2 grid)
    const chunkSize = 4;
    const totalPages = Math.ceil(total / chunkSize);

    // Initialize worker with something (placeholder)
    const worker = html2pdf()
      .set(opt)
      .from(document.createElement("div"))
      .toContainer()
      .toCanvas()
      .toImg()
      .toPdf();

    for (let p = 0; p < totalPages; p++) {
      // Create an A4 Page Container
      const a4Page = document.createElement("div");
      a4Page.className = "print-page-a4";
      a4Page.style.width = "210mm";
      a4Page.style.height = "297mm";
      a4Page.style.position = "absolute";
      a4Page.style.left = "-10000px";
      a4Page.style.background = "white";
      a4Page.style.display = "grid";
      a4Page.style.gridTemplateColumns = "1fr 1fr";
      a4Page.style.gridTemplateRows = "1fr 1fr";

      // Add up to 4 labels to this page
      for (let i = 0; i < chunkSize; i++) {
        const recordIdx = p * chunkSize + i;
        if (recordIdx >= total) break;

        const record = processingRecords[recordIdx];

        const labelWrapper = document.createElement("div");
        labelWrapper.style.width = "105mm";
        labelWrapper.style.height = "148.5mm";
        labelWrapper.style.overflow = "hidden";
        labelWrapper.style.position = "relative";
        labelWrapper.style.border = "0.1mm solid #eee"; // Subtle cut lines

        const labelInner = document.createElement("div");
        labelInner.style.width = "148mm";
        labelInner.style.height = "210mm";
        labelInner.style.transform = "scale(0.709)"; // Scale A5 down to A6
        labelInner.style.transformOrigin = "top left";
        labelInner.style.position = "absolute";
        labelInner.innerHTML = templateHtml;

        // Fill data
        const elBoxNum = labelInner.querySelector("#el-boxnum");
        const elFrom = labelInner.querySelector("#el-from");
        const elTo = labelInner.querySelector("#el-to");

        if (elBoxNum) elBoxNum.innerText = record["Hộp số"];
        if (elFrom) elFrom.innerText = "Từ hồ sơ số: " + record["Từ hồ sơ số"];
        if (elTo) elTo.innerText = "Đến hồ sơ số: " + record["Đến hồ sơ số"];

        const draggables = labelInner.querySelectorAll(".draggable");
        draggables.forEach((d) => {
          d.classList.remove("active");
          d.style.border = "none";
          d.style.background = "none";
        });

        labelWrapper.appendChild(labelInner);
        a4Page.appendChild(labelWrapper);
      }

      document.body.appendChild(a4Page);

      if (p === 0) {
        await worker.from(a4Page).toContainer().toCanvas().toImg().toPdf();
      } else {
        await worker
          .get("pdf")
          .then((pdf) => {
            pdf.addPage();
          })
          .from(a4Page)
          .toContainer()
          .toCanvas()
          .toImg()
          .toPdf();
      }

      document.body.removeChild(a4Page);

      // Update progress UI
      const percent = Math.round(((p + 1) / totalPages) * 100);
      loadingBar.style.width = percent + "%";
      loadingProgress.innerText = percent + "% Hoàn tất";
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    loadingProgress.innerText = "Đang xuất file...";
    await worker.save();

    loadingProgress.innerText = "Hoàn tất!";
    setTimeout(() => {
      loadingOverlay.classList.add("opacity-0");
      loadingCard.classList.add("scale-95");
      setTimeout(() => {
        loadingOverlay.classList.add("hidden");
      }, 300);
    }, 1000);
  } catch (error) {
    console.error("PDF Export failed:", error);
    alert("Có lỗi xảy ra khi xuất PDF. Hãy thử lại với số lượng nhãn ít hơn.");
    loadingOverlay.classList.add("hidden");
  }
}
