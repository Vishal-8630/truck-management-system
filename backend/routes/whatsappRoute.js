/**
 * whatsappRoute.js
 * ----------------
 * Provides a browser-viewable QR code page for production setup.
 * Visit: https://yourdomain.com/api/whatsapp/qr
 *
 * Protected by WHATSAPP_ADMIN_SECRET in .env — only you can access it.
 */

import express from 'express';
import { getWhatsAppStatus } from '../utils/sendWhatsApp.js';

const router = express.Router();

// Simple secret-key protection so random people can't access this
const checkSecret = (req, res, next) => {
    const secret = process.env.WHATSAPP_ADMIN_SECRET;
    const provided = req.query.secret || req.headers['x-admin-secret'];
    if (!secret || provided !== secret) {
        return res.status(403).send('Forbidden — provide ?secret=YOUR_SECRET in the URL');
    }
    next();
};

/**
 * GET /api/whatsapp/qr?secret=YOUR_SECRET
 *
 * Returns an HTML page showing:
 *  - A scannable QR code (if not yet authenticated)
 *  - A "Connected" status (if already authenticated)
 *
 * Auto-refreshes every 15 seconds so you see the latest QR.
 */
router.get('/qr', checkSecret, (req, res) => {
    const { isReady, latestQR } = getWhatsAppStatus();

    if (isReady) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>WhatsApp Status — DRL</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center;
                           justify-content: center; min-height: 100vh; margin: 0; background: #f0fdf4; }
                    .card { background: white; border-radius: 16px; padding: 48px; text-align: center;
                            box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    h1 { color: #16a34a; margin: 0 0 12px; }
                    p { color: #555; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>✅ WhatsApp Connected</h1>
                    <p>The DRL notification system is active and sending messages.</p>
                    <p style="color:#aaa; font-size:12px; margin-top:24px;">Divyanshi Road Lines — Fleet Management</p>
                </div>
            </body>
            </html>
        `);
    }

    if (!latestQR) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" http-equiv="refresh" content="5">
                <title>WhatsApp QR — DRL</title>
                <style>
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center;
                           justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
                    .card { background: white; border-radius: 16px; padding: 48px; text-align: center;
                            box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    h1 { color: #f59e0b; margin: 0 0 12px; }
                    p { color: #555; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>⏳ Waiting for QR Code...</h1>
                    <p>The WhatsApp client is initializing. This page will refresh automatically.</p>
                    <p style="color:#aaa; font-size:12px; margin-top:24px;">This usually takes 10–20 seconds on first run.</p>
                </div>
            </body>
            </html>
        `);
    }

    // Render QR as image using a public QR API
    const encodedQR = encodeURIComponent(latestQR);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedQR}`;

    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="15">
            <title>Scan WhatsApp QR — DRL</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                       display: flex; flex-direction: column; align-items: center; justify-content: center;
                       min-height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                .card { background: white; border-radius: 24px; padding: 48px; text-align: center;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-width: 420px; width: 90%; }
                h1 { color: #1a1a2e; margin: 0 0 8px; font-size: 22px; }
                .subtitle { color: #666; font-size: 14px; margin-bottom: 28px; line-height: 1.5; }
                .qr-wrap { background: white; padding: 16px; border-radius: 16px;
                           border: 3px solid #25D366; display: inline-block; margin-bottom: 24px; }
                img { display: block; }
                .steps { background: #f8f9fa; border-radius: 12px; padding: 16px; text-align: left;
                         font-size: 13px; color: #444; line-height: 1.8; margin-bottom: 20px; }
                .steps b { color: #25D366; }
                .refresh { color: #aaa; font-size: 12px; }
                .badge { background: #25D366; color: white; padding: 4px 12px; border-radius: 20px;
                         font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="badge">📱 WhatsApp Setup</span>
                <h1>Scan to Connect</h1>
                <p class="subtitle">Connect your WhatsApp to enable DRL notifications</p>
                <div class="qr-wrap">
                    <img src="${qrImageUrl}" width="260" height="260" alt="WhatsApp QR Code">
                </div>
                <div class="steps">
                    <b>Step 1</b> — Open WhatsApp on your phone<br>
                    <b>Step 2</b> — Tap ⋮ menu → <em>Linked Devices</em><br>
                    <b>Step 3</b> — Tap <em>Link a Device</em><br>
                    <b>Step 4</b> — Point camera at QR above
                </div>
                <p class="refresh">⟳ This page refreshes every 15 seconds</p>
            </div>
        </body>
        </html>
    `);
});

export default router;
