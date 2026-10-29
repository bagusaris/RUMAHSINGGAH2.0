import React, { useState } from 'react';
import {
  X,
  Bed,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Users
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/auth/authContext';
import { Application, Room, Bed as BedModel } from '../../types/models';

interface RoomPlacementModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomPlacementModal: React.FC<RoomPlacementModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const rooms = storage.getRooms();
  const allBeds = storage.getBeds();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(application.plannedCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    try {
      const d = new Date(application.plannedCheckInDate);
      d.setDate(d.getDate() + application.estimatedStayDays);
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  });
  const [placementNotes, setPlacementNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomBeds = allBeds.filter((b) => b.roomId === selectedRoomId);

  const handleAssign = () => {
    if (!selectedRoomId || !selectedBedId) {
      setErrorMsg('Pilih kamar dan tempat tidur (bed) yang tersedia.');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setErrorMsg('Tanggal check-in dan rencana check-out wajib ditentukan.');
      return;
    }

    if (new Date(checkInDate) > new Date(checkOutDate)) {
      setErrorMsg('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = storage.assignRoomAndBed({
      applicationId: application.id,
      roomId: selectedRoomId,
      bedId: selectedBedId,
      checkInDate,
      checkOutDate,
      notes: placementNotes,
      actor: currentUser,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Alokasi Kamar & Tempat Tidur Pasien</h3>
              <p className="text-[11px] text-emerald-300">
                {application.applicationNumber} — {application.patient?.fullName}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Needs Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Jenis Kelamin</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.patient?.gender === 'L' ? 'Laki-Laki (Pria)' : 'Perempuan (Wanita)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Pendamping</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.companion?.hasCompanion
                  ? `${application.companion.fullName} (${application.companion.relationship})`
                  : 'Tanpa Pendamping'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">RS Rujukan</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{application.destinationHospital}</p>
            </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              1. Pilih Kamar Rumah Singgah:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                const isMaintenance = room.status === 'maintenance';
                const isFull = room.status === 'full';

                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={isMaintenance || isFull}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setSelectedBedId('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-xs'
                        : isMaintenance || isFull
                        ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{room.roomName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isMaintenance
                            ? 'bg-rose-100 text-rose-700'
                            : isFull
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isMaintenance ? 'Perbaikan' : isFull ? 'Penuh' : `${room.totalBeds - room.occupiedBeds} Bed Kosong`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{room.roomNumber} • Lantai {room.floorNumber}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {room.facilities.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bed Selection */}
          {selectedRoom && (
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">
                2. Pilih Tempat Tidur (Bed) di {selectedRoom.roomName}:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roomBeds.map((bed) => {
                  const isOccupied = bed.status === 'occupied';
                  const isMaintenance = bed.status === 'maintenance';
                  const isSelected = bed.id === selectedBedId;

                  return (
                    <button
                      key={bed.id}
                      type="button"
                      disabled={isOccupied || isMaintenance}
                      onClick={() => setSelectedBedId(bed.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200 font-bold'
                          : isOccupied
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed text-slate-400'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50'
                      }`}
                    >
                      <Bed className="w-5 h-5 mx-auto mb-1" />
                      <div className="font-bold text-xs">{bed.bedNumber}</div>
                      <div className="text-[9px] mt-0.5">
                        {isOccupied ? `Terisi (${bed.currentPatientName?.split(' ')[0]})` : 'Tersedia'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Masuk (Check-In) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Rencana Keluar (Check-Out) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Pengelola RSP:</label>
              <input
                type="text"
                value={placementNotes}
                onChange={(e) => setPlacementNotes(e.target.value)}
                placeholder="Contoh: Pasien memakai kursi roda, bed dekat pintu akses"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Sistem secara otomatis memvalidasi jadwal agar tidak terjadi bentrok pemesanan (double-booking).
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || !selectedBedId}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${
              isSubmitting || !selectedBedId
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            {isSubmitting ? 'Menyimpan Alokasi...' : 'Konfirmasi Alokasi Kamar'}
          </button>
        </div>

      </div>
    </div>
  );
};
