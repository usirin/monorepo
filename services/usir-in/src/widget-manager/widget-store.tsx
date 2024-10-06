import {Box} from "@radix-ui/themes";
import type {ComponentType} from "react";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

export interface WidgetStoreType {
	widgets: Record<string, ComponentType>;
}

export const useWidgetStore = create<WidgetStoreType>()(
	devtools(
		persist(
			immer((set) => ({
				widgets: {
					scratch: function Scratch() {
						return <Box>Scratch</Box>;
					},
				},
				actions: {
					register: (id: string, widget: ComponentType) => {
						set((state) => {
							state.widgets[id] = widget;
						});
					},
				},
			})),
			{
				name: "widget-store",
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({widgets: state.widgets}),
			},
		),
	),
);
