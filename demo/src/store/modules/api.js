const catApiKey = 'MjcxMzkw';

export const getCats = async ({ numResults, category, size }) => {
  const response = await fetch('https://cors-anywhere.herokuapp.com/thecatapi.com/api/images/get?format=xml&results_per_page=20');
  const text = await response.text();
  return text;
};

export const getCategories = async () => {
  const response = await fetch('https://cors-anywhere.herokuapp.com/thecatapi.com/api/categories/list');
  const text = await response.text();
  return text;
};
