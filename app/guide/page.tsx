'use client';

import Link from 'next/link';
import Footer from '../../components/Footer';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-pink-500 mb-8 cursor-pointer">
          <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center mr-2"></i>
          トップページに戻る
        </Link>

        <h1 className="text-4xl font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          利用ガイド
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <div className="border-l-4 border-pink-400 pl-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-white w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg">1</span>
              予約
            </h2>
            <p className="text-gray-700 leading-relaxed">
              ご希望の鑑定士を選び、カレンダーからご希望の時間を選択し、予約を確定してください。
            </p>
          </div>

          <div className="border-l-4 border-purple-400 pl-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-white w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg">2</span>
              購入/支払い
            </h2>
            <p className="text-gray-700 leading-relaxed">
              予約が完了したら、指定の方法でお支払い手続きにお進みください。
            </p>
          </div>

          <div className="border-l-4 border-pink-400 pl-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-white w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg">3</span>
              サービス提供
            </h2>
            <p className="text-gray-700 leading-relaxed">
              お支払い(購入)が確認できたら、予約時間になりましたら先生から予約受付時のお電話番号へご連絡いたします。
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
            占い師を探す
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
