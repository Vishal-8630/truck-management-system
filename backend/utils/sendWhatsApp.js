/**
 * sendWhatsApp.js
 * ---------------
 * IMPLEMENTATION: whatsapp-web.js (Requires Puppeteer/Chrome)
 * STATUS: COMMENTED OUT (To prevent Render Free Tier crashes)
 * 
 * Instructions:
 * 1. To enable, uncomment the initialization and logic below.
 * 2. Ensure your Render plan has at least 2GB RAM.
 */

/*
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';

let clientReady = false;
let qrCodeData = null;

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "drl-session" }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        executablePath: process.env.CHROME_PATH || null // For Render/Linux environments
    }
});

client.on('qr', (qr) => {
    qrCodeData = qr;
    console.log('[WhatsApp] Scan this QR code in the status page or terminal:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    clientReady = true;
    qrCodeData = null;
    console.log('[WhatsApp] Client is ready!');
});

client.on('authenticated', () => console.log('[WhatsApp] Authenticated!'));
client.on('auth_failure', msg => console.error('[WhatsApp] Auth failure:', msg));

// Initialize only if not specifically disabled
// (Uncomment client.initialize() when ready to use)
// client.initialize();
*/

// --- Helper for Recipients ---
// Supports old JSON format or new comma-separated string
const getRecipients = () => {
    const raw = process.env.WHATSAPP_RECIPIENTS || '';
    if (raw.startsWith('[')) {
        try {
            const parsed = JSON.parse(raw);
            return parsed.map(item => Object.values(item)[0].trim());
        } catch (e) { return []; }
    }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
};

// --- Active (No-Op) Exports to prevent crashes ---

/**
 * sendWhatsApp
 * Sends a text message.
 */
export const sendWhatsApp = async (message) => {
    console.log('[WhatsApp-Log Only] Message:', message);
    /*
    if (!clientReady) return;
    const recipients = getRecipients();
    for (const phone of recipients) {
        try {
            const formatted = phone.includes('@c.us') ? phone : `${phone}@c.us`;
            await client.sendMessage(formatted, message);
            console.log(`✅ [WhatsApp] Message sent to ${phone}`);
        } catch (err) {
            console.error(`❌ [WhatsApp] Failed to send to ${phone}:`, err.message);
        }
    }
    */
};

/**
 * sendWhatsAppPDF
 * Sends a PDF document.
 */
export const sendWhatsAppPDF = async (pdfBuffer, fileName, caption) => {
    console.log('[WhatsApp-Log Only] PDF Document:', fileName);
    /*
    if (!clientReady) return;
    const recipients = getRecipients();
    const media = new MessageMedia('application/pdf', pdfBuffer.toString('base64'), fileName);
    
    for (const phone of recipients) {
        try {
            const formatted = phone.includes('@c.us') ? phone : `${phone}@c.us`;
            await client.sendMessage(formatted, media, { caption });
            console.log(`✅ [WhatsApp] PDF sent to ${phone}`);
        } catch (err) {
            console.error(`❌ [WhatsApp] Failed to send PDF to ${phone}:`, err.message);
        }
    }
    */
};

/**
 * getWhatsAppStatus
 * Used by the status route.
 */
export const getWhatsAppStatus = () => ({
    isReady: false, // clientReady
    provider: 'whatsapp-web.js (PAUSED)',
    qr: null, // qrCodeData
    recipients: getRecipients().length
});

// --- Constants & Message Builders ---
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const LINE = '━━━━━━━━━━━━━━━━━━━━━━';
const FOOTER = `\n${LINE}\n📍 _Divyanshi Road Lines_`;

export const WA = {
    newJourney: (j) =>
        `🚛 *New Journey Created*\n${LINE}\n` +
        `🔹 Truck: *${j.truck?.truck_no || 'N/A'}*\n` +
        `🔹 Driver: *${j.driver?.name || 'N/A'}*\n` +
        `🔹 Route: ${j.from || '?'} → ${j.to || '?'}\n` +
        `🔹 Start KMs: ${j.starting_kms || 'N/A'}` + FOOTER,

    journeySettled: (j) =>
        `✅ *Journey Settled*\n${LINE}\n` +
        `🔹 Truck: *${j.truck?.truck_no || 'N/A'}*\n` +
        `🔹 Driver: *${j.driver?.name || 'N/A'}*\n` +
        `🔹 Route: ${j.from || '?'} → ${j.to || '?'}` + FOOTER,

    settlementPaid: (s) =>
        `🏦 *Driver Settlement — PAID ✅*\n${LINE}\n` +
        `👤 Driver: *${s.driver?.name || 'N/A'}*\n` +
        `💰 Amount: *₹${fmt(Math.abs(s.overall_total))}*` + FOOTER,

    newBillEntry: (e) =>
        `🧾 *New Bill Entry Created*\n${LINE}\n` +
        `🔹 LR No: *${e.lr_no || 'N/A'}*\n` +
        `🔹 Party: ${e.billing_party?.party_name || 'N/A'}\n` +
        `💰 Freight: ₹${fmt(e.freight)}` + FOOTER,

    dailySummary: ({ date, activeJourneys, pendingSettlements, monthlyBills, monthlyRevenue, docAlerts, paymentDues, endingSoon }) => {
        let msg = `📊 *DRL Morning Report — ${date}*\n${LINE}\n`;
        msg += `🚛 Active Journeys: *${activeJourneys}*\n`;
        msg += `📋 Pending Settlements: *${pendingSettlements}*\n`;
        msg += `🧾 Bills this month: *${monthlyBills}* | ₹${fmt(monthlyRevenue)}\n`;

        if (docAlerts.length) {
            msg += `\n⚠️ *Document Expiry (≤3 days):*\n`;
            docAlerts.forEach(a => {
                const when = a.days === 0 ? '🔴 Today!' : `${a.days} day${a.days > 1 ? 's' : ''}`;
                msg += `  🚚 ${a.truck_no} — ${a.doc} (${when})\n`;
            });
        }

        if (paymentDues.length) {
            msg += `\n💳 *Party Payments Due (≤3 days):*\n`;
            paymentDues.forEach(d => {
                const when = d.days === 0 ? '🔴 Today!' : `${d.days} day${d.days > 1 ? 's' : ''}`;
                msg += `  📦 ${d.truck_no} — ${d.from}→${d.to} (${when})\n`;
            });
        }

        if (endingSoon.length) {
            msg += `\n🚛 *Journeys Ending Soon (≤3 days):*\n`;
            endingSoon.forEach(j => {
                msg += `  ${j.truck_no} | ${j.from}→${j.to} — ${j.journey_end_date}\n`;
            });
        }

        if (!docAlerts.length && !paymentDues.length && !endingSoon.length) {
            msg += `\n✅ No urgent alerts today.\n`;
        }

        msg += FOOTER;
        return msg;
    },
};
