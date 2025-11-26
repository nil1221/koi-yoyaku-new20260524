'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySettings {
  date: string;
  availableTimes: TimeSlot[];
  breakTimes: TimeSlot[];
}

export default function ReservationCalendar({ fortunetellerId }: { fortunetellerId: number }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [settings, setSettings] = useState<Record<string, DaySettings>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([{ start: '09:00', end: '18:00' }]);
  const [breakTimes, setBreakTimes] = useState<TimeSlot[]>([]);
  const [deadlineMinutes, setDeadlineMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDeadlineSettings();
  }, [fortunetellerId, currentMonth]);

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const loadSettings = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);

    const { data, error } = await supabase
      .from('availability_settings')
      .select('*')
      .eq('fortuneteller_id', fortunetellerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (!error && data) {
      const settingsMap: Record<string, DaySettings> = {};
      data.forEach((item: any) => {
        settingsMap[item.date] = {
          date: item.date,
          availableTimes: item.available_times || [],
          breakTimes: item.break_times || [],
        };
      });
      setSettings(settingsMap);
    }
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

  const saveDeadlineSettings = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('reservation_settings')
      .upsert({
        fortuneteller_id: fortunetellerId,
        deadline_minutes: deadlineMinutes,
      }, {
        onConflict: 'fortuneteller_id'
      });

    if (!error) {
      alert('締切設定を保存しました');
    } else {
      console.error('締切設定の保存エラー:', error);
      alert('保存に失敗しました');
    }
    setLoading(false);
  };

  const saveDaySettings = async () => {
    if (!selectedDate) return;

    setLoading(true);
    const daySettings: DaySettings = {
      date: selectedDate,
      availableTimes: availableTimes.filter(t => t.start && t.end),
      breakTimes: breakTimes.filter(t => t.start && t.end),
    };

    const { error } = await supabase
      .from('availability_settings')
      .upsert({
        fortuneteller_id: fortunetellerId,
        date: selectedDate,
        available_times: daySettings.availableTimes,
        break_times: daySettings.breakTimes,
      }, {
        onConflict: 'fortuneteller_id,date'
      });

    if (!error) {
      setSettings({ ...settings, [selectedDate]: daySettings });
      alert('予約枠を保存しました');
      setSelectedDate(null);
      setAvailableTimes([{ start: '09:00', end: '18:00' }]);
      setBreakTimes([]);
    } else {
      console.error('予約枠の保存エラー:', error);
      alert('保存に失敗しました');
    }
    setLoading(false);
  };

  const addAvailableTime = () => {
    setAvailableTimes([...availableTimes, { start: '09:00', end: '18:00' }]);
  };

  const removeAvailableTime = (index: number) => {
    setAvailableTimes(availableTimes.filter((_, i) => i !== index));
  };

  const updateAvailableTime = (index: number, field: 'start' | 'end', value: string) => {
    const newTimes = [...availableTimes];
    newTimes[index][field] = value;
    setAvailableTimes(newTimes);
  };

  const addBreakTime = () => {
    setBreakTimes([...breakTimes, { start: '12:00', end: '13:00' }]);
  };

  const removeBreakTime = (index: number) => {
    setBreakTimes(breakTimes.filter((_, i) => i !== index));
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    const newTimes = [...breakTimes];
    newTimes[index][field] = value;
    setBreakTimes(newTimes);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existingSettings = settings[dateStr];
    if (existingSettings) {
      setAvailableTimes(existingSettings.availableTimes.length > 0 ? existingSettings.availableTimes : [{ start: '09:00', end: '18:00' }]);
      setBreakTimes(existingSettings.breakTimes.length > 0 ? existingSettings.breakTimes : []);
    } else {
      setAvailableTimes([{ start: '09:00', end: '18:00' }]);
      setBreakTimes([]);
    }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isFutureLimit = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return date > oneMonthLater;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">予約締切設定</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">予約可能時間の締切：</label>
          <input
            type="number"
            value={deadlineMinutes}
            onChange={(e) => setDeadlineMinutes(Number(e.target.value))}
            className="w-20 sm:w-24 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
            min="0"
          />
          <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">分前まで</span>
          <button
            onClick={saveDeadlineSettings}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            保存
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="ri-arrow-left-s-line text-lg sm:text-xl"></i>
          </button>
          <h3 className="text-base sm:text-xl font-bold text-gray-900">
            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
          </h3>
          <button
            onClick={nextMonth}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
            const hasSetting = settings[dateStr];
            const isPast = isPastDate(day);
            const isFuture = isFutureLimit(day);
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <button
                key={index}
                onClick={() => !isPast && !isFuture && handleDateSelect(dateStr)}
                disabled={isPast || isFuture}
                className={`aspect-square rounded-lg border-2 transition-all relative ${
                  isPast
                    ? 'bg-gray-900/10 border-gray-300 cursor-not-allowed'
                    : isFuture
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                    : hasSetting
                    ? 'bg-purple-50 border-purple-500 hover:bg-purple-100'
                    : 'bg-white border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                } ${selectedDate === dateStr ? 'ring-2 ring-purple-600' : ''}`}
              >
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isPast
                      ? 'text-gray-400'
                      : isFuture
                      ? 'text-gray-400'
                      : isWeekend
                      ? index % 7 === 0
                        ? 'text-red-600'
                        : 'text-blue-600'
                      : 'text-gray-900'
                  }`}
                >
                  {day}
                </span>
                {hasSetting && !isPast && (
                  <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            {selectedDate} の予約枠設定
          </h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  待機時間
                </label>
                <button
                  onClick={addAvailableTime}
                  className="w-full sm:w-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  + 時間帯を追加
                </button>
              </div>
              <div className="space-y-2">
                {availableTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <select
                      value={time.start}
                      onChange={(e) => updateAvailableTime(index, 'start', e.target.value)}
                      className="flex-1 px-2 sm:px-3 py-2 pr-6 sm:pr-8 border border-gray-300 rounded-lg text-xs sm:text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-600 text-xs sm:text-sm">〜</span>
                    <select
                      value={time.end}
                      onChange={(e) => updateAvailableTime(index, 'end', e.target.value)}
                      className="flex-1 px-2 sm:px-3 py-2 pr-6 sm:pr-8 border border-gray-300 rounded-lg text-xs sm:text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {availableTimes.length > 1 && (
                      <button
                        onClick={() => removeAvailableTime(index)}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line text-base sm:text-lg"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  休憩時間（任意）
                </label>
                <button
                  onClick={addBreakTime}
                  className="w-full sm:w-auto px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                >
                  + 休憩時間を追加
                </button>
              </div>
              {breakTimes.length > 0 ? (
                <div className="space-y-2">
                  {breakTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <select
                        value={time.start}
                        onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-2 pr-6 sm:pr-8 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      >
                        {timeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-600 text-xs sm:text-sm">〜</span>
                      <select
                        value={time.end}
                        onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-2 pr-6 sm:pr-8 border border-gray-300 rounded-lg text-xs sm:text-sm"
                      >
                        {timeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeBreakTime(index)}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line text-base sm:text-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">休憩時間が設定されていません</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={saveDaySettings}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setAvailableTimes([{ start: '09:00', end: '18:00' }]);
                  setBreakTimes([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
