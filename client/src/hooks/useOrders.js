import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ordersApi } from '../api/orders';

export const useMyOrders = (role) => {
  return useQuery({
    queryKey: ['orders', role],
    queryFn: () => ordersApi.fetchMyOrders(role),
    enabled: !!role,
  });
};

export const useOrderById = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.fetchOrderById(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    }
  });
};

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => ordersApi.deliverOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
};

export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ordersApi.completeOrder(id),
    onSuccess: (_, id) => {
      // Invalidate both the specific order cache and the general orders list cache
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast.success('Order successfully completed!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to complete order');
    }
  });
};
