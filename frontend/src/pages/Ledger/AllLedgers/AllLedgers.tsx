import { useSelector } from "react-redux";
import styles from "./AllLedgers.module.scss";
import {
  fetchLedgerEntriesAsync,
  ledgerSelectors,
  selectLedgerLoading,
} from "../../../features/ledger";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Loading from "../../../components/Loading";
import type { LedgerType } from "../../../types/ledger";

const AllLedgers = () => {
  const dispatch: AppDispatch = useDispatch();

  const ledgers = useSelector(ledgerSelectors.selectAll);
  const loading = useSelector(selectLedgerLoading);

  useEffect(() => {
    dispatch(fetchLedgerEntriesAsync());
  }, [dispatch]);

  if (loading) return <Loading />;

  return (
    <div className={styles.allLedgersContainer}>
      <h1 className={styles.heading}>All Ledgers</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Amount</th>
            <th>Truck</th>
            <th>Driver</th>
            <th>Party</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ledgers.length === 0 ? (
            <tr>
              <td colSpan={9} className={styles.empty}>
                No ledger entries found
              </td>
            </tr>
          ) : (
            ledgers.map((entry: LedgerType) => (
              <tr key={entry._id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.category}</td>
                <td>{entry.debit}</td>
                <td>{entry.credit}</td>
                <td>{entry.amount}</td>
                <td>
                  {entry.truck ? (
                    <Link to={`/journey/truck/${entry.truck._id}`} className={styles.link}>
                      View
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {entry.driver ? (
                    <Link
                      to={`/journey/driver-detail/${entry.driver._id}`}
                      className={styles.link}
                    >
                      View
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {entry.party ? (
                    <Link to={`/party/${entry.party}`} className={styles.link}>
                      View
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <Link to={`/ledger/ledger-detail/${entry._id}`} className={styles.viewBtn}>
                    Details
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllLedgers;
