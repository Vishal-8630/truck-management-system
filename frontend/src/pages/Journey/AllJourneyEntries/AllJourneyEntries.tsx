import { useEffect } from "react";
import type { AppDispatch } from "../../../app/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  fetchJourneyEntriesAsync,
  journeySelectors,
} from "../../../features/journey";
import styles from "./AllJourneyEntries.module.scss";
import JourneyCard from "../../../components/JourneyCard";
import { useNavigate } from "react-router-dom";

const AllJourneyEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const journies = useSelector(journeySelectors.selectAll);

  useEffect(() => {
    dispatch(fetchJourneyEntriesAsync());
  }, [dispatch]);

  const handleJourneyClick = (journeyId: string) => {
    navigate(`/journey/journey-detail/${journeyId}`);
  };

  return (
    <div className={styles.allJourneyContainer}>
      <h1 className={styles.heading}>All Journies</h1>
      <div className={styles.journies}>
        {journies.map((journey) => (
          <div
            key={journey._id}
            onClick={() => handleJourneyClick(journey._id)}
          >
            <JourneyCard journey={journey} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllJourneyEntries;
