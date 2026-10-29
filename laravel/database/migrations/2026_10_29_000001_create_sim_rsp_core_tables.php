<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users & RBAC
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role', 30)->default('public')->index();
            $table->string('nip', 30)->nullable()->unique();
            $table->string('phone', 25)->nullable();
            $table->string('position')->nullable();
            $table->string('department')->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. Patients & Companions (UU PDP Compliant)
        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nik', 16)->index();
            $table->string('full_name');
            $table->string('birth_place');
            $table->date('birth_date');
            $table->enum('gender', ['L', 'P']);
            $table->text('address');
            $table->string('phone', 25);
            $table->string('emergency_phone', 25)->nullable();
            $table->string('bpjs_number', 30)->nullable();
            $table->text('diagnosa')->nullable();
            $table->timestamps();
        });

        Schema::create('companions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->boolean('has_companion')->default(false);
            $table->string('full_name')->nullable();
            $table->string('nik', 16)->nullable();
            $table->string('relationship', 50)->nullable();
            $table->string('phone', 25)->nullable();
            $table->boolean('needs_accommodation')->default(false);
            $table->timestamps();
        });

        // 3. Document Requirements
        Schema::create('document_requirements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->json('allowed_mime_types');
            $table->unsignedInteger('max_size_bytes')->default(2097152); // 2MB
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Applications (Berkas Pendaftaran)
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('application_number', 40)->unique(); // RSP-YYYYMM-XXXX
            $table->foreignUuid('patient_id')->constrained('patients');
            $table->string('destination_hospital');
            $table->string('referral_letter_number');
            $table->date('appointment_date');
            $table->date('planned_check_in_date');
            $table->unsignedTinyInteger('estimated_stay_days')->default(3);
            $table->string('status', 35)->default('submitted')->index();
            $table->string('access_code_hash'); // Hash of 6-digit access code
            $table->unsignedTinyInteger('tracking_attempts')->default(0);
            $table->timestamp('last_tracking_attempt_at')->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
        });

        // 5. Application Supporting Documents
        Schema::create('application_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUuid('requirement_id')->constrained('document_requirements');
            $table->string('doc_code', 50);
            $table->string('doc_name');
            $table->string('file_name');
            $table->string('file_path'); // stored on private disk
            $table->unsignedInteger('file_size');
            $table->string('mime_type', 100);
            $table->string('status', 30)->default('pending_review'); // valid, invalid, revision_requested
            $table->text('review_notes')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->timestamps();
        });

        // 6. Application Reviews (Admin Verifikator)
        Schema::create('application_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUuid('reviewer_user_id')->constrained('users');
            $table->string('reviewer_name');
            $table->enum('result', ['verified', 'revision_requested', 'rejected']);
            $table->text('comments')->nullable();
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();
        });

        // 7. Approval Decisions (Kepala Dinas)
        Schema::create('approval_decisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUuid('director_user_id')->constrained('users');
            $table->string('director_name');
            $table->string('director_nip');
            $table->enum('decision', ['approved', 'rejected', 'clarification_requested']);
            $table->text('reason')->nullable();
            $table->timestamp('decided_at')->useCurrent();
            $table->timestamps();
        });

        // 8. Approval Letters & E-Sign Transactions (BSrE BSSN)
        Schema::create('approval_letters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('letter_number', 60)->unique();
            $table->date('letter_date');
            $table->string('signer_name');
            $table->string('signer_nip');
            $table->string('signer_position');
            $table->string('document_hash', 128); // SHA-256
            $table->string('signed_document_hash', 128)->nullable();
            $table->string('verification_token', 60)->unique(); // Unpredictable token
            $table->string('pdf_path')->nullable();
            $table->string('status', 30)->default('pending_signature'); // signed, signature_failed
            $table->timestamps();
        });

        Schema::create('esign_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('letter_id')->constrained('approval_letters')->cascadeOnDelete();
            $table->foreignUuid('application_id')->constrained('applications');
            $table->string('provider', 30)->default('bsre');
            $table->string('transaction_id', 100)->unique();
            $table->string('status', 30)->default('pending_signature');
            $table->string('certificate_issuer')->nullable();
            $table->string('certificate_serial_number')->nullable();
            $table->string('signer_identity')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 9. Buildings, Rooms, Beds (Shelter Facility)
        Schema::create('buildings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->unsignedTinyInteger('total_floors')->default(1);
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('building_id')->constrained('buildings');
            $table->unsignedTinyInteger('floor_number')->default(1);
            $table->string('room_number', 30)->unique();
            $table->string('room_name');
            $table->enum('gender_policy', ['male', 'female', 'family', 'any']);
            $table->unsignedTinyInteger('total_beds')->default(2);
            $table->json('facilities'); // ['AC', 'Oksigen', 'KM Dalam']
            $table->string('status', 30)->default('available'); // available, partially_occupied, full, maintenance
            $table->text('maintenance_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('beds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->string('bed_number', 30);
            $table->string('status', 30)->default('available'); // available, occupied, maintenance
            $table->string('current_patient_name')->nullable();
            $table->timestamps();
        });

        // 10. Room Assignments (Anti Double-Booking Table)
        Schema::create('room_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications');
            $table->foreignUuid('patient_id')->constrained('patients');
            $table->foreignUuid('room_id')->constrained('rooms');
            $table->foreignUuid('bed_id')->constrained('beds');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->timestamp('actual_check_in_at')->nullable();
            $table->timestamp('actual_check_out_at')->nullable();
            $table->string('status', 30)->default('assigned'); // assigned, checked_in, checked_out, cancelled
            $table->foreignUuid('assigned_by_user_id')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index pencarian tumpang tindih tanggal
            $table->index(['bed_id', 'check_in_date', 'check_out_date']);
        });

        // 11. Status Histories, Audit Logs, Notifications, System Settings
        Schema::create('application_status_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('previous_status', 35);
            $table->string('new_status', 35);
            $table->foreignUuid('changed_by_user_id')->constrained('users');
            $table->string('changed_by_name');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamp('timestamp')->useCurrent();
            $table->string('actor_id');
            $table->string('actor_name');
            $table->string('actor_role', 30);
            $table->string('action', 80);
            $table->string('entity_type', 80);
            $table->string('entity_id', 80);
            $table->enum('outcome', ['success', 'failure'])->default('success');
            $table->text('details'); // NIK 16 digit otomatis di-mask
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('target_role', 30)->default('all');
            $table->foreignUuid('target_user_id')->nullable()->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'warning', 'success', 'alert'])->default('info');
            $table->boolean('is_read')->default(false);
            $table->string('action_url')->nullable();
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key', 80)->unique();
            $table->text('value');
            $table->string('label');
            $table->text('description')->nullable();
            $table->string('category', 50)->default('general');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('application_status_histories');
        Schema::dropIfExists('room_assignments');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('buildings');
        Schema::dropIfExists('esign_transactions');
        Schema::dropIfExists('approval_letters');
        Schema::dropIfExists('approval_decisions');
        Schema::dropIfExists('application_reviews');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('document_requirements');
        Schema::dropIfExists('companions');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('users');
    }
};
