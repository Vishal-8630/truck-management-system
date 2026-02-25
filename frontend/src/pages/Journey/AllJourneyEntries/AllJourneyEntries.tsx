import { useEffect } from "react";
import type { AppDispatch } from "../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJourneyEntriesAsync,
  journeySelectors,
} from "../../../features/journey";
import JourneyCard from "../../../components/JourneyCard";
import { useNavigate } from "react-router-dom";
import { Navigation, Plus } from "lucide-react";

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
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Navigation className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Active <span className="text-indigo-600">Journeys</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Detailed tracking of all ongoing and past truck journeys.</p>
        </div>

        <button
          onClick={() => navigate('/journey/new-journey-entry')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold font-heading shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus size={18} />
          Plan New Journey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {journies.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
            <Navigation size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold italic">No active journeys found.</p>
          </div>
        ) : (
          journies.map((journey) => (
            <div
              key={journey._id}
              onClick={() => handleJourneyClick(journey._id)}
            >
              <JourneyCard journey={journey} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllJourneyEntries;

