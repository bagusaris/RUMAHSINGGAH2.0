<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Bed;
use App\Models\Building;
use App\Models\Room;
use App\Models\RoomAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ShelterPlacementController extends Controller
{
    /**
     * Get real-time room availability matrix
     */
    public function getRoomMatrix(Request $request): JsonResponse
    {
        $buildings = Building::with(['rooms.beds.assignments'])->where('is_active', true)->get();

        $checkIn = $request->query('check_in', now()->toDateString());
        $checkOut = $request->query('check_out', now()->addDays(3)->toDateString());

        $matrix = $buildings->map(function ($b) use ($checkIn, $checkOut) {
            return [
                'id' => $b->id,
                'name' => $b->name,
                'code' => $b->code,
                'rooms' => $b->rooms->map(function ($room) use ($checkIn, $checkOut) {
                    $bedsWithStatus = $room->beds->map(function ($bed) use ($checkIn, $checkOut) {
                        $isAvailable = $bed->isAvailableBetween($checkIn, $checkOut);
                        return [
                            'id' => $bed->id,
                            'bed_code' => $bed->bed_code,
                            'is_operational' => $bed->is_operational,
                            'is_available' => $isAvailable,
                            'notes' => $bed->notes,
                        ];
                    });

                    return [
                        'id' => $room->id,
                        'room_number' => $room->room_number,
                        'room_type' => $room->room_type,
                        'gender_allocation' => $room->gender_allocation,
                        'floor_number' => $room->floor_number,
                        'total_capacity' => $room->total_capacity,
                        'occupied_capacity' => $room->occupied_capacity,
                        'beds' => $bedsWithStatus,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $matrix,
        ]);
    }

    /**
     * Assign room and bed with strict double-booking prevention and DB lock
     */
    public function assignBed(Request $request, string $applicationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|uuid|exists:rooms,id',
            'bed_id' => 'required|uuid|exists:beds,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after_or_equal:check_in_date',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::findOrFail($applicationId);
        $user = $request->user();

        if ($application->status !== ApplicationStatus::APPROVED_DIRECTOR && $application->status !== ApplicationStatus::ROOM_ASSIGNED) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya permohonan yang disetujui Kadinkes yang dapat dialokasikan tempat tidur.',
            ], 422);
        }

        $roomId = $request->input('room_id');
        $bedId = $request->input('bed_id');
        $checkIn = $request->input('check_in_date');
        $checkOut = $request->input('check_out_date');

        return DB::transaction(function () use ($application, $roomId, $bedId, $checkIn, $checkOut, $request, $user) {
            // Pessimistic locking on Bed to prevent race conditions & double-booking
            $bed = Bed::where('id', $bedId)->lockForUpdate()->firstOrFail();

            if ($bed->room_id !== $roomId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tempat tidur tidak sesuai dengan kamar yang dipilih.',
                ], 422);
            }



            if (!$bed->is_operational) {
                return response()->json(['success' => false, 'message' => 'Tempat tidur sedang dalam perbaikan / tidak operasional.'], 422);
            }

            // Existing assignment for this application (if reassigning)
            $existingAssignment = RoomAssignment::where('application_id', $application->id)->first();
            $excludeId = $existingAssignment?->id;

            // Strict interval overlap validation: (newCheckIn <= existingCheckOut && newCheckOut >= existingCheckIn)
            $isAvailable = $bed->isAvailableBetween($checkIn, $checkOut, $excludeId);

            if (!$isAvailable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konflik Jadwal: Tempat tidur sudah terisi untuk rentang tanggal tersebut (Double Booking Ditolak).',
                ], 409);
            }

            // Create or update assignment
            
            $assignment = RoomAssignment::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'patient_id' => $application->patient_id,
                    'room_id' => $roomId,
                    'bed_id' => $bedId,
                    'check_in_date' => $checkIn,
                    'check_out_date' => $checkOut,
                    'status' => 'assigned',
                    'assigned_by_user_id' => $user?->id,
                    'notes' => $request->input('notes'),
                ]
            );


            $application->update(['status' => ApplicationStatus::ROOM_ASSIGNED]);

            // Recalculate room occupancy
            $room = Room::findOrFail($roomId);
            $room->recalculateOccupancy();

            AuditLog::logAction(
                $user?->id,
                'ROOM_BED_ASSIGNED',
                'RoomAssignment',
                $assignment->id,
                "Penempatan kamar {$room->room_number} bed {$bed->bed_code} untuk {$application->application_number}",
                ['room' => $room->room_number, 'bed' => $bed->bed_code, 'dates' => "{$checkIn} s/d {$checkOut}"]
            );

            return response()->json([
                'success' => true,
                'message' => 'Penempatan kamar dan tempat tidur berhasil dialokasikan.',
                'data' => $assignment->load(['room', 'bed']),
            ]);
        });
    }

    /**
     * Check-in guest
     */
    public function checkIn(Request $request, string $assignmentId): JsonResponse
    {
        $assignment = RoomAssignment::with('application')->findOrFail($assignmentId);
        $user = $request->user();

        $assignment->update([
            'status' => 'checked_in',
            'actual_check_in_at' => now(),
        ]);

        $assignment->application->update(['status' => ApplicationStatus::CHECKED_IN]);
        $assignment->room->recalculateOccupancy();

        AuditLog::logAction(
            $user?->id,
            'GUEST_CHECK_IN',
            'RoomAssignment',
            $assignment->id,
            "Tamu {$assignment->application->application_number} telah Check-In di kamar {$assignment->room->room_number}",
            ['time' => now()->toIso8601String()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tamu berhasil Check-In.',
            'data' => $assignment->fresh(),
        ]);
    }

    /**
     * Check-out guest & free up room/bed capacity
     */
    public function checkOut(Request $request, string $assignmentId): JsonResponse
    {
        $assignment = RoomAssignment::with('application')->findOrFail($assignmentId);
        $user = $request->user();

        $assignment->update([
            'status' => 'checked_out',
            'actual_check_out_at' => now(),
        ]);

        $assignment->application->update(['status' => ApplicationStatus::COMPLETED]);
        $assignment->room->recalculateOccupancy();

        AuditLog::logAction(
            $user?->id,
            'GUEST_CHECK_OUT',
            'RoomAssignment',
            $assignment->id,
            "Tamu {$assignment->application->application_number} telah Check-Out dari kamar {$assignment->room->room_number}",
            ['time' => now()->toIso8601String()]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tamu berhasil Check-Out. Kapasitas kamar telah diperbarui.',
            'data' => $assignment->fresh(),
        ]);
    }
}
