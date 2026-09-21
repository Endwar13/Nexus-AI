# Dokumentasi Autentikasi dan Database Supabase (E.M.S)

Dokumen ini menjelaskan alur autentikasi dan skema database Supabase yang digunakan dalam **Ecosystem Management System (E.M.S)**. Dokumentasi ini bertujuan untuk mempermudah proses development dan penyesuaian data pada tabel di Supabase.

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

---

## 2. Skema Tabel Database (Supabase Schema)

Agar aplikasi dapat berjalan dengan lancar, Anda harus membuat 2 tabel utama di database Supabase Anda.

### A. Tabel `profiles`
Tabel ini menyimpan data profil tambahan dari pengguna yang tidak tersimpan langsung di tabel bawaan `auth.users` Supabase.

- **Nama Tabel:** `profiles`
- **Primary Key:** `id` (Tipe: `uuid`)
- **Foreign Key:** Kolom `id` harus berelasi dengan tabel bawaan `auth.users` (kolom `id`) dengan aksi *Cascade* jika user dihapus.

| Nama Kolom | Tipe Data | Keterangan | Aturan Khusus |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | ID unik pengguna | Primary Key, References `auth.users(id)` |
| `username` | `text` | Nama pengguna (username) | Tidak boleh kosong (Not Null) |
| `email` | `text` | Email pengguna | Tidak boleh kosong (Not Null) |
| `gemini_api_key` | `text` | Kunci API Gemini pengguna | Boleh kosong (Nullable) |
| `avatar_url` | `text` | URL foto profil | Boleh kosong (Nullable) |
| `created_at` | `timestampz`| Waktu pembuatan data | Default: `now()` |
| `updated_at` | `timestampz`| Waktu pembaruan data | Boleh kosong, diset saat update profil |

### B. Tabel `monitoring_data`
Tabel ini digunakan untuk menyimpan seluruh catatan pemantauan lingkungan, ekosistem, dan sampah yang diinputkan pengguna.

- **Nama Tabel:** `monitoring_data`
- **Primary Key:** `id` (Tipe: `uuid` atau `int8` auto-increment)

| Nama Kolom | Tipe Data | Keterangan | Aturan Khusus |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` / `int8`| ID unik baris data | Primary Key, Auto Generated |
| `created_at` | `timestampz`| Waktu pencatatan data | Default: `now()` |
| `location` | `text` | Lokasi pemantauan | Tidak boleh kosong (Not Null) |
| `category` | `text` | Kategori (Sampah, Polusi Udara, dll)| Tidak boleh kosong (Not Null) |
| `value` | `numeric` | Nilai indikator (jumlah, AQI, dll)| Tidak boleh kosong (Not Null) |
| `unit` | `text` | Satuan nilai (kg, AQI, dll) | Boleh kosong (Nullable) |
| `description`| `text` | Catatan opsional / keterangan | Boleh kosong (Nullable) |

---

## 3. Real-time Subscriptions (Fitur Monitoring)

Aplikasi ini menggunakan fitur **Realtime** dari Supabase pada tabel `monitoring_data`.
Agar data termutakhir secara otomatis (live-update) di halaman "Data Monitoring" tanpa perlu *refresh* halaman, Anda perlu mengaktifkan Realtime di Supabase:

1. Buka dashboard Supabase.
2. Navigasi ke menu **Database** -> **Replication** atau **Realtime**.
3. Pilih tabel `monitoring_data` dan aktifkan toggle *Enable Realtime*.

---

## 4. Konfigurasi Row Level Security (RLS)

Secara default, jika Anda membuat tabel baru di Supabase, **RLS akan aktif**. Hal ini bisa membuat operasi `insert`, `select`, atau `update` gagal jika kebijakan (Policy) belum diatur.

Untuk kemudahan *development*:
1. Anda dapat menonaktifkan RLS sementara pada tabel `profiles` dan `monitoring_data` (Klik tabel -> *Disable RLS*).
2. **Atau untuk best-practice (Produksi):**
   - Buat *Policy* agar semua orang yang sudah login (Authenticated Users) bisa membaca (`SELECT`) dan memasukkan (`INSERT`) ke `monitoring_data`.
   - Buat *Policy* agar profil hanya bisa diubah (`UPDATE`) oleh pemilik profil tersebut (berdasarkan klausa `auth.uid() = id`).
