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
  const [qrStatusText, setQrStatusText] = useState('Waiting for scan on Telegram mobile app...');
  const [qrScanned, setQrScanned] = useState(false);
  const [qrRequires2FA, setQrRequires2FA] = useState(false);
  const [qrPassword, setQrPassword] = useState('');
  const [qrPasswordLoading, setQrPasswordLoading] = useState(false);
  const [qrShowPassword, setQrShowPassword] = useState(false);
  const qrPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stop QR polling on unmount
  const stopQrPolling = useCallback(() => {
    if (qrPollingRef.current) {
      clearInterval(qrPollingRef.current);
      qrPollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopQrPolling();
  }, [stopQrPolling]);

  // QR Code Polling Function
  const startQrPolling = useCallback((activeQrId: string) => {
    stopQrPolling();
    qrPollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/auth?action=check_qr&qrId=${activeQrId}`);
        const data = await res.json();

        if (data.status === 'scanned') {
          setQrScanned(true);
          setQrStatusText('QR Scanned! Please confirm authorization on your mobile device...');
        } else if (data.status === 'requires_password') {
          setQrScanned(true);
          setQrRequires2FA(true);
          setQrStatusText('2-Step Verification password required to finish.');
          stopQrPolling();
        } else if (data.status === 'success') {
          stopQrPolling();
          connectTelegramSuccess(
            data.sessionToken || 'qr-session-active',
            data.telegramUsername || 'TelegramUser'
          );
          setSuccessMessage('Telegram session linked successfully via QR Code!');
          setTimeout(() => {
            onClose();
          }, 800);
        } else if (data.status === 'expired') {
          stopQrPolling();
          setQrExpired(true);
          setQrStatusText('QR code expired. Click below to regenerate.');
        }
      } catch {
        // silent fail on network glitch during poll
      }
    }, 2000);
  }, [connectTelegramSuccess, onClose, stopQrPolling]);

  // Request fresh QR code
  const initQrCode = async () => {
    setQrLoading(true);
    setQrExpired(false);
    setQrScanned(false);
    setQrRequires2FA(false);
    setError(null);
    setQrStatusText('Generating live QR code...');

    try {
      const res = await fetch('/api/telegram/auth?action=init_qr');
      const data = await res.json();

      if (data.success && data.qrCodeDataUrl) {
        setQrId(data.qrId);
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setQrStatusText('Waiting for scan on Telegram mobile app...');
        startQrPolling(data.qrId);
      } else {
        setError(data.error || 'Failed to initialize QR session.');
      }
    } catch {
      setError('Network failure generating QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  // Submit 2FA password for QR flow
  const handleQrSubmit2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrId || !qrPassword.trim()) return;

    setQrPasswordLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_password',
          qrId,
          password: qrPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        connectTelegramSuccess(
          data.sessionToken || 'qr-session-active',
          data.telegramUsername || 'TelegramUser'
        );
        setSuccessMessage('Telegram connected successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(data.error || 'Invalid 2FA password. Please check and retry.');
      }
    } catch {
      setError('Network error submitting 2FA password.');
    } finally {
      setQrPasswordLoading(false);
    }
  };

  // Step 1: Send Verification Code to Phone
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please provide a valid phone number including international country code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          phoneNumber: cleanPhone,
          customApiId: customApiId ? parseInt(customApiId, 10) : undefined,
          customApiHash: customApiHash || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash);
        setPendingSession(data.sessionToken || '');
        setPhoneStep('code');
        setSuccessMessage('A verification code has been dispatched to your official Telegram app.');
      } else {
        setError(data.error || 'Could not send verification code. Please check your phone format.');
      }
    } catch {
      setError('Failed to reach Telegram gateway server. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify SMS/App Code and (if required) 2FA password
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!code.trim()) {
      setError('Please enter the verification code sent to your Telegram account.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_in',
          phoneNumber: phone.trim(),
          phoneCodeHash,
          phoneCode: code.trim(),
          password: password ? password.trim() : undefined,
          pendingSession,
          customApiId: customApiId ? parseInt(customApiId, 10) : undefined,
          customApiHash: customApiHash || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        connectTelegramSuccess(
          data.sessionToken || 'session-active',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-[520px] rounded-2xl bg-surface border border-border p-6 sm:p-7 shadow-2xl text-text-primary overflow-y-auto max-h-[90vh] transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-[#36AEEA] border border-border shrink-0">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text-primary">Connect Telegram Cloud</h3>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#36AEEA]/10 text-[#36AEEA] font-semibold border border-[#36AEEA]/20">
                MTProto 2.0
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Files are stored directly in your personal <strong>Saved Messages</strong> chat.
            </p>
          </div>
        </div>

        {/* ALREADY CONNECTED VIEW */}
        {telegramConnected ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-tertiary/30 bg-tertiary/10 p-4">
              <div className="flex items-center gap-2 text-tertiary font-semibold text-xs">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>Telegram Connected</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Your personal Drive is actively connected to Telegram account{' '}
                <strong className="text-text-primary">@{telegramUsername}</strong>. All file uploads stream directly to your
                personal Saved Messages with 100% cloud privacy.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  disconnectTelegram();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 rounded-lg transition-colors cursor-pointer"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Tabs Switcher: Phone vs QR Code */}
            <div className="flex items-center p-1 bg-surface-raised rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phone');
                  stopQrPolling();
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'phone'
                    ? 'bg-surface text-text-primary border border-border shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Smartphone className="h-4 w-4 text-[#36AEEA]" />
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-surface text-text-primary border border-border shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <QrCode className="h-4 w-4 text-[#36AEEA]" />
                <span>QR Code Scan</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="flex items-center gap-2 p-3 text-xs text-tertiary bg-tertiary/10 border border-tertiary/20 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: PHONE NUMBER LOGIN */}
            {activeTab === 'phone' && (
              <div>
                {phoneStep === 'phone' ? (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-text-primary">
                          Telegram Phone Number
                        </label>
                        <span className="text-[11px] text-text-muted">Include country prefix</span>
                      </div>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+88017XXXXXXXX or +1XXXXXXXXXX"
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-surface-raised border border-border rounded-xl focus:outline-none focus:border-focus-ring font-medium text-text-primary transition-colors"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-text-muted leading-normal">
                        Include your country code (e.g. <strong>+880</strong> for Bangladesh, <strong>+91</strong> for India, <strong>+1</strong> for US).
                      </p>
                    </div>

                    <div className="p-3 bg-brand-subtle border border-border rounded-xl text-xs text-text-secondary leading-relaxed">
                      💡 A 5-digit verification code will be sent instantly to your official Telegram app.
                    </div>

                    <div className="pt-1 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-xs font-medium text-text-secondary bg-surface-raised hover:bg-surface-hover border border-border rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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
                    <div className="p-3 rounded-xl bg-surface-raised border border-border text-xs text-text-secondary flex items-center justify-between">
                      <span className="font-medium">
                        Code sent to: <strong className="text-text-primary">{phone}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep('phone');
                          setCode('');
                          setPassword('');
                          setError(null);
                        }}
                        className="text-[#36AEEA] hover:underline font-medium text-xs cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1.5">
                        Verification Code (from Telegram App)
                      </label>
                      <input
                        type="text"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. 58392"
                        maxLength={8}
                        autoFocus
                        className="w-full px-3.5 py-2.5 text-center text-base tracking-widest font-mono font-bold border border-border rounded-xl focus:outline-none focus:border-focus-ring text-text-primary bg-surface-raised"
                      />
                      <p className="mt-1 text-[11px] text-text-muted">
                        Check your Telegram messages from &quot;Telegram Notifications&quot;.
                      </p>
                    </div>

                    {requires2FA && (
                      <div>
                        <label className="block text-xs font-medium text-text-primary mb-1.5 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-warning" />
                          <span>2-Step Verification Password (Cloud Password)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your Telegram 2FA password"
                            className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-surface-raised border border-border rounded-xl focus:outline-none focus:border-focus-ring text-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
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
                        className="px-4 py-2.5 text-xs font-medium text-text-secondary bg-surface-raised hover:bg-surface-hover border border-border rounded-xl transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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

                {/* Advanced Accordion for Developers */}
                <div className="mt-6 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
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
                    <div className="mt-3 p-3 bg-surface-raised border border-border rounded-xl space-y-3">
                      <p className="text-[11px] text-text-muted leading-normal">
                        By default, One Cloud automatically uses server-configured credentials. You only need to enter custom keys if you are self-hosting your own developer application.
                      </p>
                      <div>
                        <label className="block text-[11px] font-medium text-text-secondary mb-1">
                          App API ID
                        </label>
                        <input
                          type="text"
                          value={customApiId}
                          onChange={(e) => setCustomApiId(e.target.value)}
                          placeholder="Leave empty to use server default"
                          className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-surface font-mono text-text-primary focus:outline-none focus:border-focus-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-text-secondary mb-1">
                          App API Hash
                        </label>
                        <input
                          type="text"
                          value={customApiHash}
                          onChange={(e) => setCustomApiHash(e.target.value)}
                          placeholder="Leave empty to use server default"
                          className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-surface font-mono text-text-primary focus:outline-none focus:border-focus-ring"
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
                <div className="relative p-4 bg-surface-raised border border-border rounded-2xl shadow-xs flex items-center justify-center min-h-[250px] min-w-[250px] w-full max-w-[280px]">
                  {qrLoading ? (
                    <div className="flex flex-col items-center gap-2 text-text-muted py-8">
                      <RefreshCw className="h-7 w-7 text-[#36AEEA] animate-spin" />
                      <span className="text-xs font-medium">Generating Telegram QR code...</span>
                    </div>
                  ) : qrExpired ? (
                    <div className="flex flex-col items-center gap-3 p-4">
                      <AlertCircle className="h-8 w-8 text-warning" />
                      <span className="text-xs text-text-secondary">
                        QR Code expired. Click below to generate a new code.
                      </span>
                      <button
                        type="button"
                        onClick={initQrCode}
                        className="px-4 py-2 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl transition-colors cursor-pointer"
                      >
                        Refresh QR Code
                      </button>
                    </div>
                  ) : qrCodeDataUrl ? (
                    <div className="flex flex-col items-center w-full">
                      {/* White background card for QR readability */}
                      <div className="p-3 bg-white rounded-xl shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeDataUrl}
                          alt="Telegram QR Login"
                          className={`w-48 h-48 rounded-lg object-contain transition-opacity ${
                            qrScanned ? 'opacity-40' : 'opacity-100'
                          }`}
                        />
                      </div>
                      {qrScanned && !qrRequires2FA ? (
                        <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-[#36AEEA]/10 border border-[#36AEEA]/30 rounded-xl text-[#36AEEA] text-xs font-medium w-full">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>{qrStatusText}</span>
                        </div>
                      ) : (
                        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-text-muted font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#36AEEA] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#36AEEA]"></span>
                          </span>
                          <span>{qrStatusText}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={initQrCode}
                      className="px-4 py-2 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl cursor-pointer"
                    >
                      Generate QR Code
                    </button>
                  )}
                </div>

                {/* 2FA Password Prompt */}
                {qrRequires2FA && (
                  <form onSubmit={handleQrSubmit2FA} className="w-full text-left p-4 bg-warning/10 border border-warning/30 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-warning font-semibold text-xs">
                      <Lock className="h-4 w-4" />
                      <span>2-Step Verification Password Required</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      Your mobile device confirmed the link! Enter your Telegram 2FA cloud password below to complete linking.
                    </p>
                    <div className="relative">
                      <input
                        type={qrShowPassword ? 'text' : 'password'}
                        required
                        value={qrPassword}
                        onChange={(e) => setQrPassword(e.target.value)}
                        placeholder="Enter your Telegram 2FA password"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:border-focus-ring font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setQrShowPassword(!qrShowPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                      >
                        {qrShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={qrPasswordLoading}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {qrPasswordLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Verifying Password...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Complete Connection</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 3 Step Instruction Guide */}
                <div className="w-full text-left bg-surface-raised border border-border rounded-xl p-3.5 space-y-2 text-xs text-text-secondary">
                  <div className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-[#36AEEA]" />
                    <span>How to scan and login:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-text-muted leading-normal pl-1">
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
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-medium px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${qrLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-text-secondary bg-surface-raised hover:bg-surface-hover border border-border rounded-xl transition-colors cursor-pointer"
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
