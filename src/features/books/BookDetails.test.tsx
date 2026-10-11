import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookDetails from './BookDetails';
import authReducer from '../auth/authSlice';
import * as bookApi from '../../services/bookApi';
import { supabase } from '../../services/supabase';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('../../services/bookApi');

jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const createTestStore = (initialUser: any = null) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: initialUser,
        session: initialUser ? ({ access_token: 'valid-jwt-token' } as any) : null,
        loading: false,
      },
    },
  });
};

describe('BookDetails Component', () => {
  const mockBook: bookApi.Book = {
    id: 'OL999W',
    title: 'The Pragmatic Programmer',
    authors: ['Andy Hunt', 'Dave Thomas'],
    description: 'Your journey to mastery.',
    coverUrl: 'https://example.com/pragmatic.jpg',
    categories: ['Software Engineering'],
    publishedDate: '1999',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it('debe renderizar los detalles del libro cargados desde la API', async () => {
    (bookApi.getBookById as jest.Mock).mockResolvedValueOnce(mockBook);
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/book/OL999W']}>
          <Routes>
            <Route path="/book/:id" element={<BookDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Cargando detalles...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
      expect(screen.getByText('Andy Hunt, Dave Thomas')).toBeInTheDocument();
      expect(screen.getByText('Your journey to mastery.')).toBeInTheDocument();
    });
  });

  it('debe redirigir al login si un usuario no autenticado intenta pedir un préstamo', async () => {
    (bookApi.getBookById as jest.Mock).mockResolvedValueOnce(mockBook);
    const store = createTestStore(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/book/OL999W']}>
          <Routes>
            <Route path="/book/:id" element={<BookDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /tomar prestado/i }));

    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });

  it('debe procesar el préstamo en Supabase si el usuario está autenticado', async () => {
    (bookApi.getBookById as jest.Mock).mockResolvedValueOnce(mockBook);
    const insertMock = jest.fn().mockResolvedValueOnce({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    const store = createTestStore({ id: 'user-uuid-123', email: 'reader@example.com' });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/book/OL999W']}>
          <Routes>
            <Route path="/book/:id" element={<BookDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('The Pragmatic Programmer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /tomar prestado/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('loans');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-uuid-123',
          book_id: 'OL999W',
          title: 'The Pragmatic Programmer',
        })
      );
      expect(mockedNavigate).toHaveBeenCalledWith('/loans');
    });
  });
});
