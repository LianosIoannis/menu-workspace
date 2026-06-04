export type MenuItemModel = {
	id: string;
	text: string;
	icon: string;
	iconColor: string;
	isFolder: boolean;
	items: MenuItemModel[];
};
