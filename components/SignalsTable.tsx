'use client';

import { useState, useEffect } from 'react';
import type { Signal } from '@/lib/supabase';

interface SignalsTableProps {
  signals: Signal[];
  onMarkerClick?: (signal: Signal) => void;
  onSignalDeleted?: () => void;
}

export default function SignalsTable({ signals, onMarkerClick, onSignalDeleted }: SignalsTableProps) {
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const updateTimers = () => {
      const updated: { [key: string]: string } = {};
      
      signals.forEach((signal) => {
        const now = new Date().getTime();
        const expiresAt = new Date(signal.expires_at).getTime();
        const remaining = expiresAt - now;

        if (remaining <= 0) {
          updated[signal.id] = 'Expired';
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          updated[signal.id] = `${minutes}m ${seconds}s`;
        }
      });

      setTimeRemaining(updated);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [signals]);

  const handleDelete = async (signalId: string) => {
    setDeletingId(signalId);
    try {
      const response = await fetch('/api/signal/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: signalId }),
      });

      if (response.ok) {
        onSignalDeleted?.();
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-2xl z-[9998] max-w-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3">
        <h3 className="text-white font-bold text-lg">Available Signals</h3>
      </div>
      
      <div className="overflow-y-auto max-h-96">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left text-black text-sm font-semibold">Ім'я</th>
              <th className="px-3 py-2 text-left text-black text-sm font-semibold">Що шукає</th>
              <th className="px-3 py-2 text-left text-black text-sm font-semibold">Час</th>
              <th className="px-3 py-2 text-center text-black text-sm font-semibold">Дія</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => (
              <tr 
                key={signal.id}
                className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td 
                  onClick={() => onMarkerClick?.(signal)}
                  className="px-3 py-2 text-black text-sm font-medium"
                >
                  {signal.name}
                </td>
                <td 
                  onClick={() => onMarkerClick?.(signal)}
                  className="px-3 py-2 text-black text-sm font-medium"
                >
                  {signal.intent}
                </td>
                <td 
                  onClick={() => onMarkerClick?.(signal)}
                  className="px-3 py-2 text-black text-sm font-mono font-semibold"
                >
                  {timeRemaining[signal.id] || 'Loading...'}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDelete(signal.id)}
                    disabled={deletingId === signal.id}
                    className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {deletingId === signal.id ? '...' : '✕'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
