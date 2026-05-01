import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { gigsApi } from '../api/gigs';

export const useGigs = (params) => {
  return useQuery({
    queryKey: ['gigs', params],
    queryFn: () => gigsApi.fetchGigs(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useFeaturedGigs = () => {
  return useGigs({ featured: true });
};

export const useGigsQuery = (params) => useGigs(params);

export const useGigById = (id) => {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.fetchGigById(id),
    enabled: !!id,
  });
};

export const useMyGigs = () => {
  return useQuery({
    queryKey: ['myGigs'],
    queryFn: () => gigsApi.fetchMyGigs(),
  });
};

export const useCreateGig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => gigsApi.createGig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      toast.success('Gig created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create gig');
    }
  });
};

export const useUpdateGig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => gigsApi.updateGig(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig', variables.id] });
    },
  });
};

export const useDeleteGig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => gigsApi.deleteGig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
    },
  });
};
