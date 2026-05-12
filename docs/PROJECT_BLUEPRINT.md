# Project Blueprint — React SPA

Usa questo documento come riferimento architetturale per creare un nuovo progetto React.
Segui TUTTE le convenzioni descritte. Non inventare alternative.

---

## Tech Stack

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| Runtime | React | 19 |
| Language | TypeScript | 5.9+ (strict mode) |
| Build | Vite | 7 |
| Styling | Tailwind CSS | 4 (plugin vite, NO PostCSS) |
| UI Components | shadcn/ui + Radix UI | latest |
| Routing | React Router | v7 |
| Server State | TanStack React Query | v5 |
| Tables | TanStack React Table | v8 |
| Forms | React Hook Form + Zod | RHF v7, Zod v4 |
| HTTP | Axios | latest |
| Icons | lucide-react | latest |
| Toasts | Sonner | latest |
| Date | date-fns | v4 |
| Package Manager | pnpm | latest |
| Linting | ESLint 9 (flat config) + Prettier | |
| Git hooks | Husky + lint-staged + commitlint | |

---

## Struttura cartelle

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Providers wrapper
├── index.css                         # Tailwind base + CSS variables tema
│
├── components/
│   ├── ui/                           # shadcn/ui components (generati con CLI)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── combobox.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── custom/                       # Componenti riutilizzabili di dominio
│   │   ├── sidebar/
│   │   │   ├── AppSidebar.tsx
│   │   │   └── AppSidebarFooter.tsx
│   │   ├── table/
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTableColumnHeader.tsx
│   │   │   └── ApiPagination.tsx
│   │   └── Logo.tsx
│   └── layout/
│       ├── AppRoutes.tsx             # Definizione rotte
│       ├── Layout.tsx                # Shell (sidebar + Outlet)
│       └── PermissionGuard.tsx       # Wrapper autorizzazione
│
├── pages/                            # Feature modules (una cartella = una feature)
│   ├── UsersPage/
│   │   ├── UsersPage.tsx             # Componente pagina principale
│   │   ├── components/               # Componenti locali della pagina
│   │   │   ├── CreateUserDialog.tsx
│   │   │   └── EditUserDialog.tsx
│   │   ├── hooks/                    # Hook locali della pagina
│   │   │   ├── useCreateUserDialog.ts
│   │   │   └── useEditUserDialog.ts
│   │   ├── details/                  # Sotto-pagine (es. /users/:id)
│   │   │   └── UserDetailsPage.tsx
│   │   └── user.constants.ts         # Costanti, label, config della feature
│   └── LoginPage/
│       └── LoginPage.tsx
│
├── hooks/                            # Hook globali condivisi
│   ├── useAuth.ts
│   ├── usePermission.ts
│   ├── use-mobile.ts
│   └── useURLState.ts
│
├── services/                         # Layer API
│   ├── api/
│   │   ├── api.service.ts            # Istanza Axios + interceptors
│   │   └── token-refresh.ts          # Refresh token su 401
│   ├── users/
│   │   └── user.service.ts
│   └── sites/
│       └── site.service.ts
│
├── types/
│   ├── dto/                          # Tipi auto-generati da Swagger (NON modificare)
│   │   ├── index.ts                  # Re-export centrale
│   │   ├── enums.ts
│   │   ├── user.ts
│   │   └── ...
│   └── pagination.types.ts           # Tipi custom non generati
│
├── schemas/                          # Zod schemas per validazione form
│   ├── users.schemas.ts
│   └── sites.schemas.ts
│
├── lib/                              # Utility pure
│   ├── utils.ts                      # cn() helper (clsx + tailwind-merge)
│   ├── logger.ts                     # Logger strutturato con context
│   └── apiQueryBuilder.ts            # Costruttore query string per filtri/sort/paginazione
│
├── utils/                            # Helper di dominio
│   └── role.utils.ts
│
├── config/                           # Configurazione app
│   ├── auth.config.ts                # OIDC settings
│   └── permission.config.ts          # Permessi rotte per ruolo
│
├── context/                          # React Context (solo per stato globale)
│   └── AuthContext.tsx
│
└── generated/                        # Codice auto-generato (NON modificare)
    └── api/
```

### Regole naming file

| Tipo | Naming | Esempio |
|------|--------|---------|
| Componenti | PascalCase.tsx | `CreateUserDialog.tsx` |
| Hook | camelCase con prefisso `use` | `useCreateUserDialog.ts` |
| Service | camelCase + `.service.ts` | `user.service.ts` |
| Schema | camelCase + `.schemas.ts` | `users.schemas.ts` |
| Tipi | camelCase + `.types.ts` | `pagination.types.ts` |
| Costanti | camelCase + `.constants.ts` | `user.constants.ts` |
| Utility | camelCase + `.utils.ts` | `role.utils.ts` |

---

## Variabili d'ambiente

Template `.env` (tutti i progetti usano questo naming):

```env
VITE_REACT_APP_BE_URL=http://127.0.0.1:3100/
VITE_REACT_APP_ENV=DEV
VITE_REACT_APP_AUTHORITY=https://login.microsoftonline.com/<tenant-id>/v2.0
VITE_REACT_APP_CLIENT_ID=<client-id>
VITE_REACT_APP_REDIRECT_URL=http://localhost:5173
VITE_REACT_APP_SCOPE=api://<client-id>/user_impersonation
```

- Prefisso **sempre** `VITE_REACT_APP_`
- Mai committare valori reali — usare `.env.example` con placeholder
- Accesso via `import.meta.env.VITE_REACT_APP_*`

---

## Scripts package.json

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\"",
  "generate:api": "swagger-typescript-api generate -p http://localhost:3100/swagger/doc.json -o src/generated/api --modular --no-client --extract-enums && node scripts/split-types.mjs",
  "prepare": "husky"
}
```

---

## Generazione tipi da Swagger

I tipi DTO vengono auto-generati dal backend Swagger e **non vanno modificati manualmente**.

```bash
pnpm generate:api
```

Flusso:
1. `swagger-typescript-api` genera un singolo file da `swagger/doc.json`
2. `scripts/split-types.mjs` splitta il file in moduli separati dentro `src/types/dto/`
3. `src/types/dto/index.ts` re-esporta tutto centralmente

I file generati in `src/generated/api/` e `src/types/dto/` hanno header `/* DO NOT MODIFY MANUALLY */`.

Per tipi custom (non generati): creare file in `src/types/` con suffisso `.types.ts`.

---

## Pattern architetturali

### 1. Hook con return `{ data, actions, ui }`

Ogni hook di pagina/dialog ritorna un oggetto con 3 sezioni:

```typescript
export default function useCreateUserDialog({ onOpenChange, refetch }: Props) {
  // --- State ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data fetching ---
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  // --- Mutations ---
  const { mutate } = useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      toast.success('Utente creato');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
    onError: () => toast.error('Errore'),
    onSettled: () => { form.reset(); setIsSubmitting(false); },
  });

  function onSubmit(data: z.infer<typeof createUserSchema>) {
    mutate(data);
  }

  // --- Return strutturato ---
  return {
    data: {
      form,               // istanza react-hook-form
    },
    actions: {
      onSubmit,           // handler submit
      tryAutofillEmail,   // logica di dominio
    },
    ui: {
      isSubmitting,       // stato visuale
    },
  };
}
```

**Utilizzo nel componente:**
```tsx
const { data, actions, ui } = useCreateUserDialog({ onOpenChange, refetch });

<form onSubmit={data.form.handleSubmit(actions.onSubmit)}>
  <Controller name="firstName" control={data.form.control} render={...} />
  <Button disabled={ui.isSubmitting}>Salva</Button>
</form>
```

### 2. Service layer

Ogni service esporta funzioni pure. Nessuno stato, nessun hook.

```typescript
// src/services/users/user.service.ts
import axiosInstance from '@/services/api/api.service';
import { buildQueryParams } from '@/lib/apiQueryBuilder';
import type { ListUsersResponse, CreateUserRequest, UserResponse } from '@/types/dto';

interface FetchUsersParams {
  filters?: ExtendedColumnFiltersState;
  sorting?: SortingState;
  pagination?: { pageIndex: number; pageSize: number };
}

export const fetchUsers = async (params?: FetchUsersParams): Promise<ListUsersResponse> => {
  const queryString = buildQueryParams({ ...params });
  const response = await axiosInstance.get<ListUsersResponse>(`/users${queryString}`);
  return response.data;
};

export const fetchUserById = async (id: string): Promise<UserResponse> => {
  const response = await axiosInstance.get<UserResponse>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserRequest): Promise<UserResponse> => {
  const response = await axiosInstance.post<UserResponse>('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<CreateUserRequest>): Promise<UserResponse> => {
  const response = await axiosInstance.patch<UserResponse>(`/users/${id}`, data);
  return response.data;
};
```

### 3. React Query — pattern standard

```typescript
// Query
const { data: users, isLoading } = useQuery({
  queryKey: ['users', filters, sorting, pagination],
  queryFn: () => fetchUsers({ filters, sorting, pagination }),
  select: (res) => res.data ?? [],
});

// Mutation con invalidazione
const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteUser(id),
  onSuccess: () => {
    toast.success('Utente eliminato');
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
  onError: () => toast.error('Errore'),
});
```

**Configurazione QueryClient in App.tsx:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});
```

### 4. Zod schemas

```typescript
// src/schemas/users.schemas.ts
import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.email('Email non valida'),
    firstName: z.string().min(1, 'Nome obbligatorio'),
    lastName: z.string().min(1, 'Cognome obbligatorio'),
    role: z.enum(['ADMIN', 'HR', 'USER']),
    siteId: z.string().optional(),
  })
  .refine((data) => data.role !== 'USER' || !!data.siteId, {
    message: 'Sede obbligatoria per il ruolo USER',
    path: ['siteId'],
  });
```

### 5. Combobox (NON Select)

Usa **sempre** `Combobox` da `@/components/ui/combobox`, mai `Select`. Il Combobox ha ricerca integrata.

```tsx
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput,
  ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
} from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';

type Option = { value: string; label: string };

const OPTIONS: Option[] = [
  { value: 'a', label: 'Opzione A' },
  { value: 'b', label: 'Opzione B' },
];

// Nel componente:
const selectedOption = useMemo(() => OPTIONS.find((o) => o.value === value), [value]);

<Combobox<Option>
  items={OPTIONS}
  value={selectedOption}
  onValueChange={(item) => setValue(item?.value ?? '')}
  itemToStringLabel={(item) => item.label}
  itemToStringValue={(item) => item.value}
>
  <ComboboxTrigger
    render={
      <Button variant="outline" className="w-full justify-between font-normal">
        <ComboboxValue placeholder="Seleziona..." />
      </Button>
    }
  />
  <ComboboxContent>
    <ComboboxInput showTrigger={false} placeholder="Cerca..." />
    <ComboboxEmpty>Nessun risultato</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item.value} value={item}>
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

**Con oggetti complessi (es. SiteResponse):**
```tsx
const selectedSite = useMemo(() => sites.find((s) => s.id === siteId), [sites, siteId]);

<Combobox<SiteResponse>
  items={sites}
  value={selectedSite}
  onValueChange={(item) => setSiteId(item?.id ?? '')}
  itemToStringLabel={(item) => item.name ?? ''}
  itemToStringValue={(item) => item.name ?? ''}
>
  ...
</Combobox>
```

### 6. Form con Controller + Combobox

```tsx
<Controller
  name="role"
  control={form.control}
  render={({ field, fieldState }) => {
    const options: Option[] = roles.map((r) => ({ value: r, label: r }));
    const selected = options.find((o) => o.value === field.value);
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel>Ruolo</FieldLabel>
        <Combobox<Option>
          items={options}
          value={selected}
          onValueChange={(item) => field.onChange(item?.value ?? '')}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.value}
        >
          <ComboboxTrigger
            render={
              <Button variant="outline" className="w-full justify-between font-normal">
                <ComboboxValue placeholder="Seleziona..." />
              </Button>
            }
          />
          <ComboboxContent>
            <ComboboxInput showTrigger={false} placeholder="Cerca..." />
            <ComboboxEmpty>Nessun risultato</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    );
  }}
/>
```

### 7. App.tsx — composizione Providers

L'ordine dei provider è fisso:

```tsx
// src/App.tsx
import { AuthProvider as OidcProvider } from 'react-oidc-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/components/layout/AppRoutes';
import { oidcConfig } from '@/config/auth.config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

export default function App() {
  return (
    <OidcProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </OidcProvider>
  );
}
```

### 8. Autenticazione (OIDC + Azure AD)

**Config (`src/config/auth.config.ts`):**
```typescript
export const oidcConfig = {
  authority: import.meta.env.VITE_REACT_APP_AUTHORITY,
  client_id: import.meta.env.VITE_REACT_APP_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REACT_APP_REDIRECT_URL,
  response_type: 'code',
  scope: import.meta.env.VITE_REACT_APP_SCOPE,
  automaticSilentRenew: true,
  silent_redirect_uri: `${import.meta.env.VITE_REACT_APP_REDIRECT_URL}/silent-refresh.html`,
  onSigninCallback: () => window.history.replaceState({}, '', window.location.pathname),
};
```

**AuthContext (`src/context/AuthContext.tsx`):**
- Wrappa `react-oidc-context`
- Al login OIDC, chiama `GET /me` per ottenere il profilo utente dal backend
- Salva `accessToken` in `localStorage` (per gli interceptor Axios)
- Ascolta eventi token (`addAccessTokenExpiring`, `addAccessTokenExpired`, `addUserLoaded`)
- Aggiorna il token in localStorage quando viene refreshato
- Espone: `user`, `isAuthenticated`, `isLoading`, `error`, `login()`, `logout()`, `refreshUser()`

**Token refresh (`src/services/api/token-refresh.ts`):**
- Interceptor response: se 401 → tenta silent refresh via `userManager.signinSilent()`
- Flag `_retry` per evitare loop infiniti
- Se il refresh fallisce, non redirige (AuthContext mostra la schermata di errore)

**Layout (`src/components/layout/Layout.tsx`):**
- Mostra skeleton durante il caricamento auth
- Se 401 su `/me` → schermata errore
- Se non autenticato → redirect a `/login`

### 9. DataTable — pattern standard

Le tabelle dati sono il componente più ricorrente. Pattern fisso:

**a) Definizione colonne (hook):**
```typescript
// src/pages/UsersPage/hooks/useUserColumns.tsx
export default function useUserColumns() {
  const columns = useMemo<CustomColumnDef<UserResponse, unknown>[]>(() => [
    {
      accessorKey: 'firstName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
      cell: ({ row }) => row.getValue('firstName'),
      meta: { label: 'Nome' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stato" />,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.getValue('status')]}>
          {STATUS_LABELS[row.getValue('status')]}
        </Badge>
      ),
      meta: { label: 'Stato' },
    },
  ], []);

  return columns;
}
```

**b) Hook dati con fetch paginato:**
```typescript
// src/pages/UsersPage/hooks/useUsersData.ts
export default function useUsersData() {
  const { filters, sorting, pagination, setFilters, setSorting, setPagination } = useURLState();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters, sorting, pagination],
    queryFn: () => fetchUsers({ filters, sorting, pagination }),
    placeholderData: (prev) => prev,
  });

  return {
    data: { items: data?.data ?? [], total: data?.total ?? 0 },
    actions: { refetch, setFilters, setSorting, setPagination },
    ui: { isLoading, error, filters, sorting, pagination },
  };
}
```

**c) Componente pagina:**
```tsx
// Collegamento: colonne + dati + CustomTable
const columns = useUserColumns();
const { data, actions, ui } = useUsersData();

<CustomTable columns={columns} data={data.items} total={data.total} ... />
```

### 10. Polling per stati transitori

Quando un'entità ha stati transitori (es. `processing`, `reprocessing`), usa `refetchInterval` condizionale:

```typescript
const { data } = useQuery({
  queryKey: ['entity', id],
  queryFn: () => fetchEntity(id),
  refetchInterval: (query) => {
    const status = query.state.data?.status;
    if (status && ['processing', 'reprocessing'].includes(status)) return 5000;
    return false;
  },
});
```

Il polling si attiva solo quando lo stato lo richiede e si ferma automaticamente quando cambia.

### 11. DatePicker

Usa **react-day-picker** dentro un `Popover` (da shadcn/ui). Il componente `Calendar` in `src/components/ui/calendar.tsx` è il wrapper.

```tsx
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}>
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, 'dd/MM/yyyy', { locale: it }) : 'Seleziona data'}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} locale={it} />
  </PopoverContent>
</Popover>
```

Per selezione range: `mode="range"` con tipo `DateRange`.

### 12. Permessi e routing

```typescript
// src/config/permission.config.ts
export const PAGE_PERMISSIONS: PagePermission[] = [
  { path: '/users', allowedRoles: [RoleEnum.ADMIN, RoleEnum.SUPERADMIN] },
  { path: '/vacation-requests', allowedRoles: [RoleEnum.USER] },
];

// src/components/layout/AppRoutes.tsx
<Route element={<PermissionGuard><Layout /></PermissionGuard>}>
  <Route path="/users" element={<UsersPage />} />
  <Route path="/users/:id" element={<UserDetailsPage />} />
</Route>
```

### 13. Axios con interceptors

```typescript
// src/services/api/api.service.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BE_URL,
  timeout: 15000,
});

// Request: aggiunge Bearer token
axiosInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: gestisce 401 con token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      return handleTokenRefresh(error, axiosInstance);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Convenzioni di codice

### Import order
1. Librerie esterne (react, tanstack, date-fns, lucide, ...)
2. `@/components/ui/*`
3. `@/components/custom/*`
4. `@/hooks/*`
5. `@/services/*`
6. `@/types/*`
7. `@/lib/*`, `@/utils/*`
8. Import relativi (`./`, `../`)

### TypeScript
- **strict: true** sempre
- Usa `import type { X }` per tipi puri
- Mai `any` — usa `unknown` e narrowing
- Definisci interfacce per props dei componenti
- Enum solo nei DTO generati; nel resto del codice usa `as const` objects

### Styling con Tailwind
- Usa `cn()` per classi condizionali:
  ```tsx
  <div className={cn('p-4 rounded-md', isActive && 'bg-primary/10', className)} />
  ```
- Mai inline styles
- Mobile-first: stili base = mobile, poi `sm:`, `md:`, `lg:`
- Colori dal tema CSS variables, mai hardcoded hex

### Componenti
- **Un componente per file** (eccezione: sotto-componenti piccoli privati)
- **Props destructurate** nel parametro:
  ```tsx
  export function UserCard({ user, onEdit }: UserCardProps) { ... }
  ```
- **Export named** per componenti di pagina, **export default** solo per pagine usate con lazy loading
- **Niente logica di business nel JSX** — estrai in hook o handler

### React Query keys
- Array gerarchici: `['users']`, `['users', userId]`, `['users', { filters, sorting }]`
- Invalida il parent per invalidare tutti i figli:
  ```typescript
  queryClient.invalidateQueries({ queryKey: ['users'] }); // invalida tutto
  ```

### Toast
```typescript
import { toast } from 'sonner';

toast.success('Operazione completata');
toast.error('Errore durante il salvataggio');
toast.warning('Attenzione: ...');
```

### Logger
```typescript
import { logger } from '@/lib/logger';

const log = logger.create('UserService');
log.info('Utente creato', { userId: '123' });
log.error('Errore fetch utenti', error);
```

---

## Setup progetto nuovo

### 1. Scaffold
```bash
pnpm create vite my-app --template react-ts
cd my-app
```

### 2. Dipendenze core
```bash
# Tailwind 4
pnpm add tailwindcss @tailwindcss/vite

# UI
pnpm add radix-ui @base-ui-components/react lucide-react class-variance-authority clsx tailwind-merge

# Routing
pnpm add react-router-dom

# State & Data
pnpm add @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table axios

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# Utils
pnpm add date-fns sonner

# Dev
pnpm add -D eslint @eslint/js typescript-eslint eslint-config-prettier prettier prettier-plugin-tailwindcss husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 3. Configurazione

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

**tsconfig.app.json (compilerOptions):**
```json
{
  "target": "ES2022",
  "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "jsx": "react-jsx",
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "moduleResolution": "bundler",
  "paths": { "@/*": ["./src/*"] }
}
```

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 4. shadcn/ui
Inizializza con `npx shadcn@latest init` e aggiungi i componenti necessari.
I componenti finiscono in `src/components/ui/`.

### 5. Primo file: `src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Error handling

### API errors nei componenti

Le query React Query espongono `error` nel return `ui`. Mostra un messaggio solo se rilevante:

```tsx
{ui.errorDetail && (
  <p className="text-sm text-red-600">Errore nel caricamento dei dati</p>
)}
```

Le mutation usano `onError` con toast:
```typescript
onError: (error: Error) => {
  toast.error('Errore durante il salvataggio', {
    description: error.message || 'Si è verificato un errore',
  });
},
```

### Status di errore nelle entità

Se un'entità ha uno stato `error` con campo `errorMessage`, mostrarlo nel dettaglio:
```tsx
{status === 'error' && entity.errorMessage && (
  <p className="mt-2 text-sm text-red-600">{entity.errorMessage}</p>
)}
```

---

## Formato commit message

Usa [Conventional Commits](https://www.conventionalcommits.org/). Commitlint è configurato con `@commitlint/config-conventional`.

```
<type>(<scope>): <descrizione breve>

[corpo opzionale]
```

Tipi principali:
- `feat` — nuova funzionalità
- `fix` — bug fix
- `refactor` — refactoring senza cambi funzionali
- `chore` — manutenzione (deps, config, CI)
- `docs` — documentazione
- `style` — formattazione (no logic changes)
- `test` — aggiunta o modifica test

Esempi:
```
feat(users): aggiunta dialog creazione utente
fix(auth): gestione token expired durante silent refresh
chore(deps): aggiornamento react-query a v5.90
```

---

## Anti-pattern da evitare

- **Mai `Select`** — usa sempre `Combobox`
- **Mai stato globale per dati server** — usa React Query
- **Mai `any`** — usa `unknown` + narrowing
- **Mai logica nel JSX** — estrai in variabili, handler o hook
- **Mai CSS inline** — usa Tailwind
- **Mai `useEffect` per derivare stato** — usa `useMemo` o calcolo diretto
- **Mai prop drilling oltre 2 livelli** — crea un hook o context
- **Mai import relativi lunghi** (`../../../`) — usa `@/`
- **Mai file con piu' di ~300 righe** — split in componenti/hook
- **Mai mix di lingue nei messaggi utente** — scegli una lingua e mantienila
- **Mai mock nei test di integrazione** — testa contro API reali o stub server
- **Mai cancellare senza conferma** — ogni azione distruttiva (elimina, rimuovi) deve mostrare un dialog di conferma prima di procedere
