import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  billEntrySelectors,
  fetchBillEntriesAsync,
  selectBillEntryLoading,
} from "../../../features/billEntry";
import { ENTRY_LABELS, type BillEntryType } from "../../../types/billEntry";
import Loading from "../../../components/Loading";
import styles from "./BillEntryDetail.module.scss";
import EditHeader from "../../../components/EditHeader";
import DetailBlock from "../../JourneyPages/JourneyDetail/components/DetailBlock";
import { formatDate } from "../../../utils/formatDate";
import {
  billingPartySelectors,
} from "../../../features/billingParty";
import type { Option } from "../NewBillingEntry/constants";

const BillEntryDetail = () => {
  const { id } = useParams();
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectBillEntryLoading);
  const billEntries = useSelector(billEntrySelectors.selectAll);

  const billingParties = useSelector(billingPartySelectors.selectAll);
  const [localBillEntry, setLocalBillEntry] = useState<BillEntryType | null>(
    null
  );
  const [backupBillEntry, setBackupBillEntry] = useState<BillEntryType | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const stateOptions: Option[] = [
      { label: "UP", value: "UP" },
      { label: "Other", value: "Other" }
  ]

  const emptyFieldValue = "----------";
  const safeDate = (date?: string) =>
    date ? formatDate(new Date(date)) : emptyFieldValue;

  useEffect(() => {
    dispatch(fetchBillEntriesAsync());
  }, []);

  const billEntry = billEntries.find((entry) => entry._id === id);

  useEffect(() => {
    if (billEntry && !loading) {
      setLocalBillEntry(billEntry);
    }
  }, [billEntries, loading, id]);

  if (loading || !localBillEntry) return <Loading />;

  const isDirty = JSON.stringify(localBillEntry) !== JSON.stringify(billEntry);

  const billingPartyOptions = (): Option[] => {
    let options: Option[] = [];
    billingParties.map((billingParty) =>
      options.push({ label: billingParty.name, value: billingParty.name })
    );
    return options;
  };

  const handleEdit = (key: string, value: string) => {
    setLocalBillEntry((prev) => {
      if (!prev) return prev;

      if (key.startsWith("billing_party.")) {
        const billingParty = billingParties.find(
          (p) => p.name.toLowerCase() === value.toLowerCase()
        );
        if (billingParty) {
          return {
            ...prev,
            billing_party: billingParty,
          };
        }
      }

      console.log(localBillEntry);

      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleDelete = (id: string) => {};

  const handleSave = async () => {};

  return (
    <div className={styles.billEntryContainer}>
      <EditHeader
        heading="Bill Entry"
        isDirty={isDirty}
        onEditClick={() => {
          setIsEditMode(true);
          setBackupBillEntry(localBillEntry);
        }}
        onCancelClick={() => {
          setIsEditMode(false);
          setLocalBillEntry(backupBillEntry);
        }}
        onDeleteClick={() => {
          setIsEditMode(false);
          handleDelete(localBillEntry._id);
        }}
        onDiscardClick={() => {
          setIsEditMode(false);
          setLocalBillEntry(backupBillEntry);
        }}
        onSaveClick={() => {
          setIsEditMode(false);
          handleSave();
        }}
      />
      <div className={styles.billEntryDetail}>
        <DetailBlock
          title="Bill Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "bill_no",
              label: ENTRY_LABELS["bill_no"],
              value: localBillEntry.bill_no,
              isEditable: true,
            },
            {
              key: "bill_date",
              label: ENTRY_LABELS["bill_date"],
              value: safeDate(localBillEntry.bill_date),
              isEditable: true,
            },
            {
              key: "billing_party.name",
              label: "Billing Party",
              value: localBillEntry.billing_party.name,
              options: billingPartyOptions(),
              isEditable: true,
            },
            {
              key: "billing_party.address",
              label: "Billing Party Address",
              value: localBillEntry.billing_party.address,
            },
            {
              key: "billing_party.gst_no",
              label: "Billing Party GST No.",
              value: localBillEntry.billing_party.gst_no,
            },
          ]}
        />
        <DetailBlock
          title="LR Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "lr_no",
              label: ENTRY_LABELS["lr_no"],
              value: localBillEntry.lr_no,
              isEditable: true,
            },
            {
              key: "lr_date",
              label: ENTRY_LABELS["lr_date"],
              value: safeDate(localBillEntry.lr_date),
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Consignor Detail"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "consignor_name",
              label: ENTRY_LABELS["consignor_name"],
              value: localBillEntry.consignor_name,
              isEditable: true,
            },
            {
              key: "consignor_from_address",
              label: ENTRY_LABELS["consignor_from_address"],
              value: localBillEntry.consignor_from_address,
              isEditable: true,
            },
            {
              key: "consignor_gst_no",
              label: ENTRY_LABELS["consignor_gst_no"],
              value: localBillEntry.consignor_gst_no,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Consignee Detail"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "consignee",
              label: ENTRY_LABELS["consignee"],
              value: localBillEntry.consignee,
              isEditable: true,
            },
            {
              key: "consignor_to_address",
              label: ENTRY_LABELS["consignor_to_address"],
              value: localBillEntry.consignor_to_address,
              isEditable: true,
            },
            {
              key: "consignee_gst_no",
              label: ENTRY_LABELS["consignee_gst_no"],
              value: localBillEntry.consignee_gst_no,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Vehicle & Packages Information"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "pkg",
              label: ENTRY_LABELS["pkg"],
              value: localBillEntry.pkg,
              isEditable: true,
            },
            {
              key: "vehicle_no",
              label: ENTRY_LABELS["vehicle_no"],
              value: localBillEntry.vehicle_no,
              isEditable: true,
            },
            {
              key: "from",
              label: ENTRY_LABELS["from"],
              value: localBillEntry.from,
              isEditable: true,
            },
            {
              key: "to",
              label: ENTRY_LABELS["to"],
              value: localBillEntry.to,
              isEditable: true,
            },
            {
              key: "be_no",
              label: ENTRY_LABELS["be_no"],
              value: localBillEntry.be_no,
              isEditable: true,
            },
            {
              key: "be_date",
              label: ENTRY_LABELS["be_date"],
              value: safeDate(localBillEntry.be_date),
              isEditable: true,
            },
            {
              key: "weight",
              label: ENTRY_LABELS["weight"],
              value: localBillEntry.weight,
              isEditable: true,
            },
            {
              key: "cbm",
              label: ENTRY_LABELS["cbm"],
              value: localBillEntry.cbm,
              isEditable: true,
            },
            {
              key: "fixed",
              label: ENTRY_LABELS["fixed"],
              value: localBillEntry.fixed,
              isEditable: true,
            },
            {
              key: "rate_per",
              label: ENTRY_LABELS["rate_per"],
              value: localBillEntry.rate_per,
              isEditable: true,
            },
            {
              key: "mode_of_packing",
              label: ENTRY_LABELS["mode_of_packing"],
              value: localBillEntry.mode_of_packing,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Invoice & Eway"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "invoice_no",
              label: ENTRY_LABELS["invoice_no"],
              value: localBillEntry.invoice_no,
              isEditable: true,
            },
            {
              key: "eway_bill_no",
              label: ENTRY_LABELS["eway_bill_no"],
              value: localBillEntry.eway_bill_no,
              isEditable: true,
            },
            {
              key: "description_of_goods",
              label: ENTRY_LABELS["description_of_goods"],
              value: localBillEntry.description_of_goods,
              isEditable: true,
            },
            {
              key: "container_no",
              label: ENTRY_LABELS["container_no"],
              value: localBillEntry.container_no,
              isEditable: true,
            },
            {
              key: "value",
              label: ENTRY_LABELS["value"],
              value: localBillEntry.value,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Clear & Yard"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "name_of_clerk",
              label: ENTRY_LABELS["name_of_clerk"],
              value: localBillEntry.name_of_clerk,
              isEditable: true,
            },
            {
              key: "empty_yard_name",
              label: ENTRY_LABELS["empty_yard_name"],
              value: localBillEntry.empty_yard_name,
              isEditable: true,
            },
            {
              key: "remark_if_any",
              label: ENTRY_LABELS["remark_if_any"],
              value: localBillEntry.remark_if_any,
              isEditable: true,
            }
          ]}
        />
        <DetailBlock
          title="Billing & Hire"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "to_be_billed_at",
              label: ENTRY_LABELS["to_be_billed_at"],
              value: localBillEntry.to_be_billed_at,
              isEditable: true,
            },
            {
              key: "hire_amount",
              label: ENTRY_LABELS["hire_amount"],
              value: localBillEntry.hire_amount,
              isEditable: true,
            },
            {
              key: "risk",
              label: ENTRY_LABELS["risk"],
              value: localBillEntry.risk,
              isEditable: true,
            },
            {
              key: "address_of_billing_office",
              label: ENTRY_LABELS["address_of_billing_office"],
              value: localBillEntry.address_of_billing_office,
              isEditable: true,
            },
            {
              key: "rate",
              label: ENTRY_LABELS["rate"],
              value: localBillEntry.rate,
              isEditable: true,
            },
            {
              key: "advance",
              label: ENTRY_LABELS["advance"],
              value: localBillEntry.advance,
              isEditable: true,
            },
          ]}
        />
        <DetailBlock
          title="Tax & Total"
          isEditMode={isEditMode}
          onChange={(key, value) => handleEdit(key, value)}
          fields={[
            {
              key: "state",
              label: "State",
              value: localBillEntry.tax_state,
              isEditable: true,
              options: stateOptions
            },
            {
              key: "sub_total",
              label: ENTRY_LABELS["sub_total"],
              value: localBillEntry.sub_total,
              isEditable: true,
            },
            {
              key: "cgst",
              label: ENTRY_LABELS["cgst"],
              value: localBillEntry.cgst,
              isEditable: true,
            },
            {
              key: "sgst",
              label: ENTRY_LABELS["sgst"],
              value: localBillEntry.sgst,
              isEditable: true,
            },
            {
              key: "igst",
              label: ENTRY_LABELS["igst"],
              value: localBillEntry.igst,
              isEditable: true,
            },
            {
              key: "grand_total",
              label: ENTRY_LABELS["grand_total"],
              value: localBillEntry.grand_total,
              isEditable: true,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default BillEntryDetail;
