import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, ShoppingCart,
  MessageSquare, DollarSign, Settings,
  TrendingUp, Plus
} from 'lucide-react';
import { useAuth } from '../context';
import { useIsSeller } from '../hooks';
import { useSellerStats, useMyOrders, useMyGigs } from '../hooks';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSeller = useIsSeller();

  // Only fetch seller-specific data when the user actually has a seller role.
  // Buyers would get 403 from /api/gigs/mine, crashing the dashboard.
  const { data: statsData } = useSellerStats();
  const { data: ordersData } = useMyOrders(isSeller ? 'seller' : 'buyer');
  // useMyGigs calls /api/gigs/mine which requires seller role — gate it
  const { data: gigsData } = useMyGigs(isSeller);

  // statsData.data is a plain object { totalGigs, totalOrders, totalReviews } —
  // NOT an array. We build the metric-card array from it explicitly.
  const rawStats = statsData?.data;
  const metrics = [
    { label: 'Total Gigs',    value: rawStats?.totalGigs    ?? '–', change: null },
    { label: 'Total Orders',  value: rawStats?.totalOrders  ?? '–', change: null },
    { label: 'Total Reviews', value: rawStats?.totalReviews ?? '–', change: null },
  ];

  const orders = ordersData?.data || [];
  const gigs   = gigsData?.data   || [];

  const navLinks = [
    { name: 'Overview', path: '/dashboard',          icon: LayoutDashboard },
    { name: 'My Gigs',  path: '/dashboard/gigs',     icon: Briefcase       },
    { name: 'Orders',   path: '/orders',             icon: ShoppingCart    },
    { name: 'Messages', path: '/messages',           icon: MessageSquare   },
    { name: 'Earnings', path: '/dashboard/earnings', icon: DollarSign      },
    { name: 'Settings', path: '/settings',           icon: Settings        },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Completed':   return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled':   return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:            return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-80px)]">

      {/* ── Left sidebar ── */}
      <aside className="w-[220px] bg-surface border-r border-border hidden md:flex flex-col py-8 px-4 shrink-0">
        <div className="mb-8 px-4">
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest">Dashboard Menu</h2>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} end={link.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-r-lg font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent border-l-4 border-accent'
                    : 'text-muted hover:bg-primary hover:text-text-primary border-l-4 border-transparent'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">

          {/* Welcome */}
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
              Welcome back, {user?.name || 'Freelancer'} 👋
            </h1>
            <p className="text-muted">Here is what's happening with your business today.</p>
          </div>

          {/* ── Metric cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {metrics.map((metric, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-2xl p-6 shadow-lg hover:border-muted transition-colors">
                <p className="text-muted font-medium mb-3">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="font-display text-4xl font-bold text-text-primary">{metric.value}</h3>
                  {metric.change && (
                    <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-1 rounded text-sm font-bold border border-accent/20">
                      <TrendingUp className="w-3 h-3" />
                      {metric.change}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Recent orders ── */}
          <div className="mb-12">
            <div className="flex items-center   justify-between mb-6">
              <h2 className="text-2xl font-bold font-display">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-bold text-accent hover:underline">View all</Link>
            </div>
            {orders.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
                No orders yet.
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl overflow-hidden overflow-x-auto shadow-lg">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-primary/40 text-muted text-sm border-b border-border">
                      {['Order ID','Buyer','Gig Title','Status','Amount','Date'].map(h => (
                        <th key={h} className="py-4 px-6 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-primary/20 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium">{order.id || order._id}</td>
                        <td className="py-4 px-6 text-sm font-bold text-text-primary">
                          {typeof order.buyer === 'object' ? order.buyer?.name : order.buyer}
                        </td>
                        <td className="py-4 px-6 text-sm text-muted max-w-[200px] truncate">
                          {order.gig?.title || order.gig}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold">${order.amount || order.totalPrice}</td>
                        <td className="py-4 px-6 text-sm text-muted">{order.date || order.createdAt?.slice(0,10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── My gigs (seller only) ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display">My Gigs</h2>
              {isSeller && (
                <button onClick={() => navigate('/gig/create')}
                  className="flex items-center gap-2 bg-accent text-black font-bold px-4 py-2 rounded-full text-sm hover:opacity-85 transition-opacity">
                  <Plus className="w-4 h-4" /> Create new gig
                </button>
              )}
            </div>
            {!isSeller ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
                You need a seller account to create and manage gigs.
              </div>
            ) : gigs.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
                You have no gigs yet.
                <button onClick={() => navigate('/gig/create')} className="block mx-auto mt-4 text-accent font-bold hover:underline">
                  Create your first gig →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {gigs.map((gig) => (
                  <div key={gig.id || gig._id}
                    onClick={() => navigate(`/gig/${gig.id || gig._id}`)}
                    className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-muted transition-colors cursor-pointer shadow-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{gig.title}</h4>
                      <p className="text-accent font-bold">${gig.packages?.basic?.price ?? gig.price ?? 0} starting price</p>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-muted">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-text-primary text-base">{gig.orderCount || 0}</span>
                        <span>Orders</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-text-primary text-base">{gig.reviewCount || 0}</span>
                        <span>Reviews</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}