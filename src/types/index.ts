export type Driver = '王勇' | '刘平';
export type DayOfWeek = '周一' | '周二' | '周三' | '周四' | '周五' | '周六' | '周日';
export type TimeSlot = '上午' | '下午';

export interface Trip {
  id: string;
  driver: Driver;
  destination: string;
  passenger: string;
  departureDay: DayOfWeek;
  departureTime: string;
  returnDay?: DayOfWeek;
  returnTime?: string;
  confirmed: boolean;
  note?: string;
}

export const DAYS: DayOfWeek[] = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
export const DRIVERS: Driver[] = ['王勇', '刘平'];
export const TIME_SLOTS: TimeSlot[] = ['上午', '下午'];

export function dayIndex(day: DayOfWeek): number {
  return DAYS.indexOf(day);
}

export function hourFromTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

export function isCellCovered(
  day: DayOfWeek,
  timeSlot: TimeSlot,
  trip: Trip
): boolean {
  const dIdx = dayIndex(day);
  const depIdx = dayIndex(trip.departureDay);
  const retIdx = trip.returnDay ? dayIndex(trip.returnDay) : depIdx;

  const cellStart = dIdx * 24 + (timeSlot === '上午' ? 0 : 12);
  const cellEnd = cellStart + 12;

  const tripStart = depIdx * 24 + hourFromTime(trip.departureTime);
  const tripEnd = retIdx * 24 + (trip.returnTime ? hourFromTime(trip.returnTime) : tripStart + 4);

  return tripStart < cellEnd && tripEnd > cellStart;
}

export function isDepartureCell(day: DayOfWeek, timeSlot: TimeSlot, trip: Trip): boolean {
  return day === trip.departureDay && timeSlot === (hourFromTime(trip.departureTime) < 12 ? '上午' : '下午');
}

export function isReturnCell(day: DayOfWeek, timeSlot: TimeSlot, trip: Trip): boolean {
  if (!trip.returnDay || !trip.returnTime) return false;
  return day === trip.returnDay && timeSlot === (hourFromTime(trip.returnTime) < 12 ? '上午' : '下午');
}

export function findCoveringTrip(
  day: DayOfWeek,
  timeSlot: TimeSlot,
  driver: Driver,
  trips: Trip[]
): Trip | undefined {
  return trips.find(t => t.driver === driver && isCellCovered(day, timeSlot, t));
}

export function getCellType(trip: Trip, day: DayOfWeek, timeSlot: TimeSlot): 'departure' | 'return' | 'middle' {
  if (isDepartureCell(day, timeSlot, trip)) return 'departure';
  if (isReturnCell(day, timeSlot, trip)) return 'return';
  return 'middle';
}
