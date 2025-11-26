'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettings() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [newLoginId, setNewLoginId] = useState('koikoi-denwa-uranai');
  const [newPassword, setNewPassword] = useState('asahi-koi-denwa');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('admin_settings_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setShowLoginForm(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (loginId === 'koikoi-denwa-uranai' && password === 'asahi-koi-denwa') {
      localStorage.setItem('admin_settings_authenticated', 'true');
      setIsAuthenticated(true);
      setShowLoginForm(false);
    } else {
      setError('ログインIDまたはパスワードが正しくありません');
      setLoading(false);
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('パスワードが一致しません');
      return;
    }

    if (newLoginId.trim() === '' || newPassword.trim() === '') {
      setMessage('ログインIDとパスワードを入力してください');
      return;
    }

    setMessage('✅ 管理者認証情報を更新しました。次回ログインから新しい情報を使用してください。');
    setNewLoginId('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-settings-3-line text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              管理者設定
            </h1>
            <p className="text-gray-600">設定画面にアクセスするにはログインしてください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ログインID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ログインIDを入力"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="パスワードを入力"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer">
              管理画面に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">管理者設定</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 cursor-pointer">
            管理画面へ戻る
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">管理者認証情報の変更</h2>
            <p className="text-gray-600">管理画面にログインするためのIDとパスワードを変更できます</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateCredentials} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいログインID
              </label>
              <input
                type="text"
                value={newLoginId}
                onChange={(e) => setNewLoginId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="新しいログインIDを入力"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="新しいパスワードを入力"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="パスワードを再入力"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="ri-alert-line text-yellow-600 text-xl mr-3 mt-0.5"></i>
                <div>
                  <p className="text-yellow-800 font-semibold mb-1">注意事項</p>
                  <p className="text-yellow-700 text-sm">
                    この機能は表示のみです。実際の認証情報を変更するには、コード内の認証ロジックを更新する必要があります。
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-all whitespace-nowrap cursor-pointer"
            >
              認証情報を更新
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
