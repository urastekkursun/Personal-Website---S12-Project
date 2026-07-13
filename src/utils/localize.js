export function localize(node, lang) {
  if (Array.isArray(node)) {
    return node.map((item) => localize(item, lang));
  }

  if (node !== null && typeof node === "object") {
    const keys = Object.keys(node);
    const isTranslationLeaf =
      keys.length === 2 && keys.includes("tr") && keys.includes("en");

    if (isTranslationLeaf) {
      return node[lang];
    }

    const result = {};
    for (const key of keys) {
      result[key] = localize(node[key], lang);
    }
    return result;
  }

  return node;
}
