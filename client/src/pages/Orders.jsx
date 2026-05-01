import { useState } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, Package, ChevronRight } from 'lucide-react';
import { useMyOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#888', bg: 'rgba(136,136,136,0.1)', icon: Clock },
    in_progress: { label: 'In Progress', color: '#C8F135', bg: 'rgba(200,241,53,0.1)', icon: RefreshCw },
    delivered: { label: 'Delivered', color: '#82aaff', bg: 'rgba(130,170,255,0.1)', icon: Package },
    revision: { label: 'Revision', color: '#f78c6c', bg: 'rgba(247,140,108,0.1)', icon: RefreshCw },
    completed: { label: 'Completed', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: XCircle },
};

const MOCK_ORDERS = [
    { id: 'ord-1', gig: { title: 'Build a full-stack React web app', images: [] }, buyer: { name: 'Priya Sharma', avatar: '' }, seller: { name: 'Arjun Kumar', avatar: '' }, packageType: 'standard', price: 250, deliveryDays: 7, status: 'in_progress', dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'ord-2', gig: { title: 'Design a modern logo for your brand', images: [] }, buyer: { name: 'Rahul Mehta', avatar: '' }, seller: { name: 'Arjun Kumar', avatar: '' }, packageType: 'basic', price: 80, deliveryDays: 3, status: 'delivered', dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'ord-3', gig: { title: 'Write SEO blog posts for your website', images: [] }, buyer: { name: 'Sneha Nair', avatar: '' }, seller: { name: 'Arjun Kumar', avatar: '' }, packageType: 'premium', price: 400, deliveryDays: 10, status: 'completed', dueDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

export default function Orders() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [role, setRole] = useState('seller');
    const { data, isLoading } = useMyOrders(role);
    const updateStatus = useUpdateOrderStatus();

    const orders = data?.data || MOCK_ORDERS;
    const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

    const tabs = ['all', 'in_progress', 'delivered', 'completed', 'cancelled'];

    return (
        <div style={{ maxWidth: 1000, margin: '80px auto 40px', padding: '0 24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fafafa' }}>Orders</h1>
                {/* Role toggle */}
                <div style={{ display: 'flex', background: '#111', border: '1px solid #222', borderRadius: 999, padding: 3 }}>
                    {['seller', 'buyer'].map(r => (
                        <button key={r} onClick={() => setRole(r)} style={{
                            padding: '6px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                            background: role === r ? '#C8F135' : 'transparent',
                            color: role === r ? '#000' : '#888',
                            fontSize: 13, fontWeight: role === r ? 700 : 400,
                            fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s',
                        }}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                    ))}
                </div>
            </div>

            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '7px 16px', borderRadius: 999, border: '1px solid',
                        borderColor: activeTab === tab ? '#C8F135' : '#222',
                        background: activeTab === tab ? 'rgba(200,241,53,0.1)' : 'transparent',
                        color: activeTab === tab ? '#C8F135' : '#666',
                        fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                        fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s',
                    }}>
                        {tab === 'all' ? 'All Orders' : STATUS_CONFIG[tab]?.label}
                    </button>
                ))}
            </div>

            {/* Order cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
                        <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                        No orders found
                    </div>
                )}
                {filtered.map(order => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const dueDate = new Date(order.dueDate);
                    const isOverdue = dueDate < new Date() && order.status !== 'completed' && order.status !== 'cancelled';
                    const otherParty = role === 'seller' ? order.buyer : order.seller;

                    return (
                        <div key={order.id} style={{
                            background: '#111', border: '1px solid #1e1e1e', borderRadius: 14,
                            padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start',
                            transition: 'border-color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
                        >
                            {/* Order info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 4 }}>{order.gig?.title}</div>
                                        <div style={{ fontSize: 12, color: '#555' }}>
                                            {role === 'seller' ? 'Buyer' : 'Seller'}: <span style={{ color: '#888' }}>{otherParty?.name}</span>
                                            · {order.packageType?.charAt(0).toUpperCase() + order.packageType?.slice(1)} package
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#C8F135', fontFamily: 'Syne,sans-serif' }}>${order.price}</div>
                                        <div style={{ fontSize: 11, color: isOverdue ? '#f87171' : '#555', marginTop: 2 }}>
                                            Due: {formatDate(order.dueDate)} {isOverdue ? '⚠ Overdue' : ''}
                                        </div>
                                    </div>
                                </div>

                                {/* Status + actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                        background: cfg.bg, color: cfg.color,
                                    }}>
                                        <StatusIcon size={11} /> {cfg.label}
                                    </span>

                                    {/* Action buttons based on status and role */}
                                    {role === 'seller' && order.status === 'pending' && (
                                        <button onClick={() => updateStatus.mutate({ id: order.id, status: 'in_progress' })}
                                            style={actionBtn('#C8F135', '#000')}>Accept Order</button>
                                    )}
                                    {role === 'seller' && order.status === 'in_progress' && (
                                        <button onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}
                                            style={actionBtn('#82aaff', '#000')}>Mark Delivered</button>
                                    )}
                                    {role === 'buyer' && order.status === 'delivered' && (<>
                                        <button onClick={() => updateStatus.mutate({ id: order.id, status: 'completed' })}
                                            style={actionBtn('#4ade80', '#000')}>Accept Delivery</button>
                                        <button onClick={() => updateStatus.mutate({ id: order.id, status: 'revision' })}
                                            style={actionBtn('#f78c6c', '#000')}>Request Revision</button>
                                    </>)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function actionBtn(bg, color) {
    return {
        padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
        background: bg, color, fontSize: 12, fontWeight: 700,
        fontFamily: 'DM Sans,sans-serif', transition: 'opacity 0.2s',
    };
}