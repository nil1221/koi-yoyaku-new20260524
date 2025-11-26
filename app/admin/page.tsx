'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationsPanel from './NotificationsPanel';
import ReservationManagement from './ReservationManagement';

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
  is_approved: boolean;
  login_id: string | null;
  hashed_password: string | null;
  available: boolean;
  admin_name: string | null;
  admin_price: string | null;
  admin_image_url: string | null;
  admin_specialty: string[] | null;
  admin_divination_methods: string | null;
  user_description: string | null;
  user_image_url: string | null;
  user_specialty: string[] | null;
  user_divination_methods: string | null;
  user_sns_links: any;
  user_login_id: string | null;
  user_hashed_password: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [fortunetellers, setFortunetellers] = useState<Fortuneteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFt, setSelectedFt] = useState<Fortuneteller | null>(null);
  const [credentials, setCredentials] = useState({ login_id: '', password: '' });
  const [editData, setEditData] = useState<Fortuneteller | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState('');
  const [activeSection, setActiveSection] = useState<'fortunetellers' | 'notifications'>('fortunetellers');
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'reservations'>('users');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated');
    if (isAuthenticated !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchFortunetellers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    router.push('/admin/login');
  };

  const fetchFortunetellers = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fortunetellers')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('❌ データ取得エラー:', error);
        setMessage('データの取得に失敗しました: ' + error.message);
      } else {
        setFortunetellers(data || []);
      }
    } catch (error) {
      console.error('❌ エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (ft: Fortuneteller) => {
    setSelectedFt(ft);
    setCredentials({ login_id: '', password: '' });
    setShowApprovalModal(true);
    setMessage('');
  };

  const handleApprove = async () => {
    if (!supabase || !selectedFt || isProcessing) return;

    if (!credentials.login_id.trim() || !credentials.password.trim()) {
      setMessage('ログインIDとパスワードを入力してください');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: existing } = await supabase
        .from('fortunetellers')
        .select('id')
        .eq('login_id', credentials.login_id)
        .neq('id', selectedFt.id);

      if (existing && existing.length > 0) {
        setMessage('このログインIDは既に使用されています');
        setIsProcessing(false);
        return;
      }

      const { data: updateResult, error: updateError } = await supabase
        .from('fortunetellers')
        .update({
          is_approved: true,
          login_id: credentials.login_id,
          hashed_password: credentials.password
        })
        .eq('id', selectedFt.id)
        .select();

      if (updateError) {
        console.error('❌ 承認エラー:', updateError);
        setMessage('承認に失敗しました: ' + updateError.message);
        setIsProcessing(false);
        return;
      }

      if (!updateResult || updateResult.length === 0) {
        setMessage('⚠️ データベースの権限設定を確認してください');
        setIsProcessing(false);
        return;
      }

      try {
        const emailResponse = await supabase.functions.invoke('send-approval-email', {
          body: {
            to: selectedFt.email,
            stageName: selectedFt.name,
            username: credentials.login_id,
            password: credentials.password
          }
        });

        if (emailResponse.error) {
          setMessage(`✅ 承認しましたが、メール送信に失敗しました: ${emailResponse.error.message}`);
        } else {
          setMessage(`✅ ${selectedFt.name}さんを承認し、ログイン情報をメールで送信しました`);
        }
      } catch (emailError) {
        setMessage(`✅ 承認しましたが、メール送信に失敗しました`);
      }

      setShowApprovalModal(false);
      setSelectedFt(null);
      await fetchFortunetellers();

    } catch (error) {
      console.error('❌ エラー:', error);
      setMessage('承認処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (ft: Fortuneteller) => {
    setEditData({
      ...ft,
      specialty: ft.specialty || [],
      divination_methods: ft.divination_methods || '',
      price: ft.price || '',
      description: ft.description || '',
      phone_number: ft.phone_number || '',
      birth_date: ft.birth_date || '',
      login_id: ft.user_login_id || ft.login_id || '',
      hashed_password: ft.user_hashed_password || ft.hashed_password || '',
      admin_name: ft.admin_name || '',
      admin_price: ft.admin_price || '',
      admin_specialty: ft.admin_specialty || [],
      admin_divination_methods: ft.admin_divination_methods || '',
      user_description: ft.user_description || '',
      user_specialty: ft.user_specialty || [],
      user_divination_methods: ft.user_divination_methods || ''
    });
    setImageFile(null);
    setImagePreview(ft.admin_image_url || ft.image || '');
    setUserImageFile(null);
    setUserImagePreview(ft.user_image_url || '');
    setShowEditModal(true);
    setMessage('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('画像ファイルを選択してください');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('画像サイズは5MB以下にしてください');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('画像ファイルを選択してください');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('画像サイズは5MB以下にしてください');
        return;
      }

      setUserImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!supabase || !editData || isProcessing) return;

    setIsProcessing(true);

    try {
      let adminImageUrl = editData.admin_image_url;
      let userImageUrl = editData.user_image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `admin_fortuneteller_${editData.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fortuneteller-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          setMessage('画像のアップロードに失敗しました: ' + uploadError.message);
          setIsProcessing(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('fortuneteller-images')
          .getPublicUrl(fileName);

        adminImageUrl = urlData.publicUrl;
      }

      if (userImageFile) {
        const fileExt = userImageFile.name.split('.').pop();
        const fileName = `user_fortuneteller_${editData.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fortuneteller-images')
          .upload(fileName, userImageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          setMessage('ユーザー画像のアップロードに失敗しました: ' + uploadError.message);
          setIsProcessing(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('fortuneteller-images')
          .getPublicUrl(fileName);

        userImageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('fortunetellers')
        .update({
          real_name: editData.real_name,
          email: editData.email,
          phone_number: editData.phone_number,
          birth_date: editData.birth_date,
          available: editData.available,
          admin_name: editData.admin_name || null,
          admin_price: editData.admin_price || null,
          admin_image_url: adminImageUrl || null,
          admin_specialty: editData.admin_specialty && editData.admin_specialty.length > 0 ? editData.admin_specialty : null,
          admin_divination_methods: editData.admin_divination_methods || null,
          user_image_url: userImageUrl || null
        })
        .eq('id', editData.id);

      if (error) {
        console.error('❌ 更新エラー:', error);
        setMessage('更新に失敗しました: ' + error.message);
      } else {
        setMessage('✅ 情報を更新しました');
        setShowEditModal(false);
        setEditData(null);
        setImageFile(null);
        setUserImageFile(null);
        await fetchFortunetellers();
      }
    } catch (error) {
      console.error('❌ エラー:', error);
      setMessage('更新処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingList = fortunetellers.filter(ft => !ft.is_approved);
  const approvedList = fortunetellers.filter(ft => ft.is_approved);

  const getDisplayName = (ft: Fortuneteller) => ft.admin_name || ft.name;
  const getDisplayPrice = (ft: Fortuneteller) => ft.admin_price || ft.price;
  const getDisplaySpecialty = (ft: Fortuneteller) => {
    if (ft.user_specialty && ft.user_specialty.length > 0) return ft.user_specialty;
    if (ft.admin_specialty && ft.admin_specialty.length > 0) return ft.admin_specialty;
    return ft.specialty;
  };
  const getDisplayDescription = (ft: Fortuneteller) => ft.user_description || ft.description;
  const getDisplayLoginId = (ft: Fortuneteller) => ft.user_login_id || ft.login_id;
  const getDisplayPassword = (ft: Fortuneteller) => ft.user_hashed_password || ft.hashed_password;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">管理者画面</h1>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link href="/admin/settings" className="text-gray-600 hover:text-gray-800 cursor-pointer">
              <i className="ri-settings-3-line text-lg sm:text-xl"></i>
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 cursor-pointer whitespace-nowrap text-sm sm:text-base"
            >
              <i className="ri-logout-box-line mr-1"></i>
              ログアウト
            </button>
            <Link href="/" className="text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap text-sm sm:text-base">
              トップページへ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {message && (
          <div className={`mb-4 sm:mb-6 p-4 rounded-lg text-sm sm:text-base ${message.includes('✅') ? 'bg-green-100 text-green-700' : message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="ri-user-star-line mr-2"></i>
            占い師管理
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'notifications'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="ri-notification-3-line mr-2"></i>
            変更依頼通知
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'reservations'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <i className="ri-calendar-check-line mr-2"></i>
            予約管理
          </button>
        </div>

        {activeTab === 'reservations' ? (
          <ReservationManagement />
        ) : activeTab === 'notifications' ? (
          <NotificationsPanel />
        ) : loading ? (
          <div className="text-center py-12 text-gray-600 text-sm sm:text-base">読み込み中...</div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">未承認（{pendingList.length}件）</h2>
              {pendingList.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-base">未承認の占い師はいません</p>
              ) : (
                <div className="space-y-4">
                  {pendingList.map((ft) => (
                    <div key={ft.id} className="bg-white rounded-lg shadow p-4 sm:p-6 border">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">{ft.name}</h3>
                          <p className="text-sm sm:text-base text-gray-600">本名: {ft.real_name}</p>
                          <p className="text-sm sm:text-base text-gray-600">メール: {ft.email}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                          未承認
                        </span>
                      </div>
                      <div className="mb-4 text-sm sm:text-base">
                        <p className="text-gray-600">得意鑑定: {ft.specialty?.join('、')}</p>
                        <p className="text-gray-600">料金: {ft.price}</p>
                      </div>
                      <button
                        onClick={() => handleApproveClick(ft)}
                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                      >
                        承認する
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">承認済み（{approvedList.length}件）</h2>
              {approvedList.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-base">承認済みの占い師はいません</p>
              ) : (
                <div className="space-y-4">
                  {approvedList.map((ft) => (
                    <div key={ft.id} className="bg-white rounded-lg shadow p-4 sm:p-6 border">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">{getDisplayName(ft)}</h3>
                          <p className="text-sm sm:text-base text-gray-600">本名: {ft.real_name}</p>
                          <p className="text-sm sm:text-base text-gray-600">メール: {ft.email}</p>
                          <p className="text-sm sm:text-base text-gray-600">ログインID: {getDisplayLoginId(ft)}</p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                          承認済み
                        </span>
                      </div>
                      <div className="mb-4 text-sm sm:text-base">
                        <p className="text-gray-600">得意鑑定: {getDisplaySpecialty(ft).join('、')}</p>
                        <p className="text-gray-600">料金: {getDisplayPrice(ft)}</p>
                        <p className="text-gray-600 mt-2">自己紹介: {getDisplayDescription(ft).substring(0, 100)}...</p>
                      </div>
                      <button
                        onClick={() => handleEditClick(ft)}
                        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                      >
                        編集する
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {showApprovalModal && selectedFt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">ログイン情報を設定</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{selectedFt.name}さんのログイン情報</p>
              
              <div className="space-y-4 mb-4 sm:mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">ログインID</label>
                  <input
                    type="text"
                    value={credentials.login_id}
                    onChange={(e) => setCredentials({...credentials, login_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">パスワード</label>
                  <input
                    type="text"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                >
                  {isProcessing ? '処理中...' : '承認する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-3xl w-full my-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">占い師情報編集</h2>
              
              <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto mb-4 sm:mb-6 pr-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-bold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">🔒 管理者専用設定（最優先表示）</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">芸名（管理者設定）</label>
                      <input
                        type="text"
                        value={editData.admin_name || ''}
                        onChange={(e) => setEditData({...editData, admin_name: e.target.value})}
                        placeholder="空欄の場合は登録時の芸名を表示"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ 設定すると全画面でこの芸名が表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">料金（管理者設定）</label>
                      <input
                        type="text"
                        value={editData.admin_price || ''}
                        onChange={(e) => setEditData({...editData, admin_price: e.target.value})}
                        placeholder="空欄の場合は登録時の料金を表示"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ 設定すると全画面でこの料金が表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">プロフィール写真（管理者設定）</label>
                      {imagePreview && (
                        <div className="mb-3">
                          <img
                            src={imagePreview}
                            alt="プロフィール写真"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg cursor-pointer text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ 設定すると占い師の写真より優先表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">得意鑑定（管理者設定）</label>
                      <input
                        type="text"
                        value={editData.admin_specialty?.join('、') || ''}
                        onChange={(e) => setEditData({...editData, admin_specialty: e.target.value.split(/[、,]/).map(s => s.trim()).filter(s => s)})}
                        placeholder="カンマ区切りで入力"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ 占い師が変更した場合、占い師の設定が優先されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">使用占術（管理者設定）</label>
                      <input
                        type="text"
                        value={editData.admin_divination_methods || ''}
                        onChange={(e) => setEditData({...editData, admin_divination_methods: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ 占い師が変更した場合、占い師の設定が優先されます</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-bold text-yellow-800 mb-2 sm:mb-3 text-sm sm:text-base">📝 占い師が変更した情報</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">プロフィール写真（ユーザー変更後）</label>
                      {userImagePreview && (
                        <div className="mb-3">
                          <img
                            src={userImagePreview}
                            alt="ユーザープロフィール写真"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUserImageChange}
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg cursor-pointer text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この写真が優先表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">得意鑑定（ユーザー変更後）</label>
                      <input
                        type="text"
                        value={editData.user_specialty?.join('、') || ''}
                        onChange={(e) => setEditData({...editData, user_specialty: e.target.value.split(/[、,]/).map(s => s.trim()).filter(s => s)})}
                        placeholder="ユーザーが変更していない場合は空欄"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この値が優先表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">使用占術（ユーザー変更後）</label>
                      <input
                        type="text"
                        value={editData.user_divination_methods || ''}
                        onChange={(e) => setEditData({...editData, user_divination_methods: e.target.value})}
                        placeholder="ユーザーが変更していない場合は空欄"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この値が優先表示されます</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">自己紹介（ユーザー変更後）</label>
                      <textarea
                        value={editData.user_description || ''}
                        onChange={(e) => setEditData({...editData, user_description: e.target.value})}
                        rows={4}
                        placeholder="ユーザーが変更していない場合は空欄"
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この値が優先表示されます</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">ログインID（ユーザー変更後）</label>
                        <input
                          type="text"
                          value={editData.user_login_id || ''}
                          onChange={(e) => setEditData({...editData, user_login_id: e.target.value})}
                          placeholder="ユーザーが変更していない場合は空欄"
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white text-xs sm:text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この値が優先表示されます</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">パスワード（ユーザー変更後）</label>
                        <input
                          type="text"
                          value={editData.user_hashed_password || ''}
                          onChange={(e) => setEditData({...editData, user_hashed_password: e.target.value})}
                          placeholder="ユーザーが変更していない場合は空欄"
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-white text-xs sm:text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">※ ユーザーが変更した場合、この値が優先表示されます</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">📋 基本情報</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">本名</label>
                      <input
                        type="text"
                        value={editData.real_name}
                        onChange={(e) => setEditData({...editData, real_name: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">メール</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-xs sm:text-sm">電話番号</label>
                        <input
                          type="tel"
                          value={editData.phone_number}
                          onChange={(e) => setEditData({...editData, phone_number: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editData.available}
                          onChange={(e) => setEditData({...editData, available: e.target.checked})}
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <span className="text-gray-700 font-semibold text-xs sm:text-sm">待機中として表示</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setImageFile(null);
                    setUserImageFile(null);
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap text-sm sm:text-base"
                >
                  {isProcessing ? '更新中...' : '更新する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
