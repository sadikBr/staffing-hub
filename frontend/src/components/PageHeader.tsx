import { Box, Text, Title } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import classes from './PageHeader.module.css';

interface Crumb {
  label: string;
  to: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Small mono line above the title, e.g. the period a page covers. */
  eyebrow?: ReactNode;
  /** Shown before the title (e.g. an avatar). */
  leading?: ReactNode;
  /** Shown under the title (e.g. badges). */
  meta?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

/** The page's masthead: eyebrow, large serif title, and a strong rule underneath. */
export function PageHeader({ title, description, eyebrow, leading, meta, actions, breadcrumbs }: PageHeaderProps) {
  const hasEyebrow = Boolean(eyebrow) || (breadcrumbs && breadcrumbs.length > 0);
  return (
    <header className={classes.root}>
      {hasEyebrow && (
        <div className={classes.eyebrow}>
          {breadcrumbs?.map((crumb) => (
            <Fragment key={crumb.to}>
              <Link to={crumb.to} className={`sh-label ${classes.crumb}`}>
                {crumb.label}
              </Link>
              <span className="sh-label" aria-hidden="true">
                /
              </span>
            </Fragment>
          ))}
          {eyebrow && <span className="sh-label">{eyebrow}</span>}
        </div>
      )}
      <div className={classes.row}>
        <div className={classes.main}>
          {leading}
          <Box style={{ minWidth: 0 }}>
            <Title order={1} className={classes.title}>
              {title}
            </Title>
            {description && (
              <Text component="div" className={classes.description}>
                {description}
              </Text>
            )}
            {meta && <Box mt={12}>{meta}</Box>}
          </Box>
        </div>
        {actions && <div className={classes.actions}>{actions}</div>}
      </div>
    </header>
  );
}
