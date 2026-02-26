import { useCallback, useEffect, useState } from "react";

export type ItemState<T> = {
  localItem: T;
  drafts: Partial<T>;
  editing: Set<keyof T>;
  isOpen: boolean;
  hasInteracted: boolean;
};

export const useItemStates = <T extends { _id: string }>(items: T[]) => {
  const [itemStates, setItemStates] = useState<Record<string, ItemState<T>>>({});

  useEffect(() => {
    if (!Array.isArray(items)) return;
    setItemStates((prev) => {
      const newStates: Record<string, ItemState<T>> = {};
      let hasChanged = false;
      const prevIds = Object.keys(prev);

      if (prevIds.length !== items.length) {
        hasChanged = true;
      }

      items.forEach((item) => {
        if (!prev[item._id]) hasChanged = true;
        newStates[item._id] = prev[item._id] ?? {
          localItem: { ...item },
          drafts: {},
          editing: new Set(),
          isOpen: false,
          hasInteracted: false,
        };
      });

      return hasChanged ? newStates : prev;
    });
  }, [items]);

  const updateItem = useCallback(
    (id: string, updatedItem: Partial<ItemState<T>>) => {
      setItemStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...updatedItem },
      }));
    },
    []
  );

  const updateDraft = useCallback((id: string, key: keyof T, value: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        drafts: { ...prev[id].drafts, [key]: value },
      },
    }));
  }, []);

  const toggleEditing = useCallback((id: string, key: keyof T) => {
    setItemStates((prev) => {
      const editing = new Set(prev[id].editing);
      if (editing.has(key)) editing.delete(key);
      else editing.add(key);
      return { ...prev, [id]: { ...prev[id], editing } };
    });
  }, []);

  const toggleOpen = useCallback((id: string) => {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: !prev[id].isOpen },
    }));
  }, []);

  return { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen };
};
