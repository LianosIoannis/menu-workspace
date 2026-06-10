import { Component, signal } from "@angular/core";
import { Editor, type EditorLanguage } from "editor-lib";
import { Menu, type MenuItemModel } from "menu-lib";
import { menuData } from "../menuData";

type DemoEditor = {
	readonly id: number;
	readonly title: string;
	readonly language: EditorLanguage;
	readonly value: string;
};

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
	protected readonly editorLanguage = signal<EditorLanguage>("sql");
	protected readonly languageOptions: readonly { value: EditorLanguage; label: string }[] = [
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
	protected readonly editorHeight = signal(384);
	protected readonly editorWidth = signal(720);
	protected readonly editors = signal<readonly DemoEditor[]>([
		{
			id: 1,
			title: "Editor 1",
			language: this.editorLanguage(),
			value: this.editorValue(),
		},
	]);

	private nextEditorId = 2;

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
		const selectedLanguage = (event.target as HTMLSelectElement).value as EditorLanguage;
		this.editorLanguage.set(selectedLanguage);
		this.updateEditorLanguage(1, selectedLanguage);
	}

	changeEditorHeight(event: Event) {
		const height = Number((event.target as HTMLInputElement).value);
		this.editorHeight.set(height);
	}

	changeEditorWidth(event: Event) {
		const width = Number((event.target as HTMLInputElement).value);
		this.editorWidth.set(width);
	}

	addEditor() {
		const id = this.nextEditorId;
		this.nextEditorId += 1;

		this.editors.update((editors) => [
			...editors,
			{
				id,
				title: `Editor ${id}`,
				language: this.editorLanguage(),
				value: this.createEditorValue(id),
			},
		]);
	}

	removeEditor(id: number) {
		this.editors.update((editors) => editors.filter((editor) => editor.id !== id));
	}

	updateEditorValue(id: number, value: string) {
		this.editors.update((editors) => editors.map((editor) => (editor.id === id ? { ...editor, value } : editor)));

		if (id === 1) {
			this.editorValue.set(value);
		}
	}

	changeDynamicEditorLanguage(id: number, event: Event) {
		const language = (event.target as HTMLSelectElement).value as EditorLanguage;
		this.updateEditorLanguage(id, language);

		if (id === 1) {
			this.editorLanguage.set(language);
		}
	}

	private updateEditorLanguage(id: number, language: EditorLanguage) {
		this.editors.update((editors) => editors.map((editor) => (editor.id === id ? { ...editor, language } : editor)));
	}

	private createEditorValue(id: number) {
		return `select
	${id} as editor_id,
	'paid' as status,
	count(*) as total
from orders
group by status;`;
	}
}
