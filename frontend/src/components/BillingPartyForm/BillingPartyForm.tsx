import styles from "./BillingPartyForm.module.scss";
import type { BillingPartyType } from "../../types/billingParty";
import FormSection from "../FormSection";
import FormInput from "../FormInput";

interface BillingPartyFormProps {
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  party: Omit<BillingPartyType, "_id">;
  errors: Record<string, string>;
}

const BillingPartyForm: React.FC<BillingPartyFormProps> = ({
  handleInputChange,
  handleSubmit,
  party,
  errors,
}) => {
  return (
    <div className={styles.partyFormContainer}>
      <form className={styles.partyForm} onSubmit={handleSubmit}>
        <FormSection title="Add Billing Party">
          <FormInput
            type="text"
            label="Name"
            id="name"
            name="name"
            value={party.name}
            onChange={handleInputChange}
            placeholder="Billing Party Name"
            error={errors.name}
          />
          <FormInput
            type="text"
            label="Address"
            id="address"
            name="address"
            value={party.address}
            onChange={handleInputChange}
            placeholder="Billing Party Address"
            error={errors.address}
          />
          <FormInput
            type="text"
            label="GST Number"
            id="gst_no"
            name="gst_no"
            value={party.gst_no}
            onChange={handleInputChange}
            placeholder="Billing Party GST Number"
            error={errors.gst_no}
          />
          <div className={styles.formControl}>
            <button className={styles.addBtn} type="submit">
              Add Party
            </button>
          </div>
        </FormSection>
      </form>
    </div>
  );
};

export default BillingPartyForm;
