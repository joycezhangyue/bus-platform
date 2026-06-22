import { useState, useMemo } from 'react';
import {
  Trash2, Pencil, Shield, ShieldAlert, Clock,
  Car, MapPin, User, ArrowRight, GripVertical
} from 'lucide-react';
import {
  DAYS, DRIVERS, TIME_SLOTS, findCoveringTrip, getCellType, type Trip,
  type Driver, type DayOfWeek, type TimeSlot
} from '../types';

interface ScheduleGridProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export function ScheduleGrid({ trips, onEdit, onDelete }: ScheduleGridProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const cellId = (driver: Driver, day: DayOfWeek, slot: TimeSlot) =>
    `${driver}-${day}-${slot}`;

  const getCellContent = (driver: Driver, day: DayOfWeek, slot: TimeSlot) => {
    const trip = findCoveringTrip(day, slot, driver, trips);
    if (!trip) return null;

    const cellType = getCellType(trip, day, slot);
    const isConfirmed = trip.confirmed;

    const baseClasses = driver === '王勇'
      ? (isConfirmed ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200')
      : (isConfirmed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200');

    const typeClass = cellType === 'departure' ? 'cell-departure' : cellType === 'return' ? 'cell-return' : 'cell-middle';

    const displayTime = () => {
      const depDay = trip.departureDay !== day ? trip.departureDay : '';
      const retDay = trip.returnDay && trip.returnDay !== day ? trip.returnDay : '';
      const depTime = trip.departureTime;
      const retTime = trip.returnTime;

      if (cellType === 'departure') {
        return `${depDay ? depDay + ' ' : ''}${depTime}${retTime ? ' →' : ''}`;
      }
      if (cellType === 'return') {
        return `${retDay ? retDay + ' ' : ''}${retTime ? '返 ' + retTime : '返程'}`;
      }
      return '途中';
    };

    const cid = cellId(driver, day, slot);
    const isHovered = hoveredCell === cid;

    return (
      <div
        className={`relative p-2 h-full min-h-[72px] rounded-lg border transition-all duration-300 ${baseClasses} ${typeClass} ${isHovered ? 'ring-2 ring-offset-1 ring-black/10 shadow-lg scale-[1.02]' : ''}`}
        onMouseEnter={() => setHoveredCell(cid)}
        onMouseLeave={() => setHoveredCell(null)}
        draggable
        onDragStart={() => { /* future drag */ }}
        onDragOver={(e) => { e.preventDefault(); setDragOverCell(cid); }}
        onDragLeave={() => setDragOverCell(null)}
      >
        {/* Cell type badge */}
        <div className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          cellType === 'departure' ? 'bg-amber-100 text-amber-700' :
          cellType === 'return' ? 'bg-emerald-100 text-emerald-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {cellType === 'departure' ? '出发' : cellType === 'return' ? '返回' : '途中'}
        </div>

        {/* Confirmed icon */}
        <div className="absolute top-1 right-1">
          {isConfirmed ? (
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="pt-5">
          <p className="font-semibold text-sm text-gray-800 leading-tight">
            {trip.destination}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <User className="w-3 h-3" />
            {trip.passenger}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {displayTime()}
          </p>
        </div>

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 animate-fade-in">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(trip); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              修改
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(trip); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full animate-slide-in" style={{ animationDelay: '0.2s' }}>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
              <GripVertical className="w-4 h-4 mr-1" />
              时段
            </div>
            {DAYS.map(day => (
              <div
                key={day}
                className="text-center py-2 rounded-lg glass-panel text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Driver rows */}
          {DRIVERS.map((driver, driverIdx) => (
            <div key={driver}>
              {/* Driver label */}
              <div className="flex items-center gap-2 mb-1 mt-4">
                <div className={`w-3 h-3 rounded-full ${driver === '王勇' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-sm font-semibold text-gray-700">{driver}</span>
                <span className="text-xs text-gray-400">
                  ({trips.filter(t => t.driver === driver).length}条行程)
                </span>
              </div>

              {/* Time slots */}
              {TIME_SLOTS.map((slot, slotIdx) => (
                <div
                  key={`${driver}-${slot}`}
                  className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2"
                  style={{ animationDelay: `${0.3 + driverIdx * 0.1 + slotIdx * 0.05}s` }}
                >
                  <div className="flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-50/50 rounded-lg">
                    {slot}
                  </div>
                  {DAYS.map(day => {
                    const trip = findCoveringTrip(day, slot, driver, trips);
                    return (
                      <div key={`${driver}-${day}-${slot}`} className="h-[72px]">
                        {trip ? (
                          getCellContent(driver, day, slot)
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300 rounded-lg border border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                            <Car className="w-4 h-4 opacity-30" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />
          王勇·已确认
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
          刘平·已确认
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          待确认
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-4 rounded-l bg-amber-400" />
          出发格
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-4 rounded-l bg-emerald-500" />
          返回格
        </span>
      </div>
    </div>
  );
}
