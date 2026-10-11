'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  Smartphone,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

interface ConnectTelegramModalProps {
  onClose: () => void;
}

export function ConnectTelegramModal({ onClose }: ConnectTelegramModalProps) {
  const {
    telegramConnected,
    telegramUsername,
    isSandboxTelegram,
    connectTelegramSuccess,
    disconnectTelegram,
  } = useDrive();

  const [activeTab, setActiveTab] = useState<'sandbox' | 'live'>('sandbox');
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');

  // Form states
  const [phone, setPhone] = useState('+1234567890');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [code, setCode] = useState('12345');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          phone,
          apiId: activeTab === 'live' ? apiId : undefined,
          apiHash: activeTab === 'live' ? apiHash : undefined,
          isSandbox: activeTab === 'sandbox',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash || '');
        setMessage(data.message || 'Verification code sent.');
        setStep('code');
      } else {
        setError(data.error || 'Failed to dispatch verification code.');
      }
    } catch {
      setError('Network error while contacting authentication bridge.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          phone,
          code,
          password: password || undefined,
          phoneCodeHash,
          isSandbox: activeTab === 'sandbox',
        }),
      });

      const data = await res.json();
      if (data.success && data.sessionToken) {
        connectTelegramSuccess(
          data.sessionToken,
          data.telegramUsername || (activeTab === 'sandbox' ? 'OneCloudDemo' : 'TelegramUser'),
          data.isSandbox !== false
        );
        onClose();
      } else {
        setError(data.error || 'Invalid verification code.');
      }
    } catch {
      setError('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Connect Telegram Cloud</h3>
            <p className="text-xs text-slate-500">
              Files are stored directly in your personal <strong>Saved Messages</strong> chat.
            </p>
          </div>
        </div>

        {/* If already connected */}
        {telegramConnected ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Currently Connected</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                Your Drive is active in{' '}
                <strong>{isSandboxTelegram ? 'Sandbox Demo Mode' : `@${telegramUsername}`}</strong>.
                All uploads go straight to your Saved Messages cloud chat.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  disconnectTelegram();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('sandbox');
                  setStep('credentials');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'sandbox'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Sandbox Demo (Instant)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('live');
                  setStep('credentials');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'live'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="h-3.5 w-3.5 text-sky-500" />
                <span>Live Telegram Account</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs text-sky-800 bg-sky-50 border border-sky-200 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleSendCode} className="space-y-3.5">
                {activeTab === 'sandbox' ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
                    <p className="font-semibold flex items-center gap-1.5 text-amber-950">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>Ready-to-use testing environment</span>
                    </p>
                    <p className="mt-1">
                      Sandbox mode simulates your Telegram Saved Messages chat with real byte
                      transfers, accurate storage counts, previews, and instant downloads without
                      requiring an SMS login.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">One Cloud Official Client</p>
                          <p className="text-[11px] text-slate-500">
                            Connected via secure Telegram MTProto Bridge
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        Ready
                      </span>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (with international code)
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    <span>{loading ? 'Sending Code...' : 'Request Code'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram Verification Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. 12345"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center text-sm"
                    />
                  </div>
                  {activeTab === 'sandbox' && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      (In sandbox mode, default code <code>12345</code> is accepted automatically)
                    </p>
                  )}
                </div>

                {activeTab === 'live' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2FA Password (Only if 2-Step Verification is active)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Optional Cloud Password"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Back
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      <span>{loading ? 'Verifying...' : 'Complete Connection'}</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Session tokens are encrypted with AES-256-GCM and never shared.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
