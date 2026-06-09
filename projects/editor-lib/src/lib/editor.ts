import {
	type AfterViewInit,
	Component,
	type ElementRef,
	effect,
	input,
	model,
	type OnDestroy,
	viewChild,
} from "@angular/core";
import * as monaco from "monaco-editor";
import { format } from "sql-formatter";

export type editorLanguage = "javascript" | "typescript" | "sql" | "plaintext" | "json" | "css";

@Component({
	selector: "editor",
	imports: [],
	templateUrl: "./editor.html",
})
export class Editor implements AfterViewInit, OnDestroy {
	editorRef = viewChild.required<ElementRef<HTMLDivElement>>("editorRef");
	editor?: monaco.editor.IStandaloneCodeEditor;

	value = model<string>("");
	language = input<editorLanguage>("plaintext");

	langEffect = effect(() => {
		const editor = this.editor;
		if (!editor) {
			return;
		}

		const model = editor.getModel();
		const language = this.language();
		if (model) {
			monaco.editor.setModelLanguage(model, language);
		}
	});

	valueEffect = effect(() => {
		const editor = this.editor;
		if (!editor) {
			return;
		}
		const value = this.value();

		if (value !== editor.getValue()) {
			editor.setValue(value);
		}
	});

	formatCode = async () => {
		const editor = this.editor;

		if (!editor) {
			return;
		}

		if (this.language() === "sql") {
			const formatted = format(editor.getValue(), { language: "tsql" });
			editor.setValue(formatted);
			return;
		}

		await editor.getAction("editor.action.formatDocument")?.run();
	};

	ngAfterViewInit() {
		this.editor = monaco.editor.create(this.editorRef().nativeElement, {
			value: this.value(),
			language: this.language(),
			theme: "vs-dark",
			automaticLayout: true,
			minimap: { enabled: false },
		});

		this.editor.addAction({
			id: "format-code",
			label: "Format Code",
			keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
			run: this.formatCode,
		});

		this.editor.onDidChangeModelContent(() => {
			if (!this.editor) {
				return;
			}
			this.value.set(this.editor.getValue());
		});
	}

	ngOnDestroy() {
		const model = this.editor?.getModel();

		this.editor?.dispose();
		model?.dispose();
	}
}
