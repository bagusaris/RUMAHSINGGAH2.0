<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $app_name ?? 'SIM-RSP Dinas Kesehatan' }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col justify-between p-6">
    <div class="max-w-4xl mx-auto w-full my-auto text-center py-12">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <span>Standar Backend PHP 8.5 & Laravel 11/12</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            SIM-RSP Dinas Kesehatan API & Server Engine
        </h1>
        <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Sistem Informasi Manajemen Rumah Singgah Pasien — Terintegrasi dengan modul verifikasi berkas, persetujuan Kadinkes ber-TTE BSrE BSSN, dan algoritma alokasi kamar anti-double booking.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mb-10">
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span class="text-xs font-bold text-blue-400 block mb-1">REST API</span>
                <h3 class="font-bold text-sm text-slate-200">Endpoint Publik & Internal</h3>
                <p class="text-xs text-slate-400 mt-1">Disediakan di rute <code>/api/v1/public/*</code> dan <code>/api/v1/staff/*</code>.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span class="text-xs font-bold text-emerald-400 block mb-1">BSrE BSSN</span>
                <h3 class="font-bold text-sm text-slate-200">Digital Digest & TTE</h3>
                <p class="text-xs text-slate-400 mt-1">Validasi hash SHA-256 dan token QR untuk penerbitan surat hak huni.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span class="text-xs font-bold text-purple-400 block mb-1">UU PDP</span>
                <h3 class="font-bold text-sm text-slate-200">Perlindungan Data Pribadi</h3>
                <p class="text-xs text-slate-400 mt-1">Auto-masking NIK 16 digit dan penguncian anti brute-force.</p>
            </div>
        </div>

        <div class="flex items-center justify-center gap-3">
            <a href="/api/v1/public/requirements" class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition">
                Cek API Requirements
            </a>
            <a href="/verifikasi" class="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition">
                Halaman Verifikasi QR
            </a>
        </div>
    </div>

    <footer class="text-center text-xs text-slate-500 py-4 border-t border-slate-800">
        &copy; {{ date('Y') }} Dinas Kesehatan Pemerintah Daerah. Didukung arsitektur Laravel 11/12 & PHP 8.5.
    </footer>
</body>
</html>
