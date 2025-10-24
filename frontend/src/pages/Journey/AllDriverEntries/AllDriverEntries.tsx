import { useSelector } from "react-redux"
import { driverSelectors, fetchDriverEntriesAsync, selectDriverLoading } from "../../../features/driver";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Loading from "../../../components/Loading";
import type { AppDispatch } from "../../../app/store";

const AllDriverEntries = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector(selectDriverLoading);
  const drivers = useSelector(driverSelectors.selectAll);

  useEffect(() => {
    dispatch(fetchDriverEntriesAsync());
  }, [dispatch]);

  useEffect(() => {
    console.log("All drivers: ", drivers);
  }, [drivers]);

  if (loading) return <Loading />

  return (
    <div>AllDriverEntries</div>
  )
}

export default AllDriverEntries