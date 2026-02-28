/**
 * whatsappScheduler.js
 * --------------------
 * Sends ONE consolidated daily summary at 8:00 AM via Meta Cloud API.
 * Includes: active journeys, pending settlements, doc expiries, payment dues, journeys ending soon.
 */

import Truck from '../models/truckModel.js';
import TruckJourney from '../models/truckJourneyModel.js';
import Settlement from '../models/settlementModel.js';
import Entry from '../models/billingEntryModel.js';
import { sendWhatsApp, WA } from './sendWhatsApp.js';

const ALERT_WINDOW = 3; // days

const daysUntil = (dateStr) => {
    if (!dateStr) return -1;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
};

const runDailySummary = async () => {
    console.log('[Scheduler] Building daily summary...');
    try {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Active journeys
        const activeJourneys = await TruckJourney.countDocuments({ is_deleted: false, journey_settlement_status: { $ne: 'Settled' } });

        // 2. Pending settlements
        const pendingSettlements = await Settlement.countDocuments({ is_settled: false });

        // 3. Bills this month + revenue
        const monthBills = await Entry.find({ createdAt: { $gte: monthStart } }).lean();
        const monthlyBills = monthBills.length;
        const monthlyRevenue = monthBills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);

        // 4. Truck document expiry alerts
        const trucks = await Truck.find({ is_deleted: false }).lean();
        const DOC_FIELDS = [
            { field: 'fitness_doc_expiry', label: 'Fitness' },
            { field: 'insurance_doc_expiry', label: 'Insurance' },
            { field: 'national_permit_doc_expiry', label: 'Nat. Permit' },
            { field: 'state_permit_doc_expiry', label: 'State Permit' },
            { field: 'tax_doc_expiry', label: 'Road Tax' },
            { field: 'pollution_doc_expiry', label: 'PUC' },
        ];
        const docAlerts = [];
        for (const truck of trucks) {
            for (const { field, label } of DOC_FIELDS) {
                const days = daysUntil(truck[field]);
                if (days >= 0 && days <= ALERT_WINDOW) {
                    docAlerts.push({ truck_no: truck.truck_no, doc: label, days });
                }
            }
        }

        // 5. Party payment dues
        const dueJourneys = await TruckJourney.find({
            is_deleted: false,
            party_payment_status: { $ne: 'Paid' },
            party_payment_due_date: { $exists: true, $ne: null }
        }).populate('truck').lean();
        const paymentDues = dueJourneys
            .map(j => ({ ...j, days: daysUntil(j.party_payment_due_date) }))
            .filter(j => j.days >= 0 && j.days <= ALERT_WINDOW)
            .map(j => ({ truck_no: j.truck?.truck_no || 'N/A', from: j.from, to: j.to, days: j.days, due_date: j.party_payment_due_date }));

        // 6. Journeys ending soon
        const activeWithEnd = await TruckJourney.find({
            is_deleted: false,
            journey_settlement_status: { $ne: 'Settled' },
            journey_end_date: { $exists: true, $ne: null }
        }).populate('truck').lean();
        const endingSoon = activeWithEnd
            .map(j => ({ ...j, days: daysUntil(j.journey_end_date) }))
            .filter(j => j.days >= 0 && j.days <= ALERT_WINDOW)
            .map(j => ({ truck_no: j.truck?.truck_no || 'N/A', from: j.from, to: j.to, journey_end_date: j.journey_end_date }));

        // Format date
        const date = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

        const message = WA.dailySummary({ date, activeJourneys, pendingSettlements, monthlyBills, monthlyRevenue, docAlerts, paymentDues, endingSoon });
        await sendWhatsApp(message);
        console.log('[Scheduler] Daily summary sent.');
    } catch (err) {
        console.error('[Scheduler] Daily summary failed:', err.message);
    }
};

const scheduleAt8AM = () => {
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(8, 0, 0, 0);
    if (next8AM <= now) next8AM.setDate(next8AM.getDate() + 1);

    const msUntil = next8AM - now;
    console.log(`[Scheduler] Daily summary scheduled in ${Math.round(msUntil / 60000)} min (08:00 AM)`);

    setTimeout(() => {
        runDailySummary();
        setInterval(runDailySummary, 24 * 60 * 60 * 1000);
    }, msUntil);
};

export const initScheduler = () => {
    scheduleAt8AM();
};
