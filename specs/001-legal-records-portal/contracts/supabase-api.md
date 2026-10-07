# Contract: Supabase Client Operations & Interface Definitions

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-06

This contract documents the interface contracts between the React application and the Supabase BaaS layer, ensuring strict adherence to Core Principle I (RLS) and Core Principle II (Direct BaaS consumption).

## 1. Authentication Operations Contract

### `signUp(email, password)`
- **Input**:
  ```json
  {
    "email": "abogado@theroseholding.com",
    "password": "SecurePassword123!"
  }
  ```
- **Supabase Call**: `supabase.auth.signUp({ email, password })`
- **Output (Success)**:
  ```json
  {
    "user": {
      "id": "e3a89344-913a-4be2-a5e2-e1d1f053229b",
      "email": "abogado@theroseholding.com"
    },
    "session": { "access_token": "..." },
    "error": null
  }
  ```
- **Output (Failure & Error Translation)**:
  - If user exists: Returns friendly error `"El correo ya se encuentra registrado."`
  - If weak password: Returns `"La contraseña debe tener al menos 6 caracteres."`

### `signInWithPassword(email, password)`
- **Input**: `{ email, password }`
- **Supabase Call**: `supabase.auth.signInWithPassword({ email, password })`
- **Output (Failure & Error Translation)**:
  - Invalid credentials: `"Credenciales incorrectas. Verifique su correo y contraseña."`

### `signOut()`
- **Supabase Call**: `supabase.auth.signOut()`
- **Result**: Clears local session token, redirects to `/`.

---

## 2. Legal Records Data Contract

### `fetchRecords(userId)`
- **Supabase Query**:
  ```javascript
  const { data, error } = await supabase
    .from('legal_records')
    .select('*')
    .order('created_at', { ascending: false });
  ```
- **Output**: Array of `LegalRecord` objects owned by the authenticated user. Due to RLS, Supabase automatically filters to `auth.uid() = user_id`.

### `createRecord(newRecord)`
- **Input**:
  ```json
  {
    "case_title": "Fusión Societaria Inversiones Andina",
    "client_name": "Corporación Andina S.A.",
    "category": "Corporativo",
    "notes": "Revisión de acuerdos estatutarios y cláusulas de confidencialidad."
  }
  ```
- **Validation**:
  - `case_title`: String, trimmed length > 0.
  - `client_name`: String, trimmed length > 0.
  - `category`: String, must be strictly one of `['Corporativo', 'Litigio', 'Laboral']`.
- **Supabase Mutation**:
  ```javascript
  const { data, error } = await supabase
    .from('legal_records')
    .insert([
      {
        case_title: record.case_title.trim(),
        client_name: record.client_name.trim(),
        category: record.category,
        notes: record.notes?.trim() || '',
        user_id: user.id
      }
    ])
    .select()
    .single();
  ```
- **Output (Success)**: Newly created `LegalRecord` object with `id` and `created_at`.

### `deleteRecord(recordId)`
- **Input**: `recordId: string` (UUID)
- **Supabase Mutation**:
  ```javascript
  const { error } = await supabase
    .from('legal_records')
    .delete()
    .eq('id', recordId);
  ```
- **Security Check**: RLS policy ensures that if the record belongs to another user, 0 rows are deleted and no sensitive information is leaked.

---

## 3. Realtime Channel Subscription Contract

- **Channel Name**: `public:legal_records`
- **Setup**:
  ```javascript
  const channel = supabase
    .channel('legal_records_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'legal_records'
      },
      (payload) => {
        // payload.eventType: 'INSERT' | 'DELETE' | 'UPDATE'
        // Dispatches to local state update handler
      }
    )
    .subscribe();
  ```
- **Cleanup**: `supabase.removeChannel(channel)` invoked upon component unmount.
