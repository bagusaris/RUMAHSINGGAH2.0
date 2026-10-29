# PANDUAN IMPLEMENTASI & DOKUMENTASI TEKNIS (LARAVEL 11 / PHP 8.5)
## SISTEM INFORMASI MANAJEMEN RUMAH SINGGAH PASIEN (SIM-RSP) DINAS KESEHATAN

Dokumen ini ditujukan khusus bagi **Programmer / Software Engineer** yang ingin mengimplementasikan, mengonfigurasi, dan menyesuaikan aplikasi SIM-RSP Dinas Kesehatan pada infrastruktur server internal (on-premise / VPS) menggunakan **PHP 8.5 / 8.3** dan **Laravel 11 / 12**.

---

## 1. PANDUAN INSTALASI PADA SERVER INTERNAL

### A. Kebutuhan Sistem Minimum
* **Sistem Operasi**: Ubuntu 22.04 / 24.04 LTS, Debian 12, atau Rocky Linux 9
* **PHP**: Versi **8.2, 8.3, 8.4, atau 8.5** (Ekstensi: `php-cli`, `php-fpm`, `php-mysql` / `php-pgsql`, `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-bcmath`, `php-gd`, `php-intl`)
* **Database**: MySQL 8.0+ atau PostgreSQL 15+
* **Web Server**: Nginx atau Apache 2.4
* **Composer**: Versi 2.7+

### B. Langkah Instalasi Step-by-Step

```bash
# 1. Masuk ke direktori web server
cd /var/www/html

# 2. Salin folder laravel hasil export
git clone <repository_anda> sim-rsp
cd sim-rsp/laravel

# 3. Install semua dependensi PHP via Composer
composer install --optimize-autoloader --no-dev

# 4. Salin file environment
cp .env.example .env

# 5. Generate Application Encryption Key
php artisan key:generate

# 6. Konfigurasi Hak Akses Direktori Storage & Cache
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 7. Buat Symbolic Link Storage (khusus file publik)
php artisan storage:link

# 8. Jalankan Migrasi Database dan Seeder Awal
php artisan migrate --seed
```

---

## 2. PANDUAN PROGRAMMER: STRUKTUR MVC & PENYESUAIAN KODE

### A. Konfigurasi Environment (`.env`)
Buka file `.env` dan sesuaikan koneksi database dan kredensial BSrE:
```ini
APP_NAME="SIM-RSP Dinas Kesehatan"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://simrsp.dinkes.jatengprov.go.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sim_rsp_dinkes
DB_USERNAME=dinkes_user
DB_PASSWORD=PasswordKuat2026!

# Disk Penyimpanan Berkas Sensitif (KTP, SKTM, Rujukan)
FILESYSTEM_DISK=local

# Integrasi Balai Sertifikasi Elektronik (BSrE BSSN)
BSRE_API_ENDPOINT=https://esign-api.bssn.go.id/api/sign/pdf
BSRE_API_KEY=YOUR_BSRE_API_KEY_HERE
```

### B. Penyesuaian Skema Database (`database/migrations/`)
* File: `database/migrations/2026_10_29_000001_create_sim_rsp_core_tables.php`
* Jika ingin menambah kolom baru (misal: "Golongan Darah" pada Pasien), tambahkan di tabel `patients`:
```php
$table->string('blood_type', 5)->nullable()->after('gender');
```
Lalu jalankan migrasi: `php artisan migrate`.

### C. Penyesuaian Model Eloquent (`app/Models/`)
* **Patient.php**: Memiliki mutator masking otomatis `getMaskedNikAttribute()` yang mengaburkan NIK demi kepatuhan **UU No. 27 Tahun 2022 (UU PDP)**:
```php
public function getMaskedNikAttribute(): string {
    return substr($this->nik, 0, 6) . '******' . substr($this->nik, 12, 4);
}
```
* **Bed.php**: Berisi fungsi validasi interval overlap bebas tumpang-tindih (anti double-booking):
```php
public function isAvailableBetween(string $startDate, string $endDate): bool
```

### D. Penyesuaian Controller (`app/Http/Controllers/`)
1. **PublicRegistrationController.php**: Mengontrol pendaftaran mandiri 5 langkah, pembuatan kode akses 6 digit terenkripsi (`Hash::make`), dan upload berkas ke storage privat.
2. **PublicTrackingController.php**: Fitur lacak berkas tri-faktor (Nomor Registrasi + 4 digit NIK terakhir + Kode Akses 6 Digit) yang diproteksi `RateLimiter` 10 request/menit serta penguncian berkas setelah 5x kesalahan berturut-turut.
3. **AdminVerificationController.php**: Gerbang verifikasi berkas (Valid, Tidak Valid, Perlu Revisi). Mencegah berkas diteruskan ke Kadinkes jika syarat wajib belum dipenuhi (*Mandatory Requirement Gating*).
4. **DirectorApprovalController.php**: Portal keputusan Kadinkes yang memicu pembuatan Surat Keputusan Hak Huni ber-TTE BSrE dan stempel digital SHA-256.
5. **ShelterPlacementController.php**: Menggunakan database pessimistic lock (`lockForUpdate()`) agar tidak terjadi perlombaan alokasi ranjang (*race conditions*).

### E. Penyesuaian Tampilan Surat & PDF (`resources/views/letters/`)
* Template surat resmi naskah dinas: `resources/views/letters/approval_letter.blade.php`.
* Untuk mengubah logo Pemda atau Kop Surat, Anda cukup mengganti HTML pada bagian `<div class="kop-surat">`.

---

## 3. ASPEK ARSITEKTUR UNTUK PORTOFOLIO DEVELOPER

Aplikasi ini dirancang dengan standar *Enterprise Public-Sector Application*. Bila Anda mencantumkan proyek ini di portofolio CV atau GitHub Anda, sorot poin-poin unggulan berikut:

1. **State Machine Berbasis Regulasi Pemerintah**:
   Alur 8 status permohonan yang tidak dapat dilompati (*Draft* -> *Submitted* -> *Admin Verified* -> *Approved Kadinkes* -> *Room Assigned* -> *Checked In* -> *Completed*).
2. **Kepatuhan Privasi Data Medis & Kependudukan (UU PDP No. 27/2022)**:
   NIK 16 digit tidak pernah terekspos utuh pada log audit maupun publik; berkas medis disimpan pada private disk tanpa direct URL.
3. **Anti Double-Booking Algorithm**:
   Formula irisan interval `(newStart <= existEnd && newEnd >= existStart)` dikombinasikan dengan transaksi basis data dan `Pessimistic Locking` untuk menjamin integritas data alokasi kamar.
4. **Simulasi Tanda Tangan Elektronik Bersertifikasi (BSrE BSSN)**:
   Penerbitan digest dokumen SHA-256 dan token QR verification publik tanpa perlu membocorkan NIK pemohon.
5. **Keamanan Anti Brute-Force**:
   Tri-factor authentication untuk publik tracking dengan rate limiting dan penguncian otomatis setelah 5 kali salah input.

---

## 4. AKUN PENGUJIAN DEFAULT (SEEDER)

| Role / Jabatan | Alamat Email | Password Default | Akses Menu |
|---|---|---|---|
| **Super Admin** | `superadmin@dinkes.jatengprov.go.id` | `SuperAdmin2026!` | Kelola User, Pengaturan Sistem, Audit Trail |
| **Admin Dinkes** | `admin.dinkes@dinkes.jatengprov.go.id` | `AdminDinkes2026!` | Verifikasi Berkas & Syarat Administrasi |
| **Kepala Dinas** | `kadinkes@dinkes.jatengprov.go.id` | `Kadinkes2026!` | Persetujuan / Penolakan & TTE BSrE |
| **Petugas RSP** | `petugas.rsp@dinkes.jatengprov.go.id` | `Shelter2026!` | Matriks Kamar, Plotting Bed, Check-In/Out |

---

## 5. CARA MENJALANKAN SECARA LOKAL DENGAN LARAVEL ARTISAN

```bash
cd /laravel
php artisan serve --port=8000
```
Buka peramban di `http://127.0.0.1:8000`. API siap menerima permintaan dari frontend React maupun aplikasi mobile.
