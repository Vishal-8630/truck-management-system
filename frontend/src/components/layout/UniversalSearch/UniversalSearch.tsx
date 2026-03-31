import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Truck, MapPin, FileText } from "lucide-react";
import { useTrucks } from "@/hooks/useTrucks";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";

interface UniversalSearchProps {
  isCollapsed?: boolean;
}

const UniversalSearch = ({ isCollapsed = false }: UniversalSearchProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Data Fetching
  const { useTrucksQuery } = useTrucks();
  const { useJourneysQuery } = useJourneys();
  const { useBillEntriesQuery } = useBillEntries();

  const { data: trucks = [] } = useTrucksQuery();
  const { data: journeys = [] } = useJourneysQuery();
  const { data: billEntries = [] } = useBillEntriesQuery();

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('sidebar-universal-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery("");
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Universal Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { trucks: [], journeys: [], bills: [] };

    const query = searchQuery.toLowerCase();
    return {
      trucks: trucks.filter(t => (t.truck_no || "").toLowerCase().includes(query)).slice(0, 3),
      journeys: journeys.filter(j =>
        (j.truck?.truck_no || "").toLowerCase().includes(query) ||
        (j.from || "").toLowerCase().includes(query) ||
        (j.to || "").toLowerCase().includes(query)
      ).slice(0, 3),
      bills: billEntries.filter(b =>
        (b.bill_no || "").toLowerCase().includes(query) ||
        (b.billing_party?.name || "").toLowerCase().includes(query)
      ).slice(0, 3)
    };
  }, [searchQuery, trucks, journeys, billEntries]);

  return (
    <div className="relative group w-full px-2 lg:px-0">
      <div className={`relative flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
        <Search className={`absolute left-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`} size={18} />
        <input
          id="sidebar-universal-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          placeholder={isCollapsed ? "" : "Universal search..."}
          className={`
            bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 outline-none transition-all
            ${isCollapsed ? 'w-10 px-0 pl-10 cursor-pointer overflow-hidden' : 'w-full'}
          `}
        />

        {!isCollapsed && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-500 transition-colors">
                <Plus className="rotate-45" size={16} />
              </button>
            ) : (
              <div className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 flex items-center gap-1 cursor-default opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <kbd className="font-sans text-[8px]">CTRL</kbd>
                <span className="text-[8px]">K</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results Dropdown Overlay */}
      {isSearchFocused && searchQuery && (
        <div className={`
          absolute top-full mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-[1001] animate-in fade-in slide-in-from-top-4 duration-300
          ${isCollapsed ? 'left-16 w-[350px]' : 'left-0 w-[350px]'}
        `}>
          {Object.values(searchResults).every(arr => arr.length === 0) ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                <Search size={20} />
              </div>
              <p className="text-sm font-bold text-slate-400 italic">No matches for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.trucks.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vehicles</p>
                  {searchResults.trucks.map(t => (
                    <button key={t._id} onMouseDown={() => navigate(`/journey/truck/${t._id}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck size={20} />
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.truck_no}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.journeys.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Journeys</p>
                  {searchResults.journeys.map(j => (
                    <button key={j._id} onMouseDown={() => navigate(`/journey/journey-detail/${j._id}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate">{j.from} â†’ {j.to}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{j.truck?.truck_no || 'Manual'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.bills.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Invoices</p>
                  {searchResults.bills.map(b => (
                    <button key={b._id} onMouseDown={() => navigate(`/bill-entry/bill?bill_no=${b.bill_no}`)} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white italic">#{b.bill_no}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{b.billing_party?.name || 'Party'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
