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
    const { isReady, provider, recipients } = getWhatsAppStatus();
    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>WhatsApp Status — DRL</title>
            <style>
                body { font-family: sans-serif; display: flex; align-items: center; justify-content: center;
                       min-height: 100vh; margin: 0; background: ${isReady ? '#f0fdf4' : '#fff7ed'}; }
                .card { background: white; border-radius: 16px; padding: 48px; text-align: center;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 400px; width: 90%; }
                h1 { color: ${isReady ? '#16a34a' : '#d97706'}; margin: 0 0 12px; }
                p { color: #555; }
                .badge { background: ${isReady ? '#dcfce7' : '#fef3c7'}; color: ${isReady ? '#166534' : '#92400e'};
                         padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
                .detail { font-size: 13px; color: #888; margin-top: 8px; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">${isReady ? '✅ Active' : '⚠️ Not Configured'}</span>
                <h1>${isReady ? 'WhatsApp Connected' : 'WhatsApp Not Set Up'}</h1>
                <p>Provider: <strong>${provider}</strong></p>
                <p>Recipients configured: <strong>${recipients}</strong></p>
                ${!isReady ? `<p style="color:#d97706; margin-top:16px;">Set <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_ID</code>, and <code>WHATSAPP_RECIPIENTS</code> in Render environment variables.</p>` : ''}
                <p class="detail">Divyanshi Road Lines — Fleet Management</p>
            </div>
        </body>
        </html>
    `);
});

export default router;
