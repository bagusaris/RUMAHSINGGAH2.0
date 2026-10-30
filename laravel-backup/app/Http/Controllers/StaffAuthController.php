<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Enum;

class StaffAuthController extends Controller
{
    /**
     * Authenticate staff user
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi tidak cocok.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun dinonaktifkan oleh Administrator.',
            ], 403);
        }

        $user->update(['last_login_at' => now()]);

        // Generate Sanctum plain text token or session
        $token = method_exists($user, 'createToken') 
            ? $user->createToken('sim_rsp_staff_token')->plainTextToken 
            : base64_encode($user->id . ':' . now()->timestamp);

        AuditLog::logAction(
            $user->id,
            'STAFF_LOGIN',
            'User',
            $user->id,
            "Pengguna {$user->name} ({$user->role->value}) berhasil login ke sistem."
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'nip' => $user->nip,
                'department' => $user->department,
            ],
        ]);
    }

    /**
     * Get currently authenticated user details
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Create user (Super Admin only feature)
     */
    public function createUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', new Enum(UserRole::class)],
            'nip' => 'nullable|string|max:50',
            'department' => 'required|string|max:100',
            'phone_number' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $creator = $request->user();

        $newUser = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => $request->input('role'),
            'nip' => $request->input('nip'),
            'department' => $request->input('department'),
            'phone_number' => $request->input('phone_number'),
            'is_active' => true,
        ]);

        AuditLog::logAction(
            $creator?->id,
            'CREATE_STAFF_USER',
            'User',
            $newUser->id,
            "Pengguna baru {$newUser->name} dengan role {$newUser->role->value} berhasil ditambahkan oleh Super Admin."
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengguna baru berhasil ditambahkan.',
            'data' => $newUser,
        ], 201);
    }

    /**
     * Staff Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            AuditLog::logAction($user->id, 'STAFF_LOGOUT', 'User', $user->id, "Pengguna {$user->name} keluar dari sistem.");
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}
