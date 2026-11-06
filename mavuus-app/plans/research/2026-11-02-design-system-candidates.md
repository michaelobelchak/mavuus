# Design system candidates for Mavuus (research, 2026-11-02)

Status: research only. Stats pulled from the GitHub API and each project's llms.txt on 2026-11-02. Not verified: runtime behavior with Tailwind v4 + React 19 + Vite 7 (nothing was installed), MCP server quality (docs read, not run), and anything marked "unconfirmed".

## What we need

One system for the dashboard (sidebar, KPI cards with trend badges, bar/line charts, tables, filters) and the public site, on React 19, Vite 7, Tailwind v4, react-router, lucide-react. Agent-ready means an agent can read the rules and install components without guessing.

## Comparison

| System | License | Stars / last push | Tailwind v4 | Tokens | Dashboard coverage | Charts | A11y base | Agent evidence |
|---|---|---|---|---|---|---|---|---|
| shadcn/ui | MIT | 127k / 11-02 | Yes, [documented](https://ui.shadcn.com/docs/tailwind-v4) | CSS vars, semantic (`--primary`, `--card`), light/dark, theme presets | Full set plus dashboard blocks, sidebar, data table, date picker | Recharts wrapper, [Chart](https://ui.shadcn.com/docs/components/chart) | Radix or Base UI (user picks) | [llms.txt](https://ui.shadcn.com/llms.txt), [MCP](https://ui.shadcn.com/docs/mcp), [Skills](https://ui.shadcn.com/docs/skills), registry + CLI |
| Base UI | MIT | 11k / 11-02 | Yes (docs written for v4) | None (unstyled) | Primitives only | None | Strong, 1.x stable (v1.9.0) | [llms.txt](https://base-ui.com/llms.txt), AGENTS.md in repo |
| Radix Primitives | MIT | 19k / 10-14 | Agnostic | None | Primitives only | None | Strong | No llms.txt found (404) |
| Radix Themes | MIT | 8.8k / 04-11 | Own CSS, not Tailwind-native | Radix color scales, theme props | Good, no sidebar or data table | None | Strong | No llms.txt found; slow cadence (v3.3.0, Jan 2026) |
| Tremor | Apache-2.0 | 3.7k / 2025-10 | Unconfirmed | Tailwind classes | KPI cards, trackers, tables | Recharts-based, strong | Radix | No llms.txt (404), no agent files |
| HeroUI v3 | Apache-2.0 | 31k / 11-02 | Yes, built on v4 | Tailwind v4 theme vars, semantic | Broad; sidebar thin | No chart set seen | React Aria | [llms.txt](https://www.heroui.com/llms.txt), [MCP](https://heroui.com/docs/react/getting-started/mcp-server), AGENTS.md + CLAUDE.md |
| Park UI / Ark UI | MIT | Ark 5.5k, Park 2.4k / Ark 11-02, Park 04-10 | Park supports Tailwind or Panda | Panda semantic tokens | Park is thin, Ark is headless | Ark has no charts | Zag.js state machines | [Ark llms.txt](https://ark-ui.com/llms.txt); Park none |
| Mantine 9 | MIT | 32k / 11-02 | No, uses own PostCSS CSS | CSS vars, theme object, light/dark | Very broad, incl. dates, tables, spotlight | `@mantine/charts` (Area, Bar, Line, Bullet, ...) | Good | [llms.txt](https://mantine.dev/llms.txt) + llms-full, AGENTS.md + CLAUDE.md |
| Untitled UI React | Free tier open source, PRO $349 one-time | repo `untitleduico/react` (stats not pulled) | Yes, v4 | Semantic tokens (`text-primary`, `bg-secondary`) | Dashboards, tables, sidebars | Line, bar, pie, radar | React Aria | [llms.txt](https://www.untitledui.com/react/llms.txt), [MCP](https://www.untitledui.com/react/integrations/mcp), CLI. No redistribution of PRO source |
| Catalyst (Tailwind Plus) | Paid, not open source | n/a | Yes | Tailwind classes | App shells, tables | None | Headless UI | None found (404). Licensing blocks reuse in a shared repo |
| Origin UI / coss ui | Repo `NOASSERTION`; check before use | 10.8k / 10-31 | Yes | shadcn-style vars | Many components | None | Base UI | [llms.txt](https://coss.com/ui/llms.txt), AGENTS.md |
| Chakra UI v3 | MIT | 40.7k / 11-02 | No, Emotion-based | Semantic + recipe tokens | Broad | Charts documented ([llms-charts](https://chakra-ui.com/llms-charts.txt)) | Ark/Zag | [llms.txt](https://chakra-ui.com/llms.txt), CLAUDE.md |
| Primer | MIT | 3.9k / 11-02 | No | Mature token tiers | GitHub-flavored | None | Strong | No llms.txt (404) |
| Carbon (IBM) | Apache-2.0 | 9.6k / 11-02 | No (Sass) | Best-in-class tiers | Very broad | Carbon Charts | Strong | [llms.txt](https://carbondesignsystem.com/llms.txt), [Carbon MCP](https://www.carbondesignsystem.com/getting-started/carbon-mcp/overview), AGENTS.md |
| Atlassian DS | Mixed; mostly source-available | repo not found under that name | No | Strong tokens | Product-specific | None | Strong | [llms.txt](https://atlassian.design/llms.txt) |
| Fluent UI v9 | `NOASSERTION` (MIT-style) | 20k / 11-02 | No (Griffel) | Good | Broad | [Charts v9](https://storybooks.fluentui.dev/charts/llms.txt) | Strong | llms.txt, AGENTS.md + CLAUDE.md |
| Material UI | MIT | 99k / 11-02 | No (Emotion) | Theme object | Very broad, X data grid is paid at higher tiers | MUI X charts | Good | No llms.txt at `mui.com` (404) |
| React Aria / Spectrum | Apache-2.0 | 16k / 11-02 | Yes (RAC is style-agnostic) | None in RAC | Primitives, best date and color pickers | None | Best in class | [llms.txt](https://react-aria.adobe.com/llms.txt), MCP servers and Agent Skills ([Working with AI](https://react-aria.adobe.com/ai)) |
| Ant Design | MIT | 100k / 11-02 | No, CSS-in-JS | Design tokens, algorithm themes | Huge (admin-grade tables, forms) | Separate Ant Design Charts | Fair | [llms.txt](https://ant.design/llms.txt), [MCP](https://ant.design/docs/react/mcp.md), CLI, AGENTS.md |

Caveat on repo agent files: AGENTS.md and CLAUDE.md in a library repo mostly guide contributors. For consumers, llms.txt, an MCP server and an installable registry matter more.

## Top 3 for Mavuus

### 1. shadcn/ui (Base UI flavor), with its Chart component

Why it wins:
- Fits the stack exactly: Tailwind v4, Vite, React 19, any router. Code is copied into the repo, so we own it and can fold our `components/live` and `components/ui` into one set.
- Token model is semantic CSS variables with light/dark, so our brand maps cleanly.
- Best agent story of the group: llms.txt, an MCP server, Skills, and a registry/CLI. A custom registry lets us publish our own Mavuus components and rules for agents to install.
- Covers every dashboard need we listed: sidebar, data table, tabs, dialogs, toasts (Sonner), date picker, charts (Recharts), dashboard blocks.
- Base UI became the default in July 2026 and Radix remains supported ([source](https://hextaui.com/blog/shadcn-base-ui-vs-radix); secondary, so confirm on init).

Tradeoffs:
- It is a starting kit, not finished guidelines. We would write the usage rules ourselves (the FitnessApp principles fit here).
- Charts are a thin Recharts wrapper. KPI cards with trend badges need building (small job).
- We maintain copied code, so upstream fixes are manual.

### 2. Untitled UI React (free tier) as a reference and blocks source

Why: React Aria + Tailwind v4, semantic tokens, dashboards, tables, line/bar chart examples, CLI, MCP, llms.txt. Its look (SaaS dashboard with KPI cards) is closest to the Panze reference image.

Tradeoffs: the PRO tier is paid with no-redistribution terms, and the free tier is smaller. Use it for patterns and free components, not as the foundation.

### 3. HeroUI v3

Why: Tailwind v4 native, React Aria accessibility, theme variables, llms.txt, MCP, and AGENTS.md. Most complete "installed library" feel with less to maintain than shadcn.

Tradeoffs: runtime dependency, so brand changes go through its theme layer. No chart set seen, so we would still add Recharts. Smaller dashboard block library than shadcn.

Honorable mentions: Mantine 9 is the most complete for dashboards (charts, dates, tables) but fights Tailwind. React Aria Components is the best a11y layer if we ever want to go headless. Tremor is useful for KPI/tracker patterns, but its Tailwind v4 status is unconfirmed and its last push was October 2025. Catalyst is out on licensing.

## Fitting our brand token layer

Brand inputs: pink `#F26D92`, blue `#1F648D`, dark blue `#1C2232`, Fixel Text (public site) and Manrope (dashboard today).

Common shape for all three: keep our existing `@theme` tokens in `client/src/index.css` as the primitive tier, then map the library's semantic tier to them.

- **shadcn/ui:** set `--primary` to blue `#1F648D` (pink fails contrast for small text, per CLAUDE.md), `--accent` or a new `--brand-pink` for highlights, `--foreground` and `--sidebar` to dark blue `#1C2232`, `--ring` to navy. Define them under `:root` and `.dark`, expose via `@theme inline` so classes like `bg-primary` resolve. Set `--font-sans` to Fixel Text on the public layout and Manrope in the dashboard scope. Chart colors go in `--chart-1..5` (blue, pink, dark blue, then two tints).
- **Untitled UI:** its semantic classes (`text-primary`, `bg-secondary`, `border-secondary`) resolve from a `@theme` block. We would override the brand and gray scales with ours. Free components inherit automatically.
- **HeroUI v3:** override its CSS theme variables (primary, secondary, background, foreground) in `@layer theme` under our `@theme`. Fonts via its font variable.

Recommended token tiers (any pick): primitive (raw brand hex, grays) then semantic (`surface`, `text-muted`, `border`, `brand`, `success`, `danger`, trend up/down) then component (card padding, badge radius). Radius stays 16px for CTAs and full for pills.

## Recommendation

Start from shadcn/ui on Base UI, register our own components in a private registry, write the usage rules in an AGENTS.md plus llms.txt in the repo, and pull dashboard patterns from Untitled UI's free tier. Spike plan: install shadcn with the `-b base` flag in a branch, map the tokens, rebuild one dashboard page (KPI row plus bar chart plus table), and check it at 1440/1024/768/390.

## Sources

- shadcn: [llms.txt](https://ui.shadcn.com/llms.txt), [MCP](https://ui.shadcn.com/docs/mcp), [Skills](https://ui.shadcn.com/docs/skills), [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4), [repo](https://github.com/shadcn-ui/ui)
- Base UI: [llms.txt](https://base-ui.com/llms.txt), [repo](https://github.com/mui/base-ui)
- HeroUI: [llms.txt](https://www.heroui.com/llms.txt), [MCP docs](https://heroui.com/docs/react/getting-started/mcp-server), [repo](https://github.com/heroui-inc/heroui)
- Untitled UI: [llms.txt](https://www.untitledui.com/react/llms.txt)
- Mantine: [llms.txt](https://mantine.dev/llms.txt); Chakra: [llms.txt](https://chakra-ui.com/llms.txt); Ark: [llms.txt](https://ark-ui.com/llms.txt)
- React Aria: [llms.txt](https://react-aria.adobe.com/llms.txt); Carbon: [llms.txt](https://carbondesignsystem.com/llms.txt); Ant: [llms.txt](https://ant.design/llms.txt); Atlassian: [llms.txt](https://atlassian.design/llms.txt); Fluent: [llms.txt](https://react.fluentui.dev/llms.txt); coss ui: [llms.txt](https://coss.com/ui/llms.txt)
- Tremor: [repo](https://github.com/tremorlabs/tremor); web summary of Tremor and Recharts overlap is secondary and unconfirmed.
