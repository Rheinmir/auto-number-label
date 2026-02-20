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

function processExcelData(data) {
  const groupedData = {};
  let lastBoxNum = null;

  data.forEach((row) => {
    const boxKey = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === "hộp số",
    );
    const recordKey = Object.keys(row).find((k) =>
      k.trim().toLowerCase().includes("hồ sơ số"),
    );

    if (!recordKey) return;

    let boxNum = boxKey ? row[boxKey] : null;
    const recordNum = row[recordKey];

    // Merged Cell Fill-down
    if (boxNum) {
      lastBoxNum = boxNum;
    } else if (lastBoxNum) {
      boxNum = lastBoxNum;
    }

    if (boxNum && recordNum) {
      if (!groupedData[boxNum]) {
        groupedData[boxNum] = [];
      }
      groupedData[boxNum].push(recordNum);
    }
  });

  records = Object.keys(groupedData)
    .map((box) => {
      const nums = groupedData[box]
        .map((n) => parseInt(n))
        .filter((n) => !isNaN(n));

      if (nums.length === 0) return null;

      return {
        "Hộp số": box,
        "Từ hồ sơ số": Math.min(...nums),
        "Đến hồ sơ số": Math.max(...nums),
      };
    })
    .filter((r) => r !== null);

  if (records.length > 0) {
    currentRecordIndex = 0;
    renderRecord(0);
    const controls = document.getElementById("record-controls");
    if (controls) controls.classList.remove("hidden");
    alert(`Successfully loaded ${records.length} labels!`);
    updateNavControls();
  } else {
    alert(
      "No valid data found in Excel. Please check columns 'Hộp số' and 'Hồ sơ số'.",
    );
  }
}

function updateData() {
  const text = document.getElementById("dataInput");
  if (!text || !text.value.trim()) return;

  // Parse TSV (Tab Separated Values) from textarea paste
  const lines = text.value
    .trim()
    .split("\n")
    .map((l) => l.split("\t"));
  if (lines.length < 2) return;

  // Find column indexes
  const headers = lines[0].map((h) => h.trim().toLowerCase());
  const boxCol = headers.findIndex(
    (h) => h === "hộp số" || h === "boxno" || h === "hộp số ",
  );
  const recCol = headers.findIndex(
    (h) => h.includes("hồ sơ số") || h === "profileno",
  );

  if (boxCol === -1 || recCol === -1) {
    alert(
      "Không tìm thấy cột 'Hộp số' hoặc 'Hồ sơ số'. Vui lòng kiểm tra lại Data Source.",
    );
    return;
  }

  let lastBox = null;
  const groupedData = {};

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    let boxNum = row[boxCol] ? row[boxCol].trim() : null;
    let recNum = row[recCol] ? row[recCol].trim() : null;

    if (!recNum) continue;

    if (boxNum) lastBox = boxNum;
    else if (lastBox) boxNum = lastBox;

    if (boxNum && recNum) {
      if (!groupedData[boxNum]) groupedData[boxNum] = [];
      groupedData[boxNum].push(String(recNum));
    }
  }

  // Process records
  records = Object.keys(groupedData)
    .map((box) => {
      const nums = groupedData[box]
        .map((n) => parseInt(n))
        .filter((n) => !isNaN(n));

      if (nums.length === 0) return null;

      return {
        "Hộp số": box,
        "Từ hồ sơ số": Math.min(...nums),
        "Đến hồ sơ số": Math.max(...nums),
      };
    })
    .filter((r) => r !== null);

  if (records.length > 0) {
    currentRecordIndex = 0;
    renderRecord(0);
    const controls = document.getElementById("record-controls");
    if (controls) controls.classList.remove("hidden");
    alert(`Successfully loaded ${records.length} labels from text!`);
    updateNavControls();
  } else {
    alert("No valid data found. Please check columns 'Hộp số' and 'Hồ sơ số'.");
  }
}

function renderRecord(index) {
  if (index < 0 || index >= records.length) return;
  const record = records[index];

  const elBoxNum = document.getElementById("el-boxnum");
  const elFrom = document.getElementById("el-from");
  const elTo = document.getElementById("el-to");

  if (elBoxNum) elBoxNum.innerText = record["Hộp số"];
  if (elFrom) elFrom.innerText = "Từ hồ sơ số: " + record["Từ hồ sơ số"];
  if (elTo) elTo.innerText = "Đến hồ sơ số: " + record["Đến hồ sơ số"];
}

function prevRecord() {
  if (currentRecordIndex > 0) {
    currentRecordIndex--;
    renderRecord(currentRecordIndex);
    updateNavControls();
  }
}

function nextRecord() {
  if (currentRecordIndex < records.length - 1) {
    currentRecordIndex++;
    renderRecord(currentRecordIndex);
    updateNavControls();
  }
}

function updateNavControls() {
  const countDisplay = document.getElementById("record-count-display");
  if (countDisplay) {
    countDisplay.innerText =
      records.length > 0
        ? `${currentRecordIndex + 1} / ${records.length}`
        : "0 / 0";
  }
}
