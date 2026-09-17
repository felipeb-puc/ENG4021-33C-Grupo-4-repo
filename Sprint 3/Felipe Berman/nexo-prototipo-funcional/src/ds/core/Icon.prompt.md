Tints a Lucide glyph with `currentColor` — the only icon primitive in this system; never hand-draw SVG paths.

```jsx
<Icon name="arrow-right" size={18} />
<span style={{ color: "var(--green-600)" }}><Icon name="briefcase" size={24} /></span>
```

Icons inherit color from the parent, so place them inside buttons/links and let the button's color cascade. Loaded from the lucide-static CDN (see readme ICONOGRAPHY).
