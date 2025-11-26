'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Reservation {
  id: number;
  customer_name: string;
  customer_gender: string;
  customer_age: number;
  customer_birth_date: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  reservation_date: string;
  reservation_time: string;
  status: string;
  created_at: string;
}

export default function ReservationList({ fortunetellerId, fortunetellerName, fortunetellerEmail }: { fortunetellerId: number; fortunetellerName: string; fortunetellerEmail: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, [fortunetellerId, filter]);

  const loadReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('fortuneteller_id', fortunetellerId)
      .eq('status', filter)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (!error && data) {
      setReservations(data);
    }
  };

  const handleReservation = async (reservationId: number, action: 'approved' | 'rejected') => {
    setLoading(true);
    
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const { error } = await supabase
      .from('reservations')
      .update({ status: action })
      .eq('id', reservationId);

    if (!error) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reservation-result`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: reservation.customer_email,
            customerName: reservation.customer_name,
            fortunetellerName: fortunetellerName,
            reservationDate: reservation.reservation_date,
            reservationTime: reservation.reservation_time,
            status: action,
          }),
        });
      } catch (error) {
        console.error('メール送信エラー:', error);
      }

      loadReservations();
    } else {
      alert('処理に失敗しました');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            filter === 'pending'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          新着予約
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            filter === 'approved'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          承認済み
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            filter === 'rejected'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          否認済み
        </button>
      </div>

      <div className="space-y-4">
        {reservations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            予約がありません
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {reservation.customer_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reservation.reservation_date} {reservation.reservation_time}
                  </p>
                </div>
                {filter === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReservation(reservation.id, 'approved')}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReservation(reservation.id, 'rejected')}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      否認
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">性別：</span>
                  <span className="text-gray-900">{reservation.customer_gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">年齢：</span>
                  <span className="text-gray-900">{reservation.customer_age}歳</span>
                </div>
                <div>
                  <span className="text-gray-600">生年月日：</span>
                  <span className="text-gray-900">{reservation.customer_birth_date}</span>
                </div>
                <div>
                  <span className="text-gray-600">電話番号：</span>
                  <span className="text-gray-900">{reservation.customer_phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">メールアドレス：</span>
                  <span className="text-gray-900">{reservation.customer_email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">住所：</span>
                  <span className="text-gray-900">{reservation.customer_address}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
