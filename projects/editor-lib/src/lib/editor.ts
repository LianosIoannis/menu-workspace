import {
	type AfterViewInit,
	Component,
	type ElementRef,
	effect,
	inject,
	input,
	model,
	type OnDestroy,
	viewChild,
} from "@angular/core";
import * as monaco from "monaco-editor";
import { format } from "sql-formatter";
import { MonacoWorker } from "./monaco-worker";

export type editorLanguage = "javascript" | "typescript" | "sql" | "plaintext" | "json" | "css";

@Component({
	selector: "editor",
	imports: [],
	template: `<div #editorRef class="editor-surface"></div>`,
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
	monacoWorkerService = inject(MonacoWorker);
	editorRef = viewChild.required<ElementRef<HTMLDivElement>>("editorRef");
	editor?: monaco.editor.IStandaloneCodeEditor;
	editorChangeSubscription?: monaco.IDisposable;

	value = model<string>("");
	language = input<editorLanguage>("plaintext");

	langEffect = effect(() => {
		const editor = this.editor;
		const language = this.language();

		if (!editor) {
			return;
		}

		const model = editor.getModel();

		if (model) {
			monaco.editor.setModelLanguage(model, language);
		}
	});

	valueEffect = effect(() => {
		const editor = this.editor;
		const value = this.value();

		if (!editor) {
			return;
		}

		if (value !== editor.getValue()) {
			editor.setValue(value);
		}
	});

	formatCode = async () => {
		const editor = this.editor;

		if (!editor) {
			return;
		}

		const language = this.language();

		if (language === "sql") {
			const formatted = format(editor.getValue(), { language: "tsql" });
			editor.setValue(formatted);
			return;
		}

		await editor.getAction("editor.action.formatDocument")?.run();
	};

	ngAfterViewInit() {
		this.monacoWorkerService.initialize();

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

		this.editorChangeSubscription = this.editor.onDidChangeModelContent(() => {
			if (!this.editor) {
				return;
			}
			this.value.set(this.editor.getValue());
		});
	}

	ngOnDestroy() {
		this.editorChangeSubscription?.dispose();
		this.editor?.dispose();
		this.editor?.getModel()?.dispose();
	}
}
