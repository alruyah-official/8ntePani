import { useState } from 'react';
import { User, Lock, Bell, CreditCard, Trash2, Camera, Save, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px 60px' }}>

            {/* Header */}
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, color: '#fafafa', marginBottom: 8 }}>Settings</h1>
            <p style={{ color: '#555', fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans,sans-serif' }}>Manage your account preferences and profile information.</p>

            <div style={{ display: 'flex', gap: 24 }}>

                {/* Sidebar tabs */}
                <div style={{ width: 200, flexShrink: 0 }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '11px 14px', borderRadius: 10, border: 'none',
                                    background: active ? 'rgba(200,241,53,0.1)' : 'transparent',
                                    color: active ? '#C8F135' : '#888',
                                    fontSize: 14, fontWeight: active ? 700 : 400,
                                    fontFamily: 'DM Sans,sans-serif', cursor: 'pointer',
                                    marginBottom: 4, textAlign: 'left',
                                    borderLeft: active ? '3px solid #C8F135' : '3px solid transparent',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}

                    {/* Danger zone */}
                    <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #1e1e1e' }}>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '11px 14px', borderRadius: 10, border: 'none',
                            background: 'transparent', color: '#f87171',
                            fontSize: 14, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer',
                            textAlign: 'left', transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Trash2 size={16} /> Delete Account
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
                    {activeTab === 'password' && <PasswordTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                    {activeTab === 'billing' && <BillingTab />}
                </div>
            </div>
        </div>
    );
}

// ── Profile Tab ───────────────────────────────────────────
function ProfileTab({ user, updateUser }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || '',
        country: user?.country || '',
    });
    const [saving, setSaving] = useState(false);

    function handleChange(key, val) {
        setForm(f => ({ ...f, [key]: val }));
    }

    async function handleSave() {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800)); // simulate API
        updateUser(form);
        toast.success('Profile updated!');
        setSaving(false);
    }

    return (
        <div style={card}>
            <h2 style={cardTitle}>Profile Information</h2>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111&color=C8F135&size=80`}
                        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #222' }}
                        alt="avatar"
                    />
                    <button style={{
                        position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
                        background: '#C8F135', border: '2px solid #0a0a0a', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                        <Camera size={13} color="#000" />
                    </button>
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fafafa' }}>{user?.name}</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>@{user?.username}</div>
                    <div style={{ fontSize: 11, color: '#C8F135', marginTop: 6, background: 'rgba(200,241,53,0.1)', padding: '2px 10px', borderRadius: 999, display: 'inline-block' }}>
                        {user?.sellerLevel?.toUpperCase()} SELLER
                    </div>
                </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[
                    { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
                    { key: 'username', label: 'Username', placeholder: 'your_username' },
                    { key: 'email', label: 'Email', placeholder: 'you@email.com' },
                    { key: 'country', label: 'Country', placeholder: 'e.g. India' },
                ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label style={labelStyle}>{label}</label>
                        <input value={form[key]} onChange={e => handleChange(key, e.target.value)}
                            placeholder={placeholder} style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#C8F135'}
                            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                        />
                    </div>
                ))}
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Bio</label>
                <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)}
                    placeholder="Tell buyers about yourself..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = '#C8F135'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                <div style={{ fontSize: 11, color: '#555', textAlign: 'right', marginTop: 4 }}>{form.bio.length}/600</div>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveBtn(saving)}>
                {saving ? 'Saving...' : (<><Save size={15} style={{ display: 'inline', marginRight: 6 }} /> Save Changes</>)}
            </button>
        </div>
    );
}

// ── Password Tab ──────────────────────────────────────────
function PasswordTab() {
    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (!form.current) { toast.error('Enter your current password'); return; }
        if (form.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        if (form.newPass !== form.confirm) { toast.error('Passwords do not match'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        toast.success('Password updated!');
        setForm({ current: '', newPass: '', confirm: '' });
        setSaving(false);
    }

    return (
        <div style={card}>
            <h2 style={cardTitle}>Change Password</h2>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>Use a strong password with at least 8 characters.</p>
            {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPass', label: 'New Password' },
                { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={show[key] ? 'text' : 'password'}
                            value={form[key]}
                            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ ...inputStyle, paddingRight: 44 }}
                            onFocus={e => e.target.style.borderColor = '#C8F135'}
                            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                        />
                        <button onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                            {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={handleSave} disabled={saving} style={{ ...saveBtn(saving), marginTop: 8 }}>
                {saving ? 'Updating...' : 'Update Password'}
            </button>
        </div>
    );
}

// ── Notifications Tab ─────────────────────────────────────
function NotificationsTab() {
    const [prefs, setPrefs] = useState({
        newOrder: true,
        orderUpdate: true,
        newMessage: true,
        newReview: true,
        promotions: false,
        weeklyDigest: false,
    });

    const items = [
        { key: 'newOrder', label: 'New order received', desc: 'When a buyer places an order on your gig' },
        { key: 'orderUpdate', label: 'Order status updates', desc: 'When your order status changes' },
        { key: 'newMessage', label: 'New messages', desc: 'When you receive a new message' },
        { key: 'newReview', label: 'New reviews', desc: 'When a buyer leaves you a review' },
        { key: 'promotions', label: 'Promotions & offers', desc: 'Special deals and platform news' },
        { key: 'weeklyDigest', label: 'Weekly digest email', desc: 'A weekly summary of your activity' },
    ];

    return (
        <div style={card}>
            <h2 style={cardTitle}>Notification Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map(item => (
                    <div key={item.key} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 0', borderBottom: '1px solid #1a1a1a',
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fafafa' }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{item.desc}</div>
                        </div>
                        {/* Toggle switch */}
                        <div onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                            style={{
                                width: 44, height: 24, borderRadius: 999, cursor: 'pointer',
                                background: prefs[item.key] ? '#C8F135' : '#2a2a2a',
                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                            }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%', background: '#000',
                                position: 'absolute', top: 3,
                                left: prefs[item.key] ? 22 : 3,
                                transition: 'left 0.2s',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => toast.success('Notification preferences saved!')} style={{ ...saveBtn(false), marginTop: 24 }}>
                <Check size={15} style={{ display: 'inline', marginRight: 6 }} /> Save Preferences
            </button>
        </div>
    );
}

// ── Billing Tab ───────────────────────────────────────────
function BillingTab() {
    return (
        <div style={card}>
            <h2 style={cardTitle}>Billing & Payments</h2>

            {/* Balance */}
            <div style={{ background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Available Balance</div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: '#C8F135' }}>$0.00</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Pending: $0.00</div>
                <button style={{ marginTop: 16, background: '#C8F135', color: '#000', border: 'none', borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Withdraw Funds
                </button>
            </div>

            {/* Payment method */}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fafafa', marginBottom: 12 }}>Payment Method</h3>
            <div style={{ background: '#161616', border: '1px dashed #2a2a2a', borderRadius: 12, padding: 24, textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 24 }}>
                No payment method added yet.<br />
                <button style={{ marginTop: 12, background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 999, padding: '8px 20px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8F135'; e.currentTarget.style.color = '#C8F135'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888'; }}
                >
                    + Add Payment Method
                </button>
            </div>

            {/* Transaction history */}
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fafafa', marginBottom: 12 }}>Transaction History</h3>
            <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24, textAlign: 'center', color: '#555', fontSize: 14 }}>
                No transactions yet. Complete your first order to see earnings here.
            </div>
        </div>
    );
}

// ── Shared styles ─────────────────────────────────────────
const card = {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 28,
};

const cardTitle = {
    fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20,
    color: '#fafafa', marginBottom: 24,
};

const labelStyle = {
    display: 'block', fontSize: 12, color: '#666',
    fontWeight: 600, letterSpacing: '0.05em',
    marginBottom: 7, fontFamily: 'DM Sans,sans-serif',
};

const inputStyle = {
    width: '100%', background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 10, color: '#fafafa', fontSize: 14,
    padding: '10px 14px', fontFamily: 'DM Sans,sans-serif',
    outline: 'none', transition: 'border-color 0.2s',
};

const saveBtn = (loading) => ({
    display: 'inline-flex', alignItems: 'center',
    background: loading ? '#333' : '#C8F135',
    color: loading ? '#888' : '#000',
    border: 'none', borderRadius: 999,
    padding: '10px 24px', fontSize: 14, fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s',
});