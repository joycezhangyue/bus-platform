import { useState, useEffect } from 'react';
import { X, Save, Car, MapPin, User, FileText, Shield, ShieldAlert, Clock } from 'lucide-react';
import { DAYS, type Trip, type Driver } from '../types';

interface TripFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: Omit<Trip, 'id'>) => void;
  editingTrip?: Trip | null;
}

export function TripForm({ isOpen, onClose, onSubmit, editingTrip }: TripFormProps) {
  const [driver, setDriver] = useState<Driver>('王勇');
  const [destination, setDestination] = useState('');
  const [passenger, setPassenger] = useState('');
  const [departureDay, setDepartureDay] = useState<typeof DAYS[number]>('周一');
  const [departureTime, setDepartureTime] = useState('09:00');
  const [returnDay, setReturnDay] = useState<typeof DAYS[number] | ''>('');
  const [returnTime, setReturnTime] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editingTrip) {
      setDriver(editingTrip.driver);
      setDestination(editingTrip.destination);
      setPassenger(editingTrip.passenger);
      setDepartureDay(editingTrip.departureDay);
      setDepartureTime(editingTrip.departureTime);
      setReturnDay(editingTrip.returnDay || '');
      setReturnTime(editingTrip.returnTime || '');
      setConfirmed(editingTrip.confirmed);
      setNote(editingTrip.note || '');
    } else {
      setDriver('王勇');
      setDestination('');
      setPassenger('');
      setDepartureDay('周一');
      setDepartureTime('09:00');
      setReturnDay('');
      setReturnTime('');
      setConfirmed(false);
      setNote('');
    }
  }, [editingTrip, isOpen]);

  useEffect(() => {
    if (!editingTrip && returnDay === departureDay) {
      // default return day follows departure
    }
  }, [departureDay, returnDay, editingTrip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      driver,
      destination,
      passenger,
      departureDay,
      departureTime,
      returnDay: returnDay || undefined,
      returnTime: returnTime || undefined,
      confirmed,
      note: note || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  const dayBtn = (day: typeof DAYS[number], selected: boolean, onClick: () => void) => (
    <button
      key={day}
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        selected
          ? 'bg-gray-800 text-white shadow-md'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {day}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Car className="w-5 h-5 text-gray-600" />
            {editingTrip ? '修改行程' : '新增行程'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Driver */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">司机</label>
            <div className="flex gap-3">
              {(['王勇', '刘平'] as Driver[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDriver(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    driver === d
                      ? d === '王勇'
                        ? 'bg-amber-50 text-amber-700 border-2 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-gray-50 text-gray-400 border-2 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Destination + Passenger */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                目的地
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                placeholder="如：苏盐井神"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                <User className="w-3.5 h-3.5 inline mr-1" />
                乘车人
              </label>
              <input
                type="text"
                value={passenger}
                onChange={e => setPassenger(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                placeholder="如：唐总"
              />
            </div>
          </div>

          {/* Departure */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              出发时间
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {DAYS.map(d => dayBtn(d, d === departureDay, () => setDepartureDay(d)))}
            </div>
            <input
              type="time"
              value={departureTime}
              onChange={e => setDepartureTime(e.target.value)}
              required
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Return */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              返回时间 <span className="text-gray-400 font-normal">(选填)</span>
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {DAYS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setReturnDay(d === returnDay ? '' : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    returnDay === d
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {returnDay && (
              <input
                type="time"
                value={returnTime}
                onChange={e => setReturnTime(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            )}
          </div>

          {/* Confirmed */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">行程确认</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmed(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  !confirmed
                    ? 'bg-red-50 text-red-600 border-2 border-red-300'
                    : 'bg-gray-50 text-gray-400 border-2 border-gray-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                未确认
              </button>
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  confirmed
                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300'
                    : 'bg-gray-50 text-gray-400 border-2 border-gray-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                已确认
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              备注
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              placeholder="补充信息..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20"
          >
            <Save className="w-4 h-4" />
            {editingTrip ? '保存修改' : '确认添加'}
          </button>
        </form>
      </div>
    </div>
  );
}
