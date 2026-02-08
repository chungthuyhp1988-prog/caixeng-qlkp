---
name: dark-mode-polisher
description: Audit and fix dark mode issues in QA-QLKP PlastiCycle. Check contrast, color consistency, and ensure all components work in dark theme.
---

# Dark Mode Polisher Skill

## When to use
- After adding new components
- When contrast/readability issues are reported
- During UI review

## Audit workflow
```
- [ ] Step 1: Check if dark mode is implemented
- [ ] Step 2: Scan for hardcoded colors in components
- [ ] Step 3: Verify chart colors in dark mode
- [ ] Step 4: Fix issues
- [ ] Step 5: Visual verification via browser
```

## Color variable system
If not yet implemented, create a CSS variable system:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --primary: #6366f1;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-card: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border: #374151;
  --primary: #818cf8;
  --success: #4ade80;
  --warning: #fbbf24;
  --danger: #f87171;
}
```

## Common issues to detect

### Hardcoded colors
```tsx
// ❌ Bad
style={{ color: '#333', background: 'white' }}

// ✅ Good
style={{ color: 'var(--text-primary)', background: 'var(--bg-card)' }}
```

### Recharts
```tsx
// ❌ Bad
<CartesianGrid stroke="#eee" />

// ✅ Good
<CartesianGrid stroke="var(--border)" />
<Tooltip contentStyle={{
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)'
}} />
```

### Form inputs
```css
input, select, textarea {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border);
}
```

## Detection grep patterns
```
color: ['"]#[0-9a-fA-F]{3,8}
background.*#[0-9a-fA-F]
border.*#[0-9a-fA-F]
style=\{.*#[0-9a-fA-F]
fill: ['"]#
stroke: ['"]#
```

## Theme toggle
```tsx
const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}, [theme]);

<button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
</button>
```
