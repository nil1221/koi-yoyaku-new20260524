import type { Metadata } from "next";
import { Noto_Sans_JP, Pacifico } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "【成就率98%超え】ツインレイの復縁・統合を叶える電話占いkoi",
  description: "電話占いkoiは、ツインレイ、復縁専門の厳選鑑定士が在籍。土岐天命先生、朝日恋先生、恋歌先生をはじめとした激選された実力は占い師があなたの未来を徹底鑑定します。今すぐ奇跡の復縁を体験し、運命を変えましょう。",
  keywords: "電話占い, 電話占いkoi, ツインレイ, ツインレイ 恋愛, ツインレイ 復縁, ツインレイ 統合, 土岐天命, 朝日恋, 恋歌, 復縁, 魂の片割れ, ソウルメイト, 恋愛成就, 片思い, 複雑愛, 不倫, 縁結び, ココナラ, ヴェルニ, カリス, ピュアリ, ウィル",
  icons: {
    icon: "https://static.readdy.ai/image/ff8e23331dbd230d1a8eee4fca61d586/c150b089b34e410397da5e80ef697aaf.jpeg",
  },
  openGraph: {
    title: "【成就率98%超え】ツインレイの復縁・統合を叶える電話占いkoi",
    description: "電話占いkoiは、ツインレイ、復縁専門の厳選鑑定士が在籍。土岐天命先生、朝日恋先生、恋歌先生をはじめとした激選された実力は占い師があなたの未来を徹底鑑定します。今すぐ奇跡の復縁を体験し、運命を変えましょう。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "【成就率98%超え】ツインレイの復縁・統合を叶える電話占いkoi",
    description: "電話占いkoiは、ツインレイ、復縁専門の厳選鑑定士が在籍。土岐天命先生、朝日恋先生、恋歌先生をはじめとした激選された実力は占い師があなたの未来を徹底鑑定します。今すぐ奇跡の復縁を体験し、運命を変えましょう。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <head>
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "電話占いkoi",
              "description": "ツインレイ、復縁専門の電話占いサービス。経験豊富な鑑定士があなたの恋愛をサポートします。",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "",
              "telephone": "03-5789-5267",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "恵比寿4-20-3 恵比寿ガーデンプレイスタワー18階",
                "addressLocality": "渋谷区",
                "addressRegion": "東京都",
                "addressCountry": "JP"
              },
              "priceRange": "130円～700円/分",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1250"
              }
            })
          }}
        />
      </head>
      <body
        className={`${notoSansJP.variable} ${pacifico.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
