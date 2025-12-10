# 🎨 Manga Redrawer - AI-Powered Text Removal Tool

Ứng dụng web sử dụng AI để tự động xóa text khỏi ảnh manga và inpaint lại các vùng đã xóa một cách tự nhiên.

## ✨ Tính năng

- 🖼️ **Upload & Preview**: Kéo thả hoặc chọn ảnh manga để xử lý
- 🖌️ **Interactive Mask Editor**: Vẽ mask lên các vùng cần xử lý với các công cụ:
  - 🖐️ Pan Tool (H) - Di chuyển ảnh
  - 🖊️ Brush (B) - Vẽ mask
  - 🧹 Eraser (E) - Xóa mask
- 🔄 **Undo/Redo**: Hoàn tác và làm lại các thao tác vẽ
- 🔍 **Zoom & Pan**: Phóng to/thu nhỏ và di chuyển ảnh để chỉnh sửa chi tiết
- 🤖 **AI Models**: Hỗ trợ nhiều AI model:
  - Gemini 2.0 Flash
  - Gemini 2.5 Flash Image (mặc định)
  - Nano Banana Pro
  - Stable Diffusion Standard
- ⚙️ **Advanced Settings**: Tùy chỉnh các tham số xử lý:
  - Prompt & Negative Prompt
  - Denoising Strength
  - Mask Blur & Padding
  - Inpaint Mode
- 🔄 **Before/After Comparison**: So sánh ảnh gốc và ảnh đã xử lý
- 💾 **Download Result**: Tải xuống ảnh đã xử lý

## 📋 Yêu cầu hệ thống

- **Node.js**: v18 trở lên
- **Yarn**: v4 hoặc mới hơn (không bắt buộc, có thể cài trong bước tiếp theo)
- **Gemini API Key**: Cần có API key từ Google AI Studio

## 🚀 Cài đặt

### 1. Cài đặt Node.js

Nếu chưa có Node.js, tải và cài đặt từ [nodejs.org](https://nodejs.org/):
- Khuyến nghị: Phiên bản **LTS (Long Term Support)** mới nhất
- Sau khi cài xong, kiểm tra:

```bash
node --version   # Nên >= v18.0.0
npm --version    # NPM đi kèm với Node.js
```

### 2. Cài đặt Yarn (nếu chưa có)

Yarn được khuyến nghị cho project này. Cài đặt Yarn toàn cục:

```bash
# Sử dụng NPM (đi kèm Node.js)
npm install -g yarn

# Hoặc sử dụng Corepack (đi kèm Node.js >= 16.10)
corepack enable
corepack prepare yarn@stable --activate

# Kiểm tra cài đặt
yarn --version   # Nên >= 4.0.0
```

**Lưu ý**: Project này sử dụng Yarn 4 với Plug'n'Play (PnP), không cần cài đặt Yarn toàn cục. Yarn 4 đã được cấu hình sẵn trong project.

### 3. Clone repository

```bash
git clone https://github.com/galoihhbg/manga-redrawer.git
cd manga-redrawer
```

### 4. Cài đặt dependencies

Project sử dụng Yarn 4 với Plug'n'Play (PnP) đã được cấu hình sẵn:

```bash
yarn install
```

**Giải thích**: 
- Lệnh này sẽ tự động sử dụng Yarn phiên bản được chỉ định trong project (v4.10.3)
- Dependencies sẽ được cài vào `.yarn/cache/` thay vì `node_modules/`
- Lần đầu chạy có thể mất 2-5 phút tùy tốc độ mạng

### 5. Cấu hình API Key

Bạn có 2 cách để cấu hình API key:

#### Cách 1: Nhập trực tiếp trong ứng dụng (Khuyến nghị)
- Khi chạy ứng dụng, nhập Gemini API key vào ô "API Key" ở sidebar
- API key sẽ được lưu trong localStorage của trình duyệt

#### Cách 2: Sử dụng file .env
Tạo file `.env` trong thư mục gốc:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 6. Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/apikey)
2. Đăng nhập bằng Google Account
3. Nhấp "Create API Key"
4. Copy API key và lưu lại

## 🎮 Chạy ứng dụng

### Development Mode

```bash
yarn dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### Production Build

```bash
# Build ứng dụng
yarn build

# Chạy production server
yarn start
```

## 📖 Hướng dẫn sử dụng

### Bước 1: Nhập API Key
1. Mở ứng dụng tại http://localhost:3000
2. Nhập Gemini API Key vào ô "API Key" trong phần Connection (sidebar bên phải)

### Bước 2: Chọn Model AI
1. Trong sidebar, chọn model muốn sử dụng từ dropdown "Model ID"
2. Model mặc định: **Gemini 2.5 Flash Image** (khuyến nghị cho manga)

### Bước 3: Upload ảnh
1. Kéo thả ảnh manga vào vùng upload hoặc click để chọn file
2. Hỗ trợ định dạng: PNG, JPG, JPEG, WebP

### Bước 4: Vẽ Mask
1. Chọn công cụ **Brush (B)** để vẽ mask lên các vùng có text
2. Sử dụng slider để điều chỉnh kích thước brush
3. Các phím tắt:
   - **H** - Công cụ Pan (di chuyển ảnh)
   - **B** - Công cụ Brush (vẽ mask)
   - **E** - Công cụ Eraser (xóa mask)
   - **Ctrl+Z** - Undo
   - **Ctrl+Shift+Z** - Redo
   - **Space** - Giữ để tạm thời kích hoạt Pan

### Bước 5: Zoom & Pan
- Cuộn chuột để zoom in/out
- Chọn công cụ Pan (H) và kéo chuột để di chuyển ảnh
- Nhấn nút "Reset View" để về vị trí ban đầu

### Bước 6: Tùy chỉnh Settings (Optional)
Trong sidebar, bạn có thể tùy chỉnh:
- **Preset Mode**: Chọn preset phù hợp (Standard Bubble, Transparent Bubble, Narrative Box)
- **Positive Prompt**: Mô tả kết quả mong muốn
- **Negative Prompt**: Những gì cần tránh
- **Denoising Strength**: Mức độ thay đổi (0-1)
- **Mask Blur**: Độ mờ viền mask
- **Padding**: Vùng context xung quanh

### Bước 7: Xử lý ảnh
1. Nhấn nút **"Generate Redraw"** ở header
2. Chờ AI xử lý (thường 5-30 giây tùy kích thước ảnh)
3. Xem kết quả trong chế độ comparison (kéo thanh trượt để so sánh)

### Bước 8: Download
1. Nhấn nút **"Download Result"** để tải ảnh đã xử lý
2. Nhấn **"New Image"** để xử lý ảnh mới

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Tanstack Query** - Data fetching
- **React Zoom Pan Pinch** - Canvas transformation
- **Shadcn/ui** - UI components

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Google Generative AI SDK** - AI integration
- **Zod** - Schema validation

## 📁 Cấu trúc project

```
manga-redrawer/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── interactive-canvas.tsx  # Canvas editor
│   │   │   ├── floating-toolbar.tsx    # Tool controls
│   │   │   ├── right-sidebar.tsx       # Settings sidebar
│   │   │   └── ui/                     # Shadcn UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                # Backend code
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   ├── gemini.ts         # Gemini AI integration
│   └── storage.ts        # Storage utilities
├── shared/               # Shared types & schemas
└── package.json
```

## ⚙️ Scripts NPM

```bash
yarn dev        # Chạy development server
yarn build      # Build production
yarn start      # Chạy production server
yarn check      # Type checking
```

## 🐛 Xử lý lỗi thường gặp

### Lỗi "API key is required"
- Kiểm tra đã nhập API key chưa
- Kiểm tra API key còn hợp lệ không tại Google AI Studio

### Lỗi "API quota exceeded"
- Bạn đã hết quota miễn phí của Gemini API
- Kiểm tra usage tại [Google AI Studio](https://aistudio.google.com/)

### Ảnh không hiển thị sau khi upload
- Kiểm tra định dạng ảnh (chỉ hỗ trợ PNG, JPG, WebP)
- Thử refresh lại trang
- Kiểm tra console log để xem lỗi chi tiết

### Không vẽ được mask
- Đảm bảo đang chọn công cụ Brush (B), không phải Pan (H)
- Kiểm tra kích thước brush không quá nhỏ
- Thử zoom in để vẽ dễ hơn

### Port 3000 đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 🔒 Bảo mật

- API key chỉ được gửi từ client lên server, không được lưu trên server
- Ảnh upload được xử lý trực tiếp, không lưu trữ lâu dài
- Sử dụng HTTPS khi deploy production

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết

## 🤝 Contributing

Contributions, issues và feature requests đều được welcome!

## 👨‍💻 Author

**galoihhbg**
- GitHub: [@galoihhbg](https://github.com/galoihhbg)

## 🙏 Credits

- [Google Gemini AI](https://ai.google.dev/) - AI models
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons

---

⭐ Nếu project hữu ích, hãy star repo này nhé!
