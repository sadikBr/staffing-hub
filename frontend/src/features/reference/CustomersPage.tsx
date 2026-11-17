import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBriefcase, IconBuildingSkyscraper } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { customerApi, useCustomers } from '@/api/hooks/reference';
import { LabelListPage } from './LabelListPage';

export default function CustomersPage() {
  const { t } = useTranslation();
  return (
    <LabelListPage
      icon={<IconBuildingSkyscraper size={18} stroke={1.6} />}
      query={useCustomers()}
      api={customerApi}
      texts={{
        title: t('customers.title'),
        description: t('customers.description'),
        newButton: t('customers.new'),
        createTitle: t('customers.createTitle'),
        editTitle: t('customers.editTitle'),
        fieldLabel: t('customers.name'),
        placeholder: t('customers.namePlaceholder'),
        searchPlaceholder: t('customers.searchPlaceholder'),
        emptyTitle: t('customers.emptyTitle'),
        emptyDescription: t('customers.emptyDescription'),
        created: t('customers.created'),
        updated: t('customers.updated'),
        deleted: t('customers.deleted'),
        deleteTitle: t('customers.deleteTitle'),
        deleteMessage: (label) => t('customers.deleteMessage', { label }),
      }}
      rowActions={(customer) => (
        <Tooltip label={t('customers.viewMissions')}>
          <ActionIcon component={Link} to={`/missions?customerId=${customer.id}`} aria-label={t('customers.viewMissions')}>
            <IconBriefcase size={17} />
          </ActionIcon>
        </Tooltip>
      )}
    />
  );
}
