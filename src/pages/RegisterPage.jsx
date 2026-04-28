import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, KeyRound, User, ShieldCheck } from 'lucide-react';
import apiClient, { setAuthToken, setAuthUser } from '../services/apiClient';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Validación local
    if (form.password !== form.password_confirmation) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.post('/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      const token = data.token || data.access_token;
      const user = data.user || data.data;

      if (token) {
        setAuthToken(token);
        if (user) setAuthUser(user);
        navigate('/');
      } else {
        // Si la API no devuelve token tras registrar, mandamos al login
        navigate('/login');
      }
    } catch (err) {
      if (err.response) {
        const resData = err.response.data;
        if (err.response.status === 422 && resData.errors) {
          // Mapear errores de validación de Laravel
          setFieldErrors(resData.errors);
          setError(resData.message || 'Revisá los campos marcados.');
        } else {
          setError(resData.message || resData.error || `Error del servidor (${err.response.status})`);
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full bg-black border ${fieldErrors[fieldName] ? 'border-red-800' : 'border-[#1a1a1a]'} rounded-none px-4 py-3.5 text-sm text-white font-mono placeholder-[#333] focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mt-10 mb-10">
          <h1 className="text-5xl text-white tracking-tighter uppercase font-black italic font-display">
            UNDER<span className="text-accent">PASS</span>
          </h1>
          <p className="text-[#555] text-[11px] font-mono uppercase tracking-[0.3em] mt-3">
            Barcelona Underground Electronic Scene
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#050505] border border-[#1f1f1f] p-8 relative overflow-hidden">

          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"></div>

          <h2 className="text-white font-display font-bold uppercase text-lg tracking-widest mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] animate-pulse"></span>
            Crear Cuenta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-[15px] text-[#555] font-mono uppercase tracking-[0.2em] mb-2 group-focus-within:text-accent transition-colors">
                <User size={12} className="text-accent" />
                <span className="text-accent/60">{'>'}</span> nombre
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="tu nombre"
                required
                className={inputClass('name')}
              />
              {fieldErrors.name && (
                <p className="text-red-400 text-[10px] font-mono mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-[15px] text-[#555] font-mono uppercase tracking-[0.2em] mb-2 group-focus-within:text-accent transition-colors">
                <Mail size={12} className="text-accent" />
                <span className="text-accent/60">{'>'}</span> email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className={inputClass('email')}
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-[10px] font-mono mt-1">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-[15px] text-[#555] font-mono uppercase tracking-[0.2em] mb-2 group-focus-within:text-accent transition-colors">
                <KeyRound size={12} className="text-accent" />
                <span className="text-accent/60">{'>'}</span> password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="mínimo 8 caracteres"
                  required
                  className={`${inputClass('password')} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-[10px] font-mono mt-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="flex items-center gap-2 text-[15px] text-[#555] font-mono uppercase tracking-[0.2em] mb-2 group-focus-within:text-accent transition-colors">
                <ShieldCheck size={12} className="text-accent" />
                <span className="text-accent/60">{'>'}</span> confirmar password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="repetí tu contraseña"
                required
                className={inputClass('password_confirmation')}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/50 border border-red-900 px-4 py-3 text-red-400 font-mono text-xs tracking-wide">
                ⚠ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black italic uppercase text-sm tracking-widest py-3.5 transition-all duration-300 shadow-neon hover:shadow-[0_0_25px_rgba(139,92,246,0.7)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  CREANDO CUENTA...
                </>
              ) : (
                'REGISTRARSE'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
            <p className="text-[#555] text-[11px] font-mono uppercase tracking-widest">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-accent hover:text-white transition-colors">
                INICIÁ SESIÓN
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[#333] text-[10px] font-mono text-center mt-6 mb-10 uppercase tracking-widest">
          © 2026 UNDERPASS — ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
