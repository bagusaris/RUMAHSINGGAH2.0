<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Surat Keputusan Rumah Singgah - Dinas Kesehatan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen p-4 sm:p-8 flex items-center justify-center">

    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div class="p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
            <div>
                <h1 class="text-lg font-bold">Verifikasi TTE Naskah Dinas</h1>
                <p class="text-xs text-blue-200">Balai Sertifikasi Elektronik (BSrE) - Badan Siber dan Sandi Negara</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold">
                ✓
            </div>
        </div>

        <div class="p-6 sm:p-8">
            @if($isValid && $letter)
                <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                        ✓
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-emerald-900">DOKUMEN ASLI & TERVERIFIKASI RESMI</h3>
                        <p class="text-xs text-emerald-700">Tanda Tangan Elektronik tersertifikasi oleh Balai Sertifikasi Elektronik (BSrE BSSN).</p>
                    </div>
                </div>

                <div class="space-y-4 text-sm text-slate-700">
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Nomor Surat:</span>
                        <span class="font-bold text-slate-900">{{ $letter->letter_number }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Nomor Registrasi:</span>
                        <span class="font-semibold">{{ $letter->application->application_number }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Nama Pasien:</span>
                        <span class="font-bold text-slate-900">{{ $letter->application->patient->full_name }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">NIK (Masked UU PDP):</span>
                        <span class="font-mono text-slate-800">{{ $letter->application->patient->masked_nik }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Ditandatangani Oleh:</span>
                        <span class="font-semibold text-slate-900">{{ $letter->signed_by_name }} (NIP. {{ $letter->signed_by_nip }})</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Jabatan Penandatangan:</span>
                        <span class="text-slate-800">{{ $letter->signed_by_position }}</span>
                    </div>
                    <div class="flex justify-between border-b pb-2">
                        <span class="text-slate-500">Waktu Penandatanganan:</span>
                        <span class="text-slate-800">{{ $letter->signed_at->format('d F Y, H:i:s') }} WIB</span>
                    </div>
                    <div>
                        <span class="text-xs text-slate-500 block mb-1">Cryptographic Digest (SHA-256):</span>
                        <code class="text-[11px] block p-2 rounded bg-slate-100 text-slate-800 break-all">{{ $letter->document_sha256 }}</code>
                    </div>
                </div>
            @else
                <div class="text-center py-8">
                    <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                        ✕
                    </div>
                    <h2 class="text-base font-bold text-slate-900 mb-2">Token Tidak Ditemukan atau Tidak Valid</h2>
                    <p class="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                        Pastikan QR Code yang dipindai berasal dari Surat Persetujuan Hak Huni resmi yang diterbitkan oleh Dinas Kesehatan.
                    </p>
                    <a href="/" class="inline-flex px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700">
                        Kembali ke Beranda
                    </a>
                </div>
            @endif
        </div>

        <div class="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
            Sistem Informasi Manajemen Rumah Singgah Pasien — Dinas Kesehatan Pemerintah Daerah
        </div>

    </div>

</body>
</html>
