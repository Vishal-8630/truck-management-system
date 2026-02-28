/**
 * sendWhatsApp.js
 * ---------------
 * Sends WhatsApp messages via Meta Cloud API (HTTP-only, no Chrome/Puppeteer).
 * Free tier: 1000 messages/month.
 *
 * Required env vars:
 *   WHATSAPP_TOKEN      — Permanent token from Meta Business
 *   WHATSAPP_PHONE_ID   — Phone Number ID from Meta Developer Console
 *   WHATSAPP_RECIPIENTS — Comma-separated numbers e.g. 917983635608,918630836045
 */

import axios from 'axios';

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const RECIPIENTS = (process.env.WHATSAPP_RECIPIENTS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const isConfigured = () => TOKEN && PHONE_ID && RECIPIENTS.length > 0;

// ─── Core send function ───────────────────────────────────────────────────────

export const sendWhatsApp = async (message) => {
    if (!isConfigured()) {
        console.warn('[WhatsApp] Not configured — set WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_RECIPIENTS.');
        return;
    }
    for (const phone of RECIPIENTS) {
        try {
            await axios.post(
                `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'text',
                    text: { body: message }
                },
                {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(`✅ [WhatsApp] Sent to ${phone}`);
        } catch (err) {
            console.warn(`[WhatsApp] Failed to send to ${phone}:`, err.response?.data?.error?.message || err.message);
        }
    }
};

// ─── Status helper (for /api/whatsapp/status route) ──────────────────────────

export const getWhatsAppStatus = () => ({
    isReady: isConfigured(),
    provider: 'Meta Cloud API',
    recipients: RECIPIENTS.length
});

// ─── Message Builders ─────────────────────────────────────────────────────────

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
