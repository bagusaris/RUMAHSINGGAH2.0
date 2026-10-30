import React, { useState } from 'react';
import {
  Bed,
  Building,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Search,
  Filter,
  LogOut,
  LogIn,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { storage } from '../../services/storage.ts';
import { useAuth } from '../../services/auth/authContext.tsx';
import { Application, Room, RoomAssignment } from '../../types/models.ts';
import { RoomPlacementModal } from './RoomPlacementModal.tsx';

export const ShelterDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>(() => storage.getApplications());
  const [rooms, setRooms] = useState<Room[]>(() => storage.getRooms());
  const [assignments, setAssignments] = useState<RoomAssignment[]>(() => storage.getRoomAssignments());
  const [selectedAppForPlacement, setSelectedAppForPlacement] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'active_guests' | 'rooms'>('queue');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const refreshData = () => {
    setApplications(storage.getApplications());
    setRooms(storage.getRooms());
    setAssignments(storage.getRoomAssignments());
  };

  // 1. Applications approved by Director but not yet assigned to a room
  const awaitingPlacementApps = applications.filter(
    (a) => a.status === 'approved' && (!a.roomAssignment || a.roomAssignment.status === 'awaiting_placement')
  );

  // 2. Active Guests currently staying or scheduled
  const activeAssignments = assignments.filter(
    (a) => a.status === 'assigned' || a.status === 'checked_in'
  );

  // Bed stats
  const totalBeds = rooms.reduce((acc, r) => acc + r.totalBeds, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;

  const handleCheckInOut = (assignmentId: string, action: 'check_in' | 'check_out') => {
    const res = storage.updateStayStatus(assignmentId, action, currentUser);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(''), 4000);
    refreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Operasional Rumah Singgah Pasien (RSP)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen alokasi tempat tidur, registrasi check-in, dan kepulangan tamu pasca pengobatan.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Muat Ulang Okupansi</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bed Tersedia</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{availableBeds} / {totalBeds}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Siap dialokasikan hari ini</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bed Terisi</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{occupiedBeds}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pasien & pendamping menginap</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Antrean Alokasi</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{awaitingPlacementApps.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Disetujui Kadinkes, tunggu kamar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Okupansi</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Kapasitas hunian terpakai</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Antrean Alokasi Kamar</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
            {awaitingPlacementApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active_guests')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'active_guests'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Daftar Tamu Menginap</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {activeAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'rooms'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Status Denah Kamar
        </button>
      </div>

      {/* TAB 1: PLACEMENT QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pasien Siap Masuk Kamar</h3>
              <p className="text-[11px] text-slate-500">
                Daftar pasien yang permohonannya telah disetujui resmi oleh Kepala Dinas dan bertanda tangan elektronik (TTE).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">No. Permohonan</th>
                  <th className="p-4">Nama Pasien & NIK</th>
                  <th className="p-4">Pendamping</th>
                  <th className="p-4">RS Rujukan</th>
                  <th className="p-4">Rencana Check-In</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {awaitingPlacementApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada antrean alokasi baru saat ini. Seluruh pasien yang disetujui telah memiliki kamar.
                    </td>
                  </tr>
                ) : (
                  awaitingPlacementApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{app.applicationNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.patient?.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          NIK: {app.patient?.nik.substring(0, 6)}******{app.patient?.nik.substring(12)}
                        </div>
                      </td>
                      <td className="p-4">
                        {app.companion?.hasCompanion ? (
                          <div>
                            <span className="font-semibold text-slate-800">{app.companion.fullName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {app.companion.relationship} ({app.companion.needsAccommodation ? 'Perlu Bed' : 'Tanpa Bed'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Tanpa Pendamping</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-700">{app.destinationHospital}</td>
                      <td className="p-4">
                        <span className="font-bold text-blue-700">{app.plannedCheckInDate}</span>
                        <span className="text-[10px] text-slate-500 block">{app.estimatedStayDays} Hari</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForPlacement(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>Pilihkan Kamar & Bed</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE GUESTS */}
      {activeTab === 'active_guests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Tamu & Kontrol Check-In / Check-Out</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Nama Pasien & Pendamping</th>
                  <th className="p-4">Kamar & Bed</th>
                  <th className="p-4">Periode Menginap</th>
                  <th className="p-4">Status Hunian</th>
                  <th className="p-4 text-right">Tindakan Petugas RSP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Belum ada tamu aktif yang menempati kamar saat ini.
                    </td>
                  </tr>
                ) : (
                  activeAssignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{asg.patientName}</div>
                        {asg.companionName && (
                          <div className="text-[10px] text-slate-500">Pendamping: {asg.companionName}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{asg.roomName}</div>
                        <div className="text-[10px] text-emerald-700 font-bold">{asg.bedNumber} ({asg.buildingName})</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900">
                          {asg.checkInDate} s.d {asg.checkOutDate}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            asg.status === 'checked_in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {asg.status === 'checked_in' ? 'Sedang Menginap' : 'Kamar Siap (Terjadwal)'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {asg.status === 'assigned' && (
                            <button
                              type="button"
                              onClick={() => handleCheckInOut(asg.id, 'check_in')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>Catat Masuk (Check-In)</span>
                            </button>
                          )}

                          {asg.status === 'checked_in' && (
                            <button
                              type="button"
                              onClick={() => handleCheckInOut(asg.id, 'check_out')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-2xs transition-colors"
                              title="Bebaskan tempat tidur untuk pasien berikutnya"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Selesai (Check-Out)</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM STATUS MATRIX */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => {
            const isAvailable = room.status === 'available';
            const isFull = room.status === 'full';
            const isMaintenance = room.status === 'maintenance';

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      {room.roomNumber} • Lantai {room.floorNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{room.roomName}</h4>
                    <p className="text-[11px] text-slate-500">{room.buildingName}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                      isMaintenance
                        ? 'bg-rose-100 text-rose-800'
                        : isFull
                        ? 'bg-amber-100 text-amber-800'
                        : isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isMaintenance
                      ? 'Perbaikan'
                      : isFull
                      ? 'Kamar Penuh'
                      : isAvailable
                      ? 'Tersedia'
                      : 'Terisi Sebagian'}
                  </span>
                </div>

                {/* Progress bar of occupancy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Kapasitas Tempat Tidur</span>
                    <span>
                      {room.occupiedBeds} dari {room.totalBeds} Bed Terisi
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-amber-500' : isMaintenance ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${room.totalBeds > 0 ? (room.occupiedBeds / room.totalBeds) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {room.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Placement Modal */}
      {selectedAppForPlacement && (
        <RoomPlacementModal
          application={selectedAppForPlacement}
          onClose={() => setSelectedAppForPlacement(null)}
          onSuccess={refreshData}
        />
      )}

    </div>
  );
};
