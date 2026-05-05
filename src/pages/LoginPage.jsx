import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, KeyRound } from 'lucide-react';
import apiClient, { setAuthToken, setAuthUser } from '../services/apiClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post('/login', {
        email: form.email,
        password: form.password,
      });

      const token = data.token || data.access_token;
      const user = data.user || data.data;

      if (token) {
        setAuthToken(token);
        if (user) setAuthUser(user);
        navigate('/events');
      } else {
        setError('Respuesta inesperada del servidor. No se recibió token.');
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error;
        if (err.response.status === 401 || err.response.status === 422) {
          setError(msg || 'Credenciales incorrectas.');
        } else {
          setError(msg || `Error del servidor (${err.response.status})`);
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mt-10 mb-10">
          <h1 className="text-5xl text-white tracking-tighter uppercase font-black italic font-display">
            UNDER<span className="text-accent">PASS</span>
          </h1>
          <p className="text-[#555] text-[11px] font-mono uppercase tracking-[0.3em] mt-3">
            Barcelona Underground Electronic Scene
          </p>
        </div>

        <div className="bg-[#050505] border border-[#1f1f1f] p-8 relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"></div>

          <h2 className="text-white font-display font-bold uppercase text-lg tracking-widest mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] animate-pulse"></span>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

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
                className="w-full bg-black border border-[#1a1a1a] rounded-none px-4 py-3.5 text-sm text-white font-mono placeholder-[#333] focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
              />
            </div>

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
                  placeholder="••••••••"
                  required
                  className="w-full bg-black border border-[#1a1a1a] rounded-none px-4 py-3.5 pr-12 text-sm text-white font-mono placeholder-[#333] focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 px-4 py-3 text-red-400 font-mono text-xs tracking-wide">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black italic uppercase text-sm tracking-widest py-3.5 transition-all duration-300 shadow-neon hover:shadow-[0_0_25px_rgba(139,92,246,0.7)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  CONECTANDO...
                </>
              ) : (
                'ENTRAR'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
            <p className="text-[#555] text-[11px] font-mono uppercase tracking-widest">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-accent hover:text-white transition-colors">
                REGISTRATE
              </Link>
            </p>
          </div>
        </div>

        <p className="text-[#333] text-[10px] font-mono text-center mt-6 uppercase tracking-widest">
          © 2026 UNDERPASS — ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
