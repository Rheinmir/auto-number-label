import React, { useState, useRef, useEffect } from "react";
import {
  Printer,
  Upload,
  Move,
  Type,
  Layers,
  AlertCircle,
  MousePointer2,
  Link,
  Link2Off,
} from "lucide-react";

const App = () => {
  const [startNum, setStartNum] = useState(4271);
  const [totalLabels, setTotalLabels] = useState(500);
  const [bgImage, setBgImage] = useState(null);
  const [isLinked, setIsLinked] = useState(false); // Tính năng khóa liên kết theo Nhãn 1

  const [positions, setPositions] = useState([
    { id: 1, x: 25, y: 35, fontSize: 40 },
    { id: 2, x: 75, y: 35, fontSize: 40 },
    { id: 3, x: 25, y: 85, fontSize: 40 },
    { id: 4, x: 75, y: 85, fontSize: 40 },
  ]);

  const [activeMarker, setActiveMarker] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const totalPages = Math.ceil(totalLabels / 4);

  const handleMouseDown = (index) => {
    setActiveMarker(index);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setPositions((prev) => {
      const updated = [...prev];
      const dx = newX - updated[activeMarker].x;
      const dy = newY - updated[activeMarker].y;

      // Nếu đang kéo Nhãn 1 và có Bật Liên Kết
      if (activeMarker === 0 && isLinked) {
        return updated.map((pos) => ({
          ...pos,
          x: Math.max(0, Math.min(100, pos.x + dx)),
          y: Math.max(0, Math.min(100, pos.y + dy)),
        }));
      } else {
        // Di chuyển đơn lẻ
        updated[activeMarker].x = parseFloat(newX.toFixed(2));
        updated[activeMarker].y = parseFloat(newY.toFixed(2));
        return updated;
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isLinked, activeMarker]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setBgImage(f.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-10 print:bg-white print:p-0 select-none">
      {/* Sidebar Controls */}
      <div className="fixed left-0 top-0 h-full w-80 bg-[#1e293b] border-r border-slate-700 p-6 z-20 print:hidden overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-2 mb-8 border-b border-slate-700 pb-4">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Layers size={20} className="text-white" />
          </div>
          <h1 className="font-black text-sm tracking-widest uppercase">
            PVFCCo LABEL MASTER
          </h1>
        </div>

        <div className="space-y-6">
          <section>
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-3">
              1. Tải ảnh mẫu PPT
            </label>
            <input
              type="file"
              onChange={handleImageUpload}
              id="upload"
              className="hidden"
              accept="image/*"
            />
            <label
              htmlFor="upload"
              className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center block cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-all"
            >
              <Upload size={20} className="mx-auto mb-2 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                {bgImage ? "Thay đổi ảnh" : "Chọn ảnh Cap màn hình"}
              </span>
            </label>
          </section>

          <section>
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-3">
              2. Cấu hình số
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                <span className="text-[8px] text-slate-500 block font-bold uppercase mb-1">
                  Bắt đầu
                </span>
                <input
                  type="number"
                  value={startNum}
                  onChange={(e) => setStartNum(parseInt(e.target.value))}
                  className="bg-transparent border-none w-full p-0 focus:ring-0 font-black text-indigo-400 text-sm"
                />
              </div>
              <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                <span className="text-[8px] text-slate-500 block font-bold uppercase mb-1">
                  Tổng hộp
                </span>
                <input
                  type="number"
                  value={totalLabels}
                  onChange={(e) => setTotalLabels(parseInt(e.target.value))}
                  className="bg-transparent border-none w-full p-0 focus:ring-0 font-black text-indigo-400 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-4 text-center">
              3. Căn chỉnh Kéo - Thả
            </label>

            {/* LINK TOGGLE */}
            <div className="mb-4">
              <button
                onClick={() => setIsLinked(!isLinked)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${isLinked ? "bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900/40" : "bg-slate-700 border-slate-600"}`}
              >
                {isLinked ? <Link size={16} /> : <Link2Off size={16} />}
                <span className="text-[11px] font-black uppercase tracking-tight">
                  {isLinked
                    ? "Đã Khóa Liên Kết (Nhãn 1)"
                    : "Khóa Liên Kết Theo Nhãn 1"}
                </span>
              </button>
              <p className="text-[9px] text-slate-500 mt-2 text-center italic">
                {isLinked
                  ? "Kéo Nhãn 1, cả 4 nhãn sẽ đi theo"
                  : "Hãy kéo từng nhãn vào đúng vị trí"}
              </p>
            </div>

            <div className="flex gap-1.5 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveMarker(i)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${activeMarker === i ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-500 hover:text-slate-300"}`}
                >
                  #{i + 1}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  Cỡ chữ (pt)
                </span>
                <span className="text-xs font-black text-indigo-400">
                  {positions[activeMarker].fontSize}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={positions[activeMarker].fontSize}
                onChange={(e) => {
                  const newPos = [...positions];
                  newPos[activeMarker].fontSize = parseInt(e.target.value);
                  setPositions(newPos);
                }}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </section>

          <button
            onClick={() => window.print()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Printer size={18} /> IN PDF ({totalLabels} NHÃN)
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="ml-80 p-8 flex flex-col items-center print:m-0 print:p-0">
        <div className="relative print:hidden group">
          <div className="mb-4 flex items-center gap-3 text-indigo-300 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 w-[210mm]">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight">
              {isLinked
                ? "CHẾ ĐỘ KHÓA: Chỉ cần kéo Nhãn 1, bộ khung 4 nhãn sẽ di chuyển đồng bộ."
                : "CHẾ ĐỘ TỰ DO: Kéo thả từng con số vào đúng vị trí 'HỘP SỐ' trên ảnh mẫu."}
            </p>
          </div>

          <div
            ref={containerRef}
            className="bg-white shadow-[0_0_80px_rgba(0,0,0,0.4)] relative overflow-hidden"
            style={{ width: "210mm", height: "297mm" }}
          >
            {bgImage && (
              <img
                src={bgImage}
                className="w-full h-full object-contain pointer-events-none opacity-50 select-none"
                alt="bg"
              />
            )}
            {!bgImage && (
              <div className="w-full h-full flex flex-col items-center justify-center border-8 border-dashed border-slate-100 opacity-20">
                <Upload size={100} />
                <span className="text-4xl font-black mt-4">TẢI ẢNH PPT</span>
              </div>
            )}

            {positions.map((pos, i) => (
              <div
                key={i}
                onMouseDown={() => handleMouseDown(i)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none p-1 transition-all ${activeMarker === i ? "ring-4 ring-indigo-500 ring-offset-4 rounded-lg scale-110 z-10" : "opacity-80 hover:opacity-100 hover:ring-2 hover:ring-slate-400"}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="relative">
                  <span
                    className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-black text-white ${i === 0 ? "bg-indigo-600" : "bg-slate-500"}`}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="text-red-600 font-black leading-none whitespace-nowrap block"
                    style={{ fontSize: `${pos.fontSize}pt` }}
                  >
                    {startNum + i}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Print Content */}
        <div className="hidden print:block">
          {Array.from({ length: totalPages }).map((_, pageIdx) => (
            <div
              key={pageIdx}
              className="relative bg-white w-[210mm] h-[297mm]"
              style={{ pageBreakAfter: "always" }}
            >
              {bgImage && (
                <img
                  src={bgImage}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt="print-bg"
                />
              )}
              {positions.map((pos, i) => {
                const labelNum = startNum + pageIdx * 4 + i;
                if (labelNum > startNum + totalLabels - 1) return null;
                return (
                  <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span
                      className="text-black font-black leading-none"
                      style={{ fontSize: `${pos.fontSize}pt` }}
                    >
                      {labelNum}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; }
        }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 3px solid #1e293b; }
      `,
        }}
      />
    </div>
  );
};

export default App;
