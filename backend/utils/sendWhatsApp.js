/**
 * sendWhatsApp.js
 * ---------------
 * Singleton WhatsApp client powered by whatsapp-web.js.
 * This version uses RemoteAuth (S3) so it works on Render without
 * losing the session on every restart.
 */

import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsS3Store } from 'wwebjs-aws-s3';

const { Client, RemoteAuth, MessageMedia } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client = null;
let isReady = false;
let initCalled = false;
let latestQR = null;

const RECIPIENTS = (() => {
    try {
        return JSON.parse(process.env.WHATSAPP_RECIPIENTS || '[]')
            .map(r => r.phone)
            .filter(Boolean);
    } catch {
        return [];
    }
})();

// ─── Initialise ───────────────────────────────────────────────────────────────

export const initWhatsApp = () => {
    if (initCalled) return;
    initCalled = true;

    // Use existing AWS credentials for WhatsApp Session Storage
    const s3 = new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    const store = new AwsS3Store({
        bucketName: process.env.S3_BUCKET_NAME,
        remoteDataPath: 'whatsapp_session/',
        s3Client: s3,
    });

    client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 600000, // Sync session to S3 every 10 mins
            clientId: 'DRL_FLEET_SYSTEM'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        }
    });

    client.on('qr', (qr) => {
        latestQR = qr;
        console.log('\n📱 Render QR Code — Scan in WhatsApp > Linked Devices:\n');
        qrcode.generate(qr, { small: true });
        console.log('\n⏳ Waiting for scan (Visit domain/api/whatsapp/qr if needed)...\n');
    });

    client.on('remote_session_saved', () => {
        console.log('✅ [WhatsApp] Session backed up to S3 successfully!');
    });

    client.on('authenticated', () => {
        latestQR = null;
        console.log('✅ [WhatsApp] Authenticated!');
    });

    client.on('ready', () => {
        isReady = true;
        latestQR = null;
        console.log('🟢 [WhatsApp] Client is ready — notifications enabled on Render.');
    });

    client.on('disconnected', (reason) => {
        isReady = false;
        console.warn('🔴 [WhatsApp] Client disconnected:', reason);
        setTimeout(() => client.initialize(), 10000);
    });

    client.on('auth_failure', (msg) => {
        isReady = false;
        console.error('❌ [WhatsApp] Auth failure:', msg);
    });

    client.initialize();
};

export const getWhatsAppStatus = () => ({ isReady, latestQR });

// ─── Send helpers ─────────────────────────────────────────────────────────────

export const sendWhatsApp = async (message) => {
    if (!client || !isReady || !RECIPIENTS.length) return;
    for (const phone of RECIPIENTS) {
        try {
            await client.sendMessage(phone.replace(/\D/g, '') + '@c.us', message);
            console.log(`✅ [WhatsApp] Sent to ${phone}`);
        } catch (err) {
            console.warn(`[WhatsApp] Failed to ${phone}:`, err.message);
        }
    }
};

export const sendWhatsAppPDF = async (pdfBuffer, filename, caption = '') => {
    if (!client || !isReady || !RECIPIENTS.length) return;
    for (const phone of RECIPIENTS) {
        try {
            const media = new MessageMedia('application/pdf', pdfBuffer.toString('base64'), filename);
            await client.sendMessage(phone.replace(/\D/g, '') + '@c.us', media, { caption });
            console.log(`✅ [WhatsApp] PDF sent to ${phone}`);
        } catch (err) {
            console.warn(`[WhatsApp] PDF failed to ${phone}:`, err.message);
        }
    }
};

// ─── Message Builders (Same as before) ────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const LINE = '━━━━━━━━━━━━━━━━━━━━━━';
const FOOTER = `\n${LINE}\n📍 _Divyanshi Road Lines_`;

export const WA = {
    newJourney: (j) => `🚛 *New Journey Created*\n${LINE}\n🔹 Truck: *${j.truck?.truck_no || 'N/A'}*\n🔹 Driver: *${j.driver?.name || 'N/A'}*\n🔹 Route: ${j.from || '?'} → ${j.to || '?'}\n🔹 Start: ${j.journey_start_date || 'N/A'}\n🔹 Starting KMs: ${j.starting_kms || 'N/A'}` + FOOTER,
    journeySettled: (j) => `✅ *Journey Settled*\n${LINE}\n🔹 Truck: *${j.truck?.truck_no || 'N/A'}*\n🔹 Driver: *${j.driver?.name || 'N/A'}*\n💰 Amount Paid: *₹${fmt(j.settlement?.amount_paid)}*\n🔹 Mode: ${j.settlement?.mode || 'Cash'}` + FOOTER,
    newDriverSettlement: ({ driver, totals, period, journeys }) => `📋 *Driver Settlement Created*\n${LINE}\n🔹 Driver: *${driver?.name || 'N/A'}*\n🔹 Period: ${period?.from} → ${period?.to}\n💰 Final: *₹${fmt(Math.abs(totals.overall_total))}*` + FOOTER,
    settlementMarkedSettled: (s) => `🏦 *Settlement Finalised — PAID* ✅\n${LINE}\n💰 Amount: *₹${fmt(Math.abs(s.overall_total))}*` + FOOTER,
    settlementMarkedUnpaid: (s) => `🔄 *Settlement Reopened — UNPAID* ⚠️\n${LINE}\n💰 Amount: *₹${fmt(Math.abs(s.overall_total))}*` + FOOTER,
    newDriver: (d) => `👤 *New Driver Registered*\n${LINE}\n🔹 Name: *${d.name || 'N/A'}*\n🔹 Phone: ${d.phone || 'N/A'}` + FOOTER,
    newTruck: (t) => `🚚 *New Truck Registered*\n${LINE}\n🔹 Reg No: *${t.truck_no || 'N/A'}*` + FOOTER,
    newBillEntry: (e) => `🧾 *New Bill Entry Created*\n${LINE}\n🔹 LR No: *${e.lr_no}*\n🔹 Party: ${e.billing_party?.party_name}\n💰 Freight: ₹${fmt(e.freight)}` + FOOTER,
    truckDocExpiry: (alerts) => alerts.length ? `🔔 *Truck Document Expiry Alert*\n${LINE}\n` + alerts.map(a => `🚛 *${a.truck_no}* — ${a.doc}\n   ${a.days === 0 ? '🔴 TODAY' : `⚠️ ${a.days} days`} left`).join('\n\n') + FOOTER : null,
    partyPaymentDue: (dues) => dues.length ? `💳 *Party Payment Due Alert*\n${LINE}\n` + dues.map(d => `📦 *${d.truck_no}*\n   Due: ${d.due_date} (${d.days === 0 ? '🔴 TODAY' : `⚠️ ${d.days} days`})`).join('\n\n') + FOOTER : null,
    journeyEndingSoon: (j) => j.length ? `📅 *Journey Ending Soon*\n${LINE}\n` + j.map(x => `🚛 *${x.truck_no}* — ${x.from} → ${x.to}\n   End: ${x.journey_end_date}`).join('\n\n') + FOOTER : null,
};
