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
    const { fortunetellerId, fortunetellerName, requestContent } = await req.json();

    if (!fortunetellerId || !fortunetellerName || !requestContent) {
      return new Response(
        JSON.stringify({ error: '必須パラメータが不足しています' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL');
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    
    if (!SENDGRID_API_KEY || !FROM_EMAIL || !ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({ error: 'メール送信の設定が完了していません' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          .value { color: #1f2937; }
          .request-content { background: #fff; border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 5px; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📝 プロフィール変更依頼</h1>
          </div>
          <div class="content">
            <p>占い師から以下の変更依頼が届きました。</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #7c3aed;">依頼者情報</h3>
              <div class="info-item">
                <span class="label">占い師ID：</span>
                <span class="value">${fortunetellerId}</span>
              </div>
              <div class="info-item">
                <span class="label">芸名：</span>
                <span class="value">${fortunetellerName}</span>
              </div>
            </div>

            <h3 style="color: #7c3aed;">変更依頼内容</h3>
            <div class="request-content">${requestContent}</div>

            <p style="margin-top: 30px;">管理画面から対応をお願いいたします。</p>
            
            <div class="footer">
              <p>このメールは自動送信されています。</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
占い師から以下の変更依頼が届きました。

【依頼者情報】
占い師ID：${fortunetellerId}
芸名：${fortunetellerName}

【変更依頼内容】
${requestContent}

管理画面から対応をお願いいたします。

このメールは自動送信されています。
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
            to: [{ email: ADMIN_EMAIL }],
            subject: `【変更依頼】${fortunetellerName}さんからプロフィール変更依頼`,
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