'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Fortuneteller {
  id: number;
  name: string;
  image: string;
  specialty: string[];
  experience: string;
  rating: number;
  reviews: number;
  price: string;
  available: boolean;
  description: string;
  admin_name: string | null;
  admin_specialty: string[] | null;
  admin_divination_methods: string | null;
  admin_price: string | null;
  admin_image_url: string | null;
  user_description: string | null;
  user_image_url: string | null;
  user_specialty: string[] | null;
  user_divination_methods: string | null;
  is_approved: boolean;
}

export default function FortunetellerGrid() {
  const [fortunetellers, setFortunetellers] = useState<Fortuneteller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFortunetellers();

    const channel = supabase
      .channel('fortunetellers-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fortunetellers'
        },
        (payload) => {
          console.log('占い師データが更新されました:', payload);
          fetchFortunetellers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFortunetellers = async () => {
    try {
      const { data, error } = await supabase
        .from('fortunetellers')
        .select('*')
        .eq('is_approved', true)
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabaseからのデータ取得に失敗しました:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setFortunetellers(data);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (ft: Fortuneteller) => {
    return ft.admin_name || ft.name;
  };

  const getDisplaySpecialty = (ft: Fortuneteller) => {
    if (ft.user_specialty && ft.user_specialty.length > 0) return ft.user_specialty;
    if (ft.admin_specialty && ft.admin_specialty.length > 0) return ft.admin_specialty;
    return ft.specialty;
  };

  const getDisplayPrice = (ft: Fortuneteller) => {
    return ft.admin_price || ft.price;
  };

  const getDisplayDescription = (ft: Fortuneteller) => {
    return ft.user_description || ft.description;
  };

  const getDisplayImage = (ft: Fortuneteller) => {
    if (ft.admin_image_url) {
      return ft.admin_image_url;
    }
    if (ft.user_image_url) {
      return ft.user_image_url;
    }
    return ft.image;
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-purple-600 text-lg sm:text-xl">読み込み中...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-3 sm:mb-4" translate="no">
            占い師一覧
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-600 px-4">
            あなたにぴったりの占い師を見つけてください
          </p>
        </div>

        {fortunetellers.length === 0 ? (
          <div className="text-center text-purple-600 text-base sm:text-lg py-12 sm:py-16 md:py-20">
            占い師が見つかりませんでした
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {fortunetellers.map((ft) => (
              <Link
                key={ft.id}
                href={`/profile/${ft.id}`}
                className="bg-white rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer border-2 border-pink-100"
              >
                <div className="relative h-64 sm:h-72 md:h-80">
                  <img
                    src={getDisplayImage(ft)}
                    alt={getDisplayName(ft)}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-purple-700 mb-2 sm:mb-3" translate="no">{getDisplayName(ft)}</h3>

                  <p className="text-purple-600 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
                    {getDisplayDescription(ft)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    {getDisplaySpecialty(ft).slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-semibold"
                        translate="no"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3 sm:mb-4 text-purple-600 text-sm">
                    <div className="flex items-center gap-2">
                      <i className="ri-time-line"></i>
                      <span>経験 <span translate="no">{ft.experience}</span></span>
                    </div>
                    <div className="text-purple-700 font-bold text-base sm:text-lg" translate="no">
                      {getDisplayPrice(ft)}
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer text-sm sm:text-base">
                    プロフィールを見る
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
