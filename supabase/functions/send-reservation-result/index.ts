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
    const { to, customerName, fortunetellerName, reservationDate, reservationTime, status } = await req.json();

    if (!to || !customerName || !fortunetellerName || !reservationDate || !reservationTime || !status) {
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

    const isApproved = status === 'approved';
    const subject = isApproved ? '【予約確定】ご予約が確定しました' : '【予約否認】ご予約について';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isApproved ? '#10b981' : '#ef4444'} 0%, ${isApproved ? '#059669' : '#dc2626'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 2px solid #f3e8ff; border-radius: 0 0 10px 10px; }
          .info-box { background: #fdf4ff; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-item { margin: 10px 0; font-size: 16px; }
          .label { font-weight: bold; color: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">${isApproved ? '✅ 予約確定のお知らせ' : '❌ 予約否認のお知らせ'}</h1>
          </div>
          <div class="content">
            <p>${customerName}様</p>
            <p>${isApproved ? 'ご予約が確定いたしました。' : '誠に申し訳ございませんが、ご希望の日時でのご予約をお受けすることができませんでした。'}</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #7c3aed;">予約情報</h3>
              <div class="info-item">
                <span class="label">占い師：</span>
                <span>${fortunetellerName}</span>
              </div>
              <div class="info-item">
                <span class="label">予約日時：</span>
                <span>${reservationDate} ${reservationTime}</span>
              </div>
              <div class="info-item">
                <span class="label">ステータス：</span>
                <span style="color: ${isApproved ? '#10b981' : '#ef4444'}; font-weight: bold;">${isApproved ? '承認済み' : '否認'}</span>
              </div>
            </div>

            ${isApproved ? '<p>当日は予約時間の5分前までにご準備をお願いいたします。</p>' : '<p>別の日時でのご予約をご検討いただけますと幸いです。</p>'}
            
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
${customerName}様

${isApproved ? 'ご予約が確定いたしました。' : '誠に申し訳ございませんが、ご希望の日時でのご予約をお受けすることができませんでした。'}

【予約情報】
占い師：${fortunetellerName}
予約日時：${reservationDate} ${reservationTime}
ステータス：${isApproved ? '承認済み' : '否認'}

${isApproved ? '当日は予約時間の5分前までにご準備をお願いいたします。' : '別の日時でのご予約をご検討いただけますと幸いです。'}

ご不明な点がございましたら、お気軽にお問い合わせください。
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
            subject: subject,
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
