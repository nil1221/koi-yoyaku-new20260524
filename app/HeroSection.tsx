'use client';

import { useState } from 'react';

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section className="relative bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 sm:mb-5 md:mb-6">
            <span translate="no">ツインレイ</span>の願いを叶える
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-purple-700 mb-6 sm:mb-7 md:mb-8 px-4">
            経験豊富な占い師があなたの恋愛をサポートします
          </p>
        </div>
      </div>
    </section>
  );
}
