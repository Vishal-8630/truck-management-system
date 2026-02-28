/**
 * whatsappScheduler.js
 * --------------------
 * Runs daily at 8:00 AM to send proactive WhatsApp alerts:
 *  1. Truck documents expiring within 3 days
 *  2. Party payments due within 3 days
 *  3. Journeys expected to end within 3 days (still active)
 *
 * Call initScheduler() once from server.js after initWhatsApp().
 */

import Truck from '../models/truckModel.js';
import TruckJourney from '../models/truckJourneyModel.js';
import { sendWhatsApp, WA } from './sendWhatsApp.js';

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Days until a date string (YYYY-MM-DD). Returns -1 if invalid/past. */
const daysUntil = (dateStr) => {
    if (!dateStr) return -1;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    return diff;
};

const ALERT_WINDOW = 3; // days

// ─── Individual checks ────────────────────────────────────────────────────────

const checkTruckDocuments = async () => {
    const trucks = await Truck.find({ is_deleted: false }).lean();

    const DOC_FIELDS = [
        { field: 'fitness_doc_expiry', label: 'Fitness Certificate' },
        { field: 'insurance_doc_expiry', label: 'Insurance' },
        { field: 'national_permit_doc_expiry', label: 'National Permit' },
        { field: 'state_permit_doc_expiry', label: 'State Permit' },
        { field: 'tax_doc_expiry', label: 'Road Tax' },
        { field: 'pollution_doc_expiry', label: 'Pollution Certificate' },
    ];

    const alerts = [];
    for (const truck of trucks) {
        for (const { field, label } of DOC_FIELDS) {
            const days = daysUntil(truck[field]);
            if (days >= 0 && days <= ALERT_WINDOW) {
                alerts.push({ truck_no: truck.truck_no, doc: label, days, expiry: truck[field] });
            }
        }
    }

    if (alerts.length) {
        const msg = WA.truckDocExpiry(alerts);
        if (msg) await sendWhatsApp(msg);
        console.log(`[Scheduler] Sent truck doc expiry alert (${alerts.length} items)`);
    }
};

const checkPartyPaymentDues = async () => {
    const journeys = await TruckJourney.find({
        is_deleted: false,
        party_payment_status: { $ne: 'Paid' },
        party_payment_due_date: { $ne: null, $exists: true }
    }).populate('truck').lean();

    const dues = journeys
        .map(j => {
            const days = daysUntil(j.party_payment_due_date);
            return { ...j, days };
        })
        .filter(j => j.days >= 0 && j.days <= ALERT_WINDOW)
        .map(j => ({
            truck_no: j.truck?.truck_no || 'N/A',
            from: j.from,
            to: j.to,
            due_date: j.party_payment_due_date,
            days: j.days,
            status: j.party_payment_status
        }));

    if (dues.length) {
        const msg = WA.partyPaymentDue(dues);
        if (msg) await sendWhatsApp(msg);
        console.log(`[Scheduler] Sent party payment due alert (${dues.length} items)`);
    }
};

const checkJourneysEndingSoon = async () => {
    const journeys = await TruckJourney.find({
        is_deleted: false,
        status: 'Active',
        journey_end_date: { $exists: true, $ne: null }
    }).populate('truck').populate('driver').lean();

    const ending = journeys
        .map(j => ({ ...j, days: daysUntil(j.journey_end_date) }))
        .filter(j => j.days >= 0 && j.days <= ALERT_WINDOW)
        .map(j => ({
            truck_no: j.truck?.truck_no || 'N/A',
            from: j.from,
            to: j.to,
            driver_name: j.driver?.name || 'N/A',
            journey_end_date: j.journey_end_date,
            days: j.days
        }));

    if (ending.length) {
        const msg = WA.journeyEndingSoon(ending);
        if (msg) await sendWhatsApp(msg);
        console.log(`[Scheduler] Sent journey ending soon alert (${ending.length} items)`);
    }
};

// ─── Main runner ──────────────────────────────────────────────────────────────

const runDailyChecks = async () => {
    console.log('[Scheduler] Running daily WhatsApp checks...');
    try { await checkTruckDocuments(); } catch (e) { console.error('[Scheduler] Truck doc check failed:', e.message); }
    try { await checkPartyPaymentDues(); } catch (e) { console.error('[Scheduler] Party payment check failed:', e.message); }
    try { await checkJourneysEndingSoon(); } catch (e) { console.error('[Scheduler] Journey check failed:', e.message); }
    console.log('[Scheduler] Daily checks complete.');
};

// ─── Cron-like scheduler (no extra packages needed) ──────────────────────────

const scheduleAt8AM = () => {
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(8, 0, 0, 0);
    if (next8AM <= now) next8AM.setDate(next8AM.getDate() + 1); // push to tomorrow if already past

    const msUntil = next8AM - now;
    console.log(`[Scheduler] Daily alerts scheduled in ${Math.round(msUntil / 60000)} min (08:00 AM)`);

    setTimeout(() => {
        runDailyChecks();
        // Then repeat every 24 hours
        setInterval(runDailyChecks, 24 * 60 * 60 * 1000);
    }, msUntil);
};

export const initScheduler = () => {
    scheduleAt8AM();
};
