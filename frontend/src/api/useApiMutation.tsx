import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StaleVersionContent } from '@/components/StaleVersionContent';
import i18n from '@/i18n';
import { ApiError } from './errors';

interface FormLike {
  setErrors: (errors: Record<string, string>) => void;
}

interface ApiMutationOptions<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Shown as a green notification on success. */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  /** Runs before data is refreshed (e.g. to close a form or leave a deleted record's page). */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Validation errors returned by the API are shown on this form's fields. */
  form?: FormLike;
}

/**
 * A mutation that talks to the API: after success, every query is refreshed (so all screens stay consistent) and a
 * notification is shown; errors are explained to the user.
 */
export function useApiMutation<TVariables = void, TData = unknown>(options: ApiMutationOptions<TVariables, TData>) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
      // Refresh after the current render, so that a page left in onSuccess (e.g. a deleted record) is not refetched.
      setTimeout(() => void queryClient.invalidateQueries(), 0);
      const message =
        typeof options.successMessage === 'function'
          ? options.successMessage(data, variables)
          : options.successMessage;
      if (message) {
        notifications.show({ message, color: 'teal', icon: <IconCheck size={18} />, title: t('common.saved') });
      }
    },
    onError: (error) => showApiError(error, queryClient, options.form),
  });
}

export function showApiError(error: unknown, queryClient: QueryClient, form?: FormLike) {
  const t = i18n.t;

  if (error instanceof ApiError && error.isStaleVersion) {
    modals.open({
      title: t('errors.staleTitle'),
      children: <StaleVersionContent onReload={() => void queryClient.invalidateQueries()} />,
    });
    return;
  }

  if (error instanceof ApiError && form && Object.keys(error.fieldErrors).length > 0) {
    form.setErrors(error.fieldErrors);
  }

  let title = t('errors.title');
  let message = t('errors.network');
  if (error instanceof ApiError) {
    message = error.status >= 500 ? t('errors.server') : error.message;
    if (error.status === 400) title = t('errors.invalidTitle');
    else if (error.status === 404) title = t('errors.notFoundTitle');
    else if (error.status === 409 || error.status === 422) title = t('errors.refusedTitle');
  }
  notifications.show({ title, message, color: 'red', icon: <IconX size={18} />, autoClose: 7000 });
}
