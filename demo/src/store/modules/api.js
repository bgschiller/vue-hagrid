const catApiKey = 'MjcxMzkw';

export const getCats = async (payload) => {
  if (!payload) return null;
  const { numResults, category, size } = payload;
  const response = await fetch(
    `https://cors-anywhere.herokuapp.com/thecatapi.com/api/images/get?format=xml&results_per_page=${numResults}&category=${category}&size=${size}`);
  const text = await response.text();
  return text;
};

export const getCategories = async () => {
  const response = await fetch('https://cors-anywhere.herokuapp.com/thecatapi.com/api/categories/list');
  const text = await response.text();
  return text;
};
