import express from 'express';
import { getWhatsAppStatus } from '../utils/sendWhatsApp.js';

const router = express.Router();

const checkSecret = (req, res, next) => {
    const secret = process.env.WHATSAPP_ADMIN_SECRET;
    const provided = req.query.secret || req.headers['x-admin-secret'];
    if (!secret || provided !== secret) {
        return res.status(403).send('Forbidden — provide ?secret=YOUR_SECRET in the URL');
    }
    next();
};

router.get('/status', checkSecret, (req, res) => {
    const { isReady, provider, recipients, qr } = getWhatsAppStatus();

    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WhatsApp Status — DRL</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center;
                       min-height: 100vh; margin: 0; background: ${isReady ? '#f0fdf4' : '#fff7ed'}; }
                .card { background: white; border-radius: 20px; padding: 40px; text-align: center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-width: 450px; width: 90%; }
                h1 { color: #1e293b; margin: 0 0 10px; font-size: 24px; }
                p { color: #64748b; margin-bottom: 24px; }
                .badge { background: ${isReady ? '#dcfce7' : '#fef3c7'}; color: ${isReady ? '#166534' : '#92400e'};
                         padding: 6px 16px; border-radius: 30px; font-size: 14px; font-weight: 700; display: inline-block; margin-bottom: 24px; }
                #qrcode { display: flex; justify-content: center; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px; }
                .instructions { font-size: 14px; color: #475569; background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: left; }
                .stats { display: flex; justify-content: space-around; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .stat-item { text-align: center; }
                .stat-val { display: block; font-weight: 800; color: #1e293b; font-size: 18px; }
                .stat-lbl { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">${isReady ? '✅ Connected' : qr ? '📲 Scan QR Code' : '⏳ Initializing...'}</span>
                <h1>WhatsApp Business</h1>
                <p>Status for <strong>Divyanshi Road Lines</strong></p>

                ${qr ? `
                    <div id="qrcode"></div>
                    <script>
                        new QRCode(document.getElementById("qrcode"), {
                            text: "${qr}",
                            width: 256,
                            height: 256,
                            colorDark : "#000000",
                            colorLight : "#ffffff",
                            correctLevel : QRCode.CorrectLevel.H
                        });
                    </script>
                    <div class="instructions">
                        <strong>How to connect:</strong>
                        <ol style="margin: 8px 0 0; padding-left: 20px;">
                            <li>Open WhatsApp on your phone</li>
                            <li>Tap Menu or Settings and select Linked Devices</li>
                            <li>Point your phone to this screen to capture the code</li>
                        </ol>
                    </div>
                ` : isReady ? `
                    <div style="padding: 40px 0; color: #16a34a;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <p style="margin-top: 15px; font-weight: 600;">System is authenticated and ready.</p>
                    </div>
                ` : `
                    <div style="padding: 40px 0; color: #94a3b8;">
                        <p>The WhatsApp client is currently paused or initializing.</p>
                        <p style="font-size:13px;">(Uncomment the code in <code>sendWhatsApp.js</code> when RAM is upgraded)</p>
                    </div>
                `}

                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-val">${provider.split(' ')[0]}</span>
                        <span class="stat-lbl">Method</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-val">${recipients}</span>
                        <span class="stat-lbl">Recipients</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

export default router;
