import { useState } from "react";
import Button from "@/components/Button";
import Overlay from "@/components/Overlay";
import GenericFilter from "@/components/GenericFilter";
import type { FilterConfig } from "@/filters/filter";
import { applyGenericFilters } from "@/filters/filerHelper";
import { AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";

type FilterContainerProps<T> = {
  data: T[];
  filters: FilterConfig<T>[];
  onFiltered: (results: T[]) => void;
};

function FilterContainer<T>({
  data,
  filters,
  onFiltered,
}: FilterContainerProps<T>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasFilter, setHasFilter] = useState(false);

  const handleApplyFilter = (values: Record<string, any>) => {
    const filterExists = Object.values(values).some(
      (val) =>
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.every((v) => !v))
    );

    setHasFilter(filterExists);

    const result = filterExists
      ? applyGenericFilters(data, values, filters)
      : data;

    onFiltered(result);
    setIsFilterOpen(false);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {hasFilter && (
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <p className="text-sm font-bold text-indigo-700">Filter Applied</p>
          <button
            onClick={() => handleApplyFilter({})}
            className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Button
        text="Filter Results"
        variant="secondary"
        icon={<Filter size={18} />}
        onClick={() => setIsFilterOpen(true)}
        className="!rounded-xl"
      />

      <AnimatePresence>
        {isFilterOpen && (
          <Overlay onCancel={() => setIsFilterOpen(false)}>
            <GenericFilter
              filters={filters}
              onApply={(values) => handleApplyFilter(values)}
              onCancel={() => setIsFilterOpen(false)}
            />
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FilterContainer;

