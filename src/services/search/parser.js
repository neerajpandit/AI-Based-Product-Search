export const parseQuery = (query) => {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid search query");
  }

  const q = query.toLowerCase();

  const filters = {
    category: null,
    color: null,
    maxPrice: null,
    keywords: [],
  };

  const PRICE_REGEX = /(under|below|less than)\s?(\d+)/i;

  const COLORS = ["red", "black", "white", "blue", "green", "silver"];
  const CATEGORIES = ["laptop", "mobile", "shoes", "watch", "headphones"];

  const priceMatch = q.match(PRICE_REGEX);
  if (priceMatch) {
    filters.maxPrice = Number(priceMatch[2]);
  }

  for (const cat of CATEGORIES) {
    if (q.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  for (const color of COLORS) {
    if (q.includes(color)) {
      filters.color = color;
      break;
    }
  }

  filters.keywords = q.split(" ").filter((w) => w.length > 2);

  return filters;
};
