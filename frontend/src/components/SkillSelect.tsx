import { Select, type SelectProps } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTechnologies } from '@/api/hooks/reference';

interface SkillSelectProps extends Omit<SelectProps, 'data'> {
  /** Only offer skills of these technologies. */
  technologyIds?: string[];
  /** Skills not to offer (e.g. already added). */
  excludeIds?: string[];
}

/** Skills grouped by technology. */
export function SkillSelect({ technologyIds, excludeIds = [], ...props }: SkillSelectProps) {
  const { t } = useTranslation();
  const technologies = useTechnologies();

  const data = useMemo(
    () =>
      (technologies.data ?? [])
        .filter((technology) => !technologyIds || technologyIds.includes(technology.id))
        .map((technology) => ({
          group: technology.label,
          items: technology.skills
            .filter((skill) => !excludeIds.includes(skill.id))
            .map((skill) => ({ value: skill.id, label: skill.label })),
        }))
        .filter((group) => group.items.length > 0),
    [technologies.data, technologyIds, excludeIds],
  );

  return (
    <Select
      searchable
      placeholder={t('skills.selectPlaceholder')}
      nothingFoundMessage={t('common.noResults')}
      {...props}
      data={data}
    />
  );
}
