import { waitFor } from "./shared/async.js";

(function waitOrigins() {
  if (!Navify?.Player?.origin?._state) {
    setTimeout(waitOrigins, 10);
    return;
  }

  const playerState = {
    cache: null,
    current: null,
  };

  const interval = setInterval(() => {
    if (!Navify.Player.origin._state?.item) return;
    Navify.Player.data = Navify.Player.origin._state;
    playerState.cache = Navify.Player.data;
    clearInterval(interval);
  }, 10);

  Navify.Player.origin._events.addListener("update", ({ data: playerEventData }) => {
    playerState.current = playerEventData.item ? playerEventData : null;
    Navify.Player.data = playerState.current;

    if (playerState.cache?.item?.uri !== playerState.current?.item?.uri) {
      const event = new Event("songchange");
      event.data = Navify.Player.data;
      Navify.Player.dispatchEvent(event);
    }

    if (playerState.cache?.isPaused !== playerState.current?.isPaused) {
      const event = new Event("onplaypause");
      event.data = Navify.Player.data;
      Navify.Player.dispatchEvent(event);
    }

    playerState.cache = playerState.current;
  });

  (function waitProductStateAPI() {
    if (!Navify.Platform?.UserAPI) {
      setTimeout(waitProductStateAPI, 100);
      return;
    }

    const productState = Navify.Platform.UserAPI._product_state || Navify.Platform.UserAPI._product_state_service;
    if (productState) return;

    const productStateApi = Navify.Platform?.ProductStateAPI?.productStateApi;
    if (!productStateApi) {
      setTimeout(waitProductStateAPI, 100);
      return;
    }

    Navify.Platform.UserAPI._product_state_service = productStateApi;
  })();

  void (async function setButtonsHeight() {
    const CosmosAsync = await waitFor(() => Navify.CosmosAsync, 100);
    const expFeatures = JSON.parse(localStorage.getItem("navify-exp-features") || "{}");
    const isGlobalNavbar = expFeatures?.enableGlobalNavBar?.value;

    if (typeof isGlobalNavbar !== "undefined" && isGlobalNavbar === "control") {
      await CosmosAsync.post("sp://messages/v1/container/control", {
        type: "update_titlebar",
        height: Navify.Platform.PlatformData.os_name === "osx" ? "42" : "40",
      });
    }
  })();

  setInterval(() => {
    if (playerState.cache?.isPaused === false) {
      const event = new Event("onprogress");
      event.data = Navify.Player.getProgress();
      Navify.Player.dispatchEvent(event);
    }
  }, 100);

  Navify.addToQueue = (uri) => {
    return Navify.Player.origin._queue?.addToQueue(uri);
  };
  Navify.removeFromQueue = (uri) => {
    return Navify.Player.origin._queue?.removeFromQueue(uri);
  };
})();
