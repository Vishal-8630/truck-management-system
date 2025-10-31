import { useState, type JSX } from "react";
import styles from "./PaginatedList.module.scss";

type PaginatedListProps<T> = {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T) => JSX.Element;
};

const PaginatedList = <T,>({
  items,
  itemsPerPage = 5,
  renderItem,
}: PaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <>
      <div className={styles.items}>{currentItems.map(renderItem)}</div>
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>{currentPage}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default PaginatedList;
