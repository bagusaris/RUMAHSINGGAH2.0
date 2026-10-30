<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Enums\UserRole;
use App\Models\Bed;
use App\Models\Building;
use App\Models\DocumentRequirement;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialSystemSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initial Users (All default test personas)
        $users = [
            [
                'name' => 'Siti Rahmawati, S.Tr.Kes',
                'email' => 'admin.dinkes@dinkes.jatengprov.go.id',
                'password' => Hash::make('AdminDinkes2026!'),
                'role' => UserRole::ADMIN_DINKES,
                'nip' => '198803152011012003',
                'department' => 'Subbag Pelayanan Kesehatan Rujukan',
                'phone' => '081234567801',
                'is_active' => true,
            ],
            [
                'name' => 'dr. H. Rahmat Hidayat, M.Kes',
                'email' => 'kadinkes@dinkes.jatengprov.go.id',
                'password' => Hash::make('Kadinkes2026!'),
                'role' => UserRole::DIRECTOR_KADINKES,
                'nip' => '197405122000031002',
                'department' => 'Pimpinan Dinas Kesehatan',
                'phone' => '081234567802',
                'is_active' => true,
            ],
            [
                'name' => 'Bambang Sudarsono, S.Sos',
                'email' => 'petugas.rsp@dinkes.jatengprov.go.id',
                'password' => Hash::make('Shelter2026!'),
                'role' => UserRole::SHELTER_ADMIN,
                'nip' => '198509202010011005',
                'department' => 'UPT Rumah Singgah Pasien Semarang',
                'phone' => '081234567803',
                'is_active' => true,
            ],
            [
                'name' => 'Ahmad Fauzi, S.Kom (Super Admin)',
                'email' => 'superadmin@dinkes.jatengprov.go.id',
                'password' => Hash::make('SuperAdmin2026!'),
                'role' => UserRole::SUPER_ADMIN,
                'nip' => '199001012014021001',
                'department' => 'Pusat Data dan Informasi Dinkes',
                'phone' => '081234567800',
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(['email' => $userData['email']], $userData);
        }

        // 2. Document Requirements
        $requirements = [
            [
                'code' => 'REQ_KTP_PASIEN',
                'name' => 'KTP / Identitas Pasien',
                'description' => 'Fotokopi / Scan e-KTP Pasien asli yang masih berlaku',
                'is_mandatory' => true,
                'max_file_size_mb' => 2,
                'allowed_mime_types' => ['image/jpeg', 'image/png', 'application/pdf'],
                'sort_order' => 1,
            ],
            [
                'code' => 'REQ_RUJUKAN_RS',
                'name' => 'Surat Rujukan Rumah Sakit',
                'description' => 'Surat rujukan berjenjang atau bukti kontrol ke RS tujuan di Semarang',
                'is_mandatory' => true,
                'max_file_size_mb' => 5,
                'allowed_mime_types' => ['application/pdf', 'image/jpeg', 'image/png'],
                'sort_order' => 2,
            ],
            [
                'code' => 'REQ_BPJS_SKTM',
                'name' => 'Kartu BPJS PBI / SKTM',
                'description' => 'Kartu BPJS Kesehatan PBI atau SKTM resmi dari Kelurahan/Desa domisili asal',
                'is_mandatory' => true,
                'max_file_size_mb' => 3,
                'allowed_mime_types' => ['application/pdf', 'image/jpeg', 'image/png'],
                'sort_order' => 3,
            ],
            [
                'code' => 'REQ_KK',
                'name' => 'Kartu Keluarga (KK)',
                'description' => 'Kartu Keluarga untuk verifikasi hubungan pendamping dan pasien',
                'is_mandatory' => true,
                'max_file_size_mb' => 3,
                'allowed_mime_types' => ['application/pdf', 'image/jpeg', 'image/png'],
                'sort_order' => 4,
            ],
            [
                'code' => 'REQ_KTP_PENDAMPING',
                'name' => 'KTP Pendamping',
                'description' => 'Identitas keluarga inti yang mendampingi pasien selama masa pengobatan',
                'is_mandatory' => false,
                'max_file_size_mb' => 2,
                'allowed_mime_types' => ['image/jpeg', 'image/png', 'application/pdf'],
                'sort_order' => 5,
            ],
        ];

        foreach ($requirements as $reqData) {
            DocumentRequirement::firstOrCreate(['code' => $reqData['code']], $reqData);
        }

        // 3. Buildings & Rooms & Beds
        $building = Building::firstOrCreate(
            ['code' => 'GEDUNG-A'],
            [
                'name' => 'Gedung Kartini (Utama)',
                'address' => 'Jl. Dr. Kariadi No. 12, Semarang',
                'total_floors' => 2,
                'is_active' => true,
            ]
        );

        $roomsData = [
            [
                'room_number' => '101',
                'room_type' => 'standar',
                'gender_allocation' => 'pria',
                'floor_number' => 1,
                'total_capacity' => 2,
                'beds' => ['A', 'B'],
            ],
            [
                'room_number' => '102',
                'room_type' => 'standar',
                'gender_allocation' => 'wanita',
                'floor_number' => 1,
                'total_capacity' => 2,
                'beds' => ['A', 'B'],
            ],
            [
                'room_number' => '201',
                'room_type' => 'keluarga',
                'gender_allocation' => 'campur',
                'floor_number' => 2,
                'total_capacity' => 3,
                'beds' => ['A', 'B', 'C'],
            ],
            [
                'room_number' => 'ISOLASI-1',
                'room_type' => 'isolasi',
                'gender_allocation' => 'campur',
                'floor_number' => 1,
                'total_capacity' => 1,
                'beds' => ['A'],
            ],
        ];

        foreach ($roomsData as $r) {
            $room = Room::firstOrCreate(
                ['building_id' => $building->id, 'room_number' => $r['room_number']],
                [
                    'room_type' => $r['room_type'],
                    'gender_allocation' => $r['gender_allocation'],
                    'floor_number' => $r['floor_number'],
                    'total_capacity' => $r['total_capacity'],
                    'occupied_capacity' => 0,
                    'is_active' => true,
                ]
            );

            foreach ($r['beds'] as $bedCode) {
                Bed::firstOrCreate(
                    ['room_id' => $room->id, 'bed_code' => $bedCode],
                    [
                        'is_operational' => true,
                        'notes' => 'Kasur busa medis & linen higienis standar dinkes',
                    ]
                );
            }
        }
    }
}
