import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      fortunetellerName, 
      customerName, 
      customerGender,
      customerAge,
      customerBirthDate,
      customerPhone,
      customerEmail,
      customerAddress,
      reservationDate, 
      reservationTime, 
      duration, 
      reservationId 
    } = await req.json();

    if (!to || !fortunetellerName || !customerName || !reservationDate || !reservationTime || !duration || !reservationId) {
      return new Response(
        JSON.stringify({ error: '必須パラメータが不足しています' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL');
    
    if (!SENDGRID_API_KEY || !FROM_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'メール送信の設定が完了していません' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://your-site.com';
    const approveUrl = `${SITE_URL}/api/reservation-response?id=${reservationId}&action=approve`;
    const rejectUrl = `${SITE_URL}/api/reservation-response?id=${reservationId}&action=reject`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #f3e8ff; border-radius: 0 0 10px 10px; }
          .info-box { background: #fdf4ff; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-item { margin: 10px 0; font-size: 16px; }
          .label { font-weight: bold; color: #7c3aed; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 15px 40px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
          .approve-btn { background: #10b981; color: white; }
          .reject-btn { background: #ef4444; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📅 新しい予約申し込み</h1>
          </div>
          <div class="content">
            <p>${fortunetellerName}様</p>
            <p>新しい予約申し込みがありました。</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #7c3aed;">予約情報</h3>
              <div class="info-item">
                <span class="label">予約日時：</span>
                <span>${reservationDate} ${reservationTime}〜（${duration}分）</span>
              </div>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #7c3aed;">お客様情報</h3>
              <div class="info-item">
                <span class="label">お名前：</span>
                <span>${customerName}</span>
              </div>
              <div class="info-item">
                <span class="label">性別：</span>
                <span>${customerGender || '未入力'}</span>
              </div>
              <div class="info-item">
                <span class="label">年齢：</span>
                <span>${customerAge ? `${customerAge}歳` : '未入力'}</span>
              </div>
              <div class="info-item">
                <span class="label">生年月日：</span>
                <span>${customerBirthDate || '未入力'}</span>
              </div>
              <div class="info-item">
                <span class="label">電話番号：</span>
                <span>${customerPhone || '未入力'}</span>
              </div>
              <div class="info-item">
                <span class="label">メールアドレス：</span>
                <span>${customerEmail || '未入力'}</span>
              </div>
              <div class="info-item">
                <span class="label">住所：</span>
                <span>${customerAddress || '未入力'}</span>
              </div>
            </div>

            <div class="button-container">
              <a href="${approveUrl}" class="button approve-btn">承認する</a>
              <a href="${rejectUrl}" class="button reject-btn">否認する</a>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              または、管理画面から対応することもできます。
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
${fortunetellerName}様

新しい予約申し込みがありました。

【予約情報】
予約日時：${reservationDate} ${reservationTime}〜（${duration}分）

【お客様情報】
お名前：${customerName}
性別：${customerGender || '未入力'}
年齢：${customerAge ? `${customerAge}歳` : '未入力'}
生年月日：${customerBirthDate || '未入力'}
電話番号：${customerPhone || '未入力'}
メールアドレス：${customerEmail || '未入力'}
住所：${customerAddress || '未入力'}

承認する場合：${approveUrl}
否認する場合：${rejectUrl}

または、管理画面から対応することもできます。
    `;

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: '【新規予約】予約申し込みがありました',
          },
        ],
        from: { email: FROM_EMAIL },
        content: [
          {
            type: 'text/plain',
            value: emailText,
          },
          {
            type: 'text/html',
            value: emailHtml,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`SendGrid API Error: ${res.status} - ${errorData}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'メールを送信しました' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('メール送信エラー:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});