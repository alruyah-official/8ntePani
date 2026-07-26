import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  ACTIVE: '#3b82f6',
  DELIVERED: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
  REJECTED: '#6b7280',
};

const FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'];

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [deliveringOrderId, setDeliveringOrderId] = useState(null);
  const [deliveryNoteInput, setDeliveryNoteInput] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/orders/my-orders');
        setOrders(res.data.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, action, body) => {
    try {
      const res = await api.patch(`/api/orders/${orderId}/${action}`, body);
      const updatedOrder = res.data.data.order;
      setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} order.`);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (routeOrderId && order.id === routeOrderId) return true;
    if (activeFilter === 'ALL') return true;
    return order.status === activeFilter;
  });

  const getStatusCount = filter => {
    if (filter === 'ALL') return orders.length;
    return orders.filter(o => o.status === filter).length;
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
          My Orders
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          {user?.role === 'CLIENT'
            ? 'Track your hired services'
            : 'Manage your received orders'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter;
          const count = getStatusCount(filter);
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive ? '#4f46e5' : '#f1f5f9',
                color: isActive ? 'white' : '#64748b',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>
            No orders found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {activeFilter === 'ALL'
              ? user?.role === 'CLIENT'
                ? "You haven't placed any orders yet"
                : "You haven't received any orders yet"
              : `No orders with status ${activeFilter}`}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div>
          {filteredOrders.map(order => {
            const statusColor = STATUS_COLORS[order.status] || '#6b7280';
            const isClient = user?.role === 'CLIENT';
            const isFreelancer = user?.role === 'FREELANCER';
            const isDelivering = deliveringOrderId === order.id;

            return (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${statusColor}`,
                }}
              >
                {/* Card Top Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {order.service?.title || 'Service Order'}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      Order #{order.id.slice(-8)} •{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: `${statusColor}15`,
                        color: statusColor,
                        marginBottom: '0.35rem',
                      }}
                    >
                      {order.status}
                    </span>
                    <p
                      style={{
                        fontWeight: 'bold',
                        color: '#4f46e5',
                        fontSize: '1.1rem',
                      }}
                    >
                      ₹{parseFloat(order.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Card Middle Row */}
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>
                    {isClient
                      ? `Freelancer: ${order.freelancer?.name || 'N/A'}`
                      : `Client: ${order.client?.name || 'N/A'}`}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                    {order.requirements.length > 100
                      ? `${order.requirements.slice(0, 100)}...`
                      : order.requirements}
                  </p>
                </div>

                {/* Delivery Note Box */}
                {order.deliveryNote && (order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginTop: '0.75rem',
                    }}
                  >
                    <p style={{ fontWeight: '700', color: '#166534', fontSize: '0.85rem' }}>
                      Delivery Note:
                    </p>
                    <p style={{ color: '#15803d', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                      {order.deliveryNote}
                    </p>
                  </div>
                )}

                {/* Card Actions Row */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* FREELANCER ACTIONS */}
                  {isFreelancer && (
                    <>
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'accept')}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'reject')}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}

                      {order.status === 'ACTIVE' && (
                        <>
                          {!isDelivering ? (
                            <button
                              onClick={() => {
                                setDeliveringOrderId(order.id);
                                setDeliveryNoteInput('');
                              }}
                              style={{
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                              }}
                            >
                              📦 Mark as Delivered
                            </button>
                          ) : (
                            <div style={{ width: '100%', marginTop: '0.5rem' }}>
                              <textarea
                                rows={3}
                                value={deliveryNoteInput}
                                onChange={e => setDeliveryNoteInput(e.target.value)}
                                placeholder="Write a delivery message or link to completed files..."
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  marginBottom: '0.5rem',
                                  fontFamily: 'inherit',
                                }}
                              />
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => {
                                    if (!deliveryNoteInput.trim()) {
                                      alert('Please enter a delivery note.');
                                      return;
                                    }
                                    handleStatusUpdate(order.id, 'deliver', {
                                      deliveryNote: deliveryNoteInput.trim(),
                                    });
                                    setDeliveringOrderId(null);
                                    setDeliveryNoteInput('');
                                  }}
                                  style={{
                                    background: '#8b5cf6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Confirm Delivery
                                </button>
                                <button
                                  onClick={() => {
                                    setDeliveringOrderId(null);
                                    setDeliveryNoteInput('');
                                  }}
                                  style={{
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {order.status === 'DELIVERED' && (
                        <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.875rem' }}>
                          Waiting for client approval...
                        </p>
                      )}

                      {(order.status === 'PENDING' || order.status === 'ACTIVE') && !isDelivering && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancel')}
                          style={{
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </>
                  )}

                  {/* CLIENT ACTIONS */}
                  {isClient && (
                    <>
                      {order.status === 'PENDING' && (
                        <>
                          <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            Waiting for freelancer...
                          </p>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancel')}
                            style={{
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === 'ACTIVE' && (
                        <>
                          <p style={{ color: '#3b82f6', fontStyle: 'italic', fontSize: '0.875rem' }}>
                            Work in progress...
                          </p>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancel')}
                            style={{
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === 'DELIVERED' && (
                        <div style={{ width: '100%' }}>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'complete')}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              width: '100%',
                              fontSize: '1rem',
                              padding: '0.75rem',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            ✅ Approve Completion
                          </button>
                          <p
                            style={{
                              color: '#6b7280',
                              fontSize: '0.8rem',
                              marginTop: '0.35rem',
                              textAlign: 'center',
                            }}
                          >
                            By approving you confirm the work is complete and satisfactory
                          </p>
                        </div>
                      )}

                      {order.status === 'REJECTED' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>
                            This order was rejected
                          </span>
                          <button
                            onClick={() => navigate('/explore')}
                            style={{
                              background: '#4f46e5',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            Find Another Freelancer
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
