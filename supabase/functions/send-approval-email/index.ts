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
    const { to, stageName, username, password } = await req.json();

    if (!to || !stageName || !username || !password) {
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
          .credentials { background: #fdf4ff; border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .credentials-item { margin: 10px 0; font-size: 16px; }
          .label { font-weight: bold; color: #7c3aed; }
          .value { color: #1f2937; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 占い師登録承認のお知らせ</h1>
          </div>
          <div class="content">
            <p>${stageName}様</p>
            <p>この度は占い師登録申請をいただき、誠にありがとうございます。</p>
            <p>審査の結果、<strong>登録が承認されました</strong>のでお知らせいたします。</p>
            
            <div class="credentials">
              <h3 style="margin-top: 0; color: #7c3aed;">ログイン情報</h3>
              <div class="credentials-item">
                <span class="label">ユーザー名：</span>
                <span class="value">${username}</span>
              </div>
              <div class="credentials-item">
                <span class="label">パスワード：</span>
                <span class="value">${password}</span>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ 重要</strong><br>
              このログイン情報は大切に保管してください。第三者に知られないようご注意ください。
            </div>

            <p>上記のログイン情報を使用して、占い師専用ページにログインいただけます。</p>
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            
            <div class="footer">
              <p>今後ともよろしくお願いいたします。</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
${stageName}様

この度は占い師登録申請をいただき、誠にありがとうございます。
審査の結果、登録が承認されましたのでお知らせいたします。

【ログイン情報】
ユーザー名：${username}
パスワード：${password}

⚠️ このログイン情報は大切に保管してください。

上記のログイン情報を使用して、占い師専用ページにログインいただけます。
ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願いいたします。
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
            subject: '【承認完了】占い師登録のお知らせ',
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