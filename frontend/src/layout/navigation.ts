import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendarStats,
  IconCode,
  IconId,
  IconLayoutDashboard,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import type { ParseKeys } from 'i18next';

export interface NavItem {
  to: string;
  label: ParseKeys;
  description: ParseKeys;
  icon: Icon;
}

export interface NavSection {
  label: ParseKeys;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    label: 'nav.sections.overview',
    items: [{ to: '/', label: 'nav.dashboard', description: 'nav.descriptions.dashboard', icon: IconLayoutDashboard }],
  },
  {
    label: 'nav.sections.staffing',
    items: [
      { to: '/employees', label: 'nav.employees', description: 'nav.descriptions.employees', icon: IconUsers },
      { to: '/availability', label: 'nav.availability', description: 'nav.descriptions.availability', icon: IconCalendarStats },
      { to: '/missions', label: 'nav.missions', description: 'nav.descriptions.missions', icon: IconBriefcase },
    ],
  },
  {
    label: 'nav.sections.referenceData',
    items: [
      { to: '/customers', label: 'nav.customers', description: 'nav.descriptions.customers', icon: IconBuildingSkyscraper },
      { to: '/technologies', label: 'nav.technologies', description: 'nav.descriptions.technologies', icon: IconCode },
      { to: '/roles', label: 'nav.roles', description: 'nav.descriptions.roles', icon: IconId },
    ],
  },
];

export function isActive(itemPath: string, currentPath: string): boolean {
  return itemPath === '/' ? currentPath === '/' : currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}
