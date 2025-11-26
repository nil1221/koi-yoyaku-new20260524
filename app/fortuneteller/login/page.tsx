'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FortunetellerLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ユーザーが設定したログインIDとパスワードを優先的にチェック
      let { data, error } = await supabase
        .from('fortunetellers')
        .select('*')
        .eq('user_login_id', loginId)
        .eq('user_hashed_password', password)
        .eq('is_approved', true)
        .single();

      // ユーザー設定のログイン情報が見つからない場合、管理者設定のログイン情報でチェック
      if (error || !data) {
        const result = await supabase
          .from('fortunetellers')
          .select('*')
          .eq('login_id', loginId)
          .eq('hashed_password', password)
          .eq('is_approved', true)
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        setError('ログインIDまたはパスワードが正しくありません');
        setLoading(false);
        return;
      }

      await supabase
        .from('fortunetellers')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.id);

      localStorage.setItem('fortuneteller_id', data.id.toString());
      localStorage.setItem('fortuneteller_name', data.name);
      
      router.push('/fortuneteller/dashboard');
    } catch (err) {
      setError('ログインに失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
            占い師ログイン
          </h1>
          <p className="text-gray-600">管理画面にアクセスするにはログインしてください</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-purple-600 hover:text-pink-500 transition-colors cursor-pointer">
            トップページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
