// Generates src/styles/tokens.css from src/design-system/tokens.json.
// Run: npm run tokens  (also runs automatically before storybook / build)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'src/design-system/tokens.json'), 'utf8'));

const themes = tokens.color.themes.map((t) => t.id);
const [first] = themes;
const valueFor = (value, theme) => {
  if (typeof value === 'string') return theme === first ? value : null;
  return value[theme] ?? null;
};
const resolveAlias = (v) => v.replace(/^\{(.+)\}$/, 'var(--$1)');

const block = (selector, lines) => (lines.length ? `${selector} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n` : '');

let css = `/* 流向 Flow — generated from src/design-system/tokens.json. Do not edit by hand. */\n\n`;

for (const theme of themes) {
  const lines = [];
  for (const family of ['color', 'shadow']) {
    for (const t of tokens[family]?.tokens ?? []) {
      const v = valueFor(t.value, theme);
      if (v != null) lines.push(`--${t.name}: ${resolveAlias(v)};`);
    }
  }
  const selector = theme === first ? `:root,\n[data-theme="${theme}"]` : `[data-theme="${theme}"]`;
  css += block(selector, lines) + '\n';
}

const scalar = [];
for (const [family, def] of Object.entries(tokens)) {
  if (['color', 'shadow', 'type', 'name', 'version'].includes(family)) continue;
  for (const t of def.tokens ?? []) scalar.push(`--${t.name}: ${t.value};`);
}
for (const [key, stack] of Object.entries(tokens.type.families)) scalar.push(`--font-${key}: ${stack};`);
css += block(':root', scalar) + '\n';

for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const family = s.family ?? group.family;
    const lines = [
      `font-family: var(--font-${family});`,
      `font-size: ${s.fontSize};`,
      `line-height: ${s.lineHeight};`,
      `font-weight: ${s.fontWeight};`,
    ];
    if (s.letterSpacing) lines.push(`letter-spacing: ${s.letterSpacing};`);
    if (family === 'num') lines.push('font-feature-settings: "tnum" 1, "lnum" 1;', 'font-variant-numeric: tabular-nums lining-nums;');
    css += block(`.text-${s.name}`, lines) + '\n';
  }
}

mkdirSync(resolve(root, 'src/styles'), { recursive: true });
writeFileSync(resolve(root, 'src/styles/tokens.css'), css);
console.log('tokens.css written');
