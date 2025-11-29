'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import type { Signal } from '@/lib/supabase';
import SignalModal from './SignalModal';
import SignalsTable from './SignalsTable';
import SignalDetailPopup from './SignalDetailPopup';
import { LatLngExpression } from 'leaflet';

interface MapComponentProps {
  signals: Signal[];
  onSignalClick?: (signal: Signal) => void;
  onSignalCreated?: () => void;
}

export default function MapComponent({ signals, onSignalCreated }: MapComponentProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null);
  const [cancellingSignalId, setCancellingSignalId] = useState<string | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const mapRef = useRef<any>(null);

  // Check if activeSignalId still exists in signals array
  useEffect(() => {
    if (activeSignalId && !signals.find(s => s.id === activeSignalId)) {
      setActiveSignalId(null);
    }
  }, [signals, activeSignalId]);

  const handleCancelSignal = async () => {
    if (!activeSignalId) return;

    setCancellingSignalId(activeSignalId);
    try {
      const response = await fetch('/api/signal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_id: activeSignalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel signal');
      }

      setActiveSignalId(null);
    } catch (error) {
      console.error('Error cancelling signal:', error);
      alert('Помилка при скасуванні сигналу. Спробуйте ще раз.');
    } finally {
      setCancellingSignalId(null);
    }
  };

  const mapCenter: LatLngExpression = signals.length > 0 
    ? [signals[0].lat, signals[0].lng]
    : [50.4501, 30.5234];

  return (
    <>
      <style>{`
        @keyframes wave {
          0% {
            stroke-dasharray: 0, 157;
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 157, 0;
            stroke-dashoffset: -157;
            opacity: 0.3;
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .wave-circle {
          animation: wave 2s ease-out infinite;
        }
        
        .wave-circle:nth-child(2) {
          animation: wave 2s ease-out 0.7s infinite;
        }
        
        .wave-circle:nth-child(3) {
          animation: wave 2s ease-out 1.4s infinite;
        }
      `}</style>
      
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={13}
        style={{ height: '100vh', width: '100%', position: 'relative', zIndex: '1' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {signals.map((signal, index) => {
          const intentEmoji = {
            'Coffee': '☕',
            'Walk': '🚶',
            'Dinner': '🍽️',
            'Drinks': '🍻',
            'Movie': '🎬',
            'Chat': '💬',
            'Sex': '🔥',
          } as Record<string, string>;

          return (
            <div key={index}>
              {[0, 1, 2].map((ripple) => (
                <Circle
                  key={`ripple-${index}-${ripple}`}
                  center={[signal.lat, signal.lng] as LatLngExpression}
                  radius={100 + ripple * 150}
                  pathOptions={{
                    color: '#3b82f6',
                    fillOpacity: 0,
                    stroke: true,
                    weight: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                  className="wave-circle"
                />
              ))}

              <Marker
                position={[signal.lat, signal.lng] as LatLngExpression}
                icon={L.divIcon({
                  html: `
                    <div style="
                      width: 80px;
                      height: 80px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #3b82f6, #60a5fa);
                      border: 4px solid white;
                      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 40px;
                      cursor: pointer;
                      position: relative;
                      overflow: hidden;
                      background-image: url('${signal.photo_url || ''}');
                      background-size: cover;
                      background-position: center;
                    ">
                      ${!signal.photo_url ? intentEmoji[signal.intent] || '📍' : ''}
                    </div>
                  `,
                  iconSize: [80, 80],
                  iconAnchor: [40, 40],
                  className: 'custom-marker',
                })}
                eventHandlers={{
                  click: () => setSelectedSignal(signal),
                }}
              >
                <Popup>
                  <div style={{ textAlign: 'center', minWidth: '200px', color: '#000' }}>
                    <h3>{signal.intent}</h3>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-hearts {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .go-live-btn {
          animation: gradient 3s ease infinite, pulse-hearts 0.8s ease-in-out infinite;
          background-size: 200% 200%;
          background-image: linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3);
        }
        .cancel-btn {
          background-color: #9CA3AF;
          animation: none;
        }
      `}</style>

      {!activeSignalId && !showModal ? (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 text-white font-bold rounded-full shadow-2xl text-4xl z-[9999] hover:scale-110 transition-transform go-live-btn"
        >
          💙❤️
        </button>
      ) : (
        activeSignalId && !showModal && (
          <button
            onClick={handleCancelSignal}
            disabled={cancellingSignalId === activeSignalId}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-10 py-4 text-white font-bold rounded-full shadow-2xl text-2xl z-[9999] hover:scale-110 transition-transform cancel-btn disabled:opacity-50"
          >
            {cancellingSignalId === activeSignalId ? '⏳ Cancelling...' : '❌ Cancel Signal'}
          </button>
        )
      )}

      {showModal && (
        <SignalModal
          onClose={() => setShowModal(false)}
          userLocation={{ lat: 50.4501, lng: 30.5234 }}
          onSuccess={(signal) => {
            setActiveSignalId(signal.id);
            onSignalCreated?.();
          }}
        />
      )}

      <SignalsTable signals={signals} onMarkerClick={(signal) => {
        setSelectedSignal(signal);
        if (mapRef.current) {
          mapRef.current.flyTo([signal.lat, signal.lng], 15);
        }
      }} onSignalDeleted={onSignalCreated} />

      {selectedSignal && (
        <SignalDetailPopup
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </>
  );
}
