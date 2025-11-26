'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function UranaiTourokuPage() {
  const [formData, setFormData] = useState({
    realName: '',
    stageName: '',
    pricePerMinute: '',
    specialty: '',
    divinationMethods: '',
    selfIntroduction: '',
    email: '',
    phoneNumber: '',
    birthDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setMessage('Supabaseに接続されていません');
      return;
    }

    if (!formData.specialty.trim()) {
      setMessage('得意鑑定を入力してください');
      return;
    }

    if (!formData.divinationMethods.trim()) {
      setMessage('使用占術を入力してください');
      return;
    }

    setLoading(true);
    setMessage('申請を送信中...');

    try {
      const { error } = await supabase
        .from('fortuneteller_applications')
        .insert([{
          real_name: formData.realName,
          stage_name: formData.stageName,
          price_per_minute: formData.pricePerMinute,
          specialty: formData.specialty,
          divination_methods: formData.divinationMethods,
          self_introduction: formData.selfIntroduction,
          image_url: '',
          image_urls: [],
          email: formData.email,
          phone_number: formData.phoneNumber,
          birth_date: formData.birthDate,
          status: 'pending'
        }]);

      if (error) throw error;

      setMessage('申請が完了しました！管理者の承認をお待ちください。承認後、登録完了メールをお送りします。');
      setFormData({
        realName: '',
        stageName: '',
        pricePerMinute: '',
        specialty: '',
        divinationMethods: '',
        selfIntroduction: '',
        email: '',
        phoneNumber: '',
        birthDate: ''
      });
    } catch (error) {
      setMessage('申請に失敗しました。もう一度お試しください。');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-['Pacifico'] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 cursor-pointer">
            logo
          </Link>
          <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
            トップページへ
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-pink-100">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
              占い師登録申請
            </h1>
            <p className="text-purple-600 text-lg">
              申請後、管理者の承認をお待ちください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                本名 <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.realName}
                onChange={(e) => setFormData({...formData, realName: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="例：山田太郎"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                鑑定士名 <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.stageName}
                onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="例：美咲先生"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                メールアドレス <span className="text-pink-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                電話番号 <span className="text-pink-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="例：090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                生年月日 <span className="text-pink-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                鑑定料金（1分あたり） <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.pricePerMinute}
                onChange={(e) => setFormData({...formData, pricePerMinute: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
                placeholder="例：300円"
              />
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                得意鑑定 <span className="text-pink-500">*</span>
              </label>
              <textarea
                required
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors resize-none"
                placeholder="例：恋愛、結婚、復縁、仕事、人間関係など"
              />
              <div className="text-right text-sm text-purple-400 mt-1">
                {formData.specialty.length}/500
              </div>
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                使用占術 <span className="text-pink-500">*</span>
              </label>
              <textarea
                required
                value={formData.divinationMethods}
                onChange={(e) => setFormData({...formData, divinationMethods: e.target.value})}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors resize-none"
                placeholder="例：タロット、霊視、占星術、四柱推命など"
              />
              <div className="text-right text-sm text-purple-400 mt-1">
                {formData.divinationMethods.length}/500
              </div>
            </div>

            <div>
              <label className="block text-purple-700 font-semibold mb-2">
                自己紹介 <span className="text-pink-500">*</span>
              </label>
              <textarea
                required
                value={formData.selfIntroduction}
                onChange={(e) => setFormData({...formData, selfIntroduction: e.target.value})}
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors resize-none"
                placeholder="あなたの鑑定スタイルや強みを教えてください（500文字以内）"
              />
              <div className="text-right text-sm text-purple-400 mt-1">
                {formData.selfIntroduction.length}/500
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-center font-semibold ${
                message.includes('完了') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {loading ? '申請中...' : '申請する'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
