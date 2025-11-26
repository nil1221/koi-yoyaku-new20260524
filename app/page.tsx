'use client';

import HeroSection from './HeroSection';
import FortunetellerGrid from './FortunetellerGrid';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <HeroSection />
      <FortunetellerGrid />
      <Footer />
    </div>
  );
}
