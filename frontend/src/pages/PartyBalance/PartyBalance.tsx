import { useEffect, useState } from "react";
import {
  VEHICLE_ENTRY_LABELS,
  type BalancePartyType,
  type VehicleEntryType,
} from "../../types/vehicleEntry";
import api from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserSquare, DollarSign, Calculator, ArrowRight } from "lucide-react";
import {
  balancePartySelectors,
  fetchBalanceParties,
} from "../../features/balanceParty";
import type { AppDispatch } from "../../app/store";
import ExcelButton from "../../components/ExcelButton";

const DEBOUNCE_DELAY = 500;

const PartyBalance = () => {
  const [search, setSearch] = useState<string>("");
  const parties = useSelector(balancePartySelectors.selectAll);
  const [filteredParties, setFilteredParties] = useState<BalancePartyType[]>(
    []
  );
  const [searchParty, setSearchParty] = useState<BalancePartyType | null>(null);
  const [partyVehicleEntries, setPartyVehicleEntries] = useState<
    VehicleEntryType[] | null
  >(null);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBalanceParties());
  }, [dispatch]);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.trim()) {
        const results = parties.filter((p) =>
          p.party_name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredParties(results);
      } else {
        setFilteredParties([]);
        if (!searchParty) {
          setSearchParty(null);
          setPartyVehicleEntries(null);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [search, parties, searchParty]);

  const handlePartySearch = async (party: BalancePartyType) => {
    setSearchParty(party);
    setSearch(party.party_name);
    setFilteredParties([]);
    try {
      const response = await api.get(
        `/vehicle-entry/by-party/${party._id}`
      );
      const data = response.data;
      setPartyVehicleEntries(data.data);
    } catch (error: any) {
      console.error("Error fetching party data:", error);
    }
  };

  const handleSearchCancel = () => {
    setSearchParty(null);
    setFilteredParties([]);
    setSearch("");
    setPartyVehicleEntries(null);
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight italic flex items-center gap-4">
            <Calculator className="text-indigo-600 w-10 h-10 lg:w-12 lg:h-12" />
            Party <span className="text-indigo-600">Balance</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Analyze pending and received balances for specific parties.</p>
        </div>

        <div className="relative max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              className={`
                w-full pl-14 pr-12 py-5 bg-white border border-slate-100 rounded-2xl text-lg font-bold text-slate-700
                shadow-xl shadow-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all
                placeholder:text-slate-300 placeholder:font-medium
              `}
              placeholder="Search party by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                onClick={handleSearchCancel}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {filteredParties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full mt-4 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-100/50 z-50 overflow-hidden"
              >
                {filteredParties.map((party) => (
                  <button
                    key={party._id}
                    onClick={() => handlePartySearch(party)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <UserSquare size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{party.party_name}</span>
                    <ArrowRight size={16} className="ml-auto text-slate-300" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!searchParty && !partyVehicleEntries && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
          <UserSquare className="w-20 h-20 text-slate-200 mb-6" strokeWidth={1.5} />
          <p className="text-slate-400 font-bold text-xl">Enter a party name above to view balance details</p>
        </div>
      )}

      {partyVehicleEntries && partyVehicleEntries.length > 0 && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-premium flex items-center gap-6 group hover:border-red-100 transition-all cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Pending</span>
                <span className="text-2xl font-black text-slate-900 italic">
                  ₹{partyVehicleEntries.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card-premium flex items-center gap-6 group hover:border-green-100 transition-all cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Received</span>
                <span className="text-2xl font-black text-slate-900 italic">
                  ₹{partyVehicleEntries.reduce((acc, curr) => acc + (Number(curr.in_ac) || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card-premium flex items-center gap-4 md:col-span-2 lg:col-span-1 border-indigo-100 bg-indigo-50/20">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Export Report</span>
                <span className="text-sm font-bold text-slate-600">Download data in Excel format</span>
              </div>
              <ExcelButton
                data={partyVehicleEntries}
                fileNamePrefix={`${searchParty?.party_name}_balance`}
              />
            </div>
          </div>

          <div className="card-premium p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {(Object.entries(VEHICLE_ENTRY_LABELS) as [string, string][]).map(([key, label]) => (
                      <th key={key} className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {partyVehicleEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors group">
                      {(Object.entries(VEHICLE_ENTRY_LABELS) as [keyof VehicleEntryType, string][]).map(([key]) => {
                        const value = key === "balance_party" ? entry.balance_party.party_name : entry[key];
                        const isNumeric = typeof value === 'string' && !isNaN(Number(value)) && (key === 'balance' || key === 'freight' || key === 'in_ac');

                        return (
                          <td key={key} className={`px-6 py-4 text-sm font-bold ${isNumeric ? 'text-slate-900' : 'text-slate-600'}`}>
                            {isNumeric ? `₹${Number(value).toLocaleString()}` : String(value || '---')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyBalance;

