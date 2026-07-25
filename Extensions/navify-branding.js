(async function navifyBranding() {
  while (!document.body) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const legacyName = new RegExp(["spice", "tify"].join(""), "gi");
  const attributes = ["title", "aria-label", "placeholder"];

  function replace(value) {
    return value.replace(legacyName, "Navify");
  }

  function update(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      const parent = root.parentElement;
      if (parent && !parent.closest("script,style")) {
        root.nodeValue = replace(root.nodeValue || "");
      }
      return;
    }

    if (!(root instanceof Element)) {
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest("script,style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node = walker.nextNode();

    while (node) {
      node.nodeValue = replace(node.nodeValue || "");
      node = walker.nextNode();
    }

    const elements = [root, ...root.querySelectorAll("[title],[aria-label],[placeholder]")];
    for (const element of elements) {
      for (const attribute of attributes) {
        const value = element.getAttribute(attribute);
        if (value) {
          element.setAttribute(attribute, replace(value));
        }
      }
    }
  }

  update(document.body);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        update(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
