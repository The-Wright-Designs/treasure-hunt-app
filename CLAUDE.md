@AGENTS.md

Please always refer to the below styles guideline when styling my components. When it comes to color, typography and breakpoints, I don't make use of the default Tailwind classes.

# Project Styling Guidelines

### Custom Tailwind Configuration

The project uses custom Tailwind classes defined as CSS variables in `_styles/globals.css`. Always reference and use these custom styles:

#### Custom Colors

Use these custom color classes instead of default Tailwind colors:

- `text-black`, `bg-black`, `border-black` → `#1D1D1D`
- `text-white`, `bg-white`, `border-white` → `#FFFFFF`
- `text-primary`, `bg-primary`, `border-primary` → `#E37434`
- `text-secondary`, `bg-secondary`, `border-secondary` → `#4B9DA9`

#### Custom Typography Classes

- `text-paragraph` → `0.875rem`, `font-weight: 400`, `line-height: 1.3` (use for body text, inputs, textareas, spans)
- `text-heading` → `2rem`, `font-weight: 600`, `line-height: 1` (use for h1, h2)
- `text-subheading` → `0.875rem`, `font-weight: 700`, `line-height: 1.3` (use for h3–h6)

#### Custom Font

The project uses "Miranda Sans" as the primary font (with Arial and sans-serif as fallbacks).

#### Custom Breakpoints

Use these responsive prefixes instead of default Tailwind breakpoints:

- `phone:` → `@media (min-width: 425px)`
- `tablet:` → `@media (min-width: 800px)`
- `desktop:` → `@media (min-width: 1280px)`

**Example usage:** `phone:mt-2 tablet:mt-4 desktop:mt-6`
