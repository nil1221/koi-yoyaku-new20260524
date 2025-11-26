import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-50 to-purple-50 py-8 sm:py-10 md:py-12 px-4 border-t-2 border-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 md:gap-8 mb-6 sm:mb-7 md:mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-3 sm:mb-4" translate="no">
              電話占いkoi予約
            </h3>
            <p className="text-purple-600 text-sm sm:text-base">
              あなたの未来を照らす、信頼できる占い師との出会い
            </p>
          </div>

          <div>
            <div className="flex flex-col gap-2">
              <Link href="/guide" className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer text-sm sm:text-base">
                利用ガイド
              </Link>
              <Link href="/legal" className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer text-sm sm:text-base">
                特定商取引法に基づく表記
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-200 pt-6 sm:pt-7 md:pt-8 text-center text-purple-600 text-sm sm:text-base">
          <p translate="no">Copyright © 2025 電話占いkoi予約</p>
        </div>
      </div>
    </footer>
  );
}
