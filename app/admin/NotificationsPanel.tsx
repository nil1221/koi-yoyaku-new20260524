'use client';

import { useState, useEffect } from 'react';

interface ChangeRequest {
  id: number;
  fortuneteller_id: number;
  fortuneteller_name: string;
  request_content: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export default function NotificationsPanel() {
  const [newRequests, setNewRequests] = useState<ChangeRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'completed'>('new');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [newRes, completedRes] = await Promise.all([
        fetch('https://fmbpjozokitguvplyvqk.supabase.co/functions/v1/get-change-requests?completed=false'),
        fetch('https://fmbpjozokitguvplyvqk.supabase.co/functions/v1/get-change-requests?completed=true')
      ]);

      const newData = await newRes.json();
      const completedData = await completedRes.json();

      if (newData.success) {
        setNewRequests(newData.data || []);
      }
      if (completedData.success) {
        setCompletedRequests(completedData.data || []);
      }
    } catch (error) {
      console.error('通知取得エラー:', error);
      setMessage('通知の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const response = await fetch('https://fmbpjozokitguvplyvqk.supabase.co/functions/v1/update-change-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isCompleted: true })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ 完了にしました');
        await fetchRequests();
      } else {
        setMessage('❌ 更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      setMessage('❌ 更新に失敗しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この通知を削除しますか?')) return;

    try {
      const response = await fetch('https://fmbpjozokitguvplyvqk.supabase.co/functions/v1/delete-change-request', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ 削除しました');
        await fetchRequests();
      } else {
        setMessage('❌ 削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      setMessage('❌ 削除に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">変更依頼通知</h2>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-2"></i>
          更新
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'new'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          新着通知 ({newRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          完了済み ({completedRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">読み込み中...</div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'new' ? (
            newRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-notification-off-line text-4xl mb-2"></i>
                <p>新着通知はありません</p>
              </div>
            ) : (
              newRequests.map((request) => (
                <div key={request.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{request.fortuneteller_name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                    </div>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      新着
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{request.request_content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-1"></i>
                      完了
                    </button>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            completedRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-checkbox-circle-line text-4xl mb-2"></i>
                <p>完了済みの通知はありません</p>
              </div>
            ) : (
              completedRequests.map((request) => (
                <div key={request.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{request.fortuneteller_name}</h3>
                      <p className="text-sm text-gray-500">受信: {formatDate(request.created_at)}</p>
                      {request.completed_at && (
                        <p className="text-sm text-green-600">完了: {formatDate(request.completed_at)}</p>
                      )}
                    </div>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      完了
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{request.request_content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    削除
                  </button>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
