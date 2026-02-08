---
name: erp-crud-generator
description: Generate a complete CRUD module (types, API service, list/form/detail components) for a new entity in QA-QLKP PlastiCycle app.
---

# CRUD Generator Skill

## When to use
When creating a new entity/module in PlastiCycle (e.g., production batches, quality checks, vehicles).

## Workflow checklist
```
- [ ] Step 1: Define entity type in types.ts
- [ ] Step 2: Add API functions in lib/api.ts
- [ ] Step 3: Create component page
- [ ] Step 4: Add route in App.tsx
- [ ] Step 5: Add sidebar navigation in components/Sidebar.tsx
- [ ] Step 6: Create Supabase migration
```

## Step 1: Type definition (types.ts)
Follow existing enum + interface pattern:
```typescript
export enum <Entity>Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface <Entity> {
  id: string;
  // entity fields
  created_at?: string;
}
```

## Step 2: API service (lib/api.ts)
Add functions following existing pattern in `lib/api.ts`:
```typescript
export async function get<Entities>(): Promise<Entity[]> {
  const { data, error } = await supabase.from('<entities>').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function create<Entity>(entity: Omit<Entity, 'id'>): Promise<Entity> {
  const { data, error } = await supabase.from('<entities>').insert(entity).select().single();
  if (error) throw error;
  return data;
}

export async function update<Entity>(id: string, entity: Partial<Entity>): Promise<Entity> {
  const { data, error } = await supabase.from('<entities>').update(entity).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function delete<Entity>(id: string): Promise<void> {
  const { error } = await supabase.from('<entities>').delete().eq('id', id);
  if (error) throw error;
}
```

## Step 3: Component page (components/<Entity>.tsx)
Follow existing component patterns (e.g., `Partners.tsx`, `Inventory.tsx`):
- Single-file component with list view + inline form modal
- State management with `useState` + `useEffect`
- Search/filter functionality
- Add/Edit/Delete with confirmation
- Inline icons from `lucide-react`
- CSS inline or in the same file using CSS-in-JS style
- Use `formatCurrency()` from `constants.ts` for money values

## Step 4: Routes (App.tsx)
Add page to the existing routing structure in `App.tsx`.

## Step 5: Sidebar (components/Sidebar.tsx)
Add navigation item with appropriate Lucide icon.

## Domain context
PlastiCycle manages:
- **Materials**: Nhựa phế (scrap) and Bột nhựa (powder) with stock in kg
- **Transactions**: Import (nhập kho), Export (xuất kho), Production (sản xuất), Expense (chi phí)
- **Partners**: Suppliers (vựa nhựa phế) and Customers (nhà máy)
- **Staff/Users**: Authentication with role-based access
