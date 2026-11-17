import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  createTheme,
  Drawer,
  Input,
  InputWrapper,
  Menu,
  Modal,
  Notification,
  Pagination,
  Paper,
  Popover,
  SegmentedControl,
  Switch,
  Table,
  Tooltip,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core';

/**
 * "Indigo night": cool neutral surfaces, an indigo → violet primary, and soft tinted status colors. Depth comes from
 * surface tones and soft shadows rather than lines; the serif is kept for titles and large numbers.
 */

/** Indigo, the primary color. Shade 6 is used for filled controls in both color schemes. */
const brand: MantineColorsTuple = [
  '#eef0ff',
  '#e0e2ff',
  '#c4c6ff',
  '#a5a7ff',
  '#8b8cff',
  '#7273fa',
  '#5b5bf6',
  '#4c4ce0',
  '#3f3fc2',
  '#33339e',
];

/** Cool slate grays. */
const gray: MantineColorsTuple = [
  '#f6f7fb',
  '#eef0f6',
  '#e2e5ee',
  '#cdd1de',
  '#a9aec2',
  '#8288a0',
  '#5f6580',
  '#454a61',
  '#2c3044',
  '#171a2b',
];

/** Mantine's dark scheme surfaces: deep navy-black. */
const dark: MantineColorsTuple = [
  '#e8eaf2',
  '#bfc3d4',
  '#9398ae',
  '#6f7590',
  '#3a3f55',
  '#262a3d',
  '#1e2233',
  '#151826',
  '#0f121c',
  '#0b0d14',
];

const sans = "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const serif = "'Fraunces Variable', Fraunces, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";
const mono = "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 6 },
  colors: { brand, gray, dark },
  white: '#ffffff',
  black: '#0f1222',
  fontFamily: sans,
  fontFamilyMonospace: mono,
  defaultGradient: { from: '#5b5bf6', to: '#8b5cf6', deg: 135 },
  headings: {
    fontFamily: serif,
    fontWeight: '420',
    sizes: {
      h1: { fontSize: 'clamp(2.1rem, 1.5rem + 2.2vw, 3.25rem)', lineHeight: '1.04' },
      h2: { fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.1rem)', lineHeight: '1.1' },
      h3: { fontSize: '1.3rem', lineHeight: '1.2' },
    },
  },
  defaultRadius: 'md',
  radius: { xs: '4px', sm: '6px', md: '10px', lg: '16px', xl: '999px' },
  cursorType: 'pointer',
  respectReducedMotion: true,
  shadows: {
    xs: '0 1px 2px rgba(15, 18, 34, 0.06)',
    sm: '0 1px 2px rgba(15, 18, 34, 0.04), 0 4px 12px -2px rgba(15, 18, 34, 0.06)',
    md: '0 2px 4px rgba(15, 18, 34, 0.04), 0 16px 40px -12px rgba(15, 18, 34, 0.18)',
    lg: '0 4px 8px rgba(15, 18, 34, 0.04), 0 28px 64px -20px rgba(15, 18, 34, 0.28)',
    xl: '0 8px 16px rgba(15, 18, 34, 0.06), 0 40px 96px -24px rgba(15, 18, 34, 0.38)',
  },
  other: { serif, mono },
  components: {
    Card: Card.extend({ defaultProps: { radius: 'lg', padding: 'lg', withBorder: false, shadow: 'sm' } }),
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
    Badge: Badge.extend({
      defaultProps: { variant: 'light', radius: 'xl' },
      styles: { root: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 } },
    }),
    Button: Button.extend({ defaultProps: { radius: 'md' }, styles: { root: { fontWeight: 600 } } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { variant: 'subtle', color: 'gray', radius: 'md' } }),
    Avatar: Avatar.extend({ styles: { placeholder: { fontWeight: 650, fontSize: '0.8em' } } }),
    Input: Input.extend({ defaultProps: { variant: 'filled', radius: 'md' } }),
    InputWrapper: InputWrapper.extend({
      // Help text goes under the field, so fields side by side stay aligned whatever the length of their help text.
      defaultProps: { inputWrapperOrder: ['label', 'input', 'description', 'error'] },
      styles: {
        label: { fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--sh-text-2)' },
        description: { color: 'var(--sh-text-3)', marginTop: 6, lineHeight: 1.4 },
        required: { color: 'var(--sh-primary)' },
      },
    }),
    Switch: Switch.extend({ defaultProps: { color: 'brand' } }),
    Pagination: Pagination.extend({ defaultProps: { radius: 'md' } }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md', highlightOnHover: true, withRowBorders: true },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { radius: 'md' },
      styles: {
        root: { background: 'var(--sh-surface-2)' },
        indicator: { background: 'var(--sh-raised-2)', boxShadow: 'var(--mantine-shadow-xs)' },
      },
    }),
    Menu: Menu.extend({ defaultProps: { radius: 'md', shadow: 'lg' } }),
    Popover: Popover.extend({ defaultProps: { radius: 'md', shadow: 'lg' } }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'lg',
        padding: 'xl',
        shadow: 'xl',
        overlayProps: { backgroundOpacity: 1, color: 'var(--sh-overlay)', blur: 6 },
      },
      styles: {
        title: { fontFamily: serif, fontSize: '1.6rem', fontWeight: 420, letterSpacing: '-0.015em', lineHeight: 1.15 },
        content: { background: 'var(--sh-raised)' },
        header: { background: 'var(--sh-raised)' },
      },
    }),
    Drawer: Drawer.extend({ styles: { content: { background: 'var(--sh-bg)' }, header: { background: 'var(--sh-bg)' } } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true, openDelay: 250, radius: 'sm' } }),
    Notification: Notification.extend({ defaultProps: { radius: 'md', withBorder: false } }),
  },
});

/** Page-level design tokens (`--sh-*`) and Mantine's own surface colors, for both color schemes. */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--sh-font-serif': serif,
    '--sh-font-mono': mono,
    '--sh-gradient': 'linear-gradient(135deg, #5b5bf6 0%, #8b5cf6 100%)',
  },
  light: {
    '--sh-bg': '#f6f7fb',
    '--sh-surface': '#ffffff',
    '--sh-surface-2': '#f1f3f8',
    '--sh-raised': '#ffffff',
    '--sh-raised-2': '#ffffff',
    '--sh-text': '#0f1222',
    '--sh-text-2': '#4a5068',
    '--sh-text-3': '#8288a0',
    '--sh-rule': 'rgba(15, 18, 34, 0.07)',
    '--sh-tint': 'rgba(15, 18, 34, 0.035)',
    '--sh-hover': 'rgba(91, 91, 246, 0.045)',
    '--sh-overlay': 'rgba(15, 18, 34, 0.32)',
    '--sh-primary': '#5b5bf6',
    '--sh-primary-text': '#4f4fe6',
    '--sh-primary-soft': 'rgba(91, 91, 246, 0.1)',
    '--sh-accent': '#8b5cf6',
    '--sh-free': '#10b981',
    '--sh-free-soft': 'rgba(16, 185, 129, 0.12)',
    '--sh-partial': '#f59e0b',
    '--sh-partial-soft': 'rgba(245, 158, 11, 0.14)',
    '--sh-over': '#f43f5e',
    '--sh-over-soft': 'rgba(244, 63, 94, 0.1)',
    '--sh-shadow-sheet': '0 1px 2px rgba(15, 18, 34, 0.04), 0 8px 28px -14px rgba(15, 18, 34, 0.14)',
    '--mantine-color-body': '#f6f7fb',
    '--mantine-color-text': '#0f1222',
    '--mantine-color-dimmed': '#8288a0',
    '--mantine-color-default': '#ffffff',
    '--mantine-color-default-hover': '#f1f3f8',
    '--mantine-color-default-border': 'rgba(15, 18, 34, 0.1)',
    '--mantine-color-placeholder': '#a9aec2',
    '--mantine-color-anchor': '#4f4fe6',
    '--mantine-color-error': '#f43f5e',
  },
  dark: {
    '--sh-bg': '#0b0d14',
    '--sh-surface': '#141724',
    '--sh-surface-2': '#1c2031',
    '--sh-raised': '#181c2b',
    '--sh-raised-2': '#2a2f45',
    '--sh-text': '#e8eaf2',
    '--sh-text-2': '#aeb3c7',
    '--sh-text-3': '#737990',
    '--sh-rule': 'rgba(232, 234, 242, 0.07)',
    '--sh-tint': 'rgba(232, 234, 242, 0.035)',
    '--sh-hover': 'rgba(139, 140, 255, 0.06)',
    '--sh-overlay': 'rgba(3, 4, 10, 0.72)',
    '--sh-primary': '#8b8cff',
    '--sh-primary-text': '#a5a7ff',
    '--sh-primary-soft': 'rgba(139, 140, 255, 0.14)',
    '--sh-accent': '#a78bfa',
    '--sh-free': '#34d399',
    '--sh-free-soft': 'rgba(52, 211, 153, 0.14)',
    '--sh-partial': '#fbbf24',
    '--sh-partial-soft': 'rgba(251, 191, 36, 0.14)',
    '--sh-over': '#fb7185',
    '--sh-over-soft': 'rgba(251, 113, 133, 0.14)',
    '--sh-shadow-sheet': 'inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 12px 32px -16px rgba(0, 0, 0, 0.6)',
    '--mantine-color-body': '#0b0d14',
    '--mantine-color-text': '#e8eaf2',
    '--mantine-color-dimmed': '#737990',
    '--mantine-color-default': '#1c2031',
    '--mantine-color-default-hover': '#242940',
    '--mantine-color-default-border': 'rgba(232, 234, 242, 0.08)',
    '--mantine-color-placeholder': '#5c6279',
    '--mantine-color-anchor': '#a5a7ff',
    '--mantine-color-error': '#fb7185',
  },
});
