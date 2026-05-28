import { Suspense } from 'react';
import ProfileContent from './ProfileContent';

export async function generateStaticParams() {
  // 手動で増やさず、1から50までのID（'1'〜'50'）を自動で生成します
  return Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default async function FortunetellerProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-600 text-xl">読み込み中...</div>
      </div>
    }>
      <ProfileContent fortunetellerId={resolvedParams.id} />
    </Suspense>
  );
}