'use client';

import Link from 'next/link';
import Footer from '../../components/Footer';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-pink-500 mb-8 cursor-pointer">
          <i className="ri-arrow-left-line w-5 h-5 flex items-center justify-center mr-2"></i>
          トップページに戻る
        </Link>

        <h1 className="text-4xl font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          特定商取引法に基づく表記
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">役務提供事業者</h3>
            <p className="text-gray-700">圓谷祐大</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">運営責任者</h3>
            <p className="text-gray-700">圓谷祐大</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">所在地</h3>
            <p className="text-gray-700">〒185-0002 東京都国分寺市東戸倉1-20-54</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">電話番号</h3>
            <p className="text-gray-700">080-4838-8373</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">メールアドレス</h3>
            <p className="text-gray-700">koi.denwa1225@gmail.com</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">役務の内容</h3>
            <p className="text-gray-700">電話およびインターネットでの占い相談業務</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">役務の対価(販売価格)</h3>
            <p className="text-gray-700 mb-2">1分 130円～700円(税込)</p>
            <p className="text-gray-600 text-sm">各鑑定士のプロフィールページおよび予約購入画面に税込価格で記載。</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">代金以外の付帯的費用</h3>
            <p className="text-gray-700">銀行振込の場合は振込手数料が必要です。その他、インターネット接続料金、通信料金等はお客様のご負担となります。</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">代金の支払方法</h3>
            <p className="text-gray-700">Amazon Pay、クレジットカード、銀行振込、Apple Pay、Google Pay</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">支払い時期</h3>
            <p className="text-gray-700">鑑定後4日以内</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">役務の提供時期</h3>
            <p className="text-gray-700">予約確定後、お客様が選択した予約日時</p>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-purple-700 mb-2">キャンセル・返金について</h3>
            <p className="text-gray-700">販売形態の性質上、役務提供後の返金には応じられません。</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-purple-700 mb-2">申込みの有効期限</h3>
            <p className="text-gray-700">予約完了から1時間以内に支払いが確認できない場合、自動的にキャンセル扱いとさせていただきます。</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer">
            トップページに戻る
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}