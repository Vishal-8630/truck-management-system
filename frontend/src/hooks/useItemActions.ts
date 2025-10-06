import { useCallback } from "react";
import type { ItemState } from "./useItemStates";

type ItemActions<T extends { _id: string }> = {
  handleEdit: (key: keyof T) => void;
  handleCancel: (key: keyof T) => void;
  handleSave: (key: keyof T) => void;
  handleAbortChanges: () => void;
};

export const useItemActions = <T extends { _id: string }>(
  item: T,
  itemId: string,
  itemState: ItemState<T>,
  updateItem: (id: string, updatedItem: Partial<ItemState<T>>) => void,
  updateDraft: (id: string, key: keyof T, value: T[keyof T]) => void,
  toggleEditing: (id: string, key: keyof T) => void
): ItemActions<T> => {
  const handleEdit = useCallback(
    (key: keyof T) => {
      toggleEditing(itemId, key);
      updateDraft(itemId, key, itemState.localItem[key]);
    },
    [itemId, itemState.localItem, toggleEditing, updateDraft]
  );

  const handleCancel = useCallback(
    (key: keyof T) => {
      toggleEditing(itemId, key);
      updateItem(itemId, {
        drafts: { ...itemState.drafts, [key]: undefined },
      });
    },
    [itemId, itemState.drafts, toggleEditing, updateItem]
  );

  const handleSave = useCallback(
    (key: keyof T) => {
      const updatedValue = itemState.drafts[key] ?? itemState.localItem[key];
      updateItem(itemId, {
        localItem: {
          ...itemState.localItem,
          [key]: updatedValue,
        },
      });
      toggleEditing(itemId, key);
      updateItem(itemId, {
        drafts: { ...itemState.drafts, [key]: undefined },
      });
    },
    [itemId, itemState.drafts, itemState.localItem, toggleEditing, updateItem]
  );

  const handleAbortChanges = useCallback(() => {
    updateItem(itemId, {
      localItem: { ...item },
      drafts: {},
      editing: new Set(),
    });
  }, [itemId, itemState.localItem, updateItem]);

  return { handleEdit, handleCancel, handleSave, handleAbortChanges };
};
