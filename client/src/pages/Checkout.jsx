import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Clock, RefreshCw, Check } from 'lucide-react';
import { useGigById } from '../hooks/useGigs';
import { useCreateOrder } from '../hooks/useOrders';
import toast from 'react-hot-toast';

export default function Checkout() {
    const { gigId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const packageType = searchParams.get('package') || 'basic';

    const { data: gigData } = useGigById(gigId);
    const createOrder = useCreateOrder();

    const [requirements, setRequirements] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const gig = gigData?.data || MOCK_GIG;
    const pkg = gig?.packages?.[packageType] || {};

    async function handlePlaceOrder() {
        if (!requirements.trim()) {
            toast.error('Please describe your requirements');
            return;
        }
        if (!agreed) {
            toast.error('Please agree to the terms');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await createOrder.mutateAsync({
                gigId, packageType, requirements,
            });
            toast.success('Order placed successfully!');
            navigate(`/orders`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: '80px auto 40px', padding: '0 24px' }}>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fafafa', marginBottom: 28 }}>Checkout</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

                {/* Left: Requirements */}
                <div>
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: 24, marginBottom: 16 }}>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fafafa', marginBottom: 6 }}>Tell the seller what you need</h3>
                        <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>The more detail you provide, the better the results.</p>
                        <textarea value={requirements} onChange={e => setRequirements(e.target.value)}
                            placeholder="Describe your project requirements, style preferences, examples you like..."
                            rows={6}
                            style={{
                                width: '100%', background: '#161616', border: '1px solid #2a2a2a',
                                borderRadius: 10, color: '#fafafa', fontSize: 14, padding: 14,
                                fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'vertical',
                                lineHeight: 1.6,
                            }}
                        />
                        <div style={{ fontSize: 11, color: '#555', marginTop: 6, textAlign: 'right' }}>{requirements.length}/1000</div>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: 16 }}>
                        {[
                            { icon: Shield, text: 'Secure payment' },
                            { icon: RefreshCw, text: `${pkg.revisions || 1} revisions included` },
                            { icon: Clock, text: `Delivered in ${pkg.deliveryDays || 3} days` },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                                <Icon size={14} color="#C8F135" /> {text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Order summary */}
                <div>
                    <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: 24, position: 'sticky', top: 80 }}>
                        <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: '#fafafa', marginBottom: 16 }}>Order Summary</h3>

                        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 16, lineHeight: 1.5 }}>{gig?.title}</div>

                        <div style={{ background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: '#C8F135', fontWeight: 700, marginBottom: 8 }}>
                                {packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package
                            </div>
                            {[
                                [`Delivery`, `${pkg.deliveryDays || 3} days`],
                                [`Revisions`, `${pkg.revisions || 1}`],
                            ].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginBottom: 4 }}>
                                    <span>{k}</span><span>{v}</span>
                                </div>
                            ))}
                            {(pkg.features || []).map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888', marginTop: 4 }}>
                                    <Check size={11} color="#C8F135" /> {f}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 15, color: '#fafafa', fontWeight: 600 }}>Total</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: '#C8F135', fontFamily: 'Syne,sans-serif' }}>${pkg.price || 0}</span>
                        </div>

                        {/* Terms checkbox */}
                        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 16 }}>
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                                style={{ marginTop: 2, accentColor: '#C8F135' }} />
                            <span style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                                I agree to the Terms of Service and understand that payment is held in escrow until I accept the delivery.
                            </span>
                        </label>

                        <button onClick={handlePlaceOrder} disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 999, border: 'none',
                                background: isSubmitting ? '#333' : '#C8F135',
                                color: isSubmitting ? '#888' : '#000',
                                fontSize: 15, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontFamily: 'Syne,sans-serif', transition: 'all 0.2s',
                            }}>
                            {isSubmitting ? 'Placing order...' : 'Confirm & Pay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MOCK_GIG = {
    title: 'Build a full-stack React web application',
    packages: {
        basic: { price: 50, deliveryDays: 3, revisions: 1, features: ['1 page', 'Mobile responsive'] },
        standard: { price: 150, deliveryDays: 5, revisions: 3, features: ['5 pages', 'Mobile responsive', 'SEO setup'] },
        premium: { price: 300, deliveryDays: 10, revisions: 5, features: ['Unlimited pages', 'Mobile responsive', 'SEO', 'Auth system'] },
    },
};