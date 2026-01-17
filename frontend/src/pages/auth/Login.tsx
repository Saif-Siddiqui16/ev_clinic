import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiShield, FiClock, FiCheck } from 'react-icons/fi';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);

    const { login, showCaptcha, lockoutUntil, failedAttempts } = useAuth() as any;
    const navigate = useNavigate();

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('ev_remembered_email');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (lockoutUntil && lockoutUntil > Date.now()) {
            setLockoutTime(lockoutUntil);
            const interval = setInterval(() => {
                if (lockoutUntil <= Date.now()) {
                    setLockoutTime(null);
                    clearInterval(interval);
                } else {
                    setLockoutTime(lockoutUntil);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [lockoutUntil]);

    const getRemainingLockoutTime = () => {
        if (!lockoutTime) return '';
        const remaining = Math.max(0, lockoutTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')} `;
    };

    const performLogin = async (targetEmail: string, targetPassword: string, targetCaptcha: string) => {
        setError('');
        setIsLoading(true);

        try {
            const result = await login(targetEmail, targetPassword, targetCaptcha);

            if (result.success) {
                if (rememberMe) {
                    localStorage.setItem('ev_remembered_email', targetEmail);
                } else {
                    localStorage.removeItem('ev_remembered_email');
                }

                const user = result.user;
                if (!user.roles.includes('SUPER_ADMIN') && user.clinics && user.clinics.length > 1) {
                    navigate('/select-clinic');
                } else {
                    const primaryRole = user.roles[0];
                    const paths: Record<string, string> = {
                        SUPER_ADMIN: '/super-admin',
                        ADMIN: '/clinic-admin',
                        RECEPTIONIST: '/reception',
                        DOCTOR: '/doctor',
                        PATIENT: '/patient'
                    };
                    navigate(paths[primaryRole] || '/');
                }
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('Unable to connect to service. Try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        performLogin(email, password, captcha);
    };


    const isLocked = !!(lockoutTime && lockoutTime > Date.now());

    return (
        <div className="login-container">
            <div className="login-layout-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <div className="brand-icon-wrapper mb-md">
                            <img src="/sidebar-logo.jpg" alt="Exclusive Vision Logo" className="brand-icon-img-login" />
                        </div>
                        <h1 className="login-title">Exclusive Vision</h1>
                        <h2 className="login-subtitle">Hospital Information System</h2>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                <FiAlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {isLocked && (
                            <div className="lockout-message">
                                <FiClock size={18} />
                                <div>
                                    <strong>Account Locked</strong>
                                    <p>Too many failed attempts. Try again in {getRemainingLockoutTime()}</p>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Work Email *</label>
                            <div className="input-with-icon">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@ev.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLocked}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Security Password *</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLocked}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {showCaptcha && (
                            <div className="form-group captcha-group">
                                <label htmlFor="captcha">Security Verification *</label>
                                <div className="captcha-box">
                                    <div className="captcha-challenge">
                                        <span className="captcha-text">1234</span>
                                        <small>Enter the code above</small>
                                    </div>
                                    <input
                                        type="text"
                                        id="captcha"
                                        placeholder="Enter code"
                                        value={captcha}
                                        onChange={(e) => setCaptcha(e.target.value)}
                                        disabled={isLocked}
                                        required
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLocked}
                                />
                                <span>Remember credentials</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-full ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading || isLocked}
                        >
                            {isLoading ? 'Accessing...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>

                {/* Demo Credentials Side Panel */}
                <div className="demo-access-container side-panel">
                    <div className="demo-credentials">
                        <div className="demo-header">
                            <h2 className="demo-title">Demo Access</h2>
                            <p className="demo-subtitle">Select a role to instantly populate credentials and explore the system.</p>
                        </div>

                        <div className="demo-table-wrapper">
                            <table className="demo-table">
                                <thead>
                                    <tr>
                                        <th>Role / User</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr onClick={() => performLogin('superadmin@ev.com', 'admin123', '1234')}>
                                        <td>
                                            <span className="role-name">Super Admin</span>
                                            <span className="role-email">superadmin@ev.com</span>
                                        </td>
                                        <td>
                                            <button className="btn-table-login">Magic Login</button>
                                        </td>
                                    </tr>
                                    <tr onClick={() => performLogin('admin@husri.com', 'admin123', '1234')}>
                                        <td>
                                            <span className="role-name">Clinic Admin</span>
                                            <span className="role-email">admin@husri.com</span>
                                        </td>
                                        <td>
                                            <button className="btn-table-login">Magic Login</button>
                                        </td>
                                    </tr>
                                    <tr onClick={() => performLogin('doctor@husri.com', 'doctor123', '1234')}>
                                        <td>
                                            <span className="role-name">Specialist Doctor</span>
                                            <span className="role-email">doctor@husri.com</span>
                                        </td>
                                        <td>
                                            <button className="btn-table-login">Magic Login</button>
                                        </td>
                                    </tr>
                                    <tr onClick={() => performLogin('reception@husri.com', 'reception123', '1234')}>
                                        <td>
                                            <span className="role-name">Reception / Admission</span>
                                            <span className="role-email">reception@husri.com</span>
                                        </td>
                                        <td>
                                            <button className="btn-table-login">Magic Login</button>
                                        </td>
                                    </tr>
                                    <tr onClick={() => performLogin('patient@ev.com', 'patient123', '1234')}>
                                        <td>
                                            <span className="role-name">Patient User</span>
                                            <span className="role-email">patient@ev.com</span>
                                        </td>
                                        <td>
                                            <button className="btn-table-login">Magic Login</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="demo-passwords">
                            <FiShield className="pass-icon" />
                            <span>Demo Passwords: <code>admin123</code> | <code>doctor123</code> | <code>reception123</code></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
