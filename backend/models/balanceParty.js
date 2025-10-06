import mongoose from 'mongoose';

const balancePartySchema = mongoose.Schema({
    party_name: {
        type: String
    }
}, { timestamps: true });

const BalanceParty = mongoose.model("BalanceParty", balancePartySchema);
export default BalanceParty;