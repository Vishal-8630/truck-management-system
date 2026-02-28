/**
 * Divyanshi Road Lines — LARGE Scale Seed Script
 * Generates thousands of records to simulate a production-size database.
 * Does NOT clear existing data — appends on top.
 *
 * Run: node seedLarge.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Truck from "./models/truckModel.js";
import Driver from "./models/driverModel.js";
import TruckJourney from "./models/truckJourneyModel.js";
import BillingParty from "./models/billingPartyModel.js";
import Entry from "./models/billingEntryModel.js";
import BalanceParty from "./models/balanceParty.js";
import VehicleEntry from "./models/vehicleEntryModel.js";
import Settlement from "./models/settlementModel.js";
import Ledger from "./models/ledgerModel.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

// ─── Utility ─────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; };
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const rupees = (min, max) => String(rand(min, max));
const pad = (n, z = 5) => String(n).padStart(z, "0");

// ─── Reference Data ───────────────────────────────────────────────────────────
const CITIES = [
    "Delhi", "Mumbai", "Pune", "Ahmedabad", "Jaipur", "Kolkata", "Hyderabad",
    "Chennai", "Bangalore", "Lucknow", "Chandigarh", "Amritsar", "Ludhiana",
    "Agra", "Meerut", "Surat", "Vadodara", "Nagpur", "Bhopal", "Indore",
    "Patna", "Raipur", "Jodhpur", "Udaipur", "Kota", "Rohtak", "Faridabad",
    "Gurgaon", "Hisar", "Ambala", "Rishikesh", "Haridwar", "Coimbatore", "Madurai",
    "Visakhapatnam", "Vijayawada", "Guwahati", "Bhubaneswar", "Dehradun", "Ranchi",
];

const DRIVER_NAMES = [
    "Anil Kumar", "Baldev Singh", "Chetan Yadav", "Devendra Patel", "Eknath Shinde",
    "Fayyaz Khan", "Ganesh Rawat", "Harpal Singh", "Indrapal Sharma", "Jagdish Verma",
    "Kailash Gupta", "Lakhan Tiwari", "Mahendra Nair", "Narendra Chauhan", "Om Prakash",
    "Pardeep Mishra", "Ramakant Joshi", "Sattva Hegde", "Trilok Mehta", "Uday Bose",
    "Veer Srivastava", "Wasim Ansari", "Xavier D'Souza", "Yashwant Reddy", "Zakir Hussain",
    "Amrit Pal", "Birendra Thakur", "Chiranjeev Pandey", "Dheeraj Rathore", "Ekram Ali",
    "Firoz Shaikh", "Gopal Das", "Hemant Bind", "Imran Qureshi", "Jasvir Sidhu",
    "Kulwant Dhaliwal", "Laxman Bhoi", "Mukesh Saini", "Nirmal Kashyap", "Omkar Kulkarni",
];

const TRUCK_STATES = ["HR", "UP", "DL", "RJ", "MH", "GJ", "PB", "MP", "WB", "KA", "TN", "AP", "TS", "BR", "OD"];
const TRUCK_SERIES = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T"];
const GOODS = ["MS Pipes", "Wheat", "Rice", "Auto Parts", "Textiles", "Marble", "Cement", "Steel Rods", "Electronics", "Pharmaceuticals", "FMCG Goods", "Chemicals", "Furniture", "Glass", "Tyres", "Machinery", "Food Grains", "Cotton Bales", "Plastic Granules", "Paper Reels"];
const BILLING_COMPANIES = [
    "Apex Logistics Pvt Ltd", "Bharat Transport Corp", "Century Freight Solutions", "Diamond Roadways",
    "Empire Cargo Services", "Falcon Logistics", "Ganesh Carriers", "Himalaya Transport",
    "Indus Road Lines", "Jaguar Logistics", "Kesari Carriers", "Laxmi Road Corp",
    "Marvel Logistics", "Navrang Freight", "Orbit Transport", "Pioneer Roadways",
    "Quest Cargo", "Royal Transport", "Shikhar Logistics", "Tara Road Lines",
    "Ultra Freight", "Vision Logistics", "Wisdom Carriers", "Xenith Transport",
    "Yuva Logistics", "Zenith Road Corp", "Ambica Carriers", "Bhavani Transport",
    "Chintamani Logistics", "Dhanlaxmi Freight",
];
const PARTY_NAMES = [
    "Akash Road Agency", "Bright Freight Hub", "Coastal Cargo Co.", "Dawn Logistics",
    "Eklinga Transport", "Fortune Freight", "Gateway Roadways", "Horizon Carriers",
    "Icon Transport", "Jalwa Logistics", "Kaveri Road Lines", "Lotus Carriers",
    "Mint Logistics", "Noble Freight", "Ocean Carriers", "Pearl Transport",
    "Quality Road Corp", "Rainbow Logistics", "Spirit Carriers", "Thunder Freight",
    "Unique Roadways", "Vector Transport", "Wholesale Logistics", "Xcell Cargo",
    "Yellow Freight", "Zen Transport", "Alpha Carriers", "Beta Logistics",
    "Capricorn Road Lines", "Delta Freight",
];
const OWNER_NAMES = ["Self", "Ramesh Kumar", "Mahesh Patel", "Suresh Singh", "Naresh Yadav", "Rajesh Verma", "Dinesh Gupta", "Hitesh Sharma", "Mitesh Patel", "Ritesh Jain"];

// ═══════════════════════════════════════════════════════════════════════════════
// Step 1: Fetch existing IDs for references
// ═══════════════════════════════════════════════════════════════════════════════
const existingTrucks = await Truck.find({}, "_id truck_no").lean();
const existingDrivers = await Driver.find({}, "_id name").lean();
console.log(`📦 Found ${existingTrucks.length} existing trucks, ${existingDrivers.length} existing drivers.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2: Add 38 more Trucks (total ~50)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n🚛 Adding more Trucks...");
const newTruckData = [];
const usedTruckNos = new Set(existingTrucks.map(t => t.truck_no));

for (let i = 0; i < 38; i++) {
    let truck_no;
    do {
        const state = pick(TRUCK_STATES);
        const dist = pad(rand(1, 99), 2);
        const series = pick(TRUCK_SERIES);
        const num = pad(rand(1000, 9999), 4);
        truck_no = `${state}-${dist}-${series}-${num}`;
    } while (usedTruckNos.has(truck_no));
    usedTruckNos.add(truck_no);

    newTruckData.push({
        truck_no,
        fitness_doc_expiry: daysFromNow(rand(-10, 500)),
        insurance_doc_expiry: daysFromNow(rand(-5, 400)),
        national_permit_doc_expiry: daysFromNow(rand(10, 600)),
        state_permit_doc_expiry: daysFromNow(rand(-5, 500)),
        tax_doc_expiry: daysFromNow(rand(1, 365)),
        pollution_doc_expiry: daysFromNow(rand(-10, 200)),
        last_service_kms: rand(50000, 500000),
        service_interval: pick([10000, 12000, 15000]),
    });
}
const newTrucks = await Truck.insertMany(newTruckData);
console.log(`  ✅ ${newTrucks.length} new Trucks added.`);
const allTrucks = [...existingTrucks, ...newTrucks];

// ═══════════════════════════════════════════════════════════════════════════════
// Step 3: Add 28 more Drivers (total ~40)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("👤 Adding more Drivers...");
const usedAdhaar = new Set();
const usedDL = new Set();
const newDriverData = [];

for (let i = 0; i < 28; i++) {
    let adhaar_no, dl;
    do { adhaar_no = String(rand(100000000000, 999999999999)); } while (usedAdhaar.has(adhaar_no));
    do { const st = pick(TRUCK_STATES); const yr = rand(2015, 2023); dl = `${st}${pad(rand(1, 20), 2)}${yr}${pad(rand(100000, 999999), 6)}`; } while (usedDL.has(dl));
    usedAdhaar.add(adhaar_no);
    usedDL.add(dl);

    const name = DRIVER_NAMES[i % DRIVER_NAMES.length] + (i >= DRIVER_NAMES.length ? ` ${Math.floor(i / DRIVER_NAMES.length) + 1}` : "");
    newDriverData.push({
        name,
        phone: `9${rand(700000000, 999999999)}`,
        home_phone: `9${rand(700000000, 999999999)}`,
        address: `${rand(1, 200)}, ${pick(CITIES)}`,
        adhaar_no,
        dl,
        amount_to_pay: rupees(0, 15000),
        amount_to_receive: rupees(0, 8000),
        advance_amount: rupees(0, 5000),
    });
}
const newDrivers = await Driver.insertMany(newDriverData);
console.log(`  ✅ ${newDrivers.length} new Drivers added.`);
const allDrivers = [...existingDrivers, ...newDrivers];

// ═══════════════════════════════════════════════════════════════════════════════
// Step 4: Add 30 more Billing Parties (total ~40)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🏢 Adding Billing Parties...");
const existingBP = await BillingParty.find({}, "_id").lean();
const newBPData = BILLING_COMPANIES.map((name, i) => ({
    name,
    address: `${rand(1, 500)}, ${pick(CITIES)}`,
    gst_no: `${pick(["07", "27", "24", "06", "29", "08", "03", "33", "09"])}AAAC${String.fromCharCode(65 + i % 26)}${pad(rand(1000, 9999), 4)}${String.fromCharCode(65 + rand(0, 25))}1Z${String.fromCharCode(65 + rand(0, 25))}`,
}));
const newBPs = await BillingParty.insertMany(newBPData);
const allBPs = [...existingBP, ...newBPs];
console.log(`  ✅ ${newBPs.length} Billing Parties added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 5: Add 30 more Balance Parties (total ~40)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("💰 Adding Balance Parties...");
const existingBalP = await BalanceParty.find({}, "_id").lean();
const newBalPs = await BalanceParty.insertMany(PARTY_NAMES.map(n => ({ party_name: n })));
const allBalPs = [...existingBalP, ...newBalPs];
console.log(`  ✅ ${newBalPs.length} Balance Parties added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 6: Add 280 more Journeys (total ~300)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🗺️  Adding bulk Journeys...");

const STATUSES = ["Active", "Completed", "Completed", "Completed", "Delayed", "Cancelled"]; // weighted towards Completed
const SETTLE_STATUSES = ["Settled", "Unsettled"];
const PAY_STATUSES = ["Pending", "Partially Paid", "Paid"];

const journeyBatch = [];
for (let i = 0; i < 280; i++) {
    const truck = pick(allTrucks);
    const driver = pick(allDrivers);
    const from = pick(CITIES);
    let to = pick(CITIES);
    while (to === from) to = pick(CITIES);

    const status = pick(STATUSES);
    const startOffset = rand(5, 400); // up to 400 days ago
    const journeyDays = rand(2, 10);
    const startDate = daysAgo(startOffset + journeyDays);
    const endDate = daysAgo(startOffset);
    const distKm = rand(150, 1800);
    const freightAmt = rand(15000, 120000);
    const driverExp = rand(200, 3000);
    const dieselAmt = rand(2000, 15000);
    const dieselQty = rand(15, 100);
    const isSettled = status === "Completed" && Math.random() > 0.35;
    const partyPayStatus = status === "Completed"
        ? (isSettled ? "Paid" : pick(["Pending", "Partially Paid"]))
        : "Pending";

    const journey = {
        truck: truck._id,
        driver: driver._id,
        from,
        to,
        route: [from, to],
        journey_days: String(journeyDays),
        journey_start_date: startDate,
        journey_end_date: endDate,
        distance_km: String(distKm),
        loaded_weight: `${rand(8, 25)} Tons`,
        average_mileage: `${(rand(35, 58) / 10).toFixed(1)}`,
        starting_kms: String(rand(50000, 500000)),
        ending_kms: String(rand(50000, 500000)),
        journey_starting_cash: rupees(1500, 8000),
        status,
        journey_settlement_status: isSettled ? "Settled" : "Unsettled",
        settled: isSettled,
        party_payment_status: partyPayStatus,
        party_payment_due_date: partyPayStatus !== "Paid" ? daysFromNow(rand(-5, 30)) : undefined,
        party_payment_received_date: partyPayStatus === "Paid" ? daysAgo(rand(1, 20)) : undefined,
        driver_expenses: [
            { amount: String(Math.floor(driverExp * 0.6)), reason: pick(["Food", "Toll", "Dhaba"]), date: startDate },
            { amount: String(Math.floor(driverExp * 0.4)), reason: pick(["Repair", "Toll", "Parking"]), date: endDate },
        ],
        diesel_expenses: [
            { amount: String(dieselAmt), quantity: String(dieselQty), filling_date: startDate },
        ],
        daily_progress: Array.from({ length: journeyDays }, (_, d) => ({
            day_number: String(d + 1),
            date: daysAgo(startOffset + journeyDays - d),
            location: d === 0 ? from : (d === journeyDays - 1 ? to : pick(CITIES)),
            remarks: d === 0 ? "Journey started" : (d === journeyDays - 1 ? "Reached destination" : "En route"),
        })),
    };

    if (isSettled) {
        journey.settlement = {
            amount_paid: rupees(freightAmt * 0.8, freightAmt),
            date_paid: daysAgo(rand(1, startOffset)),
            mode: pick(["Cash", "Bank Transfer", "UPI", "Cheque"]),
            remarks: pick(["Full settlement", "Partial + final balance cleared", "On-time payment", ""]),
        };
        journey.journey_summary = `${from} → ${to} (${journeyDays} days, ${distKm} km)`;
    }

    if (status === "Delayed") {
        journey.delays = [{ place: pick(CITIES), date: daysAgo(rand(1, startOffset)), reason: pick(["Traffic jam", "Road blockage", "Engine trouble", "Weather conditions", "Accident on highway", "License check by police"]) }];
    }
    if (status === "Cancelled") {
        journey.journey_summary = pick(["Cancelled by client", "Cancelled due to road closure", "Order cancelled by factory", "Weather conditions - floods"]);
    }

    journeyBatch.push(journey);
}

// Insert in chunks to keep it fast
const CHUNK = 50;
let journeysInserted = 0;
const allNewJourneys = [];
for (let i = 0; i < journeyBatch.length; i += CHUNK) {
    const chunk = journeyBatch.slice(i, i + CHUNK);
    const inserted = await TruckJourney.insertMany(chunk, { ordered: false });
    allNewJourneys.push(...inserted);
    journeysInserted += inserted.length;
    process.stdout.write(`\r  ✅ ${journeysInserted}/${journeyBatch.length} journeys inserted...`);
}
console.log(`\n  ✅ ${journeysInserted} Journeys added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 7: Add 300 Bill Entries
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📄 Adding bulk Bill Entries...");
const existingEntryCount = await Entry.countDocuments();
const billBatch = [];

for (let i = 0; i < 300; i++) {
    const freight = rand(10000, 150000);
    const igst = Math.round(freight * 0.05);
    const grandTotal = freight + igst;
    const daysBack = rand(1, 730);
    const from = pick(CITIES);
    let to = pick(CITIES);
    while (to === from) to = pick(CITIES);
    const bp = pick(allBPs);
    const truckNo = pick(allTrucks).truck_no;

    billBatch.push({
        bill_no: `BILL-${2024 + Math.floor(i / 150)}-${pad(existingEntryCount + i + 1)}`,
        bill_date: new Date(new Date().setDate(new Date().getDate() - daysBack)),
        billing_party: bp._id,
        lr_no: `LR-${pad(existingEntryCount + i + 1)}`,
        lr_date: new Date(new Date().setDate(new Date().getDate() - daysBack)),
        consignor_name: pick(BILLING_COMPANIES),
        consignee: pick(BILLING_COMPANIES),
        from,
        to,
        vehicle_no: truckNo,
        description_of_goods: pick(GOODS),
        hire_amount: String(freight),
        freight: String(freight),
        igst: String(igst),
        cgst: "0",
        sgst: "0",
        grand_total: String(grandTotal),
        sub_total: String(freight),
        advance: String(rand(0, Math.floor(freight * 0.3))),
        extra_charges: Math.random() > 0.6 ? [{ type: "Unloading", amount: String(rand(500, 5000)), rate: "", per_amount: "" }] : [],
        pkg: String(rand(1, 50)),
        weight: String(rand(2, 25)),
        to_be_billed_at: pick(CITIES),
        gst_up: pick(["5", "12", "18"]),
        eway_bill_no: `EWB${rand(100000000, 999999999)}`,
        invoice_no: `INV-${pad(rand(1, 99999))}`,
        mode_of_packing: pick(["Boxes", "Bags", "Pallets", "Loose", "Drums", "Rolls"]),
        risk: pick(["Owner's Risk", "Carrier's Risk"]),
    });
}

let billsInserted = 0;
for (let i = 0; i < billBatch.length; i += CHUNK) {
    const inserted = await Entry.insertMany(billBatch.slice(i, i + CHUNK), { ordered: false });
    billsInserted += inserted.length;
    process.stdout.write(`\r  ✅ ${billsInserted}/${billBatch.length} bill entries inserted...`);
}
console.log(`\n  ✅ ${billsInserted} Bill Entries added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 8: Add 350 Vehicle Entries
// ═══════════════════════════════════════════════════════════════════════════════
console.log("🚗 Adding bulk Vehicle Entries...");
const vehBatch = [];
for (let i = 0; i < 350; i++) {
    const freight = rand(8000, 100000);
    const driverCash = rand(1000, 8000);
    const dala = rand(200, 2000);
    const kamisan = rand(100, 1200);
    const inAc = Math.random() > 0.45 ? rand(0, freight) : 0;
    const balance = Math.max(0, freight - inAc);
    const status = inAc >= freight ? "Received" : "Pending";
    const movementType = Math.random() > 0.4 ? "From DRL" : "To DRL";
    const from = pick(CITIES);
    let to = pick(CITIES);
    while (to === from) to = pick(CITIES);
    const hasHalting = Math.random() > 0.75;
    const daysBack = rand(1, 730);
    const truckNo = pick(allTrucks).truck_no;

    vehBatch.push({
        date: daysAgo(daysBack),
        vehicle_no: truckNo,
        from,
        to,
        freight: String(freight),
        driver_cash: String(driverCash),
        dala: String(dala),
        kamisan: String(kamisan),
        in_ac: String(inAc),
        balance: String(balance),
        halting: hasHalting ? String(rand(500, 3000)) : "0",
        halting_in_date: hasHalting ? daysAgo(daysBack + 2) : "",
        halting_out_date: hasHalting ? daysAgo(daysBack) : "",
        pod_stock: pick(["Yes", "No"]),
        owner: pick(OWNER_NAMES),
        balance_party: pick(allBalPs)._id,
        status,
        movementType,
    });
}

let vehInserted = 0;
for (let i = 0; i < vehBatch.length; i += CHUNK) {
    const inserted = await VehicleEntry.insertMany(vehBatch.slice(i, i + CHUNK), { ordered: false });
    vehInserted += inserted.length;
    process.stdout.write(`\r  ✅ ${vehInserted}/${vehBatch.length} vehicle entries inserted...`);
}
console.log(`\n  ✅ ${vehInserted} Vehicle Entries added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 9: Add 25 Driver Settlements
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📊 Adding bulk Settlements...");
const settBatch = [];
for (let i = 0; i < 25; i++) {
    const driver = pick(allDrivers);
    const fromOffset = rand(30, 400);
    const toOffset = rand(5, fromOffset - 10);
    const isSettled = Math.random() > 0.3;
    const payStatus = pick(["DRL needs to pay", "Driver needs to pay", "Balanced"]);

    settBatch.push({
        driver: driver._id,
        period: { from: daysAgo(fromOffset), to: daysAgo(toOffset) },
        journeys: [],
        total_driver_expense: rand(1000, 20000),
        total_diesel_expense: rand(5000, 50000),
        total_diesel_quantity: rand(50, 400),
        total_journey_starting_cash: rand(5000, 30000),
        total_distance: rand(500, 5000),
        avg_mileage: parseFloat((rand(35, 55) / 10).toFixed(1)),
        rate_per_km: rand(18, 28),
        diesel_rate: rand(90, 105),
        extra_expense: rand(0, 5000),
        driver_total: rand(2000, 25000),
        owner_total: rand(10000, 80000),
        overall_total: rand(12000, 100000),
        payment_status: payStatus,
        payment_meta: isSettled ? {
            mode: pick(["Cash", "Bank Transfer", "UPI", "Cheque"]),
            date: daysAgo(toOffset - rand(1, 10)),
            remarks: pick(["Full settlement done", "Cleared after deductions", "Advance adjusted", ""]),
        } : undefined,
        is_settled: isSettled,
        settled_at: isSettled ? daysAgo(toOffset - 5) : null,
    });
}
const newSettlements = await Settlement.insertMany(settBatch);
console.log(`  ✅ ${newSettlements.length} Settlements added.`);

// ═══════════════════════════════════════════════════════════════════════════════
// Step 10: Add 300 Ledger Entries
// ═══════════════════════════════════════════════════════════════════════════════
console.log("📒 Adding bulk Ledger Entries...");

const CATEGORIES = [
    "Freight Income", "Diesel Expense", "Driver Advance", "Driver Settlement",
    "In Account", "Driver Expense", "Toll Expense", "Repair Expense",
    "Maintenance Expense", "Office Expense", "Payment Received", "Payment Made",
    "Cash Transfer", "Bank Transfer", "Other Income", "Other Expense", "Journey Settlement",
];
const PAYMENT_MODES = ["Cash", "Bank", "UPI", "Cheque", "Credit"];
const REF_TYPES = ["None", "Invoice", "Bill", "Voucher", "UTR", "Cheque", "LR", "Slip", "Ref"];
const TX_TYPES = ["Journey", "Vehicle Entry", "Driver Settlement", "Manual Adjustment", "Payment Receipt", "Expense"];

const INCOME_CATEGORIES = new Set(["Freight Income", "In Account", "Payment Received", "Other Income", "Bank Transfer"]);

const ledgerBatch = [];
for (let i = 0; i < 300; i++) {
    const category = pick(CATEGORIES);
    const isCredit = INCOME_CATEGORIES.has(category);
    const amount = rand(500, 150000);
    const daysBack = rand(1, 730);

    ledgerBatch.push({
        date: new Date(new Date().setDate(new Date().getDate() - daysBack)),
        truck: Math.random() > 0.4 ? pick(allTrucks)._id : undefined,
        driver: Math.random() > 0.4 ? pick(allDrivers)._id : undefined,
        party: Math.random() > 0.6 ? pick(allBPs)._id : undefined,
        category,
        transaction_type: pick(TX_TYPES),
        description: `${category} - ${pick(CITIES)} operations`,
        debit: isCredit ? 0 : amount,
        credit: isCredit ? amount : 0,
        amount,
        balance_type: isCredit ? "Credit" : "Debit",
        payment_mode: pick(PAYMENT_MODES),
        reference_no: Math.random() > 0.5 ? `REF${rand(10000, 999999)}` : "",
        reference_type: pick(REF_TYPES),
        notes: Math.random() > 0.6 ? pick(["Verified by manager", "Disputed - under review", "Auto-generated", "GST applicable", "Advance adjusted", ""]) : "",
        is_auto_generated: Math.random() > 0.8,
        is_verified: Math.random() > 0.5,
        balance_after_transaction: rand(10000, 2000000),
        gst_details: Math.random() > 0.6 ? {
            rate: pick([5, 12, 18]),
            amount: rand(100, 10000),
            cgst: rand(50, 5000),
            sgst: rand(50, 5000),
            igst: 0,
        } : { rate: 0, amount: 0, cgst: 0, sgst: 0, igst: 0 },
    });
}

let ledgerInserted = 0;
for (let i = 0; i < ledgerBatch.length; i += CHUNK) {
    const inserted = await Ledger.insertMany(ledgerBatch.slice(i, i + CHUNK), { ordered: false });
    ledgerInserted += inserted.length;
    process.stdout.write(`\r  ✅ ${ledgerInserted}/${ledgerBatch.length} ledger entries inserted...`);
}
console.log(`\n  ✅ ${ledgerInserted} Ledger Entries added.`);

// ─── Final Count ──────────────────────────────────────────────────────────────
const counts = await Promise.all([
    Truck.countDocuments(),
    Driver.countDocuments(),
    TruckJourney.countDocuments(),
    BillingParty.countDocuments(),
    Entry.countDocuments(),
    BalanceParty.countDocuments(),
    VehicleEntry.countDocuments(),
    Settlement.countDocuments(),
    Ledger.countDocuments(),
]);

console.log("\n🎉 LARGE SCALE Seeding Complete!");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  Trucks:              ${counts[0]}`);
console.log(`  Drivers:             ${counts[1]}`);
console.log(`  Journeys:            ${counts[2]}`);
console.log(`  Billing Parties:     ${counts[3]}`);
console.log(`  Bill Entries (LR):   ${counts[4]}`);
console.log(`  Balance Parties:     ${counts[5]}`);
console.log(`  Vehicle Entries:     ${counts[6]}`);
console.log(`  Settlements:         ${counts[7]}`);
console.log(`  Ledger Entries:      ${counts[8]}`);
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  TOTAL DOCUMENTS:     ${counts.reduce((a, b) => a + b, 0)}`);
console.log("═══════════════════════════════════════════════════════════════\n");

await mongoose.disconnect();
process.exit(0);
