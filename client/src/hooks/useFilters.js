import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

// Syncs filter state with the URL query string
// so filters are shareable and survive page refresh
export function useFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        deliveryDays: searchParams.get('deliveryDays') || '',
        rating: searchParams.get('rating') || '',
        sort: searchParams.get('sort') || 'newest',
        page: Number(searchParams.get('page')) || 1,
    };

    const setFilter = useCallback((key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === '' || value === null || value === undefined) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            // Reset to page 1 whenever any filter changes
            if (key !== 'page') next.set('page', '1');
            return next;
        });
    }, [setSearchParams]);

    const setFilters = useCallback((obj) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            Object.entries(obj).forEach(([k, v]) => {
                if (v === '' || v == null) next.delete(k);
                else next.set(k, v);
            });
            next.set('page', '1');
            return next;
        });
    }, [setSearchParams]);

    const clearFilters = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

    // Build clean params object for API call (removes empty values)
    const apiParams = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== 0)
    );

    return { filters, setFilter, setFilters, clearFilters, apiParams };
}