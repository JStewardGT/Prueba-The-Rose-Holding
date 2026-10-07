# Contract: Supabase Client Operations & Interface Definitions

**Feature**: `001-legal-records-portal` | **Date**: 2026-10-07

## 1. Authentication Operations Contract

- `signUp(email, password)`: Creates account with auto-confirm and immediate session fallback.
- `signInWithPassword(email, password)`: Logs in returning user profile.
- `signOut()`: Terminates session and invalidates tokens.

---

## 2. Legal Records Data Contract

- `fetchRecords()`: `supabase.from('legal_records').select('*').order('created_at', { ascending: false })`
- `createRecord(newRecord)`: Inserts record with `user_id = user.id`.
- `deleteRecord(recordId)`: Deletes record owned by user.

---

## 3. Case Updates (Novedades Procesales) Contract (New)

### `fetchCaseUpdates(caseId)`
- **Supabase Query**:
  ```javascript
  const { data, error } = await supabase
    .from('case_updates')
    .select('*')
    .eq('case_id', caseId)
    .order('event_date', { ascending: false })
    .order('created_at', { ascending: false });
  ```
- **Output**: Array of `CaseUpdate` objects associated with the given case and current user.

### `createCaseUpdate(newUpdate)`
- **Input**:
  ```json
  {
    "case_id": "f8c84106-c192-4b5c-9151-bd9d40053211",
    "title": "Notificación de Admisión de Demanda",
    "event_date": "2026-10-05",
    "description": "Se recibe auto admisorio de la demanda por parte del juzgado civil.",
    "response_days": 3
  }
  ```
- **Validation**:
  - `case_id`: UUID valid.
  - `title`: Non-empty trimmed string.
  - `event_date`: Valid date string (`YYYY-MM-DD`), must be `<= CURRENT_DATE` (cannot be a future date).
  - `description`: Non-empty trimmed string.
  - `response_days`: Optional positive integer strictly `> 0` (or `null`/omitted). Keystrokes strictly filtered to digits `0-9` (blocking `-`, `+`, `e`, `E`, `.`).
- **Validation Errors (Spanish UI feedback)**:
  - Empty title: *"Por favor ingrese el título o hito procesal."*
  - Empty or future date: *"La fecha del suceso no puede ser futura."*
  - Non-positive response days: *"Los días para responder deben ser mayores a 0 días."*
  - Empty description: *"Por favor describa la novedad procesal."*
- **Supabase Mutation**:
  ```javascript
  const { data, error } = await supabase
    .from('case_updates')
    .insert([
      {
        case_id: update.case_id,
        user_id: user.id,
        title: update.title.trim(),
        event_date: update.event_date,
        description: update.description.trim(),
        response_days: update.response_days ? parseInt(update.response_days, 10) : null
      }
    ])
    .select()
    .single();
  ```

### `deleteCaseUpdate(updateId)`
- **Input**: `updateId: string` (UUID)
- **Supabase Mutation**:
  ```javascript
  const { error } = await supabase
    .from('case_updates')
    .delete()
    .eq('id', updateId);
  ```

---

## 4. Realtime Channel Subscription Contract

- Channel for records: `supabase.channel('public:legal_records')`
- Channel for updates: `supabase.channel('public:case_updates')`
  - Subscribes to events on table `case_updates` with filter on `case_id`.
