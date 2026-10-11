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
  ExternalLink,
  Hash,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

interface ConnectTelegramModalProps {
  onClose: () => void;
}

export function ConnectTelegramModal({ onClose }: ConnectTelegramModalProps) {
  const {
    telegramConnected,
    telegramUsername,
    connectTelegramSuccess,
    disconnectTelegram,
  } = useDrive();

  const [step, setStep] = useState<'credentials' | 'code'>('credentials');

  // Form states
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [pendingSession, setPendingSession] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const cleanApiId = apiId.trim();
    const cleanApiHash = apiHash.trim();
    const cleanPhone = phone.trim();

    if (!cleanApiId || isNaN(Number(cleanApiId))) {
      setError('Please enter a valid numeric Telegram API ID.');
      setLoading(false);
      return;
    }

    if (!cleanApiHash) {
      setError('Please enter your Telegram API Hash.');
      setLoading(false);
      return;
    }

    if (!cleanPhone || !cleanPhone.startsWith('+')) {
      setError('Please enter your phone number with international country code (e.g. +8801XXXXXXXXX).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          apiId: cleanApiId,
          apiHash: cleanApiHash,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash || '');
        setPendingSession(data.pendingSession || '');
        setMessage(data.message || 'Telegram verification code has been dispatched.');
        setStep('code');
      } else {
        setError(data.error || 'Failed to dispatch verification code from Telegram.');
      }
    } catch {
      setError('Network error while contacting the Telegram authentication bridge.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!code.trim()) {
      setError('Please enter the verification code sent to your Telegram account.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          apiId: apiId.trim(),
          apiHash: apiHash.trim(),
          phone: phone.trim(),
          code: code.trim(),
          password: password.trim() || undefined,
          phoneCodeHash,
          pendingSession,
        }),
      });

      const data = await res.json();
      if (data.success && data.sessionToken) {
        connectTelegramSuccess(
          data.sessionToken,
          data.telegramUsername || 'TelegramUser'
        );
        onClose();
      } else {
        if (data.requires2FA) {
          setRequires2FA(true);
        }
        setError(data.error || 'Invalid verification code. Please check your Telegram app.');
      }
    } catch {
      setError('Network error during Telegram code verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shrink-0">
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
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Telegram Connected</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                Your personal Drive is actively connected to Telegram account{' '}
                <strong>@{telegramUsername}</strong>. All file uploads stream directly to your
                Saved Messages cloud chat with full custody.
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
          <div className="space-y-4">
            {/* Guide Card on how to get API ID / Hash */}
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 text-xs text-sky-950 leading-relaxed space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-sky-600" />
                  <span>Real MTProto Connection</span>
                </span>
                <a
                  href="https://my.telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 underline inline-flex items-center gap-1"
                >
                  <span>Get API Credentials</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-600">
                To connect your real Telegram, visit{' '}
                <a
                  href="https://my.telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-sky-700 underline"
                >
                  my.telegram.org
                </a>
                , sign in with your phone, click <strong>API development tools</strong>, and copy
                your <code>App api_id</code> and <code>App api_hash</code> below.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleSendCode} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram App API ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={apiId}
                      onChange={(e) => setApiId(e.target.value)}
                      placeholder="e.g. 29183742"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram App API Hash
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={apiHash}
                      onChange={(e) => setApiHash(e.target.value)}
                      placeholder="e.g. 34f8a91c8340d9b1c7..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (with international country code)
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+8801XXXXXXXXX or +1XXXXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    <span>{loading ? 'Connecting to Telegram...' : 'Request Telegram Code'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Telegram Verification Code
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">{phone}</span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. 54321"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center text-sm text-slate-900"
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Check the official Telegram notification chat in your Telegram mobile or desktop app.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2FA Cloud Password {requires2FA ? '(Required)' : '(Only if 2-Step Verification is active)'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={requires2FA ? 'Enter your 2FA Cloud Password' : 'Optional Cloud Password'}
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none text-slate-900 ${
                        requires2FA
                          ? 'border-amber-400 focus:border-amber-500 bg-amber-50/30'
                          : 'border-slate-200 focus:border-sky-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Change Phone or API Credentials
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
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
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Session tokens are encrypted on the server with AES-256-GCM.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
