<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Persetujuan Hak Huni Rumah Singgah</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #111;
            margin: 20px 40px;
        }
        .kop-surat {
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .kop-surat h2 {
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .kop-surat h1 {
            margin: 2px 0;
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kop-surat p {
            margin: 0;
            font-size: 9pt;
            font-style: italic;
        }
        .letter-title {
            text-align: center;
            margin-bottom: 25px;
        }
        .letter-title h3 {
            margin: 0;
            font-size: 13pt;
            text-decoration: underline;
            text-transform: uppercase;
        }
        .letter-title p {
            margin: 2px 0 0;
            font-size: 11pt;
        }
        table.meta-table {
            width: 100%;
            margin-bottom: 15px;
        }
        table.meta-table td {
            vertical-align: top;
            padding: 3px 0;
        }
        .content-body {
            text-align: justify;
            margin-bottom: 20px;
        }
        .footer-section {
            margin-top: 30px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 320px;
            text-align: center;
        }
        .qr-placeholder {
            margin: 10px auto;
            width: 100px;
            height: 100px;
            border: 1px dashed #777;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
        }
        .bsre-watermark {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 6px;
            font-size: 8pt;
            color: #555;
            font-family: sans-serif;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>

    <!-- KOP SURAT DINAS KESEHATAN -->
    <div class="kop-surat">
        <h2>Pemerintah Provinsi Jawa Tengah</h2>
        <h1>Dinas Kesehatan</h1>
        <p>Jl. Madukoro Blok AA-BB, Tawangmas, Semarang | Telp. (024) 7600588 | Email: dinkes@jatengprov.go.id</p>
    </div>

    <!-- JUDUL DAN NOMOR SURAT -->
    <div class="letter-title">
        <h3>Surat Persetujuan Pemanfaatan Fasilitas Rumah Singgah</h3>
        <p>Nomor: {{ $letter->letter_number }}</p>
    </div>

    <div class="content-body">
        <p>Berdasarkan hasil verifikasi berkas permohonan dan ketersediaan tempat tidur pada Unit Pelaksana Teknis (UPT) Rumah Singgah Pasien, Kepala Dinas Kesehatan dengan ini memberikan persetujuan penempatan kepada:</p>
        
        <table class="meta-table">
            <tr>
                <td style="width: 25%;">Nomor Registrasi</td>
                <td style="width: 3%;">:</td>
                <td style="font-weight: bold;">{{ $application->application_number }}</td>
            </tr>
            <tr>
                <td>Nama Pasien</td>
                <td>:</td>
                <td style="font-weight: bold;">{{ $patient->full_name }}</td>
            </tr>
            <tr>
                <td>NIK Pasien</td>
                <td>:</td>
                <td>{{ $patient->masked_nik }}</td>
            </tr>
            <tr>
                <td>Diagnosis / Keperluan</td>
                <td>:</td>
                <td>{{ $patient->medical_diagnosis }} (Rujukan RS: {{ $patient->hospital_referral_destination }})</td>
            </tr>
            <tr>
                <td>Jumlah Pendamping</td>
                <td>:</td>
                <td>{{ $companions->count() }} Orang</td>
            </tr>
            <tr>
                <td>Periode Izin Tinggal</td>
                <td>:</td>
                <td style="font-weight: bold;">
                    {{ $application->requested_check_in_date->format('d F Y') }} s/d {{ $application->requested_check_out_date->format('d F Y') }}
                </td>
            </tr>
        </table>

        <p>Dengan ketentuan pemohon dan pendamping wajib mematuhi seluruh tata tertib dan protokol kesehatan yang berlaku di lingkungan Rumah Singgah Pasien.</p>
    </div>

    <!-- TANDA TANGAN ELEKTRONIK BSrE -->
    <div class="footer-section">
        <div class="signature-box">
            <p>Ditetapkan di: Semarang<br>Pada tanggal: {{ $letter->signed_at->format('d F Y') }}</p>
            <p style="font-weight: bold; margin-bottom: 5px;">{{ $letter->signed_by_position }}</p>
            
            @if($qrCodeImage)
                <img src="data:image/png;base64,{{ $qrCodeImage }}" alt="QR Code BSrE" style="width: 100px; height: 100px; margin: 5px auto;">
            @else
                <div class="qr-placeholder">
                    QR TTE BSrE<br>Terverifikasi
                </div>
            @endif

            <p style="font-weight: bold; text-decoration: underline; margin-bottom: 0;">{{ $letter->signed_by_name }}</p>
            <p style="margin-top: 0; font-size: 10pt;">NIP. {{ $letter->signed_by_nip }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <!-- FOOTER BSrE NOTICE -->
    <div class="bsre-watermark">
        Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh <strong>Balai Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara (BSSN)</strong>. Keaslian dokumen dapat diverifikasi secara daring melalui pemindaian QR code atau tautan: <u>{{ $verificationUrl }}</u><br>
        <strong>Digital Digest (SHA-256):</strong> {{ $letter->document_sha256 }}
    </div>

</body>
</html>
