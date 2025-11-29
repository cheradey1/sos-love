export const getMessengerLink = (
  messenger: 'telegram' | 'whatsapp' | 'viber',
  contact: string
): string => {
  switch (messenger) {
    case 'telegram':
      return `https://t.me/${contact}`;
    case 'whatsapp':
      return `https://wa.me/${contact}`;
    case 'viber':
      return `viber://chat?number=${contact}`;
    default:
      return '#';
  }
};

export const getMessengerLabel = (
  messenger: 'telegram' | 'whatsapp' | 'viber'
): string => {
  switch (messenger) {
    case 'telegram':
      return '💬 Telegram';
    case 'whatsapp':
      return '💬 WhatsApp';
    case 'viber':
      return '💬 Viber';
    default:
      return 'Chat';
  }
};

export const formatTimeRemaining = (expiresAt: string): string => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Nominatim geocoding - free, no API key required
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    if (!response.ok) {
      console.error('Nominatim error:', response.status);
      return null;
    }

    const results = await response.json();
    if (results && results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
