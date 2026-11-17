import { ActionIcon, Tooltip } from '@mantine/core';
import { IconId, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { roleApi, useRoles } from '@/api/hooks/reference';
import { LabelListPage } from './LabelListPage';

export default function RolesPage() {
  const { t } = useTranslation();
  return (
    <LabelListPage
      icon={<IconId size={18} stroke={1.6} />}
      query={useRoles()}
      api={roleApi}
      texts={{
        title: t('roles.title'),
        description: t('roles.description'),
        newButton: t('roles.new'),
        createTitle: t('roles.createTitle'),
        editTitle: t('roles.editTitle'),
        fieldLabel: t('roles.name'),
        placeholder: t('roles.namePlaceholder'),
        searchPlaceholder: t('roles.searchPlaceholder'),
        emptyTitle: t('roles.emptyTitle'),
        emptyDescription: t('roles.emptyDescription'),
        created: t('roles.created'),
        updated: t('roles.updated'),
        deleted: t('roles.deleted'),
        deleteTitle: t('roles.deleteTitle'),
        deleteMessage: (label) => t('roles.deleteMessage', { label }),
      }}
      rowActions={(role) => (
        <Tooltip label={t('roles.viewEmployees')}>
          <ActionIcon component={Link} to={`/employees?roleId=${role.id}`} aria-label={t('roles.viewEmployees')}>
            <IconUsers size={17} />
          </ActionIcon>
        </Tooltip>
      )}
    />
  );
}
