import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctor.service';
import Modal from '../../components/Modal';
import './Dashboard.css';
import './Orders.css';

const Orders = () => {
    const { patients } = useApp() as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await doctorService.getOrders();
                setOrders(res.data || []);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const tabs = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'lab', label: 'Laboratory', count: orders.filter(o => o.type === 'Laboratory').length },
        { id: 'radiology', label: 'Radiology', count: orders.filter(o => o.type === 'Radiology').length },
        { id: 'pharmacy', label: 'Prescriptions', count: orders.filter(o => o.type === 'Pharmacy').length }
    ];

    const filteredOrders = orders.filter(order =>
        order.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (activeTab === 'all' || order.type?.toLowerCase() === activeTab)
    );

    return (
        <div className="doctor-dashboard">
            {/* Page Header */}
            <div className="orders-page-header">
                <div>
                    <h1 className="orders-title">Medical Orders</h1>
                    <p className="orders-subtitle">Manage lab tests, radiology scans, and prescriptions</p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={() => setIsNewOrderOpen(true)}>
                    <FiPlus />
                    <span>New Order</span>
                </button>
            </div>

            {/* Search and Filter Card */}
            <div className="orders-filter-card">
                <div className="search-box-full">
                    <FiSearch className="search-icon-small" />
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-minimal"
                    />
                </div>

                <div className="filter-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Grid */}
            <div className="orders-grid">
                {loading ? (
                    <div className="p-20 text-center">Loading orders...</div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div key={order.id} className="order-card-modern">
                            <div className="order-card-header">
                                <div className="order-patient-section">
                                    <h3 className="order-patient-name">{order.patientName}</h3>
                                    <p className="order-meta">{order.id} • {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`order-type-badge ${order.type.toLowerCase()}`}>
                                    {order.type}
                                </span>
                            </div>

                            <div className="order-details-section">
                                <div className="order-detail-row">
                                    <span className="order-label">Details:</span>
                                    <span className="order-value">{order.details}</span>
                                </div>
                                <div className="order-detail-row">
                                    <span className="order-label">Status:</span>
                                    <span className="order-value">{order.status}</span>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <span className={`status-badge-order ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                                <button className="btn-view-order">
                                    <FiEye />
                                    View
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state-orders">
                        <div className="empty-icon-large">
                            <FiSearch />
                        </div>
                        <h3>No orders found</h3>
                        <p>No orders match your search criteria</p>
                    </div>
                )}
            </div>

            {/* New Order Modal */}
            <Modal
                isOpen={isNewOrderOpen}
                onClose={() => setIsNewOrderOpen(false)}
                title="Create New Order"
                size="lg"
            >
                <form className="order-form-modal" onSubmit={(e) => { e.preventDefault(); setIsNewOrderOpen(false); }}>
                    <div className="form-group">
                        <label>Select Patient *</label>
                        <select required>
                            <option value="">Choose patient...</option>
                            {(patients as any[]).map((patient: any) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name} (P-{patient.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Order Type *</label>
                        <select required>
                            <option value="">Select type...</option>
                            <option value="lab">Laboratory Test</option>
                            <option value="radiology">Radiology Scan</option>
                            <option value="prescription">Prescription</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Tests/Items *</label>
                        <textarea rows={3} placeholder="Enter tests or items (e.g., CBC, Blood Sugar)" required></textarea>
                    </div>

                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Priority</label>
                            <select>
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                                <option value="stat">STAT</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Order Date</label>
                            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Clinical Notes</label>
                        <textarea rows={3} placeholder="Additional instructions or notes..."></textarea>
                    </div>

                    <div className="modal-actions-refined">
                        <button type="button" className="btn-cancel" onClick={() => setIsNewOrderOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            <FiPlus />
                            Create Order
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Orders;
