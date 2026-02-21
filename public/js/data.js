function triggerExcelUpload() {
  document.getElementById("excel-upload").click();
}

function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    processExcelData(jsonData);
  };
  reader.readAsArrayBuffer(file);
}

// Global variable declared in app.js

/**
 * Main logic to process raw Excel JSON data into aggregated box records.
 */
function processExcelData(data) {
  if (!data || data.length === 0) return;

  const groupedByBox = {};
  let lastBoxNum = "";

  // 1. Identify index of columns we care about
  // We look for "Hộp số" and "Hồ sơ số" (flexible naming)
  let boxKey = "";
  let recordKey = "";
  let thbqKey = "";

  if (data.length > 0) {
    const firstRow = data[0];
    for (let key in firstRow) {
      const kLow = key.toLowerCase().replace(/\s/g, "");
      if (kLow.includes("hộpsố") && !kLow.includes("cũ")) boxKey = key;
      if (kLow.includes("hồsơsố") && !kLow.includes("cũ")) recordKey = key;
      if (kLow.includes("thbq")) thbqKey = key;
    }
  }

  // Fallback if not found precisely
  if (!boxKey) boxKey = "Hộp số";
  if (!recordKey) recordKey = "Hồ sơ số";

  // 2. Iterate and aggregate
  data.forEach((row) => {
    let boxNum = row[boxKey];
    let recordNum = row[recordKey];

    // Handle merged cells for Box Number (Fill-down logic)
    if (boxNum && boxNum !== "") {
      lastBoxNum = boxNum;
    } else {
      boxNum = lastBoxNum;
    }

    // Only process if we have a record number (skips headers/empty rows)
    if (recordNum && recordNum !== "") {
      if (!groupedByBox[boxNum]) {
        groupedByBox[boxNum] = { records: [], thbq: "" };
      }
      groupedByBox[boxNum].records.push(recordNum);
      // Capture the first non-empty THBQ value for this box
      if (!groupedByBox[boxNum].thbq && thbqKey && row[thbqKey]) {
        groupedByBox[boxNum].thbq = String(row[thbqKey]).trim();
      }
    }
  });

  // 3. Flatten into simple records list
  records = [];
  for (let box in groupedByBox) {
    const entry = groupedByBox[box];
    const nums = entry.records;
    nums.sort((a, b) => {
      const na = parseInt(a);
      const nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b));
    });

    records.push({
      "Hộp số": box,
      "Từ hồ sơ số": nums[0],
      "Đến hồ sơ số": nums[nums.length - 1],
      THBQ: entry.thbq,
      "Dữ liệu gốc": nums,
    });
  }

  // Update UI
  if (records.length > 0) {
    currentIndex = 0;
    updateDisplay();

    // Auto-fill inputs for range if not set
    if (!document.getElementById("print-from").value) {
      document.getElementById("print-from").value = records[0]["Từ hồ sơ số"];
    }
    if (!document.getElementById("print-to").value) {
      document.getElementById("print-to").value =
        records[records.length - 1]["Đến hồ sơ số"];
    }
  }
}

function updateData() {
  const input = document.getElementById("dataInput").value;
  if (!input.trim()) return;

  const lines = input.trim().split("\n");
  const data = lines.map((line) => {
    const parts = line.split("\t");
    return {
      "Hộp số": parts[0] || "",
      "Hồ sơ số": parts[1] || "",
    };
  });

  processExcelData(data);
}

function loadSampleFromImg() {
  const sampleData = [
    { "Hộp số": "2060", "Hồ sơ số": "4348" },
    { "Hộp số": "2060", "Hồ sơ số": "4349" },
    { "Hộp số": "2061", "Hồ sơ số": "4350" },
    { "Hộp số": "2061", "Hồ sơ số": "4351" },
  ];
  processExcelData(sampleData);
}

function updateDisplay() {
  if (records.length === 0) return;
  const record = records[currentIndex];

  document.getElementById("el-boxnum").innerText = record["Hộp số"];
  document.getElementById("el-from").innerText =
    "Từ hồ sơ số: " + record["Từ hồ sơ số"];
  document.getElementById("el-to").innerText =
    "Đến hồ sơ số: " + record["Đến hồ sơ số"];

  // THBQ: if "Vĩnh viễn" show alternate text
  const thbqVal = (record["THBQ"] || "").toLowerCase();
  const elBottom = document.getElementById("el-bottom");
  if (elBottom) {
    elBottom.innerText = thbqVal.includes("vĩnh viễn")
      ? "Vĩnh Viễn"
      : "Có thời hạn bảo quản";
  }

  document.getElementById("record-status").innerText =
    `${currentIndex + 1} / ${records.length}`;

  if (window.syncA4Preview) window.syncA4Preview();
}

function nextRecord() {
  if (currentIndex < records.length - 1) {
    currentIndex++;
    updateDisplay();
  }
}

function prevRecord() {
  if (currentIndex > 0) {
    currentIndex--;
    updateDisplay();
  }
}
