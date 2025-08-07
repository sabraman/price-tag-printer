import { create } from "zustand";

interface UIState {
	// Loading states
	loading: boolean;
	error: string | null;
	isEditMode: boolean;
	
	// Selection state
	selectedItems: number[];
	searchQuery: string;
	currentFilter: string;
	
	// Modal/dialog states
	showExportDialog: boolean;
	showImportDialog: boolean;
	showSettingsDialog: boolean;
	
	// Actions
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setIsEditMode: (isEditMode: boolean) => void;
	setSelectedItems: (items: number[]) => void;
	toggleItemSelection: (id: number) => void;
	clearSelection: () => void;
	setSearchQuery: (query: string) => void;
	setCurrentFilter: (filter: string) => void;
	setShowExportDialog: (show: boolean) => void;
	setShowImportDialog: (show: boolean) => void;
	setShowSettingsDialog: (show: boolean) => void;
	resetUI: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
	// Initial state
	loading: false,
	error: null,
	isEditMode: false,
	selectedItems: [],
	searchQuery: "",
	currentFilter: "all",
	showExportDialog: false,
	showImportDialog: false,
	showSettingsDialog: false,

	// Actions
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setIsEditMode: (isEditMode) => set({ isEditMode }),

	setSelectedItems: (items) => set({ selectedItems: items }),
	
	toggleItemSelection: (id) =>
		set((state) => {
			const isSelected = state.selectedItems.includes(id);
			return {
				selectedItems: isSelected
					? state.selectedItems.filter((itemId) => itemId !== id)
					: [...state.selectedItems, id],
			};
		}),

	clearSelection: () => set({ selectedItems: [] }),
	setSearchQuery: (query) => set({ searchQuery: query }),
	setCurrentFilter: (filter) => set({ currentFilter: filter }),
	setShowExportDialog: (show) => set({ showExportDialog: show }),
	setShowImportDialog: (show) => set({ showImportDialog: show }),
	setShowSettingsDialog: (show) => set({ showSettingsDialog: show }),

	resetUI: () =>
		set({
			loading: false,
			error: null,
			isEditMode: false,
			selectedItems: [],
			searchQuery: "",
			currentFilter: "all",
			showExportDialog: false,
			showImportDialog: false,
			showSettingsDialog: false,
		}),
}));