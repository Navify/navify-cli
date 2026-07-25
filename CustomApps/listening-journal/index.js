const { React: react } = Navify;
const journalStorageKey = "navify.listening-journal";

function render() {
  return react.createElement(ListeningJournal);
}

function readJournalEntries() {
  try {
    const entries = JSON.parse(localStorage.getItem(journalStorageKey) || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function ListeningJournal() {
  const [entries, setEntries] = react.useState(readJournalEntries);
  const [query, setQuery] = react.useState("");

  react.useEffect(() => {
    const refresh = () => setEntries(readJournalEntries());
    window.addEventListener("navify-journal-change", refresh);
    return () => window.removeEventListener("navify-journal-change", refresh);
  }, []);

  const remove = (id) => {
    const next = entries.filter((entry) => entry.id !== id);
    localStorage.setItem(journalStorageKey, JSON.stringify(next));
    setEntries(next);
  };

  const exportEntries = () => {
    Navify.Platform.ClipboardAPI.copy(JSON.stringify(entries, null, 2));
    Navify.showNotification("Journal copied to clipboard");
  };

  const filtered = entries.filter((entry) =>
    `${entry.title} ${entry.artist} ${entry.note}`.toLowerCase().includes(query.toLowerCase())
  );

  return react.createElement(
    "main",
    { className: "listening-journal" },
    react.createElement(
      "header",
      null,
      react.createElement("div", null, react.createElement("span", null, "NAVIFY"), react.createElement("h1", null, "Listening Journal")),
      react.createElement("button", { onClick: exportEntries, disabled: !entries.length }, "Export")
    ),
    react.createElement(
      "div",
      { className: "journal-toolbar" },
      react.createElement("input", {
        value: query,
        onChange: (event) => setQuery(event.target.value),
        placeholder: "Search notes",
      }),
      react.createElement("p", null, "Press Ctrl+Shift+N while a track is playing to add a note.")
    ),
    filtered.length
      ? react.createElement(
          "section",
          { className: "journal-list" },
          ...filtered.map((entry) =>
            react.createElement(
              "article",
              { key: entry.id },
              entry.image ? react.createElement("img", { src: entry.image, alt: "" }) : react.createElement("div", { className: "journal-cover" }),
              react.createElement(
                "div",
                null,
                react.createElement("strong", null, entry.title),
                react.createElement("span", null, entry.artist),
                react.createElement("p", null, entry.note),
                react.createElement("time", null, new Date(entry.createdAt).toLocaleString())
              ),
              react.createElement("button", { onClick: () => remove(entry.id), title: "Delete note" }, "Delete")
            )
          )
        )
      : react.createElement("div", { className: "journal-empty" }, query ? "No notes match your search." : "Your listening journal is empty.")
  );
}
