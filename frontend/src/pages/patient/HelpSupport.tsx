import { FiPhone, FiMail, FiMessageCircle, FiInfo } from 'react-icons/fi';
import './PatientBooking.css';

const HelpSupport = () => {
    return (
        <div className="help-support-page fade-in">
            <div className="page-header">
                <h1>Help & Support</h1>
                <p>Need assistance with your booking? We're here to help.</p>
            </div>

            <div className="grid grid-2">
                <div className="card-borderless p-0">
                    <h3 className="section-label"><FiInfo className="mr-xs" /> Frequently Asked Questions</h3>
                    <div className="faq-list">
                        <div className="faq-item mb-md">
                            <strong>How long does approval take?</strong>
                            <p>Typically, appointment requests are approved within 1-2 hours during clinic working hours.</p>
                        </div>
                        <div className="faq-item mb-md">
                            <strong>Can I reschedule my appointment?</strong>
                            <p>To reschedule, please contact the clinic directly or book a new slot and cancel the previous one.</p>
                        </div>
                        <div className="faq-item">
                            <strong>What documents do I need to bring?</strong>
                            <p>Please bring a valid ID and any previous medical records relevant to your visit.</p>
                        </div>
                    </div>
                </div>

                <div className="contact-support">
                    <div className="mb-lg">
                        <h3 className="section-label"><FiMessageCircle className="mr-xs" /> Contact Us</h3>
                        <div className="contact-methods">
                            <div className="contact-item mb-md">
                                <FiPhone className="mr-sm text-primary" />
                                <span>Support: +91 98765 43210</span>
                            </div>
                            <div className="contact-item">
                                <FiMail className="mr-sm text-primary" />
                                <span>Email: support@evclinic.com</span>
                            </div>
                        </div>
                    </div>

                    <div className="card section-gradient">
                        <h3 className="mb-sm text-white">Emergency?</h3>
                        <p className="text-white mb-md">If this is a medical emergency, please call 102 or visit the nearest emergency room immediately.</p>
                        <button className="btn btn-secondary w-full" onClick={() => window.location.href = 'tel:102'}>Call Emergency</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
