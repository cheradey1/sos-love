'use client';

import { useState, useEffect } from 'react';
import type { Signal } from '@/lib/supabase';

interface SignalDetailPopupProps {
  signal: Signal;
  onClose: () => void;
}

export default function SignalDetailPopup({ signal, onClose }: SignalDetailPopupProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(signal.expires_at).getTime();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
      } else {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [signal.expires_at]);

  const getMessengerLink = () => {
    const baseUrl = signal.messenger === 'telegram' 
      ? `https://t.me/${signal.contact_info.replace('@', '')}`
      : signal.messenger === 'whatsapp'
      ? `https://wa.me/${signal.contact_info.replace(/\D/g, '')}`
      : `viber://contact?number=${signal.contact_info}`;
    
    return baseUrl;
  };

  const handleMessage = () => {
    window.open(getMessengerLink(), '_blank');
  };

  const handleMeetup = () => {
    const message = `Привіт! Мені цікавий твій сигнал: ${signal.intent}. Давай зустрінемось!`;
    const encodedMessage = encodeURIComponent(message);
    const baseUrl = signal.messenger === 'telegram'
      ? `https://t.me/${signal.contact_info.replace('@', '')}?text=${encodedMessage}`
      : signal.messenger === 'whatsapp'
      ? `https://wa.me/${signal.contact_info.replace(/\D/g, '')}?text=${encodedMessage}`
      : `viber://contact?number=${signal.contact_info}&text=${encodedMessage}`;
    
    window.open(baseUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Photo */}
        {signal.photo_url && (
          <div className="w-full h-48 overflow-hidden">
            <img
              src={signal.photo_url}
              alt={signal.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <p className="text-sm text-gray-500 font-semibold">ІМ'Я</p>
            <p className="text-2xl font-bold text-black">{signal.name}</p>
          </div>

          {/* What they want */}
          <div>
            <p className="text-sm text-gray-500 font-semibold">ЩО ШУКАЄ</p>
            <p className="text-xl font-bold text-black">
              {signal.intent}
            </p>
          </div>

          {/* Has place */}
          <div>
            <p className="text-sm text-gray-500 font-semibold">МІСЦЕ ДЛЯ ЗУСТРІЧІ</p>
            <p className="text-lg font-bold text-black">
              {signal.has_place ? '🏠 Є своє місце' : '❌ Немає місця'}
            </p>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-500 font-semibold">ЧАСУ ЗАЛИШИЛОСЬ</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">{timeRemaining}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {/* Talk Button */}
            <button
              onClick={handleMessage}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
            >
              💬 Поговорити
            </button>

            {/* Meetup Button */}
            <button
              onClick={handleMeetup}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-700 transition shadow-md"
            >
              💕 Зустрітись
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
