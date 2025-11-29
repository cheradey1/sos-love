'use client';

import { useState } from 'react';
import SignalForm from './SignalForm';
import type { Signal } from '@/lib/supabase';

interface SignalModalProps {
  onClose: () => void;
  userLocation: { lat: number; lng: number };
  onSuccess?: (signal: Signal) => void;
}

export default function SignalModal({ onClose, userLocation, onSuccess }: SignalModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSuccess = (signal: Signal) => {
    setIsSubmitted(true);
    onSuccess?.(signal);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with close button */}
        <div className="sticky top-0 bg-gradient-to-r from-red-400 via-yellow-400 to-pink-400 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white drop-shadow">Ready to Meet?</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center py-8 px-6 text-center">
              <div className="text-7xl mb-6 animate-bounce">💙</div>
              <p className="text-2xl font-bold text-green-600 mb-2">
                You&apos;re Live!
              </p>
              <p className="text-gray-600 mb-2">
                Your profile is now visible on the map.
              </p>
              <p className="text-sm text-gray-500">
                People around can see you and contact you.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <SignalForm
                onSuccess={handleSuccess}
                onClose={onClose}
                userLocation={userLocation}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
