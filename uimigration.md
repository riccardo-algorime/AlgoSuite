# UI Migration Roadmap

A structured, phase-by-phase checklist to migrate from Chakra UI → Shadcn UI.

---

## Phase 0: Preparation & Setup
- [ ] Create and switch to feature branch `feat/migrate-to-shadcn`
- [ ] Define PR strategy: small, incremental PRs into that branch
- [ ] Announce scope & UI-freeze period to team
- [ ] Install Tailwind CSS + peer deps:
  - `npm install tailwindcss postcss autoprefixer`
  - `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js` (content paths, theme.extend placeholder)
- [ ] Add Tailwind directives to `src/index.css`/`globals.css` (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- [ ] Install Shadcn UI scaffold:
  - `npx shadcn-ui@latest init`
- [ ] Install theme provider lib: `npm install next-themes`
- [ ] Audit `src/theme.ts`: list all colors, fonts, spacing, radii to migrate

## Phase 1: Global Setup & Core Providers
- [ ] Remove `<ChakraProvider>` & `<ColorModeProvider>` from `App.tsx`
- [ ] Wrap `<App>` in `<ThemeProvider attribute="class" …>`
- [ ] Translate semantic tokens into `tailwind.config.js → theme.extend`
- [ ] Define CSS variables for light/dark in `globals.css`
- [ ] Use `@layer base` to apply body styles (`@apply bg-background text-foreground`)
- [ ] Swap Chakra Toaster → Sonner:
  - `npm install sonner`
  - Add `<Toaster />` in layout
  - Replace `toaster.error` calls → `toast.error`

## Phase 2: UI–Primitive Wrappers (`src/components/ui/`)
- [ ] Separator → `npx shadcn-ui add separator` + replace `<Box as="hr">` → `<Separator>`
- [ ] Form → `npx shadcn-ui add form` + migrate `FormControl`, `FormLabel`, `FormErrorMessage`
- [ ] Link/NavLink → replace Chakra `<Link>` → `react-router-dom` `<Link>` + Tailwind
- [ ] Stack wrappers:
  - `HStack` → `<div className="flex flex-row items-center gap-…">`
  - `VStack` → `<div className="flex flex-col gap-…">`

## Phase 3: Core Reusable Components
- [ ] Card → `npx shadcn-ui add card` + map style props → Tailwind
- [ ] ThemeToggle → `npx shadcn-ui add button dropdown-menu` + hook into `useTheme`
- [ ] Swap Chakra icons → `lucide-react` if desired

## Phase 4: App–Specific Components
- [ ] `AttackSurfaceCard` & `ProjectCard`: replace `<Box>`, `<Flex>`, `<Badge>`, `<Button>` → Tailwind/Shadcn
- [ ] `ContactForm`: swap Chakra `Alert`, `Input`, `Textarea` → Shadcn
- [ ] `FeatureSection`: `SimpleGrid` → `<div className="grid …">`
- [ ] `Layout.tsx`: migrate `Container`, `Flex`, `Heading`, `NavLink`

## Phase 5: Pages (`src/pages/`)
- [ ] Migrate each page (Home, About, Dashboard, AttackSurface, Project, Login, Register)
  - Replace Chakra components → Tailwind/Shadcn
  - Swap `<Spinner>` → SVG spinner (`animate-spin`)
  - Replace `<Code>` → `<pre><code className="…">`

## Phase 6: Hooks & Utilities
- [ ] Remove `useColorMode` hook & imports
- [ ] Replace `useColorModeValue(a, b)` → `theme === 'dark' ? b : a`
- [ ] Update `getSurfaceTypeColorScheme` → Tailwind class names or CSS vars

## Phase 7: Tests
- [ ] Update `test-utils.tsx`: remove Chakra providers, wrap in `ThemeProvider`
- [ ] Adjust selectors: avoid Chakra-specific roles/classes; use semantic queries
- [ ] Rewrite style assertions to check for Tailwind or CSS vars
- [ ] Mock Sonner toaster instead of Chakra toaster
- [ ] Regenerate or update snapshots

## Phase 8: Cleanup & Finalize
- [ ] Uninstall Chakra deps: `npm uninstall @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion`
- [ ] Delete `src/theme.ts` & old wrapper files
- [ ] Run linter/formatter, fix issues
- [ ] Run full test suite, fix failures
- [ ] Manual QA: verify light/dark, responsiveness
- [ ] Code review & merge feature branch
