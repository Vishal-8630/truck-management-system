import { useJourneys } from "@/hooks/useJourneys";
import JourneyCard from "@/components/JourneyCard";
import { useNavigate } from "react-router-dom";
import { Milestone, Plus } from "lucide-react";
import Loading from "@/components/Loading";
import Button from "@/components/Button";

const AllJourneyEntries = () => {
  const navigate = useNavigate();
  const { useJourneysQuery } = useJourneys();
  const { data: journeys = [], isLoading } = useJourneysQuery();

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Milestone className="text-blue-600 w-10 h-10 lg:w-12 lg:h-12" />
            Active <span className="text-blue-600">Journeys</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Detailed tracking of all ongoing and past truck journeys.</p>
        </div>

        <Button
          onClick={() => navigate("/journey/new-journey-entry")}
          icon={<Plus size={18} />}
          className="px-8 shadow-blue-500/20"
        >
          Plan New Journey
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {journeys.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
            <Milestone size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold italic">No active journeys found.</p>
          </div>
        ) : (
          journeys.map((journey) => (
            <div key={journey._id} onClick={() => navigate(`/journey/journey-detail/${journey._id}`)}>
              <JourneyCard journey={journey} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllJourneyEntries;
