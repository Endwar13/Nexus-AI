# Ecosystem Management System (E.M.S)

Ecosystem Management System (E.M.S). E.M.S adalah sistem management dan pengawasan lingkungan berbasis AI yang dapat diintegrasikan dengan Gemini API. Sistem ini dibuat untuk memudahkan dalam menganalisis dan mengawasi kondisi lingkungan dan ekosistem untuk mengendalikan polusi atau pencemaran yang terjadi di lingkungan sekitar. E.M.S bekerja dengan menganalisis data dari pengguna untuk memberikan solusi dari sebuah permasalahan menggunakan hasil analisis dari data yang diberikan.

Tech Stack yang digunakan:
1. Typescript (React)
2. Supabase (Auth & Database)
3. Gemini API
4. Tailwind CSS 

Cloud Database = Supabase

Tema = 
1. Sky Blue dan Lime 
2. Logo = Green IT
3. Agentic AI Style


## System Rules ##

- E.M.S Menolak perintah yang tidak berkaitan dengan lingkungan dan hanya menjawab seputar kondisi ekosistem, ilmu pengetahuan tentang alam dan lingkungan serta tentang sampah.
- E.M.S Membaca data dari cloud database (Supabase) dan dianalisis untuk disesuaikan dengan input pertanyaan dari pengguna.
- Mencari jawaban dari internet atau web menggunakan teknik deepsearch di sesuaikan dengan prompt dan data yang kurang.
- Membuat grafik berdasarkan data yang dikirimkan.
- Memilih model Gemini 2.5 Flash secara default.
- Menggunakan Supabase sebagai Cloud Database dan penyedia Autentikasi.

---

## Workflow Autentikasi & Akses Pengguna (Login Page)

### Alur Login
## 1. Alur Autentikasi (Authentication Flow)

Aplikasi E.M.S menggunakan **Supabase Auth** untuk mengelola sesi dan akses pengguna. Alur utamanya terbagi menjadi beberapa metode:

### A. Registrasi (Sign Up)
1. Pengguna baru memilih opsi **"Buat akun baru"**.
2. Memasukkan Email dan Password.
3. Supabase akan mengirimkan email konfirmasi. (Pada mode *development*, Anda dapat mematikan "Confirm email" di pengaturan Supabase Auth agar akun langsung aktif).

### B. Login via Email (Magic Link / OTP)
1. Pengguna memilih opsi **"Masuk dengan Magic Link"**.
2. Memasukkan Email aktif.
3. Supabase akan mengirimkan tautan (Magic Link) atau kode OTP ke email pengguna.
4. Ketika tautan diklik, pengguna langsung masuk ke aplikasi tanpa menggunakan password.

### C. Login via Password
1. Pengguna memilih opsi **"Masuk dengan password"** (Default).
2. Memasukkan Email dan Password yang telah didaftarkan.
3. Berhasil masuk ke sistem.

### D. Post-Login (Setup Profile)
- Jika pengguna baru (atau login via OTP untuk pertama kalinya) belum memiliki data `username` pada tabel `profiles`, sistem akan otomatis mengarahkannya ke halaman `/setup-profile`.
- Di halaman ini, pengguna diwajibkan untuk melengkapi **Username** dan mengatur ulang/membuat **Password** baru (opsional, untuk memastikan mereka bisa login via password di kemudian hari).


### 1. Overview
Sebelum mengakses aplikasi utama, pengguna diharuskan melakukan login. Alur autentikasi E.M.S mengutamakan **Email-First Authentication** via Supabase Auth. Pengguna dapat langsung masuk menggunakan alamat email, lalu mengatur **Username** dan **Password** secara mandiri setelah berhasil masuk (*Post-Login Setup*).

### 2. Fitur & Aturan Bisnis (Business Logic)
* **Email Login / Registration:**
  * Pengguna memasukkan alamat email aktif pada halaman Login.
  * Sistem mengirimkan *Magic Link* atau *OTP (One-Time Password)* ke email pengguna melalui **Supabase Auth**.
* **Post-Login Profile & Credential Setup:**
  * Jika pengguna baru pertama kali login berbasis email (belum memiliki Username/Password), sistem akan menampilkan modal/halaman khusus *Set Up Profile*.
  * Pengguna wajib memasukkan **Username** dan menentukan **Password** baru untuk akunnya.
  * Password dan Username disimpan ke tabel profil pengguna di Supabase yang terikat dengan `user_id` dari Supabase Auth.
* **Direct Login (Pengguna Lama):**
  * Setelah Username dan Password diatur, pengguna di masa mendatang dapat memilih untuk login via Email OTP *atau* menggunakan Password yang telah dibuat.

### 3. Komponen UI / UX
1. **Halaman Login (Auth Screen):**
   * *Input Field*: Email pengguna.
   * *Button*: "Kirim Link / Kode Masuk Email".
   * *Alternative Login*: Form Input Username/Email & Password (bagi pengguna yang sudah pernah mengatur password).
2. **Post-Login Setup Modal / Screen (Inisialisasi Akun):**
   * Tampilan *welcome* untuk pengguna baru.
   * *Input Field*: Username.
   * *Input Field*: Password Baru & Konfirmasi Password.
   * *Button*: "Simpan Profil & Lanjutkan ke Dashboard".

### 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Pengguna dapat berhasil masuk ke sistem cukup dengan menginputkan alamat email yang valid.
- [ ] Pengguna yang belum memiliki Username/Password secara otomatis diarahkan ke alur *Setup Profile* setelah login via email.
- [ ] Username dan Password yang dibuat tersimpan dengan aman dan terhubung dengan ID akun Supabase.
- [ ] Halaman utama (Dashboard) tidak dapat diakses tanpa token/sesi login yang sah dari Supabase Auth.

---

## Detail Layout & Navigation ##

### Sidebar Layout
- **Informasi User:** Menampilkan Foto/Avatar, Nama User (Username), dan Alamat Email.
- **Halaman Navigasi:** 4 Halaman Utama web app.
- **Tombol Action:** Tombol untuk *Sign Out* (Mengakhiri sesi dan kembali ke Halaman Login).

**Halaman yang ada di Sidebar:**
1. Agentic AI
2. Data Monitoring
3. Input and Create Table
4. Setting

*Catatan:* Terdapat *toggle button* untuk memperkecil dan memperbesar sidebar. Pada saat sidebar mengecil, teks nama halaman diwakili oleh ikon/logo.

---

## Fitur 4 Halaman Utama

### 1. Agentic Page

#### 1. Overview
Halaman **Agentic Page** pada aplikasi *"Ecosystem Management System"* berfungsi sebagai antarmuka percakapan interaktif berbasis Gemini API. Halaman ini mendukung dua mode utama:
* **Chat Mode:** Menjawab pertanyaan seputar lingkungan/ekosistem/sampah berbasis data real-time, database, dan pengetahuan umum (*DeepSearch*).
* **Agentic Mode:** Menjalankan aksi/tugas kompleks seperti pembuatan tabel, grafik, dan ringkasan data ekosistem secara otomatis.

#### 2. Fitur & Aturan Bisnis (Business Logic)

##### 2.1 Chat Mode
* **Fungsi Utama:** Menjawab pertanyaan informasi ekosistem & data sampah.
* **Scope Restriction:** Menolak pertanyaan di luar topik lingkungan, ekosistem, ilmu pengetahuan alam, dan pengelolaan sampah.
* **Proses:** Lakukan pencarian (*DeepSearch*) + kueri ke cloud database sebelum memberikan jawaban.
* **System Instruction:**
  > "Kamu adalah AI yang ahli dalam bidang lingkungan, ekosistem, dan ilmu pengetahuan alam. Jawablah pertanyaan pengguna berdasarkan data real-time, data dari cloud database, serta pengetahuan ilmiah terpercaya. Tolak secara sopan pertanyaan yang tidak berkaitan dengan topik lingkungan, ekosistem, dan sampah."

##### 2.2 Agentic Mode
* **Fungsi Utama:** Menganalisis data cloud untuk menghasilkan output terstruktur.
* **Kemampuan Agent:**
  * Memanggil fungsi `generate_table` untuk membuat tabel data.
  * Memanggil fungsi `generate_chart` untuk menampilkan grafik (Bar/Line/Pie).
  * Memanggil fungsi `summarize_database` untuk membuat rangkuman data.
* **System Instruction:**
  > "Kamu adalah Asisten Agentic AI yang berpikir secara rasional menyesuaikan data dari cloud database untuk menyelesaikan tugas yang diberikan seperti menyusun tabel, membuat grafik, serta membuat ringkasan dari database sesuai dengan perintah."

#### 3. Komponen UI / UX
1. **Header:** Judul sistem *"Ecosystem Management System"*.
2. **Chat Container:**
   * Area riwayat obrolan (pesan dari pengguna & respon AI).
   * **Loading State:** Animasi indikator "Sedang menganalisis database & DeepSearch..." saat proses berlangsung.
   * **Render Component:** Area khusus untuk menampilkan komponen grafik/tabel dinamis yang dihasilkan oleh Agentic Mode.
3. **Chat Input Bar:**
   * **Toggle Switch:** Opsi pilihan `Chat Mode` | `Agentic Mode`.
   * **Dropdown Context Selector:** Memilih dokumen/file tambahan dari sistem.
   * **Button "Add Monitoring Data":** Tombol cepat untuk mengintegrasikan tabel dari halaman *Monitoring Data* sebagai konteks.
   * **Text Area:** Input *prompt* pengguna.
   * **Tombol Kirim:** Mengirim *prompt* ke Gemini API.

#### 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Pengguna dapat berpindah antara `Chat Mode` dan `Agentic Mode` menggunakan tombol Toggle.
- [ ] Dalam `Chat Mode`, AI menolak menjawab pertanyaan non-topik lingkungan (misal: topik politik atau hiburan).
- [ ] Dalam `Agentic Mode`, AI dapat mengembalikan respons berformat grafik/tabel sesuai data dari cloud database.
- [ ] Pengguna dapat mengeklik tombol "Add" untuk melampirkan konteks dari halaman *Monitoring Data*.
- [ ] Indikator *loading* muncul secara responsif selama Gemini API melakukan panggilan data/DeepSearch.

---

### 2. Data Monitoring

#### 1. Overview
Halaman **Data Monitoring** berfungsi sebagai dasbor utama untuk memantau data ekosistem dan pengelolaan sampah secara *real-time* atau historis. Data diambil secara langsung dari cloud database (Supabase).

#### 2. Fitur & Aturan Bisnis (Business Logic)
* **Data Fetching:** Mengambil tabel data metrik lingkungan (seperti volume sampah, tingkat polusi, dll) dari Supabase secara *real-time* menggunakan *subscription* atau *polling*.
* **Filter Data:** Pengguna dapat menyaring data berdasarkan rentang waktu (Tanggal), lokasi, dan jenis metrik (Misal: Organik/Anorganik, Kualitas Udara).
* **Export Data:** Kemampuan untuk mengunduh data yang sedang ditampilkan ke dalam format CSV.

#### 3. Komponen UI / UX
1. **Header Dashboard:** Judul "Pemantauan Ekosistem Real-Time".
2. **Summary Cards (Statistik Cepat):** * Card 1: Total volume sampah minggu ini.
   * Card 2: Status polusi udara/air rata-rata.
   * Card 3: Jumlah entri data baru hari ini.
3. **Filter Bar:**
   * *Date Range Picker* (Pilih rentang tanggal).
   * *Dropdown* Kategori Ekosistem/Sampah.
4. **Data Grid / Table:** Tabel responsif untuk menampilkan baris data dari Supabase (mendukung *Pagination* dan *Sorting* pada setiap kolom).
5. **Button "Export CSV":** Tombol di kanan atas tabel untuk mengekspor data.

#### 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Tabel berhasil memuat dan menampilkan data terbaru dari Supabase tanpa *error*.
- [ ] *Summary Cards* menampilkan kalkulasi angka yang akurat berdasarkan data di database.
- [ ] Fitur *sorting* kolom dan *pagination* berfungsi dengan baik.
- [ ] Pengguna dapat memfilter data dan tabel langsung menyesuaikan hasil pencarian.

---

### 3. Input and Create Table

#### 1. Overview
Halaman **Input and Create Table** adalah pusat administrasi bagi pengguna untuk memasukkan data pemantauan lingkungan secara manual atau membuat skema/tabel pencatatan baru jika ada indikator lingkungan baru yang perlu diawasi.

#### 2. Fitur & Aturan Bisnis (Business Logic)
* **Input Data Manual:** Formulir untuk menambah baris data baru ke tabel yang sudah ada di Supabase. Data divalidasi sebelum dikirim (tidak boleh kosong pada field wajib).
* **Create Custom Table/Dataset:** Pengguna dapat membuat grup/kategori pengawasan baru (misalnya membuat tabel khusus "Pemantauan Limbah Pabrik X") dengan mendefinisikan kolom yang dibutuhkan.
* **Feedback System:** Mengembalikan *Toast/Notifikasi* sukses atau gagal setelah transaksi database (Insert/Create) dilakukan.

#### 3. Komponen UI / UX
1. **Tabs Navigation:** Dua tab utama, yaitu "Input Data" dan "Buat Tabel Baru".
2. **Tab Input Data:**
   * *Dropdown* pilih Tabel/Kategori tujuan.
   * Form dinamis menyesuaikan kategori yang dipilih (Lokasi, Waktu, Jenis Sampah/Polusi, Jumlah/Tingkat).
   * Tombol "Submit Data".
3. **Tab Buat Tabel Baru:**
   * *Input Text* untuk Nama Tabel/Kategori.
   * Tombol "+ Tambah Kolom" (Input nama kolom & tipe data: Teks, Angka, Tanggal).
   * Tombol "Simpan Skema".
4. **Toast Notifications:** Pop-up kecil di pojok layar (Sukses berwarna hijau, Error berwarna merah).

#### 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Sistem memvalidasi form (mencegah *submit* jika form input data wajib kosong).
- [ ] Data yang diinputkan berhasil tersimpan ke Supabase dan otomatis muncul di halaman *Data Monitoring*.
- [ ] Pengguna dapat membuat skema tabel baru dan database merespons dengan pembuatan tabel/kategori yang valid.
- [ ] Notifikasi sukses atau gagal muncul setelah menekan tombol submit.

---

### 4. Setting

#### 1. Overview
Halaman **Setting** digunakan untuk mengatur preferensi pengguna, pembaruan kredensial akun (Username & Password), konfigurasi sistem AI, serta manajemen akun yang terhubung dalam *Ecosystem Management System*.

#### 2. Fitur & Aturan Bisnis (Business Logic)
* **Manajemen Profil & Kredensial:**
  * Menampilkan email akun terhubung (Read-only).
  * Pengguna dapat memperbarui **Username** dan mengubah **Password** kapan saja setelah login.
  * Pembaruan foto profil / avatar (disimpan di Supabase Storage / Auth).
* **AI Configuration:** Pengaturan untuk menyesuaikan tingkat detail balasan AI di *Agentic Page* (Ringkas vs Mendetail) dan pengaturan default sumber data.
* **Tema Visual:** Opsi beralih antara Mode Gelap (*Dark Mode*) dan Mode Terang (*Light Mode*).
* **Autentikasi:** Fungsionalitas Sign Out untuk mengakhiri sesi Supabase.

#### 3. Komponen UI / UX
1. **Profile & Credential Section:**
   * Avatar / Foto Profil & Tombol Upload.
   * Field Email (Read-only).
   * Input Teks Username.
   * Field Ubah Password Baru & Konfirmasi Password.
   * Tombol "Update Profile & Security".
2. **AI Preferences Section:**
   * *Radio Buttons* untuk Gaya Balasan AI: `Singkat` / `Mendetail`.
3. **Appearance Section:**
   * *Toggle Switch* untuk Mode Terang / Gelap.
4. **Danger Zone / Account Section:**
   * Tombol "Sign Out" berwarna merah.

#### 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Pengguna dapat memperbarui Username dan Password mereka dari halaman Setting dan perubahan berhasil tersimpan ke Supabase.
- [ ] Saat *Toggle Switch* tema diubah, *Tailwind CSS* langsung memperbarui tampilan aplikasi menjadi *Dark/Light mode*.
- [ ] Pengaturan preferensi AI tersimpan ke *local storage* atau database preferensi pengguna.
- [ ] Tombol Sign Out berhasil menghapus sesi Supabase Auth dan mengarahkan kembali pengguna ke Halaman Login.