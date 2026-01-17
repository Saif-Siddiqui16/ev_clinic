import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEye, FiCheckCircle, FiChevronRight, FiFileText } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctor.service';
import Modal from '../../components/Modal';
import './Dashboard.css';
import './Assessments.css';

const Assessments = () => {
    const { patients, formTemplates, selectedClinic } = useApp() as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
    const [assessmentStep, setAssessmentStep] = useState(1);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(false);

    // Selection state
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Show all available templates
    const clinicTemplates = formTemplates;


    const fetchAssessments = async (patientId?: number) => {
        setLoading(true);
        try {
            if (patientId) {
                // Fetch specific patient's assessments
                const res: any = await doctorService.getHistory(patientId);
                setAssessments(res.data || []);
            } else {
                // Fetch all assessments for the doctor
                const res: any = await doctorService.getAllAssessments();
                setAssessments(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch assessments:', error);
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load all assessments on mount
        fetchAssessments();

        // Handle incoming state (from Dashboard or Patients list)
        const state = (window as any).history.state?.usr;
        if (state?.patientId) {
            setSelectedPatientId(state.patientId.toString());
            fetchAssessments(Number(state.patientId));
            if (state.openNew) {
                setIsNewAssessmentOpen(true);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedPatientId) {
            fetchAssessments(Number(selectedPatientId));
        } else {
            fetchAssessments(); // Fetch all when no patient selected
        }
    }, [selectedPatientId]);

    const handleStartAssessment = async (templateId: number) => {
        setLoadingTemplate(true);
        setValidationErrors({});
        try {
            // Fetch full template details with parsed fields
            const res: any = await doctorService.getTemplateById(templateId);
            const template = res.data;

            setSelectedTemplateId(templateId);
            setSelectedTemplate(template);
            setAssessmentStep(2);

            // Initialize form data
            const initialData: Record<string, any> = {};
            template.fields.forEach((f: any) => {
                initialData[f.id] = f.type === 'checkbox' ? [] : '';
            });
            setFormData(initialData);
        } catch (error) {
            console.error('Failed to fetch template:', error);
            alert('Failed to load assessment template. Please try again.');
        } finally {
            setLoadingTemplate(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        selectedTemplate.fields.forEach((field: any) => {
            if (field.required) {
                const value = formData[field.id];
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    errors[field.id] = `${field.label} is required`;
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                formId: selectedTemplateId,
                patientId: Number(selectedPatientId),
                answers: formData
            };

            const response: any = await doctorService.submitAssessment(payload);

            if (response.success) {
                alert('Assessment submitted successfully!');
                setIsNewAssessmentOpen(false);
                resetForm();
                // Refresh assessments list
                fetchAssessments(Number(selectedPatientId));
            }
        } catch (error: any) {
            console.error('Failed to submit assessment:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save assessment. Please try again.';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAssessmentStep(1);
        setSelectedPatientId('');
        setSelectedTemplateId(null);
        setSelectedTemplate(null);
        setFormData({});
        setValidationErrors({});
    };

    const filteredAssessments = assessments.filter(assessment =>
        assessment.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="doctor-dashboard">
            <div className="assessments-header">
                <div>
                    <h1 className="assessments-title">Assessments</h1>
                    <p className="assessments-subtitle">Create and manage patient assessments</p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={() => setIsNewAssessmentOpen(true)}>
                    <FiPlus />
                    <span>New Assessment</span>
                </button>
            </div>

            <div className="assessments-search-card">
                <div className="search-stats-row">
                    <div className="search-box-left">
                        <FiSearch className="search-icon-small" />
                        <input
                            type="text"
                            placeholder="Search by patient name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-minimal"
                        />
                    </div>
                </div>
            </div>

            <div className="assessments-grid">
                {loading ? <p>Loading assessments...</p> :
                    filteredAssessments.length > 0 ? (
                        filteredAssessments.map(assessment => (
                            <div key={assessment.id} className="assessment-card">
                                <div className="assessment-header-row">
                                    <div className="assessment-patient-info">
                                        <h3 className="assessment-patient-name">{assessment.patient?.name || assessment.patientName}</h3>
                                        <p className="assessment-date">
                                            {new Date(assessment.visitDate || assessment.date).toLocaleString()} • {assessment.type}
                                        </p>
                                    </div>
                                    <span className="status-badge completed">
                                        <FiCheckCircle size={14} />
                                        {assessment.status || 'Completed'}
                                    </span>
                                </div>

                                <div className="assessment-actions">
                                    <button className="action-btn-icon" title="View"><FiEye /></button>
                                    <button className="action-btn-icon" title="Report"><FiFileText /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-assessments">
                            <h3>No assessments found</h3>
                        </div>
                    )}
            </div>

            <Modal
                isOpen={isNewAssessmentOpen}
                onClose={() => { setIsNewAssessmentOpen(false); resetForm(); }}
                title="New Clinical Assessment"
                size="lg"
            >
                {assessmentStep === 1 ? (
                    <div className="assessment-init">
                        <div className="form-group mb-lg">
                            <label>1. Select Patient *</label>
                            <select
                                required
                                value={selectedPatientId}
                                onChange={e => setSelectedPatientId(e.target.value)}
                            >
                                <option value="">Choose patient...</option>
                                {(patients as any[]).map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name} (P-{p.id})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mb-lg">
                            <label>2. Choose Assessment Template *</label>
                            {loadingTemplate ? (
                                <p className="text-center mt-md">Loading template...</p>
                            ) : clinicTemplates.length === 0 ? (
                                <p className="text-center mt-md" style={{ color: '#EF4444' }}>
                                    No published templates available. Please contact your clinic admin to create assessment forms.
                                </p>
                            ) : (
                                <select
                                    required
                                    value={selectedTemplateId || ''}
                                    onChange={(e) => {
                                        const templateId = Number(e.target.value);
                                        if (templateId) {
                                            handleStartAssessment(templateId);
                                        }
                                    }}
                                    disabled={!selectedPatientId || loadingTemplate}
                                >
                                    <option value="">Choose Assessment Template...</option>
                                    {clinicTemplates.map((template: any) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} - {template.specialty || 'General'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                ) : (
                    <form className="dynamic-assessment-form" onSubmit={handleSubmit}>
                        <div className="dynamic-fields-scroll mt-lg">
                            {selectedTemplate?.fields.map((field: any) => (
                                <div key={field.id} className="form-group">
                                    <label>
                                        {field.label}
                                        {field.required && <span className="text-danger">*</span>}
                                    </label>

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            rows={3}
                                            placeholder={field.placeholder || ''}
                                            value={formData[field.id] || ''}
                                            onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className={validationErrors[field.id] ? 'error' : ''}
                                        />
                                    ) : field.type === 'dropdown' ? (
                                        <select
                                            required={field.required}
                                            value={formData[field.id] || ''}
                                            onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className={validationErrors[field.id] ? 'error' : ''}
                                        >
                                            <option value="">Select...</option>
                                            {field.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'checkbox' ? (
                                        <div className="checkbox-group">
                                            {field.options?.map((opt: string) => (
                                                <label key={opt} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={(formData[field.id] || []).includes(opt)}
                                                        onChange={e => {
                                                            const current = formData[field.id] || [];
                                                            const updated = e.target.checked
                                                                ? [...current, opt]
                                                                : current.filter((val: string) => val !== opt);
                                                            setFormData({ ...formData, [field.id]: updated });
                                                        }}
                                                    />
                                                    <span>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder || ''}
                                            value={formData[field.id] || ''}
                                            onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                                            className={validationErrors[field.id] ? 'error' : ''}
                                        />
                                    )}

                                    {validationErrors[field.id] && (
                                        <p className="error-message">{validationErrors[field.id]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions mt-xl">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setAssessmentStep(1)}
                                disabled={submitting}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Assessment'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Assessments;
