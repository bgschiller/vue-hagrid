export const getMovies = ({ genre }) =>
  fetch(`/movies?genre=${genre}`)
    .then(resp => resp.json());
