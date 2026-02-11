import React, { useState, useEffect } from 'react';
import { discordService } from '../services/discordService';
import { playerService } from '../services/playerService';
import { useAuth } from '../context/AuthContext';
import { Save, Webhook, CheckCircle, AlertCircle, Terminal, MessageCircle, Settings as SettingsIcon, ShieldCheck, Zap } from 'lucide-react';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [adminStatus, setAdminStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        setWebhookUrl(discordService.getWebhookUrl());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
            setStatus('error');
            return;
        }
        discordService.setWebhookUrl(webhookUrl);
        setStatus('success');

        discordService.sendEmbed({
            title: '✅ Connexion établie',
            description: 'Le Haut Commandement de Rivals Arena s\'est intégré avec succès à ce canal.',
            color: 0x8b5cf6
        });

        setTimeout(() => setStatus('idle'), 3000);
    };

    const handleAdminSync = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const res = await (playerService as any).upgradeToAdmin(user.id, adminCode);
        if (res.success) {
            setAdminStatus('success');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            setAdminStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12 pointer-events-none">
                    <SettingsIcon size={140} />
                </div>
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-2">
                    Configuration <span className="text-rivals-accent">Système</span>
                </h2>
                <p className="text-slate-500 text-xl font-medium tracking-tight">Gérez les liaisons externes et les protocoles tactiques.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Discord Section */}
                    <div className="glass-heavy rounded-[3rem] border border-white/5 p-12 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageCircle size={100} className="text-[#5865F2]" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                                <Webhook className="text-[#5865F2] animate-pulse" size={32} />
                                Relais Discord Alpha
                            </h3>
                            <div className="px-4 py-1.5 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#5865F2] animate-ping" />
                                <span className="text-[10px] font-black text-[#8992f8] uppercase tracking-widest">Flux en direct</span>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[.3em] ml-2">URL Webhook</label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full glass bg-white/5 border-2 border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:ring-4 focus:ring-[#5865F2]/20 focus:border-[#5865F2] outline-none transition-all"
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-20">
                                        <Terminal size={20} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 font-bold tracking-tight uppercase px-4 leading-relaxed">
                                    L'injection d'un webhook valide permet au Haut Commandement de diffuser les résultats en direct et les annonces tactiques directement sur votre serveur.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-6">
                                <div className="flex items-center gap-3">
                                    {status === 'success' && (
                                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 font-black text-[10px] tracking-widest uppercase">
                                            <CheckCircle size={16} /> Liaison Opérationnelle
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="px-4 py-2 bg-hot/10 border border-hot/20 rounded-xl flex items-center gap-3 text-hot font-black text-[10px] tracking-widest uppercase">
                                            <AlertCircle size={16} /> Séquence Rejetée
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#5865F2]/20">
                                    <Save size={20} /> Sauvegarder
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Admin Shield Section (The "Code" part) */}
                    <div className="glass-heavy border border-hot/20 rounded-[3rem] p-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-hot/5 opacity-5 animate-pulse" />
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4 mb-8">
                            <ShieldCheck className="text-hot" size={32} /> Proxy High Command
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[.3em] mb-8">
                            Entrez votre code de sécurité pour activer les privilèges d'administration.
                        </p>

                        <form onSubmit={handleAdminSync} className="flex flex-col md:flex-row gap-4">
                            <input
                                type="password"
                                value={adminCode}
                                onChange={(e) => setAdminCode(e.target.value)}
                                placeholder="CODE DE SÉCURITÉ..."
                                className="flex-1 glass bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-white font-black text-sm tracking-[.5em] focus:border-hot outline-none text-center"
                            />
                            <button type="submit" className="px-8 py-5 bg-hot hover:bg-rose-500 text-white font-black rounded-2xl text-[10px] tracking-widest uppercase transition-all shadow-xl shadow-hot/20 flex items-center justify-center gap-3">
                                <Zap size={16} /> ACTIVER L'OVERRIDE
                            </button>
                        </form>

                        {adminStatus === 'success' && <p className="mt-4 text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center">Accès autorisé. Synchronisation mentale...</p>}
                        {adminStatus === 'error' && <p className="mt-4 text-hot text-[10px] font-black uppercase tracking-widest text-center">Code invalide. Alerte de sécurité émise.</p>}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-heavy border border-white/5 p-8 rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-rivals-accent/10 to-transparent">
                        <ShieldCheck size={40} className="text-rivals-accent mb-6" />
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">Sécurité</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Tous les liens de relais externes sont chiffrés. Le Haut Commandement interdit toute interception de données.
                        </p>
                    </div>

                    <div className="glass border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group text-center">
                        <Zap size={40} className="text-rivals-neon mx-auto mb-6 group-hover:scale-125 transition-transform duration-500" />
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">Pulse Temps Réel</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                            La synchronisation opère à <span className="text-rivals-neon font-black">100% d'efficacité</span> via Supabase.
                        </p>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-rivals-neon w-[100%] shadow-[0_0_10px_#22d3ee] animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
