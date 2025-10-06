export interface BalancePartyType {
    _id: string;
    party_name: string;
}

export const EmptyBalanceParty: Omit<BalancePartyType, "_id"> = {
    party_name: ""
}

export const BALANCE_PARTY_LABELS = {
  party_name: "Party Name",
};
