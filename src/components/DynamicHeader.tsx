import { useState, useEffect } from 'react';
import { Car, MapPin, User, Clock, Shield, ShieldAlert, Bell } from 'lucide-react';
import type { Trip } from '../types';

interface DynamicHeaderProps {
  trips: Trip[];
  selectedTrip: Trip | null;
}

export function DynamicHeader({ trips, selectedTrip }: DynamicHeaderProps) {
  const [currentNotif, setCurrentNotif] = useState(0);

  const notifications = trips.map(trip => ({
    title: `${trip.driver} ${trip.confirmed ? '已确认' : '待确认'} · ${trip.destination}`,
    detail: `${trip.departureDay} ${trip.departureTime}${trip.returnDay ? ` → ${trip.returnDay} ${trip.returnTime || ''}` : ''} · ${trip.passenger}`,
  }));

  const fallbackNotif = {
    title: '欢迎使用公车保障平台',
    detail: '实时同步 · 跨设备一致 · 每日更新',
  };

  const displayNotifs = notifications.length > 0 ? notifications : [fallbackNotif];

  useEffect(() => {
    if (selectedTrip) return;
    const interval = setInterval(() => {
      setCurrentNotif(p => (p + 1) % displayNotifs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayNotifs.length, selectedTrip]);

  useEffect(() => {
    if (selectedTrip) {
      const timer = setTimeout(() => {
        // parent will clear selectedTrip
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedTrip]);

  const content = selectedTrip
    ? {
        title: `${selectedTrip.driver} · ${selectedTrip.destination}`,
        detail: `${selectedTrip.departureDay} ${selectedTrip.departureTime}${selectedTrip.returnDay ? ` → ${selectedTrip.returnDay} ${selectedTrip.returnTime || ''}` : ''} · ${selectedTrip.passenger}`,
        confirmed: selectedTrip.confirmed,
      }
    : displayNotifs[currentNotif];

  return (
    <div className="glass-panel rounded-2xl p-4 animate-slide-in">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          selectedTrip
            ? selectedTrip.confirmed ? 'bg-emerald-100' : 'bg-red-100'
            : 'bg-gray-100'
        }`}>
          {selectedTrip ? (
            selectedTrip.confirmed ? (
              <Shield className="w-5 h-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-500" />
            )
          ) : (
            <Bell className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{content.title}</p>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {content.detail}
          </p>
        </div>
        {selectedTrip && (
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
            selectedTrip.confirmed
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {selectedTrip.confirmed ? '已确认' : '待确认'}
          </div>
        )}
      </div>
    </div>
  );
}
