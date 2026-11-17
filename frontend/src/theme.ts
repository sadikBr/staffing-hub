import {
  ActionIcon,
  Badge,
  Button,
  Card,
  createTheme,
  Modal,
  Paper,
  Table,
  Tooltip,
  type MantineColorsTuple,
} from '@mantine/core';

const brand: MantineColorsTuple = [
  '#eef0ff',
  '#dcdfff',
  '#b7bcfb',
  '#9097f6',
  '#6f77f2',
  '#5a63ef',
  '#4f58ee',
  '#4049d4',
  '#3740be',
  '#2b35a8',
];

const fontFamily =
  "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  colors: { brand },
  fontFamily,
  headings: { fontFamily, fontWeight: '650' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Card: Card.extend({ defaultProps: { withBorder: true, radius: 'lg', padding: 'lg', shadow: 'xs' } }),
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
    Badge: Badge.extend({ defaultProps: { variant: 'light', radius: 'sm' }, styles: { root: { textTransform: 'none' } } }),
    Button: Button.extend({ defaultProps: { radius: 'md' } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { variant: 'subtle', color: 'gray' } }),
    Table: Table.extend({ defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md', highlightOnHover: true } }),
    Modal: Modal.extend({
      defaultProps: { centered: true, radius: 'lg', overlayProps: { backgroundOpacity: 0.45, blur: 3 } },
    }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true, openDelay: 300 } }),
  },
});
