import { useState, useEffect } from 'react';

// Delays updating a value until the user stops typing
// Usage: const debouncedSearch = useDebounce(searchQuery, 400);
export function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}