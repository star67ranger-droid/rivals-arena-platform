import React, { useState, useEffect } from 'react';
import { discordService } from '../services/discordService';
import { Save, Webhook, CheckCircle, AlertCircle } from 'lucide-react';

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
            title: '✅ Webhook Connected',
            description: 'Rivals Arena is now connected to this channel.',
            color: 0x22c55e
        });

        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Settings</h2>
                <p className="text-slate-400">Configure your tournament platform integrations.</p>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Webhook className="text-[#5865F2]" />
                    Discord Integration
                </h3>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Webhook URL
                        </label>
                        <input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-[#5865F2] focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Paste a Discord Webhook URL to receive live tournament updates (Match results, New tournaments, etc.).
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                            {status === 'success' && (
                                <span className="text-green-400 flex items-center gap-1 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                                    <CheckCircle size={16} /> Saved & Tested
                                </span>
                            )}
                            {status === 'error' && (
                                <span className="text-red-400 flex items-center gap-1 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                                    <AlertCircle size={16} /> Invalid Discord Webhook URL
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#5865F2]/20"
                        >
                            <Save size={18} />
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
