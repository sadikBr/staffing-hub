import { Tooltip, UnstyledButton } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SkillLevel } from '@/api/types';
import { SKILL_LEVELS, skillLevelRank } from '@/lib/enums';
import classes from './LevelPicker.module.css';

interface LevelPickerProps {
  value: SkillLevel;
  onChange: (level: SkillLevel) => void;
  disabled?: boolean;
}

/** Five ascending bars; click one to set the level. Hovering previews the level under the pointer. */
export function LevelPicker({ value, onChange, disabled = false }: LevelPickerProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<SkillLevel>();
  const shown = hovered ?? value;
  const rank = skillLevelRank(shown);

  return (
    <div className={classes.root} onMouseLeave={() => setHovered(undefined)} role="radiogroup" aria-label={t('employees.skills.level')}>
      <div className={classes.bars}>
        {SKILL_LEVELS.map((level, index) => (
          <Tooltip key={level} label={t(`enums.skillLevel.${level}`)} openDelay={400}>
            <UnstyledButton
              className={classes.bar}
              role="radio"
              aria-checked={level === value}
              aria-label={t(`enums.skillLevel.${level}`)}
              data-on={index < rank || undefined}
              data-preview={(hovered && index < rank) || undefined}
              disabled={disabled}
              onMouseEnter={() => setHovered(level)}
              onFocus={() => setHovered(level)}
              onBlur={() => setHovered(undefined)}
              onClick={() => level !== value && onChange(level)}
            >
              <span style={{ height: 6 + index * 3 }} />
            </UnstyledButton>
          </Tooltip>
        ))}
      </div>
      <span className={classes.name} data-preview={Boolean(hovered && hovered !== value) || undefined}>
        {t(`enums.skillLevel.${shown}`)}
      </span>
    </div>
  );
}
