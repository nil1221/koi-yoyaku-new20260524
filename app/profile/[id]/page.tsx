import { Suspense } from 'react';
import ProfileContent from './ProfileContent';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
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