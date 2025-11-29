'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { geocodeAddress } from '@/lib/utils';
import type { Signal } from '@/lib/supabase';

interface SignalFormProps {
  onSuccess?: (signal: Signal) => void;
  onClose?: () => void;
}

export default function SignalForm({ onSuccess, onClose }: SignalFormProps) {
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    intent: '',
    address: '',
    messenger: 'telegram' as 'telegram' | 'whatsapp' | 'viber',
    contact_info: '',
    gender: 'male',
    has_place: false,
    hours: 0,
    minutes: 15,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoBase64(base64);
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const getDurationMinutes = () => formData.hours * 60 + formData.minutes;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoPreview) {
      alert('Завантажте фото');
      return;
    }

    if (!formData.name.trim()) {
      alert('Введіть ваше ім\'я');
      return;
    }

    if (!formData.intent.trim()) {
      alert('Введіть що ви шукаєте');
      return;
    }

    if (!formData.contact_info.trim()) {
      alert('Введіть ваш контакт');
      return;
    }

    if (!formData.address.trim()) {
      alert('Введіть адресу');
      return;
    }

    const durationMinutes = getDurationMinutes();
    if (durationMinutes === 0) {
      alert('Виберіть час доступності');
      return;
    }

    setLoading(true);

    try {
      let finalLat = 50.4501;
      let finalLng = 30.5234;

      if (formData.address.trim()) {
        const geocoded = await geocodeAddress(formData.address);
        if (geocoded) {
          finalLat = geocoded.lat;
          finalLng = geocoded.lng;
        }
      }

      let userId = localStorage.getItem('sosnu_user_id');

      if (!userId) {
        try {
          const supabase = getSupabase();
          if (supabase) {
            try {
              const { data, error } = await supabase.auth.signInAnonymously();
              if (error) throw error;
              userId = data.user?.id || null;
            } catch (supabaseError) {
              console.warn("Supabase auth failed, using demo mode:", supabaseError);
              userId = 'user_' + Date.now();
            }
          } else {
            userId = 'user_' + Date.now();
          }
        } catch (err) {
          console.error("Помилка при отриманні user ID:", err);
          userId = 'user_' + Date.now();
        }
        
        if (userId) {
          localStorage.setItem('sosnu_user_id', userId);
        }
      }

      if (!userId) throw new Error('Failed to get user ID');

      const response = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: formData.name,
          lat: finalLat,
          lng: finalLng,
          intent: formData.intent,
          photo_base64: photoBase64,
          messenger: formData.messenger,
          contact_info: formData.contact_info,
          gender: formData.gender,
          has_place: formData.has_place,
          duration_minutes: durationMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create signal');
      }

      const { signal } = await response.json();
      onSuccess?.(signal);
      onClose?.();

      setFormData({
        name: '',
        intent: '',
        address: '',
        messenger: 'telegram',
        contact_info: '',
        gender: 'male',
        has_place: false,
        hours: 0,
        minutes: 15,
      });
      setPhotoBase64(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error creating signal:', error);
      alert('Помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto">
      {/* Photo Upload */}
      <div className="sticky top-0 bg-white z-10">
        <label className="block text-lg font-bold text-gray-800 mb-2">
          📸 Upload Photo
        </label>
        {photoPreview ? (
          <div className="relative">
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoBase64(null);
                setPhotoPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="block w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-200">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <span className="text-gray-600 font-medium">Клацніть для завантаження</span>
          </label>
        )}
      </div>

      {/* Your Name */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          Your Name
        </label>
        <input
          type="text"
          placeholder="Ваше ім'я"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* What are you looking for - TEXT INPUT */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          What are you looking for?
        </label>
        <input
          type="text"
          placeholder="Наприклад: Кава, прогулянка, секс тощо"
          value={formData.intent}
          onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          Enter Address (Optional)
        </label>
        <input
          type="text"
          placeholder="Вулиця, номер будинку"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* How to reach you - Messenger Selection */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-2">
          How to reach you?
        </label>
        <div className="flex gap-2 mb-3">
          {(['telegram', 'whatsapp', 'viber'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFormData({ ...formData, messenger: m })}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition ${
                formData.messenger === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {m === 'telegram' && '📱 Telegram'}
              {m === 'whatsapp' && '💬 WhatsApp'}
              {m === 'viber' && '📞 Viber'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={
            formData.messenger === 'telegram'
              ? '@username'
              : '+380123456789'
          }
          value={formData.contact_info}
          onChange={(e) =>
            setFormData({ ...formData, contact_info: e.target.value })
          }
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {/* I have my own place */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
        <input
          type="checkbox"
          checked={formData.has_place}
          onChange={(e) => setFormData({ ...formData, has_place: e.target.checked })}
          className="h-6 w-6 text-green-600 cursor-pointer"
        />
        <label className="text-lg font-bold text-green-800 cursor-pointer flex-1">
          🏠 I have my own place
        </label>
      </div>

      {/* Who are you? */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-3">
          Who are you?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'male', label: '👨 Boy' },
            { value: 'female', label: '👩 Girl' },
            { value: 'trans', label: '🏳️‍⚧️ Trans' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, gender: opt.value })}
              className={`py-3 px-3 rounded-lg font-bold transition border-2 ${
                formData.gender === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available for */}
      <div>
        <label className="block text-lg font-bold text-gray-800 mb-3">
          Available for
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: Math.max(0, Math.min(24, parseInt(e.target.value) || 0)) })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-2xl text-center text-black font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex items-end pb-1">
            <span className="text-2xl font-bold text-gray-800">:</span>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={formData.minutes}
              onChange={(e) =>
                setFormData({ ...formData, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-2xl text-center text-black font-bold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 text-white font-bold text-lg rounded-full hover:shadow-lg disabled:opacity-50 transition"
      >
        {loading ? '⏳ Publishing...' : '🔥 GO'}
      </button>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
