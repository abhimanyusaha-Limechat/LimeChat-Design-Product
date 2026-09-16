# LimeChat Design Product

A prototype product by the LimeChat Design Team for exploring, testing, and
experiencing product ideas through functional, high-fidelity implementations.

**Live demo:** https://abhimanyusaha-limechat.github.io/LimeChat-Design-Product/

This is a React + TypeScript + Vite project: a reusable component library
(`src/components/`) built to the LimeChat Design System, exercised through a
demo app shell (`src/App.tsx`) that wires the components together into working
product flows (sidebar navigation, flow-builder canvas, broadcast/segment
pages, modals, etc.).

## Getting started

Requires [Node.js](https://nodejs.org/) 20+.

```bash
npm install    # install dependencies
npm run dev    # start the local dev server (http://localhost:5173)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and builds a production bundle into `dist/` |
| `npm run preview` | Serves the built `dist/` bundle locally, to sanity-check a production build |

## Project structure

```
src/
  App.tsx              # Demo harness — wires components into full product flows
  components/          # One folder per component:
    ComponentName/
      ComponentName.tsx
      ComponentName.css
      icons.tsx        # (where applicable)
      index.ts         # barrel export
      README.md         # (where applicable) component-level docs
```

Notable components: `Sidebar`, `TopNavBar`, `Modal`, `Tooltip`, `Button`,
`CanvasChrome` (flow-builder canvas chrome), and a set of product home pages
(`SegmentsHomePage`, `BroadcastHomePage`, `FlowsHomePage`, `BotFlowsHomePage`,
`TemplatesHomePage`, `SettingsPage`).

## Deployment

Pushing to `main` (via a merged pull request) automatically builds and
deploys the app to GitHub Pages — see
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

## Contributing

`main` is protected — changes go through a pull request rather than a direct
push. Typical flow:

```bash
git checkout -b my-change
# ...make changes...
git commit -m "Describe what changed and why"
git push -u origin my-change
```

Then open a pull request on GitHub and merge once it looks good.

## License

Proprietary — see [`LICENSE`](LICENSE). All rights reserved by LimeChat.
