/**
 * components/appointments/SlotPicker.jsx
 * Date strip (next 14 days) + time slot grid.
 * Generates 30-min intervals from the vet's availableSlots for the selected day,
 * falling back to standard 09:00–18:00 if the vet has no configured slots.
 */
import { useState, useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** Generate array of HH:MM strings between startTime and endTime, step 30 min */
function generateSlots(startTime = '09:00', endTime = '18:00') {
  const slots = [];
  let [h, m] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  while (h < eh || (h === eh && m < em)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) { m -= 60; h++; }
  }
  return slots;
}

/** Build the next N dates starting from today */
function buildDateStrip(days = 14) {
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    result.push(d);
  }
  return result;
}

function format12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12    = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// ── Date strip button ─────────────────────────────────────────────────────────
function DateButton({ date, isSelected, onClick, isToday }) {
  const day   = date.toLocaleDateString('en-IN', { weekday: 'short' });
  const num   = date.getDate();
  const month = date.toLocaleDateString('en-IN', { month: 'short' });

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border flex-shrink-0 min-w-[3.5rem]
        transition-all duration-200 hover:scale-105
        ${isSelected
          ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20'
          : isToday
          ? 'bg-primary-500/10 border-primary-500/40 text-primary-300'
          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
        }`}
    >
      <span className="text-xs font-medium">{day}</span>
      <span className="text-lg font-black leading-none mt-0.5">{num}</span>
      <span className="text-xs opacity-70">{month}</span>
      {isToday && !isSelected && (
        <span className="w-1 h-1 rounded-full bg-primary-400 mt-1" />
      )}
    </button>
  );
}

// ── Main SlotPicker ───────────────────────────────────────────────────────────
export default function SlotPicker({ selectedDate, selectedTime, onDateChange, onTimeChange, vet }) {
  const dateStrip  = useMemo(() => buildDateStrip(21), []);
  const today      = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute available time slots for the selected date based on vet's schedule
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayName  = DAY_NAMES[new Date(selectedDate).getDay()];
    const vetSlots = (vet?.availableSlots ?? []).filter((s) => s.day === dayName);

    if (vetSlots.length > 0) {
      // Merge all configured slot ranges for that day
      return vetSlots.flatMap((s) => generateSlots(s.startTime, s.endTime));
    }
    // Default business hours
    return generateSlots('09:00', '17:30');
  }, [selectedDate, vet]);

  const handleDateClick = (date) => {
    const iso = date.toISOString().slice(0, 10);
    onDateChange(iso);
    onTimeChange(''); // reset time when date changes
  };

  return (
    <div>
      {/* ── Date strip ── */}
      <p className="text-sm font-medium text-gray-300 mb-3">📅 Select Date</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {dateStrip.map((date) => {
          const iso       = date.toISOString().slice(0, 10);
          const isToday   = date.toDateString() === new Date().toDateString();
          return (
            <DateButton
              key={iso}
              date={date}
              isSelected={selectedDate === iso}
              isToday={isToday}
              onClick={() => handleDateClick(date)}
            />
          );
        })}
      </div>

      {/* ── Time slot grid ── */}
      {selectedDate && (
        <>
          <p className="text-sm font-medium text-gray-300 mb-3">
            🕐 Select Time
            {vet?.availableSlots?.length > 0 && (
              <span className="ml-2 text-xs text-green-400/80">
                (Based on Dr. {vet.name?.split(' ')[0]}'s schedule)
              </span>
            )}
          </p>

          {timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm bg-white/5 rounded-xl border border-white/10">
              <p className="text-2xl mb-2">📵</p>
              <p>No slots available on this day for Dr. {vet?.name ?? 'this vet'}.</p>
              <p className="text-xs mt-1">Please select a different date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  id={`slot-${slot}`}
                  onClick={() => onTimeChange(slot)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-105
                    ${selectedTime === slot
                      ? 'bg-primary-500 border-primary-400 text-white shadow-md shadow-primary-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                    }`}
                >
                  {format12h(slot)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedDate && (
        <div className="text-center py-8 text-gray-600 text-sm bg-white/5 rounded-xl border border-white/10">
          <p className="text-3xl mb-2">📅</p>
          <p>Select a date above to see available time slots.</p>
        </div>
      )}
    </div>
  );
}
