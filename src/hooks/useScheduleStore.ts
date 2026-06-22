import { useState, useEffect, useCallback, useRef } from 'react';
import type { Trip, Driver } from '../types';

const API_BASE = '/api';

let sseConnection: EventSource | null = null;

// URL data decode
function decodeUrlData(): Trip[] | null {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get('d');
  if (!dataParam) return null;
  try {
    const padding = 4 - (dataParam.length % 4);
    const encoded = padding !== 4 ? dataParam + '='.repeat(padding) : dataParam;
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64));
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].destination) {
      return parsed as Trip[];
    }
  } catch {
    // ignore
  }
  return null;
}

// LocalStorage helpers
const LS_KEY = 'bus-platform-trips';
function loadFromLS(): Trip[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveToLS(trips: Trip[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(trips));
  } catch {
    // ignore
  }
}

export function useScheduleStore() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const [backendMode, setBackendMode] = useState(true);
  const initRef = useRef(false);
  const tripsRef = useRef<Trip[]>([]);

  useEffect(() => { tripsRef.current = trips; }, [trips]);

  const syncToUrl = useCallback(() => {
    const current = tripsRef.current;
    if (current.length === 0) return;
    const json = JSON.stringify(current);
    const encoded = btoa(encodeURIComponent(json))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const url = new URL(window.location.href);
    url.searchParams.set('d', encoded);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Fetch from backend or fallback
  const initData = useCallback(async () => {
    // 1. Try URL param first
    const fromUrl = decodeUrlData();
    if (fromUrl) {
      setTrips(fromUrl);
      saveToLS(fromUrl);
      setLoading(false);
      setBackendMode(false);
      return;
    }

    // 2. Try backend
    try {
      const res = await fetch(`${API_BASE}/trips`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const mapped = data.trips.map((t: Record<string, unknown>) => ({
            id: t.id,
            driver: t.driver as Driver,
            destination: t.destination,
            passenger: t.passenger,
            departureDay: t.departure_day,
            departureTime: t.departure_time,
            returnDay: t.return_day || undefined,
            returnTime: t.return_time || undefined,
            confirmed: !!t.confirmed,
            note: t.note || undefined,
          }));
          setTrips(mapped);
          saveToLS(mapped);
          setBackendMode(true);
          setLoading(false);
          return;
        }
      }
    } catch {
      // backend unavailable, fallback to localStorage
    }

    // 3. Fallback to localStorage
    const fromLS = loadFromLS();
    setTrips(fromLS);
    setBackendMode(false);
    setLoading(false);
  }, []);

  // Connect SSE
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    initData();

    const connectSSE = () => {
      if (!backendMode) return;
      if (sseConnection) sseConnection.close();
      sseConnection = new EventSource(`${API_BASE}/trips/stream`);

      sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'trips') {
            const mapped = data.trips.map((t: Record<string, unknown>) => ({
              id: t.id,
              driver: t.driver as Driver,
              destination: t.destination,
              passenger: t.passenger,
              departureDay: t.departure_day,
              departureTime: t.departure_time,
              returnDay: t.return_day || undefined,
              returnTime: t.return_time || undefined,
              confirmed: !!t.confirmed,
              note: t.note || undefined,
            }));
            setTrips(mapped);
            saveToLS(mapped);
            setSynced(true);
            setTimeout(() => setSynced(false), 3000);
          }
        } catch {
          // ignore
        }
      };

      sseConnection.onerror = () => {
        sseConnection?.close();
        setBackendMode(false);
      };
    };

    connectSSE();

    return () => {
      sseConnection?.close();
      sseConnection = null;
    };
  }, [backendMode, initData]);

  const addTrip = useCallback(async (trip: Omit<Trip, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newTrip = { ...trip, id };

    if (backendMode) {
      try {
        const res = await fetch(`${API_BASE}/trips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTrip),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } catch (err) {
        setError('后端同步失败，已保存到本地');
        setBackendMode(false);
      }
    }

    // Always update local state
    setTrips(prev => {
      const next = [newTrip, ...prev];
      saveToLS(next);
      setTimeout(() => syncToUrl(), 0);
      return next;
    });
  }, [backendMode, syncToUrl]);

  const updateTrip = useCallback(async (id: string, trip: Partial<Trip>) => {
    if (backendMode) {
      try {
        const res = await fetch(`${API_BASE}/trips/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trip),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } catch (err) {
        setError('后端同步失败，已保存到本地');
        setBackendMode(false);
      }
    }

    setTrips(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...trip } : t);
      saveToLS(next);
      setTimeout(() => syncToUrl(), 0);
      return next;
    });
  }, [backendMode, syncToUrl]);

  const removeTrip = useCallback(async (id: string) => {
    if (backendMode) {
      try {
        const res = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } catch (err) {
        setError('后端同步失败，已保存到本地');
        setBackendMode(false);
      }
    }

    setTrips(prev => {
      const next = prev.filter(t => t.id !== id);
      saveToLS(next);
      setTimeout(() => syncToUrl(), 0);
      return next;
    });
  }, [backendMode, syncToUrl]);

  const stats = {
    wangYong: trips.filter(t => t.driver === '王勇').length,
    liuPing: trips.filter(t => t.driver === '刘平').length,
    unconfirmed: trips.filter(t => !t.confirmed).length,
    confirmed: trips.filter(t => t.confirmed).length,
    total: trips.length,
  };

  return { trips, loading, error, synced, backendMode, stats, addTrip, updateTrip, removeTrip };
}
