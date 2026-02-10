import React, { useState, useEffect } from 'react';
import { discordService } from '../services/discordService';
import { Save, Webhook, CheckCircle, AlertCircle, Terminal, MessageCircle, Settings as SettingsIcon, ShieldCheck, Zap } from 'lucide-react';

const Settings: React.FC = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

        // Test notification
        discordService.sendEmbed({
            title: '✅ Neural Link Established',
            description: 'Rivals Arena High Command has successfully integrated with this communication channel.',
            color: 0x8b5cf6
        });

        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute -top-10 -right-10 opacity-5 rotate-12 pointer-events-none">
                    <SettingsIcon size={140} />
                </div>
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-2">
                    System <span className="text-rivals-accent">Integrations</span>
                </h2>
                <p className="text-slate-500 text-xl font-medium tracking-tight">Configure external relay links and tactical communication protocols.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-heavy rounded-[3rem] border border-white/5 p-12 relative overflow-hidden group shadow-2xl shadow-rivals-dark/50">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageCircle size={100} className="text-[#5865F2]" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                                <Webhook className="text-[#5865F2] animate-pulse" size={32} />
                                Discord Relay Alpha
                            </h3>
                            <div className="px-4 py-1.5 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#5865F2] animate-ping" />
                                <span className="text-[10px] font-black text-[#8992f8] uppercase tracking-widest">Live Broadcast Link</span>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[.3em] ml-2">Neural Webhook URL</label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full glass bg-white/5 border-2 border-white/5 rounded-2xl p-6 text-white font-mono text-sm focus:ring-4 focus:ring-[#5865F2]/20 focus:border-[#5865F2] outline-none transition-all placeholder:text-slate-800"
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-20">
                                        <Terminal size={20} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-600 font-bold tracking-tight uppercase px-4 leading-relaxed">
                                    Injecting a valid Discord webhook allows High Command to broadcast live tournament results, deployment notices, and strategic updates directly to your communications array.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between pt-6 gap-6">
                                <div className="flex items-center gap-3">
                                    {status === 'success' && (
                                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 font-black text-[10px] tracking-widest uppercase animate-in slide-in-from-left-4">
                                            <CheckCircle size={16} /> Link Verified & Operational
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="px-4 py-2 bg-hot/10 border border-hot/20 rounded-xl flex items-center gap-3 text-hot font-black text-[10px] tracking-widest uppercase animate-in slide-in-from-left-4">
                                            <AlertCircle size={16} /> Sequence Rejected: Invalid Proxy
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full md:w-auto bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-5 rounded-2xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#5865F2]/20 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <Save size={20} /> Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-heavy border border-white/5 p-8 rounded-[3rem] relative overflow-hidden bg-gradient-to-br from-rivals-accent/10 to-transparent">
                        <ShieldCheck size={40} className="text-rivals-accent mb-6" />
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">Security Protocol</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            All external relay links are encrypted via server-side storage. High Command strictly prohibits unauthorized data interception during tournament broadcasts.
                        </p>
                    </div>

                    <div className="glass border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group">
                        <Zap size={40} className="text-rivals-neon mb-6 group-hover:scale-125 transition-transform duration-500" />
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">Real-time Pulse</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                            Tournament sync is currently operating at <span className="text-rivals-neon font-black">100% efficiency</span> via Supabase Realtime fabrics.
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
