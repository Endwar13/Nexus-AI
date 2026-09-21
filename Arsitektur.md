# Nexus ECO AI
Nexus ECO adalah sistem manajemen dan pengawasan lingkungan berbasis AI yang terintegrasi dengan Gemini API. Sistem ini mempermudah analisis dan pengawasan kondisi lingkungan serta ekosistem untuk membantu mengendalikan pencemaran dan pengelolaan sampah di lingkungan sekitar.

## 🌟 Fitur Utama

1. **Autentikasi Aman & Fleksibel**:
   - Mendukung Login via Email (Magic Link / OTP) & Password.
   - Setup profil pasca-login (Username & API Key Mandiri).
2. **Agentic AI Assistant**:
   - **Chat Mode**: Menjawab informasi seputar ekosistem dan lingkungan berbasis ilmu pengetahuan.
   - **Agentic Mode**: Mengolah data dari *cloud database* untuk melakukan generate tabel, grafik visual, dan ringkasan data.
3. **Data Monitoring Real-Time**:
   - Memantau indikator lingkungan (Sampah, Polusi Udara, Polusi Air) secara *live*.
   - Filter data dan kemampuan *Export* ke CSV.
4. **Input & Kustomisasi Tabel**:
   - Form input pencatatan data pemantauan.
   - Pembuatan kategori/tabel pengawasan kustom secara dinamis.

---

## 🛠️ Tech Stack & Daftar Package

Aplikasi ini dibangun menggunakan arsitektur **Fullstack (Express + Vite)** dengan React TypeScript. Berikut adalah daftar *package* (dependensi) utama yang digunakan dalam sistem ini:

### Dependensi Utama (Dependencies)
Jika Anda menginisiasi proyek dari awal, berikut adalah *command* untuk meng-install package eksternal yang dibutuhkan:

```bash
# 1. UI, Routing, & Styling
npm install react-router-dom clsx tailwind-merge lucide-react

# 2. Supabase (Database & Autentikasi)
npm install @supabase/supabase-js

# 3. Grafik & Visualisasi Data
npm install recharts

# 4. Rendering Markdown (Untuk respon dari Gemini)
npm install react-markdown

# 5. Gemini AI SDK
npm install @google/genai
```

### Dependensi Development (DevDependencies)
```bash
# Plugin Tailwind Typography (Untuk mempercantik tampilan markdown)
npm install -D @tailwindcss/typography
```

*Catatan: Jika Anda sudah memiliki file `package.json` dari *repository* ini, Anda hanya perlu menjalankan command:*
```bash
npm install
```

---

## 🚀 Cara Menjalankan Aplikasi (Development)

### 1. Prasyarat
Pastikan Anda sudah meng-install Node.js di komputer Anda. Selain itu, Anda perlu memiliki:
- Akun dan Project di **Supabase**.
- API Key dari **Google Gemini API** (Google AI Studio).

### 2. Konfigurasi Environment Variables
Buat sebuah file bernama `.env` di *root* direktori proyek, kemudian isi dengan variabel berikut (lihat `.env.example` sebagai referensi):

```env
# Gemini API Key (Digunakan sebagai default di sisi server)
GEMINI_API_KEY="AIzaSy_YOUR_GEMINI_API_KEY"

# URL Service (Opsional)
APP_URL="http://localhost:3000"

# Kredensial Supabase (Dapatkan dari Project Settings > API)
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 3. Menjalankan Server Development
Aplikasi ini menjalankan backend (Express) dan frontend (Vite) secara terintegrasi. Jalankan perintah berikut:

```bash
# Menjalankan server dalam mode development
npm run dev
```

Aplikasi dapat diakses melalui browser pada alamat `http://localhost:3000`.

---

## 📦 Build & Production

Untuk membangun aplikasi dan bersiap untuk *deployment* (seperti ke Cloud Run atau layanan hosting container lainnya), jalankan perintah berikut:

```bash
# 1. Build aplikasi (Frontend Vite & Backend Server)
npm run build

# 2. Jalankan hasil build
npm run start
```

---

## 📖 Dokumentasi Lanjutan
- **Panduan Supabase**: Untuk mengetahui struktur pembuatan tabel di database Supabase dan mengatur keamanan *Row Level Security (RLS)*, silakan baca file `SUPABASE_DOCS.md`.
