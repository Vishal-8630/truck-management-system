export interface BillingPartyType {
  _id: string;
  name: string;
  address: string;
  gst_no: string;
}

export const PARTY_LABELS: Record<string, string> = {
  name: "Billing Party Name",
  address: "Billing Party Address",
  gst_no: "Billing Party GST Number",
};

export const EmptyBillingParty: BillingPartyType = {
  _id: "",
  name: "",
  address: "",
  gst_no: "",
};
