import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import ServiceCard from '../components/ServiceCard';

// The Home page displays a hero section, search/filter controls, and a grid of service cards.
// We use functional components and hooks to manage local state and side effects (API calls).
const Home = () => {
  // State for storing the list of services and available categories fetched from API.
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading and error states to provide appropriate UI feedback during asynchronous operations.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state holds the current values for our search inputs and dropdowns.
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: ''
  });

  // On initial mount, fetch categories and services simultaneously to optimize loading time.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Using Promise.all allows us to run both API requests concurrently.
        const [categoriesRes, servicesRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/services')
        ]);
        

        setCategories(categoriesRes.data.data.categories);
        setServices(servicesRes.data.data.services);

        setError(null);

      } catch (err) {
        // If an error occurs, we set the error state to display a message to the user.
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Generic handler for filter inputs to keep our state up-to-date as the user types or selects.
  // We use computed property names to dynamically update the correct field in our filters object.
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handles form submission for the search bar, applying filters to the API request.
  const handleSearch = async (e) => {
    e.preventDefault(); // Prevents page reload on form submit.
    
    // We only want to send filter parameters that have a value to keep the query string clean.
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        queryParams.append(key, value);
      }
    });

    try {
      setLoading(true);
      // Fetch services with the constructed query parameters applied.
      const response = await axios.get(`/api/services?${queryParams.toString()}`);
      setServices(response.data.data.services);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch filtered services');
    } finally {
      setLoading(false);
    }
  };

  // Resets all filters to empty and fetches the full, unfiltered list of services again.
  const handleReset = async () => {
    const emptyFilters = {
      search: '',
      categoryId: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(emptyFilters);
    
    try {
      setLoading(true);
      const response = await axios.get('/api/services');
      setServices(response.data.data.services);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section: Grabs the user's attention with a vibrant gradient background and clear value proposition. */}
      <section
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: 'white',
          padding: '3rem 1rem',
          textAlign: 'center'
        }}
      >
        <h1>Find Freelancers for Any Job</h1>
        <p>Browse services from talented college students</p>
      </section>

      {/* Search and Filter Bar: Provided as a form so pressing Enter triggers a search. */}
      <section
        style={{
          background: 'white',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <form 
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center' // Centers the filter bar on wider screens
          }}
        >
          <input
            type="text"
            name="search"
            placeholder="Search services..."
            value={filters.search}
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          
          <select
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">All Categories</option>
            {/* Dynamically render category options based on API response. */}
            {categories.map(cat => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price (₹)"
            value={filters.minPrice}
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '120px' }}
          />
          
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price (₹)"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', width: '120px' }}
          />
          
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          
          <button 
            type="button" 
            className="btn" 
            onClick={handleReset}
            style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
          >
            Reset
          </button>
        </form>
      </section>

      {/* Results Section: Displays the grid of services or appropriate fallback UI (loading/error/empty). */}
      <section className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {services.length} services found
        </div>

        {error && (
          <div style={{ color: 'red', border: '1px solid red', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ marginBottom: '1rem' }}>No services found</p>
            <button 
              onClick={handleReset} 
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {services.map(service => (
              <ServiceCard key={service.id || service._id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
