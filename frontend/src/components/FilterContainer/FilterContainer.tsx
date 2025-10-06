import { useState } from "react";
import styles from "./FilterContainer.module.scss";
import Button from "../Button";
import Overlay from "../Overlay";
import GenericFilter from "../GenericFilter";
import type { FilterConfig } from "../../filters/filter";
import { applyGenericFilters } from "../../filters/filerHelper";
import { AnimatePresence } from "framer-motion";

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
    <div className={styles.filterContainer}>
      {hasFilter && (
        <div className={styles.clearContainer}>
          <p className={styles.filterPara}>Filter is applied</p>
          <Button
            text="Clear"
            variant="primary"
            onClick={() => handleApplyFilter({})}
            className="clearFilterBtn"
          />
        </div>
      )}
      <Button
        text="Filter"
        variant="secondary"
        className="filterBtn"
        onClick={() => setIsFilterOpen(true)}
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
