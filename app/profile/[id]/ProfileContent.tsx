'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ReservationModal from './ReservationModal';

interface Fortuneteller {
  id: number;
  name: string;
  specialty: string[];
  divination_methods: string;
  price: string;
  description: string;
  image: string;
  available: boolean;
  email: string;
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
}

interface ProfileContentProps {
  fortunetellerId: string;
}

export default function ProfileContent({ fortunetellerId }: ProfileContentProps) {
  const [fortuneteller, setFortuneteller] = useState<Fortuneteller | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  useEffect(() => {
    if (fortunetellerId) {
      fetchFortunetellerData(fortunetellerId);
    }
  }, [fortunetellerId]);

  const fetchFortunetellerData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('fortunetellers')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setFortuneteller(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!fortuneteller) return '';
    return fortuneteller.admin_name || fortuneteller.name;
  };

  const getDisplaySpecialty = () => {
    if (!fortuneteller) return [];
    if (fortuneteller.user_specialty && fortuneteller.user_specialty.length > 0) return fortuneteller.user_specialty;
    if (fortuneteller.admin_specialty && fortuneteller.admin_specialty.length > 0) return fortuneteller.admin_specialty;
    return fortuneteller.specialty;
  };

  const getDisplayDivinationMethods = () => {
    if (!fortuneteller) return '';
    if (fortuneteller.user_divination_methods) return fortuneteller.user_divination_methods;
    if (fortuneteller.admin_divination_methods) return fortuneteller.admin_divination_methods;
    return fortuneteller.divination_methods;
  };

  const getDisplayPrice = () => {
    if (!fortuneteller) return '';
    return fortuneteller.admin_price || fortuneteller.price;
  };

  const getDisplayImage = () => {
    if (!fortuneteller) return '';
    if (fortuneteller.admin_image_url) return fortuneteller.admin_image_url;
    if (fortuneteller.user_image_url) return fortuneteller.user_image_url;
    return fortuneteller.image;
  };

  const getDisplayDescription = () => {
    if (!fortuneteller) return '';
    return fortuneteller.user_description || fortuneteller.description;
  };

  const getDisplaySnsLinks = () => {
    if (!fortuneteller || !fortuneteller.user_sns_links) return [];
    
    const snsConfig = [
      { key: 'line', label: 'LINE', icon: 'ri-line-fill', color: 'bg-green-500 hover:bg-green-600' },
      { key: 'instagram', label: 'Instagram', icon: 'ri-instagram-line', color: 'bg-pink-500 hover:bg-pink-600' },
      { key: 'twitter', label: 'X', icon: 'ri-twitter-x-line', color: 'bg-gray-800 hover:bg-gray-900' },
      { key: 'youtube', label: 'YouTube', icon: 'ri-youtube-fill', color: 'bg-red-500 hover:bg-red-600' },
      { key: 'ameblo', label: 'アメブロ', icon: 'ri-article-line', color: 'bg-orange-500 hover:bg-orange-600' },
      { key: 'note', label: 'note', icon: 'ri-file-text-line', color: 'bg-teal-500 hover:bg-teal-600' },
      { key: 'tiktok', label: 'TikTok', icon: 'ri-music-2-line', color: 'bg-black hover:bg-gray-800' }
    ];

    return snsConfig
      .filter(sns => fortuneteller.user_sns_links[sns.key] && fortuneteller.user_sns_links[sns.key].trim() !== '')
      .map(sns => ({
        ...sns,
        url: fortuneteller.user_sns_links[sns.key]
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-purple-600 text-lg sm:text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!fortuneteller) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">占い師が見つかりません</h1>
          <Link href="/" className="text-purple-600 hover:text-pink-500 transition-colors cursor-pointer">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const snsLinks = getDisplaySnsLinks();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 cursor-pointer" translate="no">
            電話占いkoi予約
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-pink-100 to-purple-100 p-6 sm:p-8 flex items-center justify-center">
              <img
                src={getDisplayImage()}
                alt={getDisplayName()}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg"
              />
            </div>

            <div className="md:w-2/3 p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4" translate="no">{getDisplayName()}</h1>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2" translate="no">得意鑑定</h3>
                  <div className="flex flex-wrap gap-2">
                    {getDisplaySpecialty().map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm whitespace-nowrap"
                        translate="no"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2" translate="no">使用占術</h3>
                  <p className="text-gray-700 text-sm sm:text-base" translate="no">{getDisplayDivinationMethods()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2" translate="no">料金</h3>
                  <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500" translate="no">
                    {getDisplayPrice()}
                  </p>
                </div>

                {snsLinks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">SNS</h3>
                    <div className="flex flex-wrap gap-2">
                      {snsLinks.map((sns) => (
                        <a
                          key={sns.key}
                          href={sns.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 ${sns.color} text-white rounded-lg transition-colors cursor-pointer`}
                        >
                          <i className={`${sns.icon} w-4 h-4 flex items-center justify-center`}></i>
                          <span className="text-xs sm:text-sm font-medium whitespace-nowrap" translate="no">{sns.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsReservationModalOpen(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all whitespace-nowrap cursor-pointer text-sm sm:text-base"
              >
                今すぐ予約する
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4" translate="no">プロフィール</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {getDisplayDescription()}
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Link href="/" className="text-purple-600 hover:text-pink-500 transition-colors cursor-pointer text-sm sm:text-base">
            ← 占い師一覧に戻る
          </Link>
        </div>
      </main>

      {fortuneteller && (
        <ReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          fortunetellerId={fortuneteller.id}
          fortunetellerName={fortuneteller.name}
          fortunetellerEmail={fortuneteller.email}
        />
      )}
    </div>
  );
}