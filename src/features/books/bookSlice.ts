import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Book } from '../../services/bookApi';

interface BookState {
  items: Book[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: BookState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    }
  },
});

export const { setLoading, setBooks, setError, setSearchQuery } = bookSlice.actions;
export default bookSlice.reducer;
