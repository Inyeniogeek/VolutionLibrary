import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookSearch } from './useBookSearch';
import * as bookApi from '../services/bookApi';

jest.mock('../services/bookApi');

describe('useBookSearch', () => {
  const mockBooks: bookApi.Book[] = [
    {
      id: 'OL123W',
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      description: 'A handbook of agile software craftsmanship',
      coverUrl: 'https://example.com/cover.jpg',
      categories: ['Programming'],
      publishedDate: '2008',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializarse y cargar los libros por defecto', async () => {
    (bookApi.searchBooks as jest.Mock).mockResolvedValueOnce(mockBooks);

    const { result } = renderHook(() => useBookSearch('clean code'));

    expect(result.current.query).toBe('clean code');
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks);
    expect(result.current.error).toBeNull();
    expect(bookApi.searchBooks).toHaveBeenCalledWith('clean code');
  });

  it('debe manejar errores de la API', async () => {
    (bookApi.searchBooks as jest.Mock).mockRejectedValueOnce(new Error('Fallo de red'));

    const { result } = renderHook(() => useBookSearch('error query'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBe('Fallo de red');
  });

  it('debe limpiar los libros si se busca una cadena vacía', async () => {
    const { result } = renderHook(() => useBookSearch(''));

    await act(async () => {
      await result.current.search('   ');
    });

    expect(result.current.books).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
