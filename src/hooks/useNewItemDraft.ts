import { useEffect } from "react";

interface NewItemDraft {
	data: string;
	price: string;
	designType: string;
	hasDiscount: boolean;
	priceFor2: string;
	priceFrom3: string;
}

export function useNewItemDraft(isEditMode: boolean) {
	useEffect(() => {
		// When leaving edit mode, save any current draft
		return () => {
			if (!isEditMode) {
				// Component is unmounting or mode is switching
				const savedDraft = localStorage.getItem("newPriceTagDraft");
				if (savedDraft) {
					try {
						const draft = JSON.parse(savedDraft) as NewItemDraft;
						// Only keep draft if it has meaningful content
						if (draft.data.trim() || draft.price) {
							localStorage.setItem("newPriceTagDraft", JSON.stringify(draft));
						} else {
							localStorage.removeItem("newPriceTagDraft");
						}
					} catch (_e) {
						localStorage.removeItem("newPriceTagDraft");
					}
				}
			}
		};
	}, [isEditMode]);

	// When entering edit mode, restore draft if available
	useEffect(() => {
		if (isEditMode) {
			const savedDraft = localStorage.getItem("newPriceTagDraft");
			if (savedDraft) {
				try {
					const draft = JSON.parse(savedDraft) as NewItemDraft;
					// Draft will be automatically loaded by the NewItemForm component
					if (draft.data.trim() || draft.price) {
						// Show a toast to indicate draft was restored
						import("sonner").then(({ toast }) => {
							toast.info("Восстановлен черновик товара", { duration: 3000 });
						});
					}
				} catch (_e) {
					localStorage.removeItem("newPriceTagDraft");
				}
			}
		}
	}, [isEditMode]);
}
