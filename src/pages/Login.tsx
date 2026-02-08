import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ArrowRight, Swords } from 'lucide-react';

const Login: React.FC = () => {
    const { loginAsAdmin, loginAsPlayer } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'select' | 'admin' | 'player'>('select');
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'admin') {
            const success = loginAsAdmin(inputValue);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid Admin PIN');
            }
        } else {
            if (inputValue.trim().length < 3) {
                setError('Username must be at least 3 characters');
                return;
            }
            loginAsPlayer(inputValue.trim());
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-in zoom-in-95 duration-300">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-rivals-accent to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/20 mx-auto mb-4">
                        <Swords size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to Rivals Arena</h1>
                    <p className="text-slate-500 text-sm">Tournament Management System</p>
                </div>

                {mode === 'select' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setMode('player')}
                            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                    <User size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white group-hover:text-cyan-400">Player Access</p>
                                    <p className="text-xs text-slate-500">Join tournaments & view stats</p>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                        </button>

                        <button
                            onClick={() => setMode('admin')}
                            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/50 p-4 rounded-xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <Shield size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white group-hover:text-red-400">Admin Access</p>
                                    <p className="text-xs text-slate-500">Manage system & events</p>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                )}

                {mode !== 'select' && (
                    <form onSubmit={handleSubmit} className="animate-in slide-in-from-right-4">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                {mode === 'admin' ? 'Security PIN' : 'Roblox Username'}
                            </label>
                            <input
                                type={mode === 'admin' ? 'password' : 'text'}
                                autoFocus
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-700"
                                placeholder={mode === 'admin' ? '••••' : 'e.g. xSlayer_99'}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                maxLength={mode === 'admin' ? 4 : 20}
                            />
                            {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><Shield size={12} /> {error}</p>}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setMode('select'); setInputValue(''); setError(''); }}
                                className="px-4 py-3 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 font-bold py-3 rounded-lg transition-all shadow-lg text-white
                            ${mode === 'admin'
                                        ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                        : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20'
                                    }`}
                            >
                                {mode === 'admin' ? 'Unlock Dashboard' : 'Enter Arena'}
                            </button>
                        </div>
                    </form>
                )}

            </div>

            <p className="absolute bottom-8 text-slate-600 text-xs">
                Rivals Arena Tournament Manager v1.0
            </p>
        </div>
    );
};

export default Login;
