// NAME: Auto Skip Video
// AUTHOR: khanhas
// DESCRIPTION: Auto skip video

/// <reference path="../globals.d.ts" />

(function SkipVideo() {
	Navify.Player.addEventListener("songchange", () => {
		const data = Navify.Player.data || Navify.Queue;
		if (!data) return;

		const meta = data.item.metadata;
		// Ads are also video media type so I need to exclude them out.
		if (meta["media.type"] === "video" && meta.is_advertisement !== "true") {
			Navify.Player.next();
		}
	});
})();
