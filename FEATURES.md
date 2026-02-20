# PVFCCo Label Designer Pro - Tóm tắt Tính năng

Ứng dụng Label Designer Pro là một công cụ thiết kế và in tem nhãn linh hoạt, hỗ trợ thao tác kéo thả trực quan và nạp dữ liệu tự động từ file Excel. Dưới đây là danh sách tổng hợp các nhóm chức năng chính:

## 1. Giao Diện Điều Khiển (Modern Workspace UI)
*   **Sidebar (Bên trái)**: Cung cấp khu vực cấu hình thuộc tính, quản lý công cụ thêm đối tượng.
*   **Canvas (Ở giữa)**: Khu vực thiết kế WYSIWYG (những gì bạn thấy là những gì sẽ in), cho hình dung chính xác về bố cục in.
*   **Toolbar (Thanh trên đỉnh)**: Chứa các công cụ chức năng tổng quát như Import Excel, Điều hướng bản ghi, Phóng to/Thu nhỏ, và nút In ấn.

## 2. Quản Lý Phần Tử Thiết Kế (Elements)
*   **Thêm Văn Bản (Add Text)**: Tạo một khối văn bản giữ chỗ mới trên màn hình.
*   **Thêm รูป Ảnh (Add Image)**: Tải lên các file hình (ví dụ: Logo) để đính vào thiết kế.
*   **Sửa Nội Dung**: Người dùng nhấp đúp (Double-click/Tap) vào bất kỳ hộp văn bản nào để chỉnh sửa trực tiếp đoạn text bên trong.
*   **Kéo Thả (Drag & Drop)**: Di chuyển mượt mà mọi thành phần trên màn hình để thiết lập bố cục ưng ý.
*   **Xóa (Delete)**: Bấm nút Delete trên bàn phím hoặc nút "Delete Element" trên sidebar để xóa phần tử đang được chọn.

## 3. Lựa Chọn & Chỉnh Sửa Hàng Loạt (Select & Bulk Edit)
*   **Chọn nhiều phần tử (Multi-Select)**: Giữ phím `Ctrl/Cmd` + Click chuột để chọn thêm nhiều khối, hoặc `Ctrl/Cmd + A` để chọn tất cả.
*   **Di chuyển theo nhóm**: Kéo thả khi đang quét nhiều phần tử sẽ làm dịch chuyển cả nhóm cùng nhau.
*   **Áp dụng định dạng hàng loạt**: Bất kỳ thay đổi nào trên Bảng thuộc tính (như đổi màu sắc, font, in đậm...) sẽ được tự động áp dụng cùng lúc lên toàn bộ các phần tử đang được chọn.

## 4. Bảng Thuộc Tính Thông Minh (Contextual Properties)
*   Bảng thuộc tính sẽ tự động thay đổi dựa theo loại đối tượng người dùng đang click:
    *   **Khi chọn Văn bản (Text)**: Cài đặt Phông chữ (Font Family), Cỡ chữ (Size), Màu sắc (Color picker/Hex input), Kiểu in đậm (Bold) và Căn lề (Align Text).
    *   **Khi chọn Hình ảnh (Image)**: Chỉ hiển thị các thanh trượt điều chỉnh Chiều rộng (Width) và Độ trong suốt (Opacity) để thay đổi kích cỡ hình mà không gây biến dạng tỉ lệ.

## 5. Tự Động Hóa Dữ Liệu Excel (Smart Excel Import)
*   **Nhập file Excel (.xlsx / .xls)**: Bấm nút "Import Excel" để đọc trực tiếp file.
*   **Xử lý Ô bị Gộp (Merged Cells)**: Thuật toán nhận diện được phong cách gộp ô của Excel trên cột "Hộp số" để điền lấp đầy, giúp các "Hồ sơ số" rỗng vẫn được nhóm đúng vào hộp số cha.
*   **Đọc và nhóm dữ liệu**: Tool sẽ tự động tìm kiếm cột "Hộp số" và "Hồ sơ số", sau đó nhóm tất cả các Hồ sơ theo Hộp. 
*   **Tự tìm Min/Max**: Tại mỗi Hộp số, ứng dụng tiếp tục tính ra Min/Max của Hồ sơ số để biến đổi dòng chữ thay thế vào thẻ `#el-from` (Từ hồ sơ số: Min) và `#el-to` (Đến hồ sơ số: Max).
*   **Điều hướng (Record Navigation)**: Khi tải data thành công, hai phím bấm `Trái/Phải` ở trên Toolbar xuất hiện cho phép chuyển qua mẫu in hiện tại rất nhanh chóng mà không cần sửa tay.

## 6. Tiện ích Phụ Trợ
*   **Phóng To/Thu Nhỏ (Zoom)**: Cho phép điều chỉnh tỉ lệ Canvas để nhìn bao quát hoặc soi rõ chi tiết nhỏ thông qua nút `[-] 100% [+]`.
*   **In Ấn Bản Sạch (Clean Print)**: Bấm nút `Print Label` sẽ vào thẳng chế độ giấy in của trình duyệt, nó sẽ tự giấu đi Toolbar, Sidebar, và các viền chọn rườm rà — chỉ giữ lại khung in hoàn hảo cho việc găm máy in.
*   **Hỗ Trợ Mở Rộng API (Agent API)**: Dự án xuất ra đối tượng `window.LabelDesignerAPI` hỗ trợ điều khiển app thông qua các lệnh gọi code (script, extension) bên ngoài.
