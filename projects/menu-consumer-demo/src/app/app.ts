import { Component, signal } from "@angular/core";
import { Editor, type editorLanguage } from "editor-lib";
import { Menu, type MenuItemModel } from "menu-lib";
import { menuData } from "../menuData";

@Component({
	selector: "app-root",
	imports: [Editor, Menu],
	templateUrl: "./app.html",
})
export class App {
	protected readonly title = signal("menu-consumer-demo");

	// sample data passed to the library component
	protected readonly menuData = menuData;

	protected readonly lastClicked = signal<string | null>(null);
	protected readonly editorLanguage = signal<editorLanguage>("sql");
	protected readonly languageOptions: readonly { value: editorLanguage; label: string }[] = [
		{ value: "sql", label: "SQL" },
		{ value: "typescript", label: "TypeScript" },
		{ value: "javascript", label: "JavaScript" },
		{ value: "json", label: "JSON" },
		{ value: "css", label: "CSS" },
		{ value: "plaintext", label: "Plain text" },
	];
	protected readonly editorValue = signal(`select
	customer_id,
	count(*) as orders_count
from orders
where status = 'paid'
group by customer_id
order by orders_count desc;`);

	itemClicked(item: MenuItemModel) {
		console.log("itemClicked", item);
		this.lastClicked.set(item.text);
	}

	closeClicked() {
		console.log("closeClicked");
	}

	logoutClicked() {
		console.log("logoutClicked");
	}

	profileClicked() {
		console.log("profileClicked");
	}

	changeEditorLanguage(event: Event) {
		const selectedLanguage = (event.target as HTMLSelectElement).value as editorLanguage;
		this.editorLanguage.set(selectedLanguage);
	}
}
