window.Navify = {
  API: Object.freeze({
    name: "Navify",
    version: "1.0.0",
    global: "Navify",
  }),
  Extensions: new Map(),
  registerExtension: (name, setup) => {
    if (typeof name !== "string" || !name.trim()) {
      throw new TypeError("Extension name must be a non-empty string.");
    }
    if (typeof setup !== "function") {
      throw new TypeError("Extension setup must be a function.");
    }
    if (Navify.Extensions.has(name)) {
      return Navify.Extensions.get(name);
    }

    const extension = {
      name,
      dispose: setup(Navify) || null,
    };
    Navify.Extensions.set(name, extension);
    return extension;
  },
  unregisterExtension: (name) => {
    const extension = Navify.Extensions.get(name);
    if (!extension) {
      return false;
    }
    if (typeof extension.dispose === "function") {
      extension.dispose();
    }
    return Navify.Extensions.delete(name);
  },
  Player: {
    addEventListener: (type, callback) => {
      if (!(type in Navify.Player.eventListeners)) {
        Navify.Player.eventListeners[type] = [];
      }
      Navify.Player.eventListeners[type].push(callback);
    },
    dispatchEvent: (event) => {
      if (!(event.type in Navify.Player.eventListeners)) {
        return true;
      }
      const stack = Navify.Player.eventListeners[event.type];
      for (let i = 0; i < stack.length; i++) {
        if (typeof stack[i] === "function") {
          stack[i](event);
        }
      }
      return !event.defaultPrevented;
    },
    eventListeners: {},
    seek: (p) => {
      const duration = !Number.isInteger(p) && p >= 0 && p <= 1 ? Math.round(p * Navify.Player.origin._state.duration) : p;
      Navify.Player.origin.seekTo(duration);
    },
    getProgress: () => {
      const state = Navify.Player.origin._state;
      return (state.isPaused ? 0 : Date.now() - state.timestamp) + state.positionAsOfTimestamp;
    },
    getProgressPercent: () => {
      const state = Navify.Player.origin._state;
      return Navify.Player.getProgress() / state.duration;
    },
    getDuration: () => Navify.Player.origin._state.duration,
    setVolume: (v) => {
      Navify.Platform.PlaybackAPI.setVolume(v);
    },
    increaseVolume: () => {
      Navify.Platform.PlaybackAPI.raiseVolume();
    },
    decreaseVolume: () => {
      Navify.Platform.PlaybackAPI.lowerVolume();
    },
    getVolume: () => Navify.Platform.PlaybackAPI._volume,
    next: () => {
      Navify.Player.origin.skipToNext();
    },
    back: () => {
      Navify.Player.origin.skipToPrevious();
    },
    togglePlay: () => {
      if (Navify.Player.isPlaying()) Navify.Player.pause();
      else Navify.Player.play();
    },
    isPlaying: () => !Navify.Player.origin._state.isPaused,
    toggleShuffle: () => {
      Navify.Player.origin.setShuffle(!Navify.Player.origin._state.shuffle);
    },
    getShuffle: () => Navify.Player.origin._state.shuffle,
    setShuffle: (b) => {
      Navify.Player.origin.setShuffle(b);
    },
    toggleRepeat: () => {
      Navify.Player.origin.setRepeat((Navify.Player.origin._state.repeat + 1) % 3);
    },
    getRepeat: () => Navify.Player.origin._state.repeat,
    setRepeat: (r) => {
      Navify.Player.origin.setRepeat(r);
    },
    getMute: () => Navify.Player.getVolume() === 0,
    toggleMute: () => {
      Navify.Player.setMute(!Navify.Player.getMute());
    },
    setMute: (b) => {
      if (b !== Navify.Player.getMute()) {
        document.querySelector(".volume-bar__icon-button")?.click();
      }
    },
    formatTime: (ms) => {
      let seconds = Math.floor(ms / 1e3);
      const minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      return `${minutes}:${seconds > 9 ? "" : "0"}${String(seconds)}`;
    },
    getHeart: () => Navify.Player.origin._state.item?.metadata["collection.in_collection"] === "true",
    pause: () => {
      Navify.Player.origin.pause();
    },
    play: () => {
      Navify.Player.origin.resume();
    },
    playUri: async (uri, context = {}, options = {}) => {
      return await Navify.Player.origin.play({ uri: uri }, context, options);
    },
    removeEventListener: (type, callback) => {
      if (!(type in Navify.Player.eventListeners)) return;
      const stack = Navify.Player.eventListeners[type];
      for (let i = 0; i < stack.length; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return;
        }
      }
    },
    skipBack: (amount = 15e3) => {
      Navify.Player.origin.seekBackward(amount);
    },
    skipForward: (amount = 15e3) => {
      Navify.Player.origin.seekForward(amount);
    },
    setHeart: (b) => {
      const uris = [Navify.Player.origin._state.item.uri];
      if (b) {
        Navify.Platform.LibraryAPI.add({ uris });
      } else {
        Navify.Platform.LibraryAPI.remove({ uris });
      }
    },
    toggleHeart: () => {
      Navify.Player.setHeart(!Navify.Player.getHeart());
    },
  },
  test: () => {
    function checkObject(object) {
      const { objectToCheck, methods, name } = object;
      let count = methods.size;

      for (const method of methods) {
        if (objectToCheck[method] === undefined || objectToCheck[method] === null) {
          console.error(`${name}.${method} is not available. Please open an issue in the Navify repository to inform us about it.`);
          count--;
        }
      }
      console.log(`${count}/${methods.size} ${name} methods and objects are OK.`);

      for (const key of Object.keys(objectToCheck)) {
        if (!methods.has(key)) {
          console.warn(`${name} method ${key} exists but is not in the method list. Consider adding it.`);
        }
      }
    }

    const objectsToCheck = new Set([
      {
        objectToCheck: Navify,
        name: "Navify",
        methods: new Set([
          "Player",
          "API",
          "Extensions",
          "registerExtension",
          "unregisterExtension",
          "addToQueue",
          "CosmosAsync",
          "getAudioData",
          "Keyboard",
          "URI",
          "LocalStorage",
          "Queue",
          "removeFromQueue",
          "showNotification",
          "Menu",
          "ContextMenu",
          "React",
          "Mousetrap",
          "Locale",
          "ReactDOM",
          "Topbar",
          "ReactComponent",
          "PopupModal",
          "SVGIcons",
          "colorExtractor",
          "test",
          "Platform",
          "_platform",
          "Config",
          "expFeatureOverride",
          "createInternalMap",
          "RemoteConfigResolver",
          "Playbar",
          "Tippy",
          "_getStyledClassName",
          "GraphQL",
          "ReactHook",
          "AppTitle",
          "_reservedPanelIds",
          "ReactFlipToolkit",
          "classnames",
          "ReactQuery",
          "Color",
          "extractColorPreset",
          "ReactDOMServer",
          "Snackbar",
          "ContextMenuV2",
          "ReactJSX",
          "_renderNavLinks",
          "Events",
        ]),
      },
      {
        objectToCheck: Navify.Player,
        name: "Navify.Player",
        methods: new Set([
          "addEventListener",
          "back",
          "data",
          "decreaseVolume",
          "dispatchEvent",
          "eventListeners",
          "formatTime",
          "getDuration",
          "getHeart",
          "getMute",
          "getProgress",
          "getProgressPercent",
          "getRepeat",
          "getShuffle",
          "getVolume",
          "increaseVolume",
          "isPlaying",
          "next",
          "pause",
          "play",
          "removeEventListener",
          "seek",
          "setMute",
          "setRepeat",
          "setShuffle",
          "setVolume",
          "skipBack",
          "skipForward",
          "toggleHeart",
          "toggleMute",
          "togglePlay",
          "toggleRepeat",
          "toggleShuffle",
          "origin",
          "playUri",
          "setHeart",
        ]),
      },
      {
        objectToCheck: Navify.ReactComponent,
        name: "Navify.ReactComponent",
        methods: new Set([
          "RightClickMenu",
          "ContextMenu",
          "Menu",
          "MenuItem",
          "AlbumMenu",
          "PodcastShowMenu",
          "ArtistMenu",
          "PlaylistMenu",
          "TrackMenu",
          "TooltipWrapper",
          "TextComponent",
          "IconComponent",
          "ConfirmDialog",
          "Slider",
          "RemoteConfigProvider",
          "ButtonPrimary",
          "ButtonSecondary",
          "ButtonTertiary",
          "Snackbar",
          "Chip",
          "Toggle",
          "Cards",
          "Router",
          "Routes",
          "Route",
          "StoreProvider",
          "PlatformProvider",
          "Dropdown",
          "MenuSubMenuItem",
          "Navigation",
          "ScrollableContainer",
        ]),
      },
      {
        objectToCheck: Navify.ReactComponent.Cards,
        name: "Navify.ReactComponent.Cards",
        methods: new Set([
          "Default",
          "Hero",
          "CardImage",
          "Album",
          "Artist",
          "Audiobook",
          "Episode",
          "Playlist",
          "Profile",
          "Show",
          "Track",
          "FeatureCard",
        ]),
      },
      {
        objectToCheck: Navify.ReactHook,
        name: "Navify.ReactHook",
        methods: new Set(["DragHandler", "useExtractedColor"]),
      },
    ]);

    for (const object of objectsToCheck) {
      checkObject(object);
    }
  },
  GraphQL: {
    Definitions: {},
  },
  ReactComponent: {},
  ReactHook: {},
  ReactFlipToolkit: {},
  Snackbar: {},
  Platform: {},
};
