import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, ArrowRight, Swords, Zap, Lock, Globe, Terminal, Mail, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Login: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                if (!username) {
                    showToast('Un pseudonyme est requis pour l\'enrôlement', 'error');
                    setLoading(false);
                    return;
                }
                const { error, data } = await (signUp(email, password, username) as any);
                if (error) {
                    showToast(error.message, 'error');
                } else if (data?.session) {
                    showToast('Enrôlement réussi ! Lien neural établi.', 'success');
                    navigate('/');
                } else {
                    showToast('Enrôlement initié ! Vérifiez vos emails pour confirmer le lien.', 'success');
                    setIsSignUp(false);
                }
            } else {
                const { error } = await signIn(email, password);
                if (error) {
                    let msg = 'Accès Refusé : Identifiants invalides';
                    if (error.message?.includes('Email not confirmed')) {
                        msg = 'Lien neural non confirmé. Vérifiez vos emails.';
                    }
                    showToast(msg, 'error');
                } else {
                    showToast('Bon retour, Commandant', 'success');
                    navigate('/');
                }
            }
        } catch (err) {
            showToast('Lien neural rompu. Réessayez.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rivals-darker flex items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-rivals-accent/10 blur-[150px] rounded-full animate-float pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-rivals-neon/5 blur-[150px] rounded-full animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
                <div className="text-center mb-12">
                    <div className="relative inline-block group mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-rivals-accent to-rivals-neon rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)] rotate-3 group-hover:rotate-12 transition-transform duration-700 relative z-20">
                            <Swords size={40} className="text-white" />
                        </div>
                        <div className="absolute -inset-4 bg-rivals-accent/20 blur-2xl rounded-full animate-pulse z-10" />
                    </div>

                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2">
                        Rivals<span className="text-rivals-neon">Arena</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black tracking-[0.5em] uppercase">Portail de Déploiement Tactique</p>
                </div>

                <div className="glass-heavy border border-white/5 rounded-[3.5rem] p-10 md:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rivals-neon/50 to-transparent" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(false)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isSignUp ? 'bg-rivals-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Connexion
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSignUp(true)}
                                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isSignUp ? 'bg-rivals-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                S'enrôler
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isSignUp && (
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-white font-bold text-sm focus:ring-4 focus:ring-rivals-accent/20 focus:border-rivals-accent outline-none transition-all placeholder:text-slate-700"
                                        placeholder="Indicatif Tactique (Pseudo)"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-white font-bold text-sm focus:ring-4 focus:ring-rivals-accent/20 focus:border-rivals-accent outline-none transition-all placeholder:text-slate-700"
                                    placeholder="ID Neural (Email)"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full glass bg-white/5 border border-white/10 rounded-2xl p-5 pl-14 text-white font-bold text-sm focus:ring-4 focus:ring-rivals-accent/20 focus:border-rivals-accent outline-none transition-all placeholder:text-slate-700"
                                    placeholder="Clé de Sécurité (Mot de passe)"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rivals-accent hover:bg-violet-500 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-rivals-accent/20 border border-white/10 mt-6 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    {isSignUp ? <Zap size={18} /> : <Lock size={18} />}
                                    {isSignUp ? 'Finaliser l\'enrôlement' : 'Initialiser la Session'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-4 text-slate-500 italic">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed">
                            {isSignUp
                                ? "En vous enrôlant, vous acceptez les Règles d'Engagement de l'Arène. Votre lien neural sera sécurisé par cryptage de grade militaire."
                                : "Clé de sécurité perdue ? Contactez le Haut Commandement pour les protocoles de secours."}
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center text-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Rivals Arena © 2024 • Conçu pour l'Élite</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
