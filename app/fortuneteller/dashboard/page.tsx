'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ReservationCalendar from './ReservationCalendar';
import ReservationList from './ReservationList';

interface Fortuneteller {
  id: number;
  name: string;
  real_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  specialty: string[];
  divination_methods: string;
  price: string;
  description: string;
  image: string;
  admin_name: string | null;
  admin_specialty: string[] | null;
  admin_divination_methods: string | null;
  admin_price: string | null;
  admin_image_url: string | null;
  user_description: string | null;
  user_image_url: string | null;
  user_specialty: string[] | null;
  user_divination_methods: string | null;
  user_sns_links: any;
  login_id: string | null;
  hashed_password: string | null;
  user_login_id: string | null;
  user_hashed_password: string | null;
}

export default function FortunetellerDashboard() {
  const router = useRouter();
  const [fortuneteller, setFortuneteller] = useState<Fortuneteller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'reservation-calendar' | 'reservation-list'>('profile');
  
  const [userDescription, setUserDescription] = useState('');
  const [userSpecialty, setUserSpecialty] = useState<string[]>([]);
  const [userDivinationMethods, setUserDivinationMethods] = useState('');
  const [userSnsLinks, setUserSnsLinks] = useState({ 
    line: '', 
    instagram: '', 
    twitter: '', 
    youtube: '', 
    ameblo: '', 
    note: '', 
    tiktok: '' 
  });
  const [userLoginId, setUserLoginId] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const fortunetellerId = localStorage.getItem('fortuneteller_id');
    if (!fortunetellerId) {
      router.push('/fortuneteller/login');
      return;
    }

    fetchFortunetellerData(fortunetellerId);
  }, []);

  const fetchFortunetellerData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('fortunetellers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/fortuneteller/login');
        return;
      }

      setFortuneteller(data);
      setUserDescription(data.user_description || data.description || '');
      setUserSpecialty(data.user_specialty || data.admin_specialty || data.specialty || []);
      setUserDivinationMethods(data.user_divination_methods || data.admin_divination_methods || data.divination_methods || '');
      setUserSnsLinks(data.user_sns_links || { 
        line: '', 
        instagram: '', 
        twitter: '', 
        youtube: '', 
        ameblo: '', 
        note: '', 
        tiktok: '' 
      });
      setUserLoginId(data.user_login_id || data.login_id || '');
      setUserPassword(data.user_hashed_password || data.hashed_password || '');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching fortuneteller data:', err);
      router.push('/fortuneteller/login');
    }
  };

  const handleSave = async () => {
    if (!fortuneteller) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('fortunetellers')
        .update({
          user_description: userDescription,
          user_specialty: userSpecialty,
          user_divination_methods: userDivinationMethods,
          user_sns_links: userSnsLinks,
          user_login_id: userLoginId,
          user_hashed_password: userPassword
        })
        .eq('id', fortuneteller.id);

      if (error) {
        console.error('Update error:', error);
        setMessage('保存に失敗しました: ' + error.message);
      } else {
        setMessage('✅ プロフィールを更新しました');
        
        if (userLoginId !== (fortuneteller.user_login_id || fortuneteller.login_id)) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('fortuneteller_login_id', userLoginId);
          }
        }
        
        fetchFortunetellerData(fortuneteller.id.toString());
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('保存に失敗しました');
    }

    setSaving(false);
  };

  const handleSendRequest = async () => {
    if (!fortuneteller || !changeRequest.trim()) {
      setMessage('変更内容を入力してください');
      return;
    }

    try {
      const response = await fetch('https://fmbpjozokitguvplyvqk.supabase.co/functions/v1/submit-change-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortunetellerId: fortuneteller.id,
          fortunetellerName: getDisplayName(),
          requestContent: changeRequest
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('通知送信エラー:', data.error);
        setMessage('❌ 依頼の送信に失敗しました: ' + (data.error || ''));
      } else {
        setMessage('✅ 変更依頼を送信しました。管理者が確認次第、対応いたします。');
        setShowRequestModal(false);
        setChangeRequest('');
      }
    } catch (err) {
      console.error('Request error:', err);
      setMessage('❌ 依頼の送信に失敗しました');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fortuneteller_id');
      localStorage.removeItem('fortuneteller_name');
      localStorage.removeItem('fortuneteller_login_id');
    }
    router.push('/fortuneteller/login');
  };

  const getDisplayName = () => {
    if (!fortuneteller) return '';
    return fortuneteller.admin_name || fortuneteller.name;
  };

  const getDisplayPrice = () => {
    if (!fortuneteller) return '';
    return fortuneteller.admin_price || fortuneteller.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!fortuneteller) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            占い師管理画面
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'profile'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              プロフィール変更
            </button>
            <button
              onClick={() => setActiveTab('reservation-calendar')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'reservation-calendar'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              予約管理カレンダー
            </button>
            <button
              onClick={() => setActiveTab('reservation-list')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'reservation-list'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              予約一覧
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm sm:text-base ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">基本情報（管理者設定）</h2>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                  >
                    変更を依頼
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <span className="font-medium">芸名：</span>
                      <span>{getDisplayName()}</span>
                    </div>
                    <div>
                      <span className="font-medium">本名：</span>
                      <span>{fortuneteller.real_name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">料金：</span>
                    <span>{getDisplayPrice()}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs sm:text-sm text-gray-500">
                  ※ これらの情報は管理者が設定しています。変更が必要な場合は「変更を依頼」ボタンから管理者にお問い合わせください。
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">ログイン情報</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ログインID
                    </label>
                    <input
                      type="text"
                      value={userLoginId}
                      onChange={(e) => setUserLoginId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="ログインIDを入力"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      ※ 変更すると次回ログイン時から新しいIDが必要になります
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      パスワード
                    </label>
                    <input
                      type="text"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="パスワードを入力"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      ※ 変更すると次回ログイン時から新しいパスワードが必要になります
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">鑑定スキル情報</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      得意鑑定
                    </label>
                    <input
                      type="text"
                      value={userSpecialty.join('、')}
                      onChange={(e) => setUserSpecialty(e.target.value.split(/[、,]/).map(s => s.trim()).filter(s => s))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="例：恋愛、結婚、仕事"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      カンマ区切りで入力してください
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      使用占術
                    </label>
                    <input
                      type="text"
                      value={userDivinationMethods}
                      onChange={(e) => setUserDivinationMethods(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="例：タロット、霊視、四柱推命"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">プロフィール情報</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      自己紹介文
                    </label>
                    <textarea
                      value={userDescription}
                      onChange={(e) => setUserDescription(e.target.value)}
                      rows={8}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="あなたの自己紹介を入力してください"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      {userDescription.length}/500文字
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SNSリンク
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">公式LINE</label>
                        <input
                          type="url"
                          value={userSnsLinks.line || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, line: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://line.me/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Instagram</label>
                        <input
                          type="url"
                          value={userSnsLinks.instagram || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, instagram: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">X (Twitter)</label>
                        <input
                          type="url"
                          value={userSnsLinks.twitter || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, twitter: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://x.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">YouTube</label>
                        <input
                          type="url"
                          value={userSnsLinks.youtube || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, youtube: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">アメブロ</label>
                        <input
                          type="url"
                          value={userSnsLinks.ameblo || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, ameblo: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://ameblo.jp/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">note</label>
                        <input
                          type="url"
                          value={userSnsLinks.note || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, note: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://note.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">TikTok</label>
                        <input
                          type="url"
                          value={userSnsLinks.tiktok || ''}
                          onChange={(e) => setUserSnsLinks({...userSnsLinks, tiktok: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://tiktok.com/..."
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-gray-500">
                      ※ 入力されたSNSのみプロフィールページに表示されます
                    </p>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer text-sm sm:text-base"
                  >
                    {saving ? '保存中...' : '保存する'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservation-calendar' && fortuneteller && (
            <ReservationCalendar fortunetellerId={fortuneteller.id} />
          )}

          {activeTab === 'reservation-list' && fortuneteller && (
            <ReservationList 
              fortunetellerId={fortuneteller.id}
              fortunetellerName={fortuneteller.name}
              fortunetellerEmail={fortuneteller.email}
            />
          )}
        </div>
      </main>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">管理者に変更を依頼</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              芸名、料金など、管理者が設定している情報の変更を依頼できます。
            </p>
            
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">変更内容</label>
              <textarea
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="変更したい内容を具体的に記入してください"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                {changeRequest.length}/500文字
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setChangeRequest('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
