import React from "react";
import styles from "./Invoice.module.scss";
import Logo from "../../assets/logo.png";
import type { BillEntryType } from "../../types/billEntry";
import { formatDate } from "../../utils/formatDate";

interface InvoiceProps {
  entry: BillEntryType
}

const Invoice: React.FC<InvoiceProps> = ({ entry }) => {
  let lrDate = new Date();
  if (entry?.lr_date) {
    lrDate = new Date(entry?.lr_date);
  }
  return (
    <div className={styles.invoice}>
      <div className={styles.header}>
        <div className={`${styles.box} ${styles.flex_1} ${styles.text_center}`}>
          <div className={styles.logo}>
            <img src={Logo} alt="Logo" />
          </div>
          <div>
            <div className={styles.field_name}>Address of Deliver Office:</div>
            <div className={styles.underlineText}>GURUGRAM</div>
          </div>
        </div>
        <div className={`${styles.box} ${styles.flex_5} ${styles.text_center}`}>
          <div className={`${styles.bold}`}>
            Subject to Mathura Juridiction Only
          </div>
          <div className={styles.drl}>Divyanshi Road Lines</div>
          <div className={`${styles.bold}`}>
            FLEET OWNER & TRANSPORT CONTRACTORS & COMMISION AGENT
          </div>
          <div className={`${styles.bold}`}>
            Head Office: Yamuna Vihar, Near Essar Fuel Pump, Lohvan Bhagichi,
            Laxmi Nagar, Mathura - 281001
          </div>
          <div className={`${styles.bold}`}>
            Branch Office: Sunari Aparna Pream, Near Kuber Jee Dharam Kanta,
            Shashtripuram, Agra - 281305
          </div>
          <div className={`${styles.bold}`}>
            Mob:- 8630836045, 7983635608, 8449991690 Email:-{" "}
            <span className={styles.email}>drldivyashi@gmail.com</span>
          </div>
        </div>
        <div className={`${styles.box} ${styles.flex_1} ${styles.text_center}`}>
          <div className={`${styles.bold}`}>
            Address of Issuing office or Name & Address of the Agent:
          </div>
          <div></div>
        </div>
      </div>

      <div className={styles.section_1}>
        <div className={`${styles.box} ${styles.flex_1} ${styles.lr_no_box}`}>
          <div>
            <p className={`${styles.lr_header} ${styles.bold}`}>No.:</p>
            <p className={styles.auto_populated}>{entry?.lr_no}</p>
          </div>
          <div>
            <p className={`${styles.lr_header} ${styles.bold}`}>Date:</p>
            <p className={styles.auto_populated}>{formatDate(lrDate)}</p>
          </div>
        </div>
        <div className={`${styles.box} ${styles.flex_4} ${styles.owner_risk}`}>
          <div className={styles.text_center}>AT OWNERS RISK</div>
          <div>The Customer has started that.</div>
          <div>He has insured the consignment</div>
          <div className={styles.details}>
            <div className={`${styles.parentDiv} ${styles.bottom}`}>
              <div className={styles.childDiv}>
                <p className={styles.bold}>Policy No.:</p>
                <p className={styles.childValue}>_____________</p>
              </div>
              <div className={styles.childDiv}>
                <p className={styles.bold}>Amount:</p>
                <p className={styles.childValue}>_____________</p>
              </div>
            </div>
            <div className={styles.parentDiv}>
              <div className={styles.childDiv}>
                <p className={styles.bold}>BE No:</p>
                <p className={styles.childValue}>______________</p>
              </div>
              <div className={styles.childDiv}>
                <p className={styles.bold}>BE Date:</p>
                <p className={styles.childValue}>______________</p>
              </div>
              <div className={styles.childDiv}>
                <p className={styles.bold}>Date:</p>
                <p className={styles.childValue}>______________</p>
              </div>
              <div className={styles.childDiv}>
                <p className={styles.bold}>Risk:</p>
                <p className={styles.childValue}>______________</p>
              </div>
            </div>
          </div>
          <hr />
          <div className={`${styles.parentDiv} ${styles.pan_gst}`}>
            <div className={styles.childDiv}>
              <p className={styles.bold}>PAN NO.:</p>
              <p>____________</p>
            </div>
            <div className={styles.childDiv}>
              <p className={styles.bold}>GST NO.:</p>
              <p>______________</p>
            </div>
          </div>
        </div>
        <div
          className={`${styles.box} ${styles.flex_1} ${styles.bold} ${styles.damage_section}`}
        >
          <div>
            <p>GST Payable By</p>
            <p>Consignee</p>
          </div>
          <hr />
          <div>
            <p>SCHEDULE OF DEMURAGE CHARGES</p>
            <p>Demurage Charges after ___ days</p>
            <p>days from today @Rs _____ per</p>
            <p>days Qtl, on weight charged.</p>
          </div>
          <hr />
          <div>
            NOT RESPONSIBLE FOR LEAKAGE & BREAKAGE DELIVERY AGAINST PAYMENT
          </div>
        </div>
        <div
          className={`${styles.box} ${styles.flex_1} ${styles.invoice_info}`}
        >
          <div>
            <p className={`${styles.bold}`}>Mode of Packing</p>
            <p className={styles.auto_populated}>{entry?.mode_of_packing || ""}</p>
          </div>
          <hr />
          <div>
            <p className={`${styles.bold}`}>Invoice No</p>
            <p className={styles.auto_populated}>{entry?.invoice_no || ""}</p>
          </div>
          <hr />
          <div>
            <p className={`${styles.bold}`}>Consignee GST No</p>
            <p className={styles.auto_populated}>{entry?.consignor_gst_no}</p>
          </div>
          <hr />
          <div>
            <p className={`${styles.bold}`}>Consignor GST No</p>
            <p className={styles.auto_populated}>{entry?.consignor_gst_no}</p>
          </div>
        </div>
      </div>

      <div className={styles.section_2}>
        <div
          className={`${styles.box} ${styles.flex_4} ${styles.consignor_details}`}
        >
          <div className={styles.outerDiv}>
            <div className={styles.bold}>Consignor's Name & Address</div>
            <div
              className={`${styles.auto_populated} ${styles.consignor_values}`}
            >
              <p>{entry?.consignor_name}</p>
              <p>{entry?.consignor_from_address}</p>
            </div>
          </div>
          <hr />
          <div className={styles.outerDiv}>
            <div className={styles.bold}>Consignee's Name & Address</div>
            <div
              className={`${styles.auto_populated} ${styles.consignor_values}`}
            >
              <p>{entry?.consignee}</p>
              <p>{entry?.consignor_to_address}</p>
            </div>
          </div>
        </div>
        <div
          className={`${styles.box} ${styles.flex_1} ${styles.vehicle_details}`}
        >
          <div className={styles.innerDiv}>
            <p className={styles.bold}>Vehicle No:</p>
            <p className={`${styles.auto_populated} ${styles.values}`}>
              {entry?.vehicle_no}
            </p>
          </div>
          <hr />
          <div>
            <div className={styles.innerDiv}>
              <p className={styles.bold}>From:</p>
              <p className={`${styles.auto_populated} ${styles.values}`}>
                {entry?.from}
              </p>
            </div>
            <hr />
            <div className={styles.innerDiv}>
              <p className={styles.bold}>To:</p>
              <p className={`${styles.auto_populated} ${styles.values}`}>
                {entry?.to}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`${styles.box} ${styles.flex_1} ${styles.innerPadding} ${styles.flex_center}`}
        >
          <div>
            <p className={styles.bold}>Excise Gate Pass No.</p>
            <p>___________</p>
          </div>
          <hr />
          <div>
            <p className={styles.bold}>Remark</p>
            <p>__________</p>
          </div>
        </div>
      </div>

      <div className={styles.section_3}>
        <div className={`${styles.box} ${styles.flex_6}`}>
          <table>
            <thead>
              <tr className={styles.tableHeader}>
                <th>PACKAGES</th>
                <th className={styles.description}>
                  DESCRIPTION (SAID TO CONTAIN)
                </th>
                <th>WEIGHT (ACTUAL)</th>
                <th>WEIGHT (CHARGED)</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.tableBody}>
                <td className={styles.auto_populated}>{entry?.pkg}</td>
                <td className={styles.description}>
                  <div>Container No</div>
                  <div>
                    The Consignment is booked subject to Specific Terms &
                    condition Printed overleaf & accepted by the consignor
                  </div>
                </td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={`${styles.box} ${styles.flex_2}`}>
          <table>
            <thead>
                <tr>
                    <th style={{ width: '40%'}} rowSpan={2}>RATE</th>
                    <th colSpan={2}>AMOUNT TO PAY PAID / TBB</th>
                </tr>
              <tr>
                <th>Rs</th>
                <th>Ps</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.tableBody}>
                <td style={{ fontWeight: "bold", textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    <p>Hire Amount</p>
                    <p>Hamali</p>
                    <p>St. Ch.</p>
                    <p>Service Tax</p>
                    <p>Risk Ch.</p>
                </td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={`${styles.box} ${styles.flex_1} ${styles.innerPadding}`}>
            <div>
                <p className={styles.bold}>Sales Bill No</p>
                <p>____________</p>
            </div>
            <hr />
            <div>
                <p className={styles.bold}>Eway Bill No</p>
                <p className={styles.auto_populated}>{entry?.eway_bill_no || "_______"}</p>
            </div>
            <hr />
            <div>
                <p className={styles.bold}>Empty Yard Name</p>
                <p>____________</p>
            </div>
            <hr />
            <div>
                <p className={styles.bold}>TO PAY/PAID/TBB</p>
                <p>___________</p>
            </div>
        </div>
      </div>

      <div className={styles.section_4}>
        <div className={styles.lastDiv}>
            <p className={styles.bold}>Value Rs</p>
            <p className={styles.auto_populated}>{entry?.value}</p>
        </div>
        <div className={styles.lastDiv}>
            <p className={styles.bold}>Name of Transport Operator</p>
            <p>__________________________</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
