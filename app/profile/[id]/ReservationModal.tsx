'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailableSlot {
  date: string;
  times: string[];
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fortunetellerId: number;
  fortunetellerName: string;
  fortunetellerEmail: string;
}

export default function ReservationModal({
  isOpen,
  onClose,
  fortunetellerId,
  fortunetellerName,
  fortunetellerEmail,
}: ReservationModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [deadlineMinutes, setDeadlineMinutes] = useState(60);
  
  const [customerName, setCustomerName] = useState('');
  const [customerGender, setCustomerGender] = useState('');
  const [customerAge, setCustomerAge] = useState('');
  const [customerBirthDate, setCustomerBirthDate] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
      loadDeadlineSettings();
    }
  }, [isOpen, fortunetellerId, currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDuration]);

  const getJSTTime = () => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jstTime = new Date(utcTime + (9 * 60 * 60 * 1000));
    return jstTime;
  };

  const loadDeadlineSettings = async () => {
    const { data } = await supabase
      .from('reservation_settings')
      .select('deadline_minutes')
      .eq('fortuneteller_id', fortunetellerId)
      .single();

    if (data) {
      setDeadlineMinutes(data.deadline_minutes);
    }
  };

  const loadAvailableSlots = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

    const { data: settings } = await supabase
      .from('availability_settings')
      .select('*')
      .eq('fortuneteller_id', fortunetellerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    const { data: reservations } = await supabase
      .from('reservations')
      .select('reservation_date, reservation_time, duration, status')
      .eq('fortuneteller_id', fortunetellerId)
      .in('status', ['pending', 'approved']);

    const slots: Record<string, string[]> = {};
    settings?.forEach((setting: any) => {
      const times: string[] = [];
      const availableTimes: TimeSlot[] = setting.available_times || [];
      const breakTimes: TimeSlot[] = setting.break_times || [];

      availableTimes.forEach((slot: TimeSlot) => {
        const startHour = parseInt(slot.start.split(':')[0]);
        const startMinute = parseInt(slot.start.split(':')[1]);
        const endHour = parseInt(slot.end.split(':')[0]);
        const endMinute = parseInt(slot.end.split(':')[1]);

        for (let h = startHour; h < endHour || (h === endHour && startMinute < endMinute); h++) {
          for (let m = (h === startHour ? startMinute : 0); m < 60; m += 30) {
            if (h === endHour && m >= endMinute) break;

            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const isBreak = breakTimes.some((breakSlot: TimeSlot) => {
              const breakStart = breakSlot.start;
              const breakEnd = breakSlot.end;
              return timeStr >= breakStart && timeStr < breakEnd;
            });

            const isPastDeadline = isPastDeadlineTime(setting.date, timeStr);
            const isAvailable = isTimeSlotAvailableSync(setting.date, timeStr, selectedDuration, reservations || []);

            if (!isBreak && !isPastDeadline && isAvailable) {
              times.push(timeStr);
            }
          }
        }
      });

      if (times.length > 0) {
        slots[setting.date] = times;
      }
    });

    setAvailableSlots(slots);
  };

  const isPastDeadlineTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    const slotTime = new Date(year, month - 1, day, hour, minute);
    
    const jstNow = getJSTTime();
    const deadlineTime = new Date(slotTime.getTime() - deadlineMinutes * 60 * 1000);
    
    return jstNow > deadlineTime;
  };

  const isTimeSlotAvailableSync = (date: string, time: string, duration: number, reservations: any[]) => {
    const [hour, minute] = time.split(':').map(Number);
    const startTime = hour * 60 + minute;
    const endTime = startTime + duration;

    if (!reservations) return true;

    for (const reservation of reservations) {
      if (reservation.reservation_date !== date) continue;
      
      const [resHour, resMinute] = reservation.reservation_time.split(':').map(Number);
      const resStartTime = resHour * 60 + resMinute;
      const resEndTime = resStartTime + reservation.duration;

      if (
        (startTime >= resStartTime && startTime < resEndTime) ||
        (endTime > resStartTime && endTime <= resEndTime) ||
        (startTime <= resStartTime && endTime >= resEndTime)
      ) {
        return false;
      }
    }

    return true;
  };

  const isTimeSlotAvailable = async (date: string, time: string, duration: number) => {
    const [hour, minute] = time.split(':').map(Number);
    const startTime = hour * 60 + minute;
    const endTime = startTime + duration;

    const { data: reservations } = await supabase
      .from('reservations')
      .select('reservation_time, duration')
      .eq('fortuneteller_id', fortunetellerId)
      .eq('reservation_date', date)
      .in('status', ['pending', 'approved']);

    if (!reservations) return true;

    for (const reservation of reservations) {
      const [resHour, resMinute] = reservation.reservation_time.split(':').map(Number);
      const resStartTime = resHour * 60 + resMinute;
      const resEndTime = resStartTime + reservation.duration;

      if (
        (startTime >= resStartTime && startTime < resEndTime) ||
        (endTime > resStartTime && endTime <= resEndTime) ||
        (startTime <= resStartTime && endTime >= resEndTime)
      ) {
        return false;
      }
    }

    return true;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getDateString = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const jstNow = getJSTTime();
    const today = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
    
    return date < today;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('日時を選択してください');
      return;
    }

    if (!customerName || !customerGender || !customerAge || !customerBirthDate || 
        !customerPhone || !customerEmail || !customerAddress) {
      alert('すべての項目を入力してください');
      return;
    }

    const available = await isTimeSlotAvailable(selectedDate, selectedTime, selectedDuration);
    if (!available) {
      alert('選択された時間帯は既に予約されています。別の時間を選択してください。');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        fortuneteller_id: fortunetellerId,
        customer_name: customerName,
        customer_gender: customerGender,
        customer_age: parseInt(customerAge),
        customer_birth_date: customerBirthDate,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_address: customerAddress,
        reservation_date: selectedDate,
        reservation_time: selectedTime,
        duration: selectedDuration,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reservation-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: fortunetellerEmail,
            fortunetellerName: fortunetellerName,
            customerName: customerName,
            customerGender: customerGender,
            customerAge: parseInt(customerAge),
            customerBirthDate: customerBirthDate,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            customerAddress: customerAddress,
            reservationDate: selectedDate,
            reservationTime: selectedTime,
            duration: selectedDuration,
            reservationId: data.id,
          }),
        });
      } catch (error) {
        console.error('メール送信エラー:', error);
      }

      alert('予約申し込みが完了しました。占い師からの承認をお待ちください。');
      onClose();
      resetForm();
    } else {
      alert('予約に失敗しました');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration(30);
    setCustomerName('');
    setCustomerGender('');
    setCustomerAge('');
    setCustomerBirthDate('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
  };

  if (!isOpen) return null;

  const days = getDaysInMonth();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold" translate="no">予約申し込み</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <i className="ri-close-line text-xl sm:text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">日時を選択</h3>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <i className="ri-arrow-left-s-line text-lg sm:text-xl"></i>
                </button>
                <h4 className="text-base sm:text-lg font-bold text-gray-900">
                  {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <i className="ri-arrow-right-s-line text-lg sm:text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center text-xs sm:text-sm font-bold py-1 sm:py-2 ${
                      index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const dateStr = getDateString(day);
                  const hasSlots = availableSlots[dateStr]?.length > 0;
                  const isPast = isPastDate(day);
                  const isWeekend = index % 7 === 0 || index % 7 === 6;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => hasSlots && !isPast && setSelectedDate(dateStr)}
                      disabled={!hasSlots || isPast}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        isPast
                          ? 'bg-gray-900/10 border-gray-300 cursor-not-allowed'
                          : !hasSlots
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : selectedDate === dateStr
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                      }`}
                    >
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isPast
                            ? 'text-gray-400'
                            : !hasSlots
                            ? 'text-gray-400'
                            : selectedDate === dateStr
                            ? 'text-white'
                            : isWeekend
                            ? index % 7 === 0
                              ? 'text-red-600'
                              : 'text-blue-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 sm:mb-3" translate="no">希望時間</h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[30, 60, 90].map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => {
                          setSelectedDuration(duration);
                          setSelectedTime(null);
                        }}
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedDuration === duration
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-purple-100 border border-purple-300'
                        }`}
                      >
                        {duration}分
                      </button>
                    ))}
                  </div>
                </div>

                {availableSlots[selectedDate] && availableSlots[selectedDate].length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-2 sm:mb-3">開始時間を選択</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots[selectedDate].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                            selectedTime === time
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-purple-100 border border-purple-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {availableSlots[selectedDate] && availableSlots[selectedDate].length === 0 && (
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 text-center">選択した時間では予約可能な枠がありません。別の時間を選択してください。</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">お客様情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  お名前（ニックネーム可）<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  性別<span className="text-red-600">*</span>
                </label>
                <select
                  value={customerGender}
                  onChange={(e) => setCustomerGender(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 pr-8 border border-gray-300 rounded-lg text-xs sm:text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="男性">男性</option>
                  <option value="女性">女性</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  年齢<span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={customerAge}
                  onChange={(e) => setCustomerAge(e.target.value)}
                  required
                  min="0"
                  max="150"
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  生年月日<span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={customerBirthDate}
                  onChange={(e) => setCustomerBirthDate(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  電話番号<span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  メールアドレス<span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  住所<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              予約を申し込む
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold whitespace-nowrap text-sm sm:text-base"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
