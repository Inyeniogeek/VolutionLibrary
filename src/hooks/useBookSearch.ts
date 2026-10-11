import { useState, useEffect, useCallback } from 'react';
import { searchBooks } from '../services/bookApi';
import type { Book } from '../services/bookApi';

export const useBookSearch = (initialQuery = 'programming') => {
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setBooks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (err: any) {
      setError(err.message || 'Error al buscar libros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  return {
    query,
    setQuery,
    books,
    loading,
    error,
    search: performSearch,
  };
};
