# Retail POS

Aplikasi **Point of Sale (Kasir)** berbasis web untuk bisnis retail multi-gerai. Dibangun untuk localhost, modular, dan mudah dikembangkan ke VPS.

**Repository:** https://github.com/IdrusShahab/retail-pos

---

## Teknologi

| Bagian | Stack |
|--------|-------|
| Frontend | React, Vite, Bootstrap 5, Chart.js |
| Backend | Node.js, Express.js |
| Database | MySQL + Prisma ORM |
| Auth | JWT + bcrypt |

---

## Fitur

- **Admin** — Dashboard, CRUD Gerai/User/Supplier/Produk, Stok, Receiving, Stock Opname, Promo, Laporan
- **Kasir** — POS, scan barcode, pembayaran (Tunai/QRIS/Debit), cetak struk, kode promo
- **Multi gerai** — 5 gerai, stok & transaksi per `store_id`

---

## Prasyarat

- Node.js 20+
- XAMPP (MySQL aktif, port **8111**)
- (Opsional) Cloudflared — untuk akses dari luar via tunnel

---

## Cara Menjalankan

### 1. Setup database (pertama kali)

```bat
E:\Kasir\setup-database.bat
```

### 2. Jalankan aplikasi

```bat
E:\Kasir\start-all.bat
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| MySQL | localhost:8111 — database `retail_pos` |

### 3. Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Kasir | `kasir1` | `kasir123` |

> Ganti password default sebelum dipakai di lingkungan nyata.

---

## Konfigurasi

Salin dan sesuaikan `backend/.env`:

```
DATABASE_URL="mysql://root:@localhost:8111/retail_pos"
JWT_SECRET="ganti-secret-key-anda"
PORT=3000
```

---

## Akses dari Internet (opsional)

```bat
E:\Kasir\tunnel-cloudflare.bat
```

Bagikan URL `*.trycloudflare.com` yang muncul. PC harus tetap menyala.

---

## Struktur Folder

```
Kasir/
├── backend/     → API Express + Prisma
├── frontend/    → React + Vite
├── start-all.bat
└── setup-database.bat
```

---

## Database

- **Engine:** MySQL (bukan file `.db`)
- **Nama:** `retail_pos`
- **Buka data:** phpMyAdmin → http://localhost/phpmyadmin
- **Export:** phpMyAdmin → Export → SQL

---

## Lisensi

Open source — gratis untuk belajar dan pengembangan.