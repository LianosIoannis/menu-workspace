import type { MenuItemModel } from "./menu-item/menu-item.model";

export type MenuDataModel = {
	mainHeaderText: string;
	subHeaderText: string;
	menuItems: MenuItemModel[];
};
