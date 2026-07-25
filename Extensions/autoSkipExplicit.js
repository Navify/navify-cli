// NAME: Christian Spotify
// AUTHOR: khanhas
// DESCRIPTION: Auto skip explicit songs. Toggle in Profile menu.

/// <reference path="../globals.d.ts" />

(async function ChristianSpotify() {
	if (!Navify.LocalStorage) {
		setTimeout(ChristianSpotify, 1000);
		return;
	}
	await new Promise((res) => Navify.Events.webpackLoaded.on(res));

	let isEnabled = Navify.LocalStorage.get("ChristianMode") === "1";

	new Navify.Menu.Item("Christian mode", isEnabled, (self) => {
		isEnabled = !isEnabled;
		Navify.LocalStorage.set("ChristianMode", isEnabled ? "1" : "0");
		self.setState(isEnabled);
	}).register();

	Navify.Player.addEventListener("songchange", () => {
		if (!isEnabled) return;
		const data = Navify.Player.data || Navify.Queue;
		if (!data) return;

		const isExplicit = data.item.metadata.is_explicit;
		if (isExplicit === "true") {
			Navify.Player.next();
		}
	});
})();
