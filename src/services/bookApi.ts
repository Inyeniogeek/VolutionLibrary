export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl: string;
  categories: string[];
  publishedDate: string;
}

const SEARCH_BASE_URL = 'https://openlibrary.org/search.json';
const WORKS_BASE_URL = 'https://openlibrary.org/works';

export const searchBooks = async (query: string, maxResults = 20): Promise<Book[]> => {
  if (!query) return [];
  
  const response = await fetch(`${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}&limit=${maxResults}`);
  if (!response.ok) throw new Error('Error al obtener libros');
  
  const data = await response.json();
  
  return (data.docs || []).map((item: any) => {
    const id = item.key ? item.key.replace('/works/', '') : '';
    const coverUrl = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '';
    
    return {
      id,
      title: item.title || 'Sin Título',
      authors: item.author_name || ['Autor Desconocido'],
      description: 'Haz clic para ver más detalles.',
      coverUrl,
      categories: item.subject ? item.subject.slice(0, 3) : [],
      publishedDate: item.first_publish_year ? item.first_publish_year.toString() : '',
    };
  }).filter((book: Book) => book.id !== '');
};

export const getBookById = async (id: string): Promise<Book> => {
  if (!id) throw new Error('ID de libro requerido');
  
  const searchResponse = await fetch(`${SEARCH_BASE_URL}?q=${id}&limit=1`);
  const searchData = await searchResponse.json();
  const searchItem = searchData.docs && searchData.docs.length > 0 ? searchData.docs[0] : null;

  const workResponse = await fetch(`${WORKS_BASE_URL}/${id}.json`);
  const workData = await workResponse.json();
  
  let descriptionText = 'Sin descripción disponible.';
  if (workData.description) {
    if (typeof workData.description === 'string') {
      descriptionText = workData.description;
    } else if (workData.description.value) {
      descriptionText = workData.description.value;
    }
  }

  if (searchItem) {
    return {
      id,
      title: searchItem.title || workData.title || 'Sin Título',
      authors: searchItem.author_name || ['Autor Desconocido'],
      description: descriptionText,
      coverUrl: searchItem.cover_i ? `https://covers.openlibrary.org/b/id/${searchItem.cover_i}-L.jpg` : '',
      categories: searchItem.subject ? searchItem.subject.slice(0, 3) : [],
      publishedDate: searchItem.first_publish_year ? searchItem.first_publish_year.toString() : '',
    };
  }

  let coverUrl = '';
  if (workData.covers && workData.covers.length > 0) {
    coverUrl = `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`;
  }

  return {
    id,
    title: workData.title || 'Sin Título',
    authors: ['Autor Desconocido'],
    description: descriptionText,
    coverUrl,
    categories: workData.subjects ? workData.subjects.slice(0, 3) : [],
    publishedDate: '',
  };
};
