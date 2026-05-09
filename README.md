# Daily Quest

## Deskripsi
Daily Quest adalah aplikasi web untuk mengelola aktivitas harian dengan konsep *daily quest*. Pengguna dapat login, menambahkan task, menandai task sebagai selesai, dan melihat histori penyelesaian berdasarkan tanggal.

Aplikasi mendukung backend Supabase untuk autentikasi dan penyimpanan data. Jika Supabase belum dikonfigurasi, aplikasi tetap bisa dicoba secara lokal menggunakan `localStorage`.

## Teknologi
- Next.js untuk aplikasi web dan Route Handlers
- React untuk antarmuka pengguna
- TypeScript untuk penulisan kode yang lebih aman
- Tailwind CSS untuk styling
- Supabase untuk autentikasi dan database
- Zod untuk validasi input client dan server
- `localStorage` untuk mode lokal tanpa backend

## Struktur Folder
```text
root/
|-- app/
|   |-- api/
|   |   |-- auth/
|   |   |-- history/
|   |   |-- me/
|   |   `-- tasks/
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- daily-quest/
|   |   |-- dashboard-view.tsx
|   |   |-- history-view.tsx
|   |   |-- login-screen.tsx
|   |   |-- task-form.tsx
|   |   |-- task-row.tsx
|   |   |-- ui.tsx
|   |   `-- view-switch.tsx
|   `-- daily-quest-app.tsx
|-- docs/
|   `-- product-requirements-document.pdf
|-- lib/
|   |-- server/
|   |-- daily-quest-api.ts
|   |-- daily-quest-schemas.ts
|   |-- daily-quest-state.ts
|   |-- daily-quest-store.ts
|   |-- dates.ts
|   |-- error-message.ts
|   |-- supabase.ts
|   |-- user-profile.ts
|   `-- utils.ts
|-- supabase/
|   `-- schema.sql
|-- types/
|   `-- daily-quest.ts
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
`-- README.md
```

## Cara Menjalankan
1. Unduh atau *clone* proyek
2. Buka folder proyek
3. Instal dependensi:
   ```bash
   npm install
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Buka aplikasi di browser melalui `http://localhost:3000`

Login lokal menerima email valid dan password minimal 6 karakter. Data task, status harian, sesi, dan histori disimpan di `localStorage` saat Supabase belum dikonfigurasi.

## Script
```bash
npm run dev        # menjalankan development server
npm run build      # membuat production build
npm run start      # menjalankan production server
npm run lint       # menjalankan ESLint
npm run typecheck  # menjalankan TypeScript type check
```

## Supabase
Variabel environment tersedia di `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Buat file `.env.local` untuk nilai environment lokal. Skema database tersedia di `supabase/schema.sql` dan perlu diterapkan di SQL Editor Supabase sebelum backend online digunakan. Supabase Auth juga perlu memiliki akun email/password untuk login.

## Keamanan
File `.gitignore` sudah mengabaikan file sensitif dan artefak lokal seperti:
- `.env*` kecuali `.env.example`
- `.vercel/`
- `.supabase/`
- file credential seperti `*.pem`, `*.key`, `*.p12`, dan `*.pfx`
- `node_modules/`, `.next/`, `dist/`, dan `tsconfig.tsbuildinfo`

---
Dikembangkan oleh: @franzxml
