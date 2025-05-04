import { useQuery } from '@tanstack/react-query';
import { api } from '../api/apiClient';

// Example data type
export interface DataItem {
  id: string;
  name: string;
  description: string;
}

/**
 * Custom hook to fetch data items
 */
export function useDataItems() {
  return useQuery({
    queryKey: ['data-items'],
    queryFn: () => api.get<DataItem[]>('/data-items'),
    // In a real app, you might want to configure staleTime, cacheTime, etc.
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch a single data item by ID
 */
export function useDataItem(id: string) {
  return useQuery({
    queryKey: ['data-item', id],
    queryFn: () => api.get<DataItem>(`/data-items/${id}`),
    // Only fetch if we have an ID
    enabled: !!id,
  });
}
