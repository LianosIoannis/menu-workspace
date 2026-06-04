import { Component, signal } from "@angular/core";
import { Menu } from "menu-lib";
import { menuData } from "../menuData";

@Component({
	selector: "app-root",
	imports: [Menu],
	templateUrl: "./app.html",
})
export class App {
	protected readonly title = signal("menu-consumer-demo");

	// sample data passed to the library component
	protected readonly menuData = menuData;

	protected readonly lastClicked = signal<string | null>(null);

	itemClicked(item: any) {
		console.log("itemClicked", item);
		this.lastClicked.set(item?.text ?? JSON.stringify(item));
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
}
