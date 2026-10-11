# Documentación del Proyecto - VolutionLibrary

## 1. Arquitectura General y Backend

He estado manejando todo con Supabase ya que me pareció más cómodo y rápido para el funcionamiento de la aplicación, y me centré más en la optimización, el rendimiento y la experiencia de usuario.

Lo bueno de usar Supabase es que me permite contar con una base de datos relacional PostgreSQL completa y un sistema de autenticación robusto basado en tokens JWT sin necesidad de montar un servidor backend independiente desde cero. Esto agiliza el desarrollo y me asegura estándares de seguridad elevados, como el cifrado de contraseñas y las políticas de acceso por fila (Row Level Security).

Para la gestión de los datos de la aplicación combino dos fuentes:
- **API REST de OpenLibrary**: La utilizo para consultar el catálogo de libros, portadas, autores y descripciones detalladas en tiempo real mediante peticiones HTTP asíncronas con `fetch`.
- **Supabase (PostgreSQL y Auth)**: Lo utilizo como backend principal para registrar usuarios, gestionar sesiones y almacenar las tablas relacionales de préstamos (`loans`) y lista de deseos (`wishlist`).

---

## 2. Flujo Completo de Autenticación Basado en Tokens

El flujo de autenticación de la plataforma funciona íntegramente mediante tokens JWT de la siguiente manera:

### Inicio de Sesión y Registro
En el formulario del componente `Auth`, el usuario introduce su correo y contraseña. Dependiendo de la acción seleccionada:
- Para iniciar sesión llamo a `supabase.auth.signInWithPassword({ email, password })`.
- Para registrarse llamo a `supabase.auth.signUp({ email, password })`.

Supabase valida las credenciales y devuelve una sesión que contiene el token de acceso (`access_token`) y el token de actualización (`refresh_token`).

### Almacenamiento y Envío del Token
- **Almacenamiento**: El cliente de Supabase guarda automáticamente el token en el almacenamiento local del navegador (`localStorage`) con un identificador único y seguro.
- **Envío**: En cada petición hacia las tablas de la base de datos (por ejemplo, al registrar un préstamo en `loans` o agregar un libro a `wishlist`), el cliente adjunta automáticamente el token en la cabecera HTTP:
  ```http
  Authorization: Bearer <access_token>
  ```
  De esta forma, la base de datos valida en cada consulta la identidad del usuario y aplica las reglas de seguridad correspondientes.

### Sincronización del Estado con Redux
En el componente principal `App`, mantengo sincronizado el estado global mediante dos llamadas:
1. `supabase.auth.getSession()` al montar la aplicación para recuperar la sesión existente si el usuario ya había iniciado sesión previamente.
2. `supabase.auth.onAuthStateChange()` para escuchar en tiempo real cualquier cambio de estado (inicio de sesión, expiración de token o cierre de sesión) y despachar las acciones correspondientes a Redux (`setAuth`).

### Cierre de Sesión
Cuando el usuario presiona el botón de salida en la barra de navegación:
1. Ejecuto `supabase.auth.signOut()`, lo cual invalida y remueve el token almacenado tanto en el cliente como en el backend.
2. Despacho la acción `clearAuth()` de Redux para reiniciar el estado global y devolver la aplicación a su estado de usuario invitado.

---

## 3. Pruebas Unitarias e de Integración

Configuré el entorno de pruebas utilizando **Jest** y **React Testing Library** para asegurar el correcto funcionamiento de los componentes más críticos y los hooks de la aplicación.

Para ejecutar todas las pruebas en la consola:

```bash
pnpm test
```

### Hook Personalizado: `useBookSearch`
- **Ubicación**: `src/hooks/useBookSearch.test.ts`
- **Objetivo**: Probar la lógica de búsqueda de libros encapsulada en el hook personalizado.
- **Simulación de dependencias**: Simulé la llamada a la API externa (`searchBooks` / `fetch`) con `jest.mock('../../services/bookApi')`.
- **Casos probados**:
  - Inicialización correcta del estado con consulta por defecto y carga de datos.
  - Manejo adecuado de errores si la petición de red falla.
  - Vaciado de la lista de resultados cuando se ingresa una cadena vacía.

### Componente Crítico 1: `Auth`
- **Ubicación**: `src/features/auth/Auth.test.tsx`
- **Objetivo**: Validar el formulario de acceso y la integración con el flujo de autenticación.
- **Simulación de dependencias**: Simulé el cliente de Supabase (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`) y la navegación de `react-router-dom`.
- **Casos probados**:
  - Renderizado de los campos de correo, contraseña y botones.
  - Alternancia entre las vistas de "Iniciar Sesión" y "Registrarse".
  - Envío exitoso del formulario, llamada al método de Supabase y redirección a la ruta principal.
  - Presentación visual de alertas de error en caso de credenciales incorrectas.

### Componente Crítico 2: `BookCatalog`
- **Ubicación**: `src/features/books/BookCatalog.test.tsx`
- **Objetivo**: Probar el catálogo interactivo de libros y su conexión con el estado global de Redux.
- **Simulación de dependencias**: Simulé el servicio de búsqueda `searchBooks` de la API REST.
- **Casos probados**:
  - Renderizado del catálogo y carga de tarjetas de libros iniciales.
  - Búsqueda reactiva mediante el formulario y actualización del listado.
  - Manejo de estados de error cuando el servidor no responde.

### Componente Crítico 3: `BookDetails`
- **Ubicación**: `src/features/books/BookDetails.test.tsx`
- **Objetivo**: Validar la visualización del libro y la lógica de negocio para solicitar préstamos y agregar a favoritos.
- **Simulación de dependencias**: Simulé `getBookById` para la carga de datos y `supabase.from('loans').insert` para el guardado en base de datos.
- **Casos probados**:
  - Renderizado de la información del libro (portada, título, autor, descripción).
  - Redirección obligatoria al formulario de login si un usuario no autenticado intenta solicitar un préstamo.
  - Procesamiento correcto del préstamo en la tabla de Supabase cuando el usuario cuenta con sesión activa.

---

## 4. Optimizaciones de Rendimiento y Experiencia de Usuario

Adicionalmente, integré mejoras de rendimiento aplicadas en los laboratorios de desarrollo web:

- **Code Splitting y Lazy Loading**: Rutas divididas mediante `React.lazy()` y envueltas en `<Suspense>`, cargando cada vista bajo demanda para reducir el peso inicial del bundle.
- **Carga Diferida de Imágenes**: Uso del atributo `loading="lazy"` en todas las portadas de libros del catálogo.
- **Micro-interacciones y Animaciones**: Efectos de elevación e iluminación en las tarjetas de libros (`hover glow`) y transiciones suaves en paneles con estilo glassmorphism.
