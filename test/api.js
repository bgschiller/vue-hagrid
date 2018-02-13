const moviesByGenre = {
  comedy: [
    'The Wolf of Wall Street',
    'Back to the Future',
    'Finding Nemo',
    'Up',
    'The Truman Show',
    'Toy Story',
  ],
  animation: [
    'Finding Nemo',
    'Up',
    'Toy Story',
    'Monsters, Inc',
    'Toy Story 3',
    'How to Train your Dragon',
    'Ratatouille',
    'Shrek',
    'Frozen',
    'Inside Out',
  ],
  scifi: [
    'Inception',
    'The Matrix',
    'Interstellar',
    'The Avengers',
    'Star Wars: Episode IV - A New Hope',
    'Avatar',
    'The Prestige',
  ],
  drama: [
    'The Shawshank Redemption',
    'Fight Club',
    'Pulp Fiction',
    'Forrest Gump',
    'The Godfather',
  ],
};

const getMoviesforGenre = genre =>
  Promise.resolve(moviesByGenre[genre] || []);

export const getMovies = ({ genre }) =>
  getMoviesforGenre(genre) // like: fetch(`/movies?genre=${genre}`)
    .then(resp => resp.json());
