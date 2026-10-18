# VolutionLibrary

> Plataforma web moderna de catálogo y gestión bibliotecaria digital desarrollada con React 19, TypeScript, Vite, Redux Toolkit, Tailwind CSS v4 y Supabase.

**Enlace en vivo:** [https://volutionlibrary.pages.dev/](https://volutionlibrary.pages.dev/)

**Enlace al repositorio:** [GitHub Repository](https://github.com/Inyeniogeek/VolutionLibrary)

---

## Descripción del Proyecto

VolutionLibrary es una aplicación web interactiva que permite a los usuarios descubrir lecturas a través de la API abierta de OpenLibrary, filtrar libros por género, solicitar préstamos con control de disponibilidad y administrar su propia lista de deseos personal.

Toda la persistencia de usuarios, sesiones y registros de préstamos está respaldada por una base de datos relacional PostgreSQL y autenticación basada en tokens JWT gestionada a través de Supabase, acompañada de una interfaz visual en modo oscuro con diseño _glassmorphism_, micro-animaciones fluidas y notificaciones interactivas con Sonner.

---

## Características Principales

- **Catálogo Digital Interactivo**: Exploración de obras literarias con portadas en alta calidad, autores, fechas de publicación y sinopsis detalladas obtenidas en tiempo real desde la API de OpenLibrary.
- **Filtros Dinámicos por Género**: Navegación rápida por categorías temáticas (Aventura, Acción, Ciencia Ficción, Fantasía, Misterio, Romance, Terror, Historia y Tecnología) con selector interactivo y buscador por texto libre.
- **Autenticación Basada en Tokens**: Sistema completo de registro e inicio de sesión con JWT emitidos por Supabase, persistencia segura en `localStorage` y sincronización en tiempo real del estado global del usuario con Redux.
- **Gestión Inteligente de Préstamos**:
  - Solicitud de préstamos por 14 días.
  - Prevención de duplicados: La aplicación detecta si el usuario ya tiene un libro en préstamo activo y bloquea solicitudes repetidas.
  - Historial y fecha de devolución: Al devolver un libro se registra y visualiza la fecha y hora exacta de devolución, permitiendo volver a solicitarlo en el futuro.
- **Lista de Deseos Personalizada**: Guardado rápido de libros favoritos para consultarlos o pedirlos prestados más adelante.
- **Sistema de Notificaciones con Sonner**: Notificaciones _toast_ modernas para confirmar préstamos, devoluciones, altas/bajas de la lista de deseos y errores de red.
- **Rendimiento Optimizado**: Carga diferida de rutas con `React.lazy` y `<Suspense>`, atributo `loading="lazy"` en imágenes y memorización de funciones con `useCallback`.

---

## Stack Tecnológico

| Capa / Herramienta          | Tecnología                    | Propósito                                                               |
| :-------------------------- | :---------------------------- | :---------------------------------------------------------------------- |
| **Framework Frontend**      | React 19 + TypeScript         | Construcción de interfaces tipadas, modulares y reactivas               |
| **Bundler & Tooling**       | Vite 8 + `@tailwindcss/vite`  | Servidor de desarrollo ultrarrápido y compilación optimizada            |
| **Gestión de Estado**       | Redux Toolkit + React-Redux   | Centralización predecible del estado de autenticación y catálogo        |
| **Enrutamiento**            | React Router DOM 7            | Navegación SPA con división de código a nivel de ruta                   |
| **Estilos & UI**            | Tailwind CSS v4 + Vanilla CSS | Sistema de diseño en modo oscuro, efectos _glassmorphism_ y animaciones |
| **Iconografía & Alertas**   | Lucide React + Sonner         | Iconos vectoriales limpios y sistema moderno de notificaciones _toast_  |
| **Backend & Base de Datos** | Supabase (PostgreSQL + Auth)  | Base de datos relacional, emisión de tokens JWT y políticas RLS         |
| **API Externa de Libros**   | OpenLibrary REST API          | Consultas asíncronas de obras, autores y portadas sin límite de cuota   |
| **Testing**                 | Jest + React Testing Library  | Pruebas unitarias e integración de componentes y hooks                  |
| **Hosting & Despliegue**    | Cloudflare Pages              | Entrega global en la red Edge con integración continua                  |

---

## Arquitectura y Decisiones Técnicas

### 1. Autenticación y Seguridad

- **Flujo de tokens JWT**: El usuario envía sus credenciales al endpoint de autenticación de Supabase. Al autenticarse, recibe un `access_token` y un `refresh_token`. El cliente guarda automáticamente la sesión en el almacenamiento local y adjunta el token en la cabecera `Authorization: Bearer <token>` para cada consulta a las tablas `loans` y `wishlist`.
- **Seguridad por Fila (RLS)**: Las políticas configuradas en PostgreSQL garantizan que cada usuario solo pueda consultar, insertar o actualizar sus propios préstamos y listas de deseos.

### 2. Separación de Responsabilidades y Hooks

- La lógica de consumo de la API de libros y la gestión de estados asíncronos está encapsulada en el hook personalizado `useBookSearch`, desacoplando la lógica de negocio de la vista del catálogo.
- De igual forma, el hook `useAuth` abstrae la suscripción a la sesión y las funciones de cierre de sesión.

### 3. Rendimiento y Carga Diferida

- Todas las vistas principales (`Auth`, `BookCatalog`, `BookDetails`, `Loans`, `Wishlist`) se cargan bajo demanda mediante `React.lazy` y `Suspense`, minimizando el tamaño del paquete inicial transferido al navegador.

---

## Estructura del Proyecto

```text
Capstone/
├── public/                  # Favicon y recursos estáticos
├── src/
│   ├── assets/              # Archivos multimedia y logos
│   ├── features/            # Módulos organizados por funcionalidad
│   │   ├── auth/            # Vista de login/registro y authSlice
│   │   ├── books/           # Catálogo, vista de detalles y bookSlice
│   │   └── loans/           # Gestión de préstamos y lista de deseos
│   ├── hooks/               # Hooks personalizados (useBookSearch, useAuth)
│   ├── lib/                 # Utilidades (cn para shadcn/tailwind)
│   ├── services/            # Clientes de API (bookApi.ts, supabase.ts)
│   ├── store/               # Configuración central de Redux Toolkit
│   ├── App.tsx              # Rutas, Navbar, Toaster y layout principal
│   ├── index.css            # Configuración de Tailwind CSS v4 y tokens visuales
│   ├── main.tsx             # Punto de entrada de React 19
│   └── setupTests.ts        # Configuración del entorno de pruebas
├── __mocks__/               # Mocks de estilos y dependencias para Jest
├── index.html               # Plantilla HTML con título y metadatos
├── jest.config.cjs          # Configuración de Jest con ts-jest
├── package.json             # Dependencias y scripts del proyecto
├── tsconfig.app.json        # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite con plugins
```

---

## Instrucciones de Configuración y Ejecución Local

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 20 o superior recomendada).
- [pnpm](https://pnpm.io/) (versión 9 o superior).

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/volutionlibrary.git
cd volutionlibrary
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`:

```bash
cp .env.example .env
```

Contenido necesario dentro de `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica-anon
```

### 4. Ejecutar en Modo Desarrollo

```bash
pnpm dev
```

La aplicación se iniciará localmente en `http://localhost:5173/`.

### 5. Ejecutar la Suite de Pruebas

Para correr las pruebas unitarias y de integración con Jest y React Testing Library:

```bash
pnpm test
```

### 6. Compilar para Producción

```bash
pnpm build
```

Para previsualizar el bundle generado en la carpeta `dist`:

```bash
pnpm preview
```

---

## Pruebas Automatizadas

El proyecto incluye 13 pruebas unitarias y de integración que cubren los flujos esenciales:

1. **`useBookSearch.test.ts`**: Valida la inicialización de estado, consultas asíncronas con mock de API, manejo de fallos de red y limpieza ante búsquedas vacías.
2. **`Auth.test.tsx`**: Valida el renderizado de campos, alternancia entre login y registro, envío correcto a Supabase Auth, redirección y captura de credenciales inválidas.
3. **`BookCatalog.test.tsx`**: Valida la carga inicial con Redux, renderizado de tarjetas, envío del buscador y presentación de errores.
4. **`BookDetails.test.tsx`**: Valida la visualización detallada, redirección a login para usuarios no autenticados y la inserción exitosa de préstamos en base de datos.

---

## Despliegue en Producción

La aplicación se encuentra desplegada de forma continua en **Cloudflare Pages**:

- **URL de Producción:** [https://volutionlibrary.pages.dev/](https://volutionlibrary.pages.dev/)
- **Rama de Despliegue:** `main`
- **Comando de Compilación:** `pnpm build`
- **Directorio de Salida:** `dist`

---

## Autor

Desarrollado por **Inyeniogeek** como proyecto Capstone de Desarrollo Web.
