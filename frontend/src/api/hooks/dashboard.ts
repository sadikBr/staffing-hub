import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => unwrap(api.GET('/api/dashboard')) });
}
