'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  QrCode,
  Lock,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Settings2,
  Check,
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

  // Active tab: 'phone' or 'qr'
  const [activeTab, setActiveTab] = useState<'phone' | 'qr'>('phone');

  // Phone flow state
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [pendingSession, setPendingSession] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);

  // Optional custom credentials (advanced)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customApiId, setCustomApiId] = useState('');
  const [customApiHash, setCustomApiHash] = useState('');

  // QR flow state
  const [qrId, setQrId] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);
  const qrPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ----------------------------------------------------
  // QR CODE FLOW
  // ----------------------------------------------------
  const stopQrPolling = useCallback(() => {
    if (qrPollingRef.current) {
      clearInterval(qrPollingRef.current);
      qrPollingRef.current = null;
    }
  }, []);

  const initQrCode = useCallback(async () => {
    stopQrPolling();
    setQrLoading(true);
    setQrExpired(false);
    setError(null);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'qr_init' }),
      });
      const data = await res.json();

      if (data.success && data.qrId && data.qrCodeDataUrl) {
        setQrId(data.qrId);
        setQrCodeDataUrl(data.qrCodeDataUrl);
      } else {
        setError(data.error || 'Failed to generate Telegram QR code. Try Phone Login.');
      }
    } catch {
      setError('Network error while connecting to Telegram bridge.');
    } finally {
      setQrLoading(false);
    }
  }, [stopQrPolling]);

  // Start polling when qrId is available
  useEffect(() => {
    if (activeTab !== 'qr' || !qrId || qrExpired) {
      stopQrPolling();
      return;
    }

    const pollStatus = async () => {
      try {
        const res = await fetch('/api/telegram/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'qr_status', qrId }),
        });
        const data = await res.json();

        if (data.success && data.authorized && data.sessionToken) {
          stopQrPolling();
          connectTelegramSuccess(
            data.sessionToken,
            data.telegramUsername || 'TelegramUser'
          );
          setSuccessMessage('Telegram connected successfully via QR code!');
          setTimeout(() => {
            onClose();
          }, 1200);
        } else if (!data.success) {
          if (data.error && data.error.includes('expired')) {
            setQrExpired(true);
            stopQrPolling();
          }
        }
      } catch {
        // Ignore background polling transient network errors
      }
    };

    qrPollingRef.current = setInterval(pollStatus, 2500);

    return () => {
      stopQrPolling();
    };
  }, [activeTab, qrId, qrExpired, stopQrPolling, connectTelegramSuccess, onClose]);


  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      stopQrPolling();
    };
  }, [stopQrPolling]);

  // ----------------------------------------------------
  // PHONE NUMBER FLOW
  // ----------------------------------------------------
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your phone number with country code (e.g. +8801XXXXXXXXX).');
      setLoading(false);
      return;
    }

    if (!cleanPhone.startsWith('+')) {
      setError('Please include your international country code starting with + (e.g. +88017... or +1...).');
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        action: 'send_code',
        phone: cleanPhone,
      };
      if (customApiId.trim()) payload.apiId = customApiId.trim();
      if (customApiHash.trim()) payload.apiHash = customApiHash.trim();

      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash || '');
        setPendingSession(data.pendingSession || '');
        setSuccessMessage(data.message || 'Verification code sent to your Telegram app.');
        setPhoneStep('code');
      } else {
        setError(data.error || 'Failed to dispatch verification code from Telegram.');
      }
    } catch {
      setError('Network error while requesting verification code.');
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
      const payload: Record<string, unknown> = {
        action: 'verify_code',
        phone: phone.trim(),
        code: code.trim(),
        password: password.trim() || undefined,
        phoneCodeHash,
        pendingSession,
      };
      if (customApiId.trim()) payload.apiId = customApiId.trim();
      if (customApiHash.trim()) payload.apiHash = customApiHash.trim();

      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.sessionToken) {
        connectTelegramSuccess(
          data.sessionToken,
          data.telegramUsername || 'TelegramUser'
        );
        setSuccessMessage('Telegram connected successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
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

        {/* ALREADY CONNECTED VIEW */}
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
                personal Saved Messages with 100% cloud privacy.
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
          <div className="space-y-5">
            {/* Tabs Switcher: Phone vs QR Code */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phone');
                  stopQrPolling();
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'phone'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-4 w-4 text-sky-600" />
                <span>Phone Number</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('qr');
                  setError(null);
                  setSuccessMessage(null);
                  if (!qrCodeDataUrl && !qrLoading) {
                    initQrCode();
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'qr'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="h-4 w-4 text-sky-600" />
                <span>QR Code Scan</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: PHONE NUMBER LOGIN */}
            {activeTab === 'phone' && (
              <div>
                {phoneStep === 'phone' ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Telegram Phone Number
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+88017XXXXXXXX or +1XXXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-slate-900"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500 leading-normal">
                        Include your country code (e.g. <strong>+880</strong> for Bangladesh, <strong>+91</strong> for India, <strong>+1</strong> for US).
                      </p>
                    </div>

                    <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-[11px] text-sky-900 leading-relaxed">
                      💡 A 5-digit verification code will be sent instantly to your official Telegram app.
                    </div>

                    <div className="pt-1 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-colors disabled:opacity-50 active:scale-[0.99]"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Sending Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Step 2: Code & 2FA */
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span className="font-medium">
                        Code sent to: <strong className="text-slate-900">{phone}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep('phone');
                          setCode('');
                          setPassword('');
                          setError(null);
                        }}
                        className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] underline"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Verification Code (from Telegram App)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="e.g. 58392"
                          maxLength={8}
                          autoFocus
                          className="w-full px-3.5 py-2.5 text-center text-base tracking-widest font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 bg-slate-50/50"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Check your Telegram messages from &quot;Telegram Notifications&quot;.
                      </p>
                    </div>

                    {requires2FA && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          <span>2-Step Verification Password (Cloud Password)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your Telegram 2FA password"
                            className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep('phone');
                          setCode('');
                          setPassword('');
                          setError(null);
                        }}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-2xs transition-colors disabled:opacity-50 active:scale-[0.99]"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Connect Drive</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Advanced Accordion for Developers (Optional) */}
                <div className="mt-6 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>Custom Telegram API Credentials (Optional)</span>
                    {showAdvanced ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <p className="text-[11px] text-slate-500 leading-normal">
                        By default, One Cloud automatically uses server-configured credentials. You only need to enter custom keys if you are self-hosting your own developer application.
                      </p>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          App API ID
                        </label>
                        <input
                          type="text"
                          value={customApiId}
                          onChange={(e) => setCustomApiId(e.target.value)}
                          placeholder="Leave empty to use server default"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          App API Hash
                        </label>
                        <input
                          type="text"
                          value={customApiHash}
                          onChange={(e) => setCustomApiHash(e.target.value)}
                          placeholder="Leave empty to use server default"
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: QR CODE LOGIN */}
            {activeTab === 'qr' && (
              <div className="flex flex-col items-center py-2 space-y-4 text-center">
                <div className="relative p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center min-h-[250px] min-w-[250px]">
                  {qrLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <RefreshCw className="h-7 w-7 text-sky-600 animate-spin" />
                      <span className="text-xs font-medium">Generating Telegram QR code...</span>
                    </div>
                  ) : qrExpired ? (
                    <div className="flex flex-col items-center gap-3 p-4">
                      <AlertCircle className="h-8 w-8 text-amber-500" />
                      <span className="text-xs text-slate-600">
                        QR Code expired. Click below to generate a new code.
                      </span>
                      <button
                        type="button"
                        onClick={initQrCode}
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        Refresh QR Code
                      </button>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <div className="flex flex-col items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeDataUrl}
                        alt="Telegram QR Login"
                        className="w-56 h-56 rounded-lg object-contain"
                      />
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        <span>Waiting for scan on Telegram mobile app...</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={initQrCode}
                      className="px-4 py-2 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-xl"
                    >
                      Generate QR Code
                    </button>
                  )}
                </div>

                {/* 3 Step Instruction Guide */}
                <div className="w-full text-left bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-sky-600" />
                    <span>How to scan and login:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-normal pl-1">
                    <li>Open <strong>Telegram</strong> on your phone</li>
                    <li>
                      Go to <strong>Settings</strong> ➔ <strong>Devices</strong> ➔ <strong>Link Desktop Device</strong>
                    </li>
                    <li>Point your phone camera at this QR code to login</li>
                  </ol>
                </div>

                <div className="flex items-center justify-between w-full pt-1">
                  <button
                    type="button"
                    onClick={initQrCode}
                    disabled={qrLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${qrLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
