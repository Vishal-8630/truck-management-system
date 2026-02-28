/**
 * Divyanshi Road Lines - Comprehensive Database Seed Script
 * Covers all scenarios: Trucks, Drivers, Journeys (Active/Completed/Delayed/Cancelled),
 * Billing Parties, Bill Entries, Balance Parties, Vehicle Entries, Settlements, Ledgers
 *
 * Run: node seedData.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ─── Model Imports ────────────────────────────────────────────────────────────
import Truck from "./models/truckModel.js";
import Driver from "./models/driverModel.js";
import TruckJourney from "./models/truckJourneyModel.js";
import BillingParty from "./models/billingPartyModel.js";
import Entry from "./models/billingEntryModel.js";
import BalanceParty from "./models/balanceParty.js";
import VehicleEntry from "./models/vehicleEntryModel.js";
import Settlement from "./models/settlementModel.js";
import Ledger from "./models/ledgerModel.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
};
const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
};

// ─── Connect ──────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB:", process.env.MONGO_URI);

// ─── Drop All Collections ─────────────────────────────────────────────────────
console.log("\n🗑️  Clearing all collections...");
await Promise.all([
    Truck.deleteMany({}),
    Driver.deleteMany({}),
    TruckJourney.deleteMany({}),
    BillingParty.deleteMany({}),
    Entry.deleteMany({}),
    BalanceParty.deleteMany({}),
    VehicleEntry.deleteMany({}),
    Settlement.deleteMany({}),
    Ledger.deleteMany({}),
]);
console.log("✅ All collections cleared.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TRUCKS (12 trucks - mix of documents near expiry, expired, valid)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🚛 Seeding Trucks...");
const trucks = await Truck.insertMany([
    {
        truck_no: "HR-55-A-1234",
        fitness_doc_expiry: daysFromNow(15),   // expiring soon
        insurance_doc_expiry: daysFromNow(45),
        national_permit_doc_expiry: daysFromNow(120),
        state_permit_doc_expiry: daysFromNow(90),
        tax_doc_expiry: daysFromNow(200),
        pollution_doc_expiry: daysFromNow(5),  // critical - 5 days
        last_service_kms: 145000,
        service_interval: 10000,
    },
    {
        truck_no: "HR-55-B-5678",
        fitness_doc_expiry: daysFromNow(180),
        insurance_doc_expiry: daysFromNow(20), // expiring soon
        national_permit_doc_expiry: daysFromNow(300),
        state_permit_doc_expiry: daysFromNow(60),
        tax_doc_expiry: daysFromNow(30),       // expiring soon
        pollution_doc_expiry: daysFromNow(150),
        last_service_kms: 210000,
        service_interval: 15000,
    },
    {
        truck_no: "UP-14-C-9012",
        fitness_doc_expiry: daysFromNow(365),
        insurance_doc_expiry: daysFromNow(365),
        national_permit_doc_expiry: daysFromNow(365),
        state_permit_doc_expiry: daysFromNow(365),
        tax_doc_expiry: daysFromNow(365),
        pollution_doc_expiry: daysFromNow(365),
        last_service_kms: 85000,
        service_interval: 10000,
    },
    {
        truck_no: "DL-01-D-3456",
        fitness_doc_expiry: daysFromNow(250),
        insurance_doc_expiry: daysFromNow(100),
        national_permit_doc_expiry: daysFromNow(180),
        state_permit_doc_expiry: daysFromNow(25),  // expiring soon
        tax_doc_expiry: daysFromNow(400),
        pollution_doc_expiry: daysFromNow(80),
        last_service_kms: 178000,
        service_interval: 12000,
    },
    {
        truck_no: "RJ-14-E-7890",
        fitness_doc_expiry: daysFromNow(60),
        insurance_doc_expiry: daysFromNow(300),
        national_permit_doc_expiry: daysFromNow(10), // critical
        state_permit_doc_expiry: daysFromNow(200),
        tax_doc_expiry: daysFromNow(150),
        pollution_doc_expiry: daysFromNow(90),
        last_service_kms: 320000,
        service_interval: 10000,
    },
    {
        truck_no: "MH-12-F-2345",
        fitness_doc_expiry: daysFromNow(400),
        insurance_doc_expiry: daysFromNow(400),
        national_permit_doc_expiry: daysFromNow(400),
        state_permit_doc_expiry: daysFromNow(400),
        tax_doc_expiry: daysFromNow(400),
        pollution_doc_expiry: daysFromNow(400),
        last_service_kms: 95000,
        service_interval: 10000,
    },
    {
        truck_no: "GJ-01-G-6789",
        fitness_doc_expiry: daysFromNow(28),   // expiring soon
        insurance_doc_expiry: daysFromNow(200),
        national_permit_doc_expiry: daysFromNow(350),
        state_permit_doc_expiry: daysFromNow(100),
        tax_doc_expiry: daysFromNow(280),
        pollution_doc_expiry: daysFromNow(22), // expiring soon
        last_service_kms: 455000,
        service_interval: 15000,
    },
    {
        truck_no: "PB-10-H-1122",
        fitness_doc_expiry: daysFromNow(500),
        insurance_doc_expiry: daysFromNow(500),
        national_permit_doc_expiry: daysFromNow(500),
        state_permit_doc_expiry: daysFromNow(500),
        tax_doc_expiry: daysFromNow(500),
        pollution_doc_expiry: daysFromNow(500),
        last_service_kms: 62000,
        service_interval: 10000,
    },
    {
        truck_no: "MP-09-I-3344",
        fitness_doc_expiry: daysFromNow(70),
        insurance_doc_expiry: daysFromNow(18),  // expiring soon
        national_permit_doc_expiry: daysFromNow(220),
        state_permit_doc_expiry: daysFromNow(310),
        tax_doc_expiry: daysFromNow(100),
        pollution_doc_expiry: daysFromNow(45),
        last_service_kms: 290000,
        service_interval: 10000,
    },
    {
        truck_no: "WB-23-J-5566",
        fitness_doc_expiry: daysFromNow(120),
        insurance_doc_expiry: daysFromNow(240),
        national_permit_doc_expiry: daysFromNow(130),
        state_permit_doc_expiry: daysFromNow(150),
        tax_doc_expiry: daysFromNow(50),
        pollution_doc_expiry: daysFromNow(200),
        last_service_kms: 188000,
        service_interval: 12000,
    },
    {
        truck_no: "KA-03-K-7788",
        fitness_doc_expiry: daysFromNow(320),
        insurance_doc_expiry: daysFromNow(320),
        national_permit_doc_expiry: daysFromNow(320),
        state_permit_doc_expiry: daysFromNow(320),
        tax_doc_expiry: daysFromNow(320),
        pollution_doc_expiry: daysFromNow(320),
        last_service_kms: 128000,
        service_interval: 10000,
    },
    {
        truck_no: "TN-07-L-9900",
        fitness_doc_expiry: daysFromNow(8),    // critical
        insurance_doc_expiry: daysFromNow(400),
        national_permit_doc_expiry: daysFromNow(250),
        state_permit_doc_expiry: daysFromNow(175),
        tax_doc_expiry: daysFromNow(27),       // expiring soon
        pollution_doc_expiry: daysFromNow(260),
        last_service_kms: 375000,
        service_interval: 15000,
    },
]);
console.log(`  ✅ ${trucks.length} Trucks seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DRIVERS (12 drivers)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("👤 Seeding Drivers...");
const drivers = await Driver.insertMany([
    { name: "Ramesh Kumar", phone: "9812345678", home_phone: "9812345679", address: "Rohtak, Haryana", adhaar_no: "111122223333", dl: "HR0120210012345", amount_to_pay: "5000", amount_to_receive: "0", advance_amount: "2000" },
    { name: "Suresh Singh", phone: "9823456789", home_phone: "9823456780", address: "Ambala, Haryana", adhaar_no: "222233334444", dl: "HR0120220023456", amount_to_pay: "0", amount_to_receive: "3500", advance_amount: "1500" },
    { name: "Mohan Yadav", phone: "9834567890", home_phone: "9834567891", address: "Agra, UP", adhaar_no: "333344445555", dl: "UP1420200034567", amount_to_pay: "8000", amount_to_receive: "0", advance_amount: "3000" },
    { name: "Rakesh Sharma", phone: "9845678901", home_phone: "9845678902", address: "Faridabad, Haryana", adhaar_no: "444455556666", dl: "HR1020190045678", amount_to_pay: "0", amount_to_receive: "0", advance_amount: "0" },
    { name: "Vijay Patel", phone: "9856789012", home_phone: "9856789013", address: "Ahmedabad, Gujarat", adhaar_no: "555566667777", dl: "GJ0120210056789", amount_to_pay: "12000", amount_to_receive: "0", advance_amount: "4000" },
    { name: "Santosh Gupta", phone: "9867890123", home_phone: "9867890124", address: "Jaipur, Rajasthan", adhaar_no: "666677778888", dl: "RJ0220220067890", amount_to_pay: "0", amount_to_receive: "2000", advance_amount: "1000" },
    { name: "Harish Verma", phone: "9878901234", home_phone: "9878901235", address: "Ludhiana, Punjab", adhaar_no: "777788889999", dl: "PB1020200078901", amount_to_pay: "7500", amount_to_receive: "0", advance_amount: "2500" },
    { name: "Dinesh Chauhan", phone: "9889012345", home_phone: "9889012346", address: "Pune, Maharashtra", adhaar_no: "888899990000", dl: "MH1220210089012", amount_to_pay: "0", amount_to_receive: "5000", advance_amount: "2000" },
    { name: "Lokesh Tiwari", phone: "9890123456", home_phone: "9890123457", address: "Bhopal, MP", adhaar_no: "999900001111", dl: "MP0920200090123", amount_to_pay: "9500", amount_to_receive: "0", advance_amount: "3500" },
    { name: "Ajay Rawat", phone: "9801234567", home_phone: "9801234568", address: "Kolkata, WB", adhaar_no: "101010112222", dl: "WB2320220091234", amount_to_pay: "0", amount_to_receive: "1500", advance_amount: "500" },
    { name: "Pradeep Nair", phone: "9802345678", home_phone: "9802345679", address: "Bangalore, Karnataka", adhaar_no: "121212123333", dl: "KA0320210102345", amount_to_pay: "6000", amount_to_receive: "0", advance_amount: "2000" },
    { name: "Sanjay Mishra", phone: "9803456789", home_phone: "9803456780", address: "Chennai, Tamil Nadu", adhaar_no: "131313134444", dl: "TN0720200113456", amount_to_pay: "0", amount_to_receive: "4500", advance_amount: "1500" },
]);
console.log(`  ✅ ${drivers.length} Drivers seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ASSIGN DRIVERS TO TRUCKS
// ═══════════════════════════════════════════════════════════════════════════════
const assignPairs = [
    [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11]
];
for (const [ti, di] of assignPairs) {
    const truck = trucks[ti];
    const driver = drivers[di];
    truck.drivers.push({ driver_id: driver._id, assignedAt: new Date() });
    driver.vehicles.push({ vehicle_id: truck._id, assignedAt: new Date() });
    await truck.save();
    await driver.save();
}
console.log("  ✅ Drivers assigned to trucks.");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TRUCK JOURNEYS (covers all status scenarios)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🗺️  Seeding Journeys...");

// Helper: create a journey object
const j = (truckIdx, driverIdx, from, to, startOffset, journeyDays, status, extra = {}) => ({
    truck: trucks[truckIdx]._id,
    driver: drivers[driverIdx]._id,
    from,
    to,
    route: [from, to],
    journey_days: String(journeyDays),
    journey_start_date: daysAgo(startOffset + journeyDays),
    journey_end_date: daysAgo(startOffset),
    status,
    ...extra,
});

const journeyDocs = await TruckJourney.insertMany([
    // ── ACTIVE JOURNEYS (5) ──────────────────────────────────────────────────────
    j(0, 0, "Delhi", "Mumbai", -3, 7, "Active", {
        starting_kms: "145000", journey_starting_cash: "5000",
        distance_km: "1400", loaded_weight: "22 Tons", average_mileage: "4.2",
        driver_expenses: [{ amount: "500", reason: "Food", date: daysAgo(-1) }, { amount: "300", reason: "Toll", date: daysAgo(-2) }],
        diesel_expenses: [{ amount: "8500", quantity: "60", filling_date: daysAgo(-1) }],
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(15),
    }),
    j(1, 1, "Jaipur", "Ahmedabad", -2, 5, "Active", {
        starting_kms: "210000", journey_starting_cash: "4000",
        distance_km: "600", loaded_weight: "18 Tons", average_mileage: "4.5",
        driver_expenses: [{ amount: "400", reason: "Food", date: daysAgo(-1) }],
        diesel_expenses: [{ amount: "5200", quantity: "40", filling_date: daysAgo(-1) }],
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(10),
    }),
    j(2, 2, "Agra", "Lucknow", -1, 3, "Active", {
        starting_kms: "85000", journey_starting_cash: "3000",
        distance_km: "380", loaded_weight: "15 Tons", average_mileage: "5.1",
        driver_expenses: [{ amount: "200", reason: "Toll", date: daysAgo(-0) }],
        diesel_expenses: [{ amount: "3100", quantity: "24", filling_date: daysAgo(-0) }],
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(7),
    }),
    j(3, 3, "Chandigarh", "Amritsar", -0, 2, "Active", {
        starting_kms: "178000", journey_starting_cash: "2000",
        distance_km: "210", loaded_weight: "12 Tons", average_mileage: "5.5",
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(5),
    }),
    j(4, 4, "Jodhpur", "Udaipur", -0, 4, "Active", {
        starting_kms: "320000", journey_starting_cash: "3500",
        distance_km: "290", loaded_weight: "20 Tons", average_mileage: "4.0",
        driver_expenses: [{ amount: "600", reason: "Repair", date: daysAgo(-0) }],
        diesel_expenses: [{ amount: "4200", quantity: "35", filling_date: daysAgo(-0) }],
        party_payment_status: "Pending",
    }),

    // ── COMPLETED + JOURNEY SETTLED (4) ──────────────────────────────────────────
    j(5, 5, "Mumbai", "Pune", 8, 2, "Completed", {
        ending_kms: "96200", starting_kms: "95000",
        distance_km: "150", loaded_weight: "10 Tons", average_mileage: "5.8",
        driver_expenses: [{ amount: "300", reason: "Food", date: daysAgo(7) }],
        diesel_expenses: [{ amount: "2100", quantity: "16", filling_date: daysAgo(7) }],
        settlement: { amount_paid: "45000", date_paid: daysAgo(5), mode: "Bank Transfer", remarks: "Full payment received" },
        journey_settlement_status: "Settled", settled: true,
        party_payment_status: "Paid", party_payment_received_date: daysAgo(4),
    }),
    j(6, 6, "Ludhiana", "Delhi", 15, 3, "Completed", {
        ending_kms: "456500", starting_kms: "455000",
        distance_km: "300", loaded_weight: "24 Tons", average_mileage: "4.1",
        driver_expenses: [{ amount: "700", reason: "Toll + Food", date: daysAgo(13) }],
        diesel_expenses: [{ amount: "4500", quantity: "36", filling_date: daysAgo(14) }],
        settlement: { amount_paid: "72000", date_paid: daysAgo(10), mode: "UPI", remarks: "On-time payment" },
        journey_settlement_status: "Settled", settled: true,
        party_payment_status: "Paid", party_payment_received_date: daysAgo(9),
    }),
    j(7, 7, "Pune", "Hyderabad", 22, 4, "Completed", {
        ending_kms: "63200", starting_kms: "62000",
        distance_km: "560", loaded_weight: "19 Tons", average_mileage: "4.6",
        driver_expenses: [{ amount: "900", reason: "Food", date: daysAgo(20) }, { amount: "500", reason: "Toll", date: daysAgo(20) }],
        diesel_expenses: [{ amount: "7800", quantity: "62", filling_date: daysAgo(21) }],
        settlement: { amount_paid: "88000", date_paid: daysAgo(17), mode: "Cash", remarks: "Cash settlement" },
        journey_settlement_status: "Settled", settled: true,
        party_payment_status: "Paid", party_payment_received_date: daysAgo(15),
    }),
    j(8, 8, "Bhopal", "Raipur", 30, 5, "Completed", {
        ending_kms: "291800", starting_kms: "290000",
        distance_km: "370", loaded_weight: "17 Tons", average_mileage: "4.9",
        driver_expenses: [{ amount: "800", reason: "Dhaba + Fuel", date: daysAgo(28) }],
        diesel_expenses: [{ amount: "5100", quantity: "42", filling_date: daysAgo(29) }],
        settlement: { amount_paid: "55000", date_paid: daysAgo(23), mode: "Bank Transfer", remarks: "" },
        journey_settlement_status: "Settled", settled: true,
        party_payment_status: "Paid", party_payment_received_date: daysAgo(22),
    }),

    // ── COMPLETED + UNSETTLED (Dashboard scenario - 4 journeys) ──────────────────
    j(9, 9, "Kolkata", "Patna", 10, 3, "Completed", {
        ending_kms: "189400", starting_kms: "188000",
        distance_km: "580", loaded_weight: "21 Tons", average_mileage: "3.9",
        driver_expenses: [{ amount: "1100", reason: "Toll", date: daysAgo(9) }],
        diesel_expenses: [{ amount: "8100", quantity: "65", filling_date: daysAgo(9) }],
        journey_settlement_status: "Unsettled",
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(3),
    }),
    j(10, 10, "Bangalore", "Chennai", 7, 2, "Completed", {
        ending_kms: "129600", starting_kms: "128000",
        distance_km: "340", loaded_weight: "14 Tons", average_mileage: "5.0",
        driver_expenses: [{ amount: "600", reason: "Food", date: daysAgo(6) }],
        diesel_expenses: [{ amount: "4600", quantity: "37", filling_date: daysAgo(6) }],
        journey_settlement_status: "Unsettled",
        party_payment_status: "Partially Paid", party_payment_due_date: daysFromNow(5),
    }),
    j(11, 11, "Chennai", "Coimbatore", 5, 2, "Completed", {
        ending_kms: "376500", starting_kms: "375000",
        distance_km: "500", loaded_weight: "23 Tons", average_mileage: "4.2",
        driver_expenses: [{ amount: "800", reason: "Toll + Repair", date: daysAgo(4) }],
        diesel_expenses: [{ amount: "7000", quantity: "56", filling_date: daysAgo(4) }],
        journey_settlement_status: "Unsettled",
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(2),
    }),
    j(0, 0, "Delhi", "Chandigarh", 6, 2, "Completed", {
        ending_kms: "146500", starting_kms: "145000",
        distance_km: "250", loaded_weight: "16 Tons", average_mileage: "5.3",
        driver_expenses: [{ amount: "400", reason: "Food", date: daysAgo(5) }],
        diesel_expenses: [{ amount: "3400", quantity: "27", filling_date: daysAgo(5) }],
        journey_settlement_status: "Unsettled",
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(7),
    }),

    // ── DELAYED JOURNEYS (2) ──────────────────────────────────────────────────────
    j(1, 1, "Ahmedabad", "Surat", 12, 4, "Delayed", {
        starting_kms: "211500", journey_starting_cash: "3000",
        distance_km: "265", loaded_weight: "18 Tons", average_mileage: "4.4",
        delays: [{ place: "Vadodara", date: daysAgo(11), reason: "Road blockage" }],
        driver_expenses: [{ amount: "500", reason: "Food", date: daysAgo(11) }],
        diesel_expenses: [{ amount: "3600", quantity: "28", filling_date: daysAgo(11) }],
        party_payment_status: "Pending", party_payment_due_date: daysFromNow(1),
    }),
    j(2, 2, "Delhi", "Rishikesh", 9, 5, "Delayed", {
        starting_kms: "86200", journey_starting_cash: "4500",
        distance_km: "310", loaded_weight: "11 Tons", average_mileage: "4.8",
        delays: [{ place: "Haridwar", date: daysAgo(8), reason: "Engine overheating" }, { place: "Meerut bypass", date: daysAgo(7), reason: "Traffic jam" }],
        driver_expenses: [{ amount: "1500", reason: "Repair", date: daysAgo(8) }, { amount: "400", reason: "Food", date: daysAgo(7) }],
        diesel_expenses: [{ amount: "4000", quantity: "32", filling_date: daysAgo(8) }],
        party_payment_status: "Pending",
    }),

    // ── CANCELLED JOURNEYS (2) ───────────────────────────────────────────────────
    j(3, 3, "Faridabad", "Meerut", 20, 2, "Cancelled", {
        starting_kms: "179000",
        distance_km: "100",
        journey_summary: "Cancelled due to factory shutdown at destination.",
        party_payment_status: "Pending",
    }),
    j(4, 4, "Jodhpur", "Jaisalmer", 35, 3, "Cancelled", {
        starting_kms: "321000",
        distance_km: "285",
        journey_summary: "Cancelled - client order cancelled last minute.",
        party_payment_status: "Pending",
    }),
]);
console.log(`  ✅ ${journeyDocs.length} Journeys seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. BILLING PARTIES (10)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🏢 Seeding Billing Parties...");
const billingParties = await BillingParty.insertMany([
    { name: "Balaji Enterprises", address: "A-12, Saket, New Delhi", gst_no: "07AAACB1234F1ZK" },
    { name: "Shree Logistics Pvt Ltd", address: "Plot 45, MIDC, Pune", gst_no: "27AABCS5678G2ZL" },
    { name: "Global Transport Co.", address: "NH-8, Ahmedabad", gst_no: "24AABCG9012H3ZM" },
    { name: "Ram Cargo Services", address: "Sector 14, Faridabad", gst_no: "06AAACR3456I4ZN" },
    { name: "Sai Road Carriers", address: "MG Road, Bangalore", gst_no: "29AAACS7890J5ZO" },
    { name: "Hanuman Freight Lines", address: "Station Road, Jaipur", gst_no: "08AAACH2345K6ZP" },
    { name: "Mahadev Logistics", address: "Industrial Area, Ludhiana", gst_no: "03AABCM6789L7ZQ" },
    { name: "Tirupati Transport", address: "Anna Nagar, Chennai", gst_no: "33AAACT1234M8ZR" },
    { name: "Krishna Road Lines", address: "Mathura Road, Agra", gst_no: "09AAACK5678N9ZS" },
    { name: "Durga Carriers", address: "GT Road, Ambala", gst_no: "06AACD9012O1ZT" },
]);
console.log(`  ✅ ${billingParties.length} Billing Parties seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. BILL ENTRIES / LR COPIES (12 entries)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📄 Seeding Bill Entries...");
const billData = [
    { bp: 0, from: "Delhi", to: "Mumbai", veh: "HR-55-A-1234", freight: "85000", igst: "6120", grand: "91120", consignor: "Ramesh Steel", consignee: "Mumbai Steel Corp", lrn: "DRL-001", daysBack: 5, desc: "MS Pipes" },
    { bp: 1, from: "Pune", to: "Hyderabad", veh: "MH-12-F-2345", freight: "62000", igst: "4464", grand: "66464", consignor: "Pune Auto Parts", consignee: "Hyderabad Motors", lrn: "DRL-002", daysBack: 8, desc: "Auto Parts" },
    { bp: 2, from: "Ahmedabad", to: "Jaipur", veh: "GJ-01-G-6789", freight: "38000", igst: "2736", grand: "40736", consignor: "Gujarat Textiles", consignee: "Jaipur Fabrics", lrn: "DRL-003", daysBack: 12, desc: "Textile Goods" },
    { bp: 3, from: "Faridabad", to: "Lucknow", veh: "DL-01-D-3456", freight: "44000", igst: "3168", grand: "47168", consignor: "NCR Industries", consignee: "Lucknow Pvt Ltd", lrn: "DRL-004", daysBack: 15, desc: "Industrial Equipment" },
    { bp: 4, from: "Bangalore", to: "Chennai", veh: "KA-03-K-7788", freight: "28000", igst: "2016", grand: "30016", consignor: "Infra Tech", consignee: "Chennai Builders", lrn: "DRL-005", daysBack: 3, desc: "Construction Material" },
    { bp: 5, from: "Jaipur", to: "Delhi", veh: "RJ-14-E-7890", freight: "32000", igst: "2304", grand: "34304", consignor: "Rajasthan Marble", consignee: "Delhi Decor", lrn: "DRL-006", daysBack: 20, desc: "Marble Slabs" },
    { bp: 6, from: "Ludhiana", to: "Chandigarh", veh: "PB-10-H-1122", freight: "18000", igst: "1296", grand: "19296", consignor: "Punjab Grain", consignee: "Chd Food Corp", lrn: "DRL-007", daysBack: 7, desc: "Wheat sacks" },
    { bp: 7, from: "Chennai", to: "Coimbatore", veh: "TN-07-L-9900", freight: "22000", igst: "1584", grand: "23584", consignor: "TN Motors", consignee: "CB Auto Works", lrn: "DRL-008", daysBack: 11, desc: "Engine parts" },
    { bp: 8, from: "Agra", to: "Meerut", veh: "UP-14-C-9012", freight: "15000", igst: "1080", grand: "16080", consignor: "Agra Footwear", consignee: "Meerut Traders", lrn: "DRL-009", daysBack: 4, desc: "Footwear (leather)" },
    { bp: 9, from: "Ambala", to: "Rohtak", veh: "HR-55-B-5678", freight: "11000", igst: "792", grand: "11792", consignor: "Ambala Electric", consignee: "Rohtak Elec House", lrn: "DRL-010", daysBack: 18, desc: "Electrical fittings" },
    { bp: 0, from: "Delhi", to: "Chandigarh", veh: "HR-55-A-1234", freight: "25000", igst: "1800", grand: "26800", consignor: "Delhi Hardware", consignee: "Chd Hardware Depot", lrn: "DRL-011", daysBack: 25, desc: "Hardware Goods" },
    { bp: 1, from: "Pune", to: "Nagpur", veh: "MH-12-F-2345", freight: "35000", igst: "2520", grand: "37520", consignor: "Pune Pharma", consignee: "Nagpur Medical", lrn: "DRL-012", daysBack: 9, desc: "Pharmaceutical goods" },
];

await Entry.insertMany(billData.map((b, i) => ({
    bill_no: `BILL-2025-${String(i + 1).padStart(3, "0")}`,
    bill_date: new Date(new Date().setDate(new Date().getDate() - b.daysBack)),
    billing_party: billingParties[b.bp]._id,
    lr_no: b.lrn,
    lr_date: new Date(new Date().setDate(new Date().getDate() - b.daysBack)),
    consignor_name: b.consignor,
    consignee: b.consignee,
    from: b.from,
    to: b.to,
    vehicle_no: b.veh,
    description_of_goods: b.desc,
    hire_amount: b.freight,
    rate: "Per Ton",
    freight: b.freight,
    igst: b.igst,
    grand_total: b.grand,
    cgst: "0",
    sgst: "0",
    sub_total: b.freight,
    advance: "0",
    extra_charges: [],
    pkg: String(Math.floor(Math.random() * 20) + 5),
    weight: String(Math.floor(Math.random() * 15) + 5),
    to_be_billed_at: "Delhi",
    gst_up: "6",
    eway_bill_no: `EWB${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
})));
console.log(`  ✅ 12 Bill Entries seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. BALANCE PARTIES (10)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("💰 Seeding Balance Parties...");
const balanceParties = await BalanceParty.insertMany([
    { party_name: "Mahesh Transports" },
    { party_name: "Nandini Freight" },
    { party_name: "Om Sai Carriers" },
    { party_name: "Pawan Roadways" },
    { party_name: "Rajendra Logistics" },
    { party_name: "Surya Transport Co." },
    { party_name: "Triveni Road Lines" },
    { party_name: "Umesh Cargo Services" },
    { party_name: "Vardhan Fleet Solutions" },
    { party_name: "Yogesh Heavy Movers" },
]);
console.log(`  ✅ ${balanceParties.length} Balance Parties seeded.`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. VEHICLE ENTRIES (14 entries covering all statuses/movementTypes)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🚗 Seeding Vehicle Entries...");
await VehicleEntry.insertMany([
    // Pending + From DRL
    { date: daysAgo(2), vehicle_no: "HR-55-A-1234", from: "Delhi", to: "Mumbai", freight: "85000", driver_cash: "5000", dala: "1200", kamisan: "800", in_ac: "0", balance: "85000", halting: "0", pod_stock: "Yes", owner: "Ramesh Kumar", balance_party: balanceParties[0]._id, status: "Pending", movementType: "From DRL" },
    { date: daysAgo(5), vehicle_no: "HR-55-B-5678", from: "Ambala", to: "Delhi", freight: "32000", driver_cash: "3000", dala: "900", kamisan: "600", in_ac: "0", balance: "32000", halting: "0", pod_stock: "Yes", owner: "Suresh Singh", balance_party: balanceParties[1]._id, status: "Pending", movementType: "From DRL" },
    { date: daysAgo(8), vehicle_no: "UP-14-C-9012", from: "Agra", to: "Lucknow", freight: "44000", driver_cash: "4000", dala: "1100", kamisan: "700", in_ac: "0", balance: "44000", halting: "500", pod_stock: "No", owner: "Mohan Yadav", balance_party: balanceParties[2]._id, status: "Pending", movementType: "From DRL" },
    { date: daysAgo(3), vehicle_no: "DL-01-D-3456", from: "Faridabad", to: "Meerut", freight: "18000", driver_cash: "2000", dala: "500", kamisan: "350", in_ac: "0", balance: "18000", halting: "0", pod_stock: "Yes", owner: "Rakesh Sharma", balance_party: balanceParties[3]._id, status: "Pending", movementType: "From DRL" },
    { date: daysAgo(10), vehicle_no: "RJ-14-E-7890", from: "Jaipur", to: "Delhi", freight: "38000", driver_cash: "3500", dala: "1000", kamisan: "650", in_ac: "0", balance: "38000", halting: "0", pod_stock: "Yes", owner: "Vijay Patel", balance_party: balanceParties[4]._id, status: "Pending", movementType: "From DRL" },

    // Received + From DRL
    { date: daysAgo(15), vehicle_no: "MH-12-F-2345", from: "Mumbai", to: "Pune", freight: "28000", driver_cash: "2500", dala: "750", kamisan: "500", in_ac: "28000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Santosh Gupta", balance_party: balanceParties[5]._id, status: "Received", movementType: "From DRL" },
    { date: daysAgo(18), vehicle_no: "GJ-01-G-6789", from: "Ahmedabad", to: "Surat", freight: "22000", driver_cash: "2000", dala: "600", kamisan: "400", in_ac: "22000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Harish Verma", balance_party: balanceParties[6]._id, status: "Received", movementType: "From DRL" },
    { date: daysAgo(22), vehicle_no: "PB-10-H-1122", from: "Ludhiana", to: "Amritsar", freight: "15000", driver_cash: "1500", dala: "400", kamisan: "280", in_ac: "15000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Dinesh Chauhan", balance_party: balanceParties[7]._id, status: "Received", movementType: "From DRL" },
    { date: daysAgo(25), vehicle_no: "MP-09-I-3344", from: "Bhopal", to: "Indore", freight: "20000", driver_cash: "2000", dala: "550", kamisan: "350", in_ac: "20000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Lokesh Tiwari", balance_party: balanceParties[8]._id, status: "Received", movementType: "From DRL" },

    // Pending + To DRL
    { date: daysAgo(4), vehicle_no: "WB-23-J-5566", from: "Kolkata", to: "DRL Depot", freight: "55000", driver_cash: "4500", dala: "1400", kamisan: "900", in_ac: "0", balance: "55000", halting: "800", pod_stock: "No", owner: "Ajay Rawat", balance_party: balanceParties[9]._id, status: "Pending", movementType: "To DRL" },
    { date: daysAgo(7), vehicle_no: "KA-03-K-7788", from: "Bangalore", to: "DRL Depot", freight: "48000", driver_cash: "4000", dala: "1200", kamisan: "800", in_ac: "0", balance: "48000", halting: "0", pod_stock: "Yes", owner: "Pradeep Nair", balance_party: balanceParties[0]._id, status: "Pending", movementType: "To DRL" },

    // Received + To DRL
    { date: daysAgo(20), vehicle_no: "TN-07-L-9900", from: "Chennai", to: "DRL Depot", freight: "65000", driver_cash: "5500", dala: "1600", kamisan: "1000", in_ac: "65000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Sanjay Mishra", balance_party: balanceParties[1]._id, status: "Received", movementType: "To DRL" },
    // Partial - halting
    { date: daysAgo(12), vehicle_no: "HR-55-A-1234", from: "Delhi", to: "Chandigarh", freight: "25000", driver_cash: "2500", dala: "700", kamisan: "450", in_ac: "10000", balance: "15000", halting: "1200", halting_in_date: daysAgo(11), halting_out_date: daysAgo(9), pod_stock: "Yes", owner: "Ramesh Kumar", balance_party: balanceParties[2]._id, status: "Pending", movementType: "From DRL" },
    { date: daysAgo(30), vehicle_no: "HR-55-B-5678", from: "Rohtak", to: "Hisar", freight: "12000", driver_cash: "1200", dala: "350", kamisan: "220", in_ac: "12000", balance: "0", halting: "0", pod_stock: "Yes", owner: "Suresh Singh", balance_party: balanceParties[3]._id, status: "Received", movementType: "From DRL" },
]);
console.log("  ✅ 14 Vehicle Entries seeded.");

// ═══════════════════════════════════════════════════════════════════════════════
// 9. DRIVER SETTLEMENTS (3 - is_settled: true, is_settled: false)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📊 Seeding Settlements...");

// Settled Settlements (2)
const settledJourneys = journeyDocs.slice(5, 9); // journeys that are "settled"
const settlement1 = await Settlement.create({
    driver: drivers[5]._id,
    period: { from: daysAgo(30), to: daysAgo(5) },
    journeys: [settledJourneys[0]._id, settledJourneys[1]._id],
    total_driver_expense: 1000, total_diesel_expense: 6600,
    total_distance: 450, avg_mileage: 4.5,
    rate_per_km: 20, diesel_rate: 95, extra_expense: 500,
    driver_total: 1500, owner_total: 9000, overall_total: 10500,
    payment_status: "DRL needs to pay",
    payment_meta: { mode: "Bank Transfer", date: daysAgo(3), remarks: "Settled via online transfer" },
    is_settled: true, settled_at: daysAgo(3),
});

const settlement2 = await Settlement.create({
    driver: drivers[6]._id,
    period: { from: daysAgo(20), to: daysAgo(7) },
    journeys: [settledJourneys[2]._id, settledJourneys[3]._id],
    total_driver_expense: 1400, total_diesel_expense: 12300,
    total_distance: 860, avg_mileage: 4.35,
    rate_per_km: 22, diesel_rate: 95, extra_expense: 800,
    driver_total: 2200, owner_total: 18900, overall_total: 21100,
    payment_status: "DRL needs to pay",
    payment_meta: { mode: "Cash", date: daysAgo(5), remarks: "Cash settlement done" },
    is_settled: true, settled_at: daysAgo(5),
});

// Pending Settlements  (1 - Dashboard will show this)
const settlement3 = await Settlement.create({
    driver: drivers[9]._id,
    period: { from: daysAgo(12), to: daysAgo(2) },
    journeys: [journeyDocs[9]._id],
    total_driver_expense: 1100, total_diesel_expense: 8100,
    total_distance: 580, avg_mileage: 3.9,
    rate_per_km: 22, diesel_rate: 95, extra_expense: 300,
    driver_total: 1400, owner_total: 12700, overall_total: 14100,
    payment_status: "DRL needs to pay",
    is_settled: false,
});

// Update settled journeys with settlement refs
await TruckJourney.updateMany({ _id: { $in: [settledJourneys[0]._id, settledJourneys[1]._id] } }, { settlement_ref: settlement1._id });
await TruckJourney.updateMany({ _id: { $in: [settledJourneys[2]._id, settledJourneys[3]._id] } }, { settlement_ref: settlement2._id });
console.log("  ✅ 3 Settlements seeded (2 settled, 1 pending).");

// ═══════════════════════════════════════════════════════════════════════════════
// 10. LEDGER ENTRIES (12 entries covering all categories)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📒 Seeding Ledger Entries...");
await Ledger.insertMany([
    // Freight Income
    { date: new Date(daysAgo(5)), journey: journeyDocs[5]._id, truck: trucks[5]._id, driver: drivers[5]._id, party: billingParties[0]._id, category: "Freight Income", transaction_type: "Journey", description: "Mumbai-Pune freight received", credit: 45000, debit: 0, payment_mode: "Bank", reference_no: "NEFT2025001", reference_type: "UTR", notes: "Full payment received on delivery" },
    // Diesel Expense
    { date: new Date(daysAgo(3)), journey: journeyDocs[0]._id, truck: trucks[0]._id, driver: drivers[0]._id, category: "Diesel Expense", transaction_type: "Journey", description: "Diesel filling - Delhi to Mumbai", credit: 0, debit: 8500, payment_mode: "Cash", reference_no: "PUMP-001", reference_type: "Slip", notes: "Petrol pump receipt attached" },
    // Driver Advance
    { date: new Date(daysAgo(7)), truck: trucks[2]._id, driver: drivers[2]._id, category: "Driver Advance", transaction_type: "Expense", description: "Cash advance to Mohan Yadav", credit: 0, debit: 3000, payment_mode: "Cash", reference_no: "", reference_type: "Voucher", notes: "" },
    // Driver Settlement
    { date: new Date(daysAgo(3)), settlement: settlement1._id, driver: drivers[5]._id, category: "Driver Settlement", transaction_type: "Driver Settlement", description: "Final settlement payout for May", credit: 0, debit: 10500, payment_mode: "Bank", reference_no: "NEFT2025002", reference_type: "UTR", notes: "Settled for period 1-15 May" },
    // In Account (freight credited to account)
    { date: new Date(daysAgo(9)), journey: journeyDocs[6]._id, driver: drivers[6]._id, party: billingParties[1]._id, category: "In Account", transaction_type: "Payment Receipt", description: "Ludhiana-Delhi freight in AC", credit: 72000, debit: 0, payment_mode: "UPI", reference_no: "UPI202505001", reference_type: "UTR", notes: "Payment from party" },
    // Toll Expense
    { date: new Date(daysAgo(1)), journey: journeyDocs[1]._id, truck: trucks[1]._id, driver: drivers[1]._id, category: "Toll Expense", transaction_type: "Expense", description: "Toll charges Jaipur-Ahmedabad", credit: 0, debit: 1200, payment_mode: "Cash", reference_no: "", reference_type: "Slip", notes: "Multiple toll plazas" },
    // Repair Expense
    { date: new Date(daysAgo(8)), journey: journeyDocs[14]._id, truck: trucks[2]._id, driver: drivers[2]._id, category: "Repair Expense", transaction_type: "Expense", description: "Engine overheating repair Haridwar", credit: 0, debit: 1500, payment_mode: "Cash", reference_no: "", reference_type: "Voucher", notes: "Mechanic workshop bill" },
    // Office Expense
    { date: new Date(daysAgo(4)), category: "Office Expense", transaction_type: "Manual Adjustment", description: "Stationery and office supplies", credit: 0, debit: 2500, payment_mode: "Cash", reference_no: "", reference_type: "Bill", notes: "Monthly stationery" },
    // Payment Received from party
    { date: new Date(daysAgo(6)), party: billingParties[4]._id, category: "Payment Received", transaction_type: "Payment Receipt", description: "Partial payment from Sai Road Carriers", credit: 15000, debit: 0, payment_mode: "Cheque", reference_no: "CHQ-45678", reference_type: "Cheque", notes: "Cheque dated 15 Feb" },
    // Cash Transfer
    { date: new Date(daysAgo(2)), truck: trucks[0]._id, category: "Cash Transfer", transaction_type: "Manual Adjustment", description: "Cash transfer to truck fund", credit: 0, debit: 5000, payment_mode: "Cash", reference_no: "", reference_type: "None", notes: "" },
    // Journey Settlement
    { date: new Date(daysAgo(4)), journey: journeyDocs[9]._id, driver: drivers[9]._id, category: "Journey Settlement", transaction_type: "Journey", description: "Kolkata-Patna journey settlement", credit: 0, debit: 9200, payment_mode: "Bank", reference_no: "NEFT2025003", reference_type: "UTR", notes: "Expense + diesel settlement" },
    // Other Income
    { date: new Date(daysAgo(10)), category: "Other Income", transaction_type: "Manual Adjustment", description: "Container cleaning charges recovered", credit: 3000, debit: 0, payment_mode: "Cash", reference_no: "", reference_type: "None", notes: "Recovery from client" },
]);
console.log("  ✅ 12 Ledger Entries seeded.");

// ─── Done ─────────────────────────────────────────────────────────────────────
console.log("\n🎉 Database seeding complete!");
console.log("═══════════════════════════════════════════════════════════");
console.log("  Trucks:           12");
console.log("  Drivers:          12");
console.log("  Journeys:         17 (5 Active, 4 Settled, 4 Completed-Unsettled, 2 Delayed, 2 Cancelled)");
console.log("  Billing Parties:  10");
console.log("  Bill Entries:     12");
console.log("  Balance Parties:  10");
console.log("  Vehicle Entries:  14 (Pending/Received × From DRL/To DRL)");
console.log("  Settlements:       3 (2 settled, 1 pending)");
console.log("  Ledger Entries:   12 (all major categories)");
console.log("═══════════════════════════════════════════════════════════\n");

await mongoose.disconnect();
process.exit(0);
