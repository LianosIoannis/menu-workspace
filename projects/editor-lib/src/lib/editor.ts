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
	host: {
		class: "block min-h-96",
	},
	styles: [
		`
			:host {
				display: block;
				min-height: 24rem;
			}

			.editor-surface {
				height: 100%;
				min-height: 24rem;
				overflow: hidden;
				width: 100%;
			}
		`,
	],
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

	initializeMonaco() {
		window.MonacoEnvironment = {
			getWorker: (_: string, label: string) => {
				const workerMap: Record<string, Worker> = {
					json: new Worker(new URL("monaco-editor/esm/vs/language/json/json.worker.js", import.meta.url), {
						type: "module",
					}),
					css: new Worker(new URL("monaco-editor/esm/vs/language/css/css.worker.js", import.meta.url), {
						type: "module",
					}),
					scss: new Worker(new URL("monaco-editor/esm/vs/language/css/css.worker.js", import.meta.url), {
						type: "module",
					}),
					less: new Worker(new URL("monaco-editor/esm/vs/language/css/css.worker.js", import.meta.url), {
						type: "module",
					}),
					html: new Worker(new URL("monaco-editor/esm/vs/language/html/html.worker.js", import.meta.url), {
						type: "module",
					}),
					typescript: new Worker(new URL("monaco-editor/esm/vs/language/typescript/ts.worker.js", import.meta.url), {
						type: "module",
					}),
					javascript: new Worker(new URL("monaco-editor/esm/vs/language/typescript/ts.worker.js", import.meta.url), {
						type: "module",
					}),
				};

				return (
					workerMap[label] ??
					new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" })
				);
			},
		};
	}

	ngAfterViewInit() {
		this.initializeMonaco();

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
