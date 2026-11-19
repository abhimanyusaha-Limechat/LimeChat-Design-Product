/**
 * Styles entry point for the arceus design system.
 *
 * Import this in consuming apps alongside `arceus/dist/arceus.css`:
 *
 *   import 'arceus/styles';
 *
 * This file is a side-effect-only module — it loads Mantine's core styles,
 * Lato @font-face rules, and Sonner toast styles. The UI package build links
 * extracted `dist/styles.css` into `dist/styles.es.js` via `link-styles-css.mjs`.
 */
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/code-highlight/styles.css";
import "sonner/dist/styles.css";
import "./assets/fonts/lato.sass";
import "./assets/disabled.sass";
