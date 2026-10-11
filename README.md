# VolutionLibrary - Documentación del Proyecto

## Arquitectura y Decisiones Técnicas

He estado manejando todo con Supabase ya que me pareció más cómodo y rápido para el funcionamiento de la aplicación, y me centré más en la optimización, el rendimiento y la experiencia de usuario. 

Lo bueno de usar Supabase es que me permite gestionar tanto una base de datos relacional PostgreSQL como un sistema completo y robusto de autenticación basado en tokens JWT sin necesidad de levantar un servidor Node/Express desde cero. De esta forma, tengo resuelto el almacenamiento seguro de contraseñas, la emisión y renovación automática de tokens de acceso, y las políticas de seguridad a nivel de filas (RLS).

---

## Integración con Backend y Autenticación Basada en Tokens

Para la comunicación con el backend he integrado dos capas de servicios:

1. **API REST de OpenLibrary**: La utilizo para consultar el catálogo general de libros y los detalles de cada obra en tiempo real mediante peticiones HTTP asíncronas con `fetch`.
2. **Backend as a Service con Supabase**: Gestiona las operaciones de base de datos relacional para el sistema de préstamos (`loans`) y la lista de deseos (`wishlist`), además del ciclo de vida de usuarios y sesiones.

### Flujo Completo de Autenticación por Tokens

El flujo de autenticación implementado funciona de la siguiente manera:

- **Inicio de sesión y Registro**: En el componente `Auth`, el usuario ingresa sus credenciales (correo y contraseña). Mediante `supabase.auth.signInWithPassword` o `supabase.auth.signUp`, Supabase valida los datos en el servidor y retorna una sesión que incluye un JWT de acceso (`access_token`) y un token de actualización (`refresh_token`).
- **Almacenamiento y Envío de Token**: El cliente de Supabase almacena el token de sesión de forma segura y persistente en el almacenamiento local del navegador (`localStorage`). Cada petición posterior a las tablas de base de datos (`loans`, `wishlist`) adjunta automáticamente este token en la cabecera `Authorization: Bearer <access_token>`, permitiendo verificar la identidad del usuario en cada transacción.
- **Sincronización de Estado Global con Redux**: Al cargar la aplicación (`App.tsx`), verifico la existencia de una sesión activa mediante `supabase.auth.getSession()` y escucho los cambios de estado en tiempo real con `supabase.auth.onAuthStateChange()`, actualizando el estado de Redice (`authSlice`) con los datos del usuario y la sesión actual.
- **Cierre de Sesión**: Al hacer clic en salir, invoco `supabase.auth.signOut()`, lo cual invalida y destruye el token en el cliente y en el servidor, seguido del reseteo del estado global en Redux con `dispatch(clearAuth())`.

---

## Pruebas Unitarias e de Integración

He configurado un entorno de pruebas con **Jest** y **React Testing Library** para asegurar la fiabilidad de las funcionalidades más críticas de la plataforma. Para ejecutar las pruebas en modo desarrollo y validar las suites:

```bash
pnpm test
```

### 1. Hook Personalizado (`useBookSearch`)
- **Archivo**: `src/hooks/useBookSearch.test.ts`
- **Cobertura**: Verifica la inicialización del estado, la llamada a la función de búsqueda simulando la API REST externa (`fetch` / `bookApi`), el manejo correcto de errores cuando la petición falla, y el vaciado del listado ante búsquedas vacías.
- **Simulación**: Se simula el módulo `bookApi` para aislar la lógica del hook sin depender de la red real.

### 2. Componente de Autenticación (`Auth`)
- **Archivo**: `src/features/auth/Auth.test.tsx`
- **Cobertura**: Comprueba el renderizado inicial del formulario de login, el cambio dinámico entre login y registro, el flujo exitoso de inicio de sesión con llamada a `signInWithPassword` y redirección al catálogo, así como la captura y visualización de errores de credenciales inválidas.
- **Simulación**: Se simula el cliente de Supabase (`supabase.auth`) y el hook de navegación `useNavigate` de `react-router-dom`.

### 3. Catálogo de Libros (`BookCatalog`)
- **Archivo**: `src/features/books/BookCatalog.test.tsx`
- **Cobertura**: Valida la carga inicial de los libros con Redux, el renderizado de tarjetas con títulos, autores y estados de portada, el envío del formulario de búsqueda para solicitar nuevos resultados, y la presentación de mensajes de error cuando el servicio REST no responde.
- **Simulación**: Se simula `searchBooks` y se integra con un `configureStore` de Redux Toolkit y `MemoryRouter`.

### 4. Detalles del Libro y Acciones de Préstamo (`BookDetails`)
- **Archivo**: `src/features/books/BookDetails.test.tsx`
- **Cobertura**: Verifica la carga y visualización de información extendida del libro, la redirección obligatoria al formulario de login si un usuario no autenticado intenta solicitar un préstamo, y la ejecución exitosa de la inserción en la tabla `loans` cuando el usuario cuenta con una sesión válida.
- **Simulación**: Se simula `getBookById`, `supabase.from('loans').insert`, y el hook de enrutamiento.

---

## Optimizaciones de Rendimiento

Para asegurar una carga veloz y una navegación fluida, he implementado las siguientes técnicas:

- **Carga diferida (Lazy Loading) y Code Splitting**: División de rutas principales (`Auth`, `BookCatalog`, `BookDetails`, `Loans`, `Wishlist`) mediante `React.lazy` y `Suspense`, cargando los módulos únicamente cuando el usuario navega a ellos.
- **Carga diferida de imágenes**: Atributo `loading="lazy"` en todas las portadas de libros para evitar la descarga innecesaria de imágenes fuera del viewport.
- **Memorización y Callbacks**: Empleo de `useCallback` en búsquedas y operaciones frecuentes para evitar re-renderizados innecesarios.
