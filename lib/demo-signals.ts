// Shared in-memory storage for demo mode signals
export let demoSignals: any[] = [];

export function getDemoSignals() {
  return demoSignals;
}

export function addDemoSignal(signal: any) {
  demoSignals.push(signal);
  
  // Keep only recent signals (last 100)
  if (demoSignals.length > 100) {
    demoSignals = demoSignals.slice(-100);
  }
  
  return signal;
}

export function clearExpiredSignals() {
  const now = new Date();
  demoSignals = demoSignals.filter((signal) => {
    const expiresAt = new Date(signal.expires_at);
    return expiresAt > now;
  });
}
