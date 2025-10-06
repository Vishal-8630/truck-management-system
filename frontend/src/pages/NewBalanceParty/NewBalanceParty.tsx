import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { BalancePartyType } from "../../types/balanceParty";
import type { AppDispatch } from "../../app/store";

import styles from "./NewBalanceParty.module.scss";

import FormSection from "../../components/FormSection";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import Loading from "../../components/Loading";

import { EmptyBalanceParty } from "../../types/balanceParty";
import { addBalancePartyAsync, selectBalancePartyLoading } from "../../features/balanceParty";
import { addMessage } from "../../features/message";

const NewBalanceParty: React.FC = () => {
  /* --------------------- Redux & Navigation --------------------- */
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectBalancePartyLoading);

  /* -------------------- Local State ---------------------------- */
  const [balanceParty, setBalanceParty] = useState<Omit<BalancePartyType, "_id">>(EmptyBalanceParty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ------------------- Handle Change -------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setBalanceParty((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------ Handle form submit ----------------------- */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(addBalancePartyAsync(balanceParty));

    if (addBalancePartyAsync.fulfilled.match(resultAction)) {
      dispatch(addMessage({ type: "success", text: "Balance Party added successfully" }));
      navigate("/vehicle-entry/all-balance-parties");
    } else if (addBalancePartyAsync.rejected.match(resultAction)) {
      const errors = resultAction.payload;
      if (errors && Object.keys(errors).length > 0) {
        setErrors(errors);
      }
      dispatch(addMessage({
        type: "error",
        text: errors?.message || "Please fill all the required fields",
      }));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.balancePartyFormContainer}>
      <form className={styles.balancePartyForm} onSubmit={handleFormSubmit}>
        <div className={styles.inputArea}>
          <FormSection title="New Balance Party">
            <FormInput
              type="text"
              id="party_name"
              name="party_name"
              label="Party Name"
              value={balanceParty.party_name}
              placeholder="Party Name"
              error={errors.party_name}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              text="Add Balance Party"
              variant="primary"
              loading={loading}
              disabled={loading}
              className={styles.submitBtn}
            />
          </FormSection>
        </div>
      </form>
    </div>
  );
};

export default NewBalanceParty;