import type { ReactNode } from 'react';
import classes from './Section.module.css';

interface SectionProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /**
   * Puts the content on a sheet (a white or deep-navy rounded surface): `padded` for free-form content, `flush` for
   * tables and lists that manage their own spacing. Without it, the content sits directly on the page.
   */
  sheet?: 'padded' | 'flush';
  className?: string;
}

/** A titled area of a page: heading and actions, then the content, optionally on a sheet. */
export function Section({ title, description, icon, actions, children, sheet, className }: SectionProps) {
  return (
    <section className={`${classes.section} ${className ?? ''}`}>
      <div className={classes.head}>
        <div style={{ minWidth: 0 }}>
          <div className={classes.headText}>
            {icon && <span className={classes.icon}>{icon}</span>}
            <div style={{ minWidth: 0 }}>
              <h2 className={classes.title}>{title}</h2>
              {description && <div className={classes.description}>{description}</div>}
            </div>
          </div>
        </div>
        {actions && <div className={classes.actions}>{actions}</div>}
      </div>
      {sheet ? <div className={`sh-sheet ${classes[sheet]}`}>{children}</div> : children}
    </section>
  );
}

/** A labelled value in a details list, with an optional action (e.g. "Edit") next to the label. */
export function DetailItem({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className={classes.detail}>
      <div className={classes.detailLabel}>
        <span className="sh-label">{label}</span>
        {action}
      </div>
      <div className={classes.detailValue}>{children}</div>
    </div>
  );
}
