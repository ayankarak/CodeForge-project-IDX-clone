
import { create } from "zustand";

export const useClipboardStore = create((set) => ({
    // Currently selected file or folder
    selectedPath: null,
    selectedType: null,

    // Copied file or folder
    copiedPath: null,
    copiedType: null,

    setSelectedItem: (path, type) => {
        set({
            selectedPath: path,
            selectedType: type,
        });
    },

    copyItem: () => {
        set((state) => ({
            copiedPath: state.selectedPath,
            copiedType: state.selectedType,
        }));
    },

    clearClipboard: () => {
        set({
            copiedPath: null,
            copiedType: null,
        });
    },
}));
