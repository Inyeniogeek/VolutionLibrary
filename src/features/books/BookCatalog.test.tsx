import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import BookCatalog from './BookCatalog';
import bookReducer from './bookSlice';
import * as bookApi from '../../services/bookApi';

jest.mock('../../services/bookApi');

const createTestStore = () => {
  return configureStore({
    reducer: {
      books: bookReducer,
    },
  });
};

describe('BookCatalog Component', () => {
  const mockBooks: bookApi.Book[] = [
    {
      id: 'OL100W',
      title: 'JavaScript: The Good Parts',
      authors: ['Douglas Crockford'],
      description: 'A classic JavaScript book.',
      coverUrl: 'https://example.com/cover1.jpg',
      categories: ['Computers'],
      publishedDate: '2008',
    },
    {
      id: 'OL200W',
      title: 'You Don’t Know JS',
      authors: ['Kyle Simpson'],
      description: 'Deep dive into JS core.',
      coverUrl: '',
      categories: ['Programming'],
      publishedDate: '2015',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el catálogo y cargar los libros iniciales', async () => {
    (bookApi.searchBooks as jest.Mock).mockResolvedValueOnce(mockBooks);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <BookCatalog />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Catálogo de Libros/i)).toBeInTheDocument();
    expect(screen.getByText(/Cargando libros.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('JavaScript: The Good Parts')).toBeInTheDocument();
      expect(screen.getByText('You Don’t Know JS')).toBeInTheDocument();
    });

    expect(screen.getByText('Douglas Crockford')).toBeInTheDocument();
    expect(screen.getByText('Sin Portada')).toBeInTheDocument();
  });

  it('debe buscar nuevos libros al enviar el formulario de búsqueda', async () => {
    (bookApi.searchBooks as jest.Mock).mockResolvedValueOnce(mockBooks);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <BookCatalog />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('JavaScript: The Good Parts')).toBeInTheDocument();
    });

    const newBooks: bookApi.Book[] = [
      {
        id: 'OL300W',
        title: 'React Design Patterns',
        authors: ['Carlos Santana'],
        description: 'React design patterns guide.',
        coverUrl: 'https://example.com/cover3.jpg',
        categories: ['Web'],
        publishedDate: '2022',
      },
    ];

    (bookApi.searchBooks as jest.Mock).mockResolvedValueOnce(newBooks);

    const input = screen.getByPlaceholderText(/buscar por título, autor o palabra clave.../i);
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(bookApi.searchBooks).toHaveBeenCalledWith('React');
      expect(screen.getByText('React Design Patterns')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de error si falla la petición de libros', async () => {
    (bookApi.searchBooks as jest.Mock).mockRejectedValueOnce(new Error('Error en el servidor de libros'));
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <BookCatalog />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error en el servidor de libros')).toBeInTheDocument();
    });
  });
});
