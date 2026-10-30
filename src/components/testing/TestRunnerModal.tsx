import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Terminal,
  Clock
} from 'lucide-react';
import { runAllAutomatedTests, TestCaseResult } from '../../services/testing/testSuite.ts';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const executeTests = async () => {
    setIsRunning(true);
    const results = await runAllAutomatedTests();
    setTestResults(results);
    setIsRunning(false);
    setHasRun(true);
  };

  useEffect(() => {
    if (isOpen && !hasRun) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = testResults.filter((r) => r.status === 'passed').length;
  const failedCount = testResults.filter((r) => r.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Uji Kepatuhan & Validasi Otomatis (QA Testing)</h3>
              <p className="text-[11px] text-slate-400">
                Pengujian 8 spesifikasi inti sesuai Master Prompt Bagian Q
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Hasil Pengujian:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{passedCount} Lolos (Passed)</span>
            </span>
            {failedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>{failedCount} Gagal</span>
              </span>
            )}
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all ${
              isRunning ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Menjalankan Uji...' : 'Jalankan Ulang Uji QA'}</span>
          </button>
        </div>

        {/* Test List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 text-xs">
          {testResults.map((test) => {
            const isPassed = test.status === 'passed';
            return (
              <div
                key={test.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPassed
                    ? 'bg-white border-slate-200 hover:border-emerald-300'
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          [{test.id}]
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{test.name}</h4>
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {test.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{test.executionTimeMs} ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Seluruh tes dijalankan secara lokal di runtime browser tanpa ketergantungan mock statis.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
          >
            Tutup Panel QA
          </button>
        </div>

      </div>
    </div>
  );
};
