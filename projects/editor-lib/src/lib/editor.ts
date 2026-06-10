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
import { MonacoService } from "./monaco-service";

export type EditorLanguage = "javascript" | "typescript" | "sql" | "plaintext" | "json" | "css";

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
	private monacoWorkerService = inject(MonacoService);

	private editorRef = viewChild.required<ElementRef<HTMLDivElement>>("editorRef");
	private editor?: monaco.editor.IStandaloneCodeEditor;
	private editorChangeSubscription?: monaco.IDisposable;

	value = model<string>("");
	language = input<EditorLanguage>("plaintext");

	private langEffect = effect(() => {
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

	private valueEffect = effect(() => {
		const editor = this.editor;
		const value = this.value();

		if (!editor) {
			return;
		}

		if (value !== editor.getValue()) {
			editor.setValue(value);
		}
	});

	private readonly formatCode = async () => {
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
		this.monacoWorkerService.initializeWorkers();

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
		this.langEffect.destroy();
		this.valueEffect.destroy();
		this.editorChangeSubscription?.dispose();
		this.editor?.getModel()?.dispose();
		this.editor?.dispose();
	}
}
