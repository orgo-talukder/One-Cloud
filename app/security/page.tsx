'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  Lock,
  Key,
  Server,
  AlertCircle,
  Database,
  Cpu,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Shield,
  Layers,
  FileCode,
  Bug,
  Check,
  CheckCircle,
  Info,
} from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="bg-canvas text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="w-full pt-[72px] bg-canvas flex-1">
        <div className="flex flex-col w-full">
          {/* Subtle ambient illumination accent */}
          <div className="relative w-full overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-brand-subtle opacity-30 blur-[120px] pointer-events-none" />

            {/* Header Section */}
            <section className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12 w-full">
              <div className="flex flex-col items-start gap-4 max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-xs border border-tertiary/20">
                  <ShieldCheck className="w-4 h-4 text-tertiary" />
                  <span className="tracking-wider uppercase font-semibold">
                    Security &amp; Trust Architecture
                  </span>
                </div>

                {/* Main Title & Lead */}
                <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                  Built for Privacy. Engineered for Trust.
                </h1>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  Learn how One Cloud strictly separates file metadata from raw binary storage,
                  ensuring zero custody over your personal files through direct MTProto pipes.
                </p>

                {/* Quick Spec Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary text-xs sm:text-sm font-medium transition-colors shadow-xs border border-border"
                  >
                    <FileCode className="w-4 h-4 text-primary" />
                    <span>Read Architecture Spec</span>
                  </Link>
                  <a
                    href="https://core.telegram.org/mtproto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition-colors shadow-xs border border-border"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>View MTProto Protocol Specs</span>
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Key Architectural Guarantees (3-Column Layout) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8 w-full">
            <div className="flex items-center justify-between pb-6">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                <span className="text-xs sm:text-sm text-text-secondary uppercase tracking-wider font-semibold">
                  Zero-Custody Architectural Guarantees
                </span>
              </div>
              <span className="text-xs text-text-muted">Client ↔ MTProto Pipeline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guarantee Card 1 */}
              <div className="bg-surface rounded-xl p-6 flex flex-col justify-between shadow-md group hover:bg-surface-raised transition-all border border-border">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform border border-border">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Zero-Custody File Payloads
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Your binary bytes stream directly between your browser and Telegram Saved
                    Messages via MTProto. One Cloud application servers never inspect, store, or cache
                    your actual files.
                  </p>
                </div>
                <div className="pt-4 mt-4 bg-canvas/40 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Payload Pipeline:</span>
                    <span className="text-tertiary font-mono text-[11px]">
                      Direct Browser → Telegram DC
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee Card 2 */}
              <div className="bg-surface rounded-xl p-6 flex flex-col justify-between shadow-md group hover:bg-surface-raised transition-all border border-border">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform border border-border">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Isolated Metadata Index
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Folder hierarchies, custom tags, and file names are stored in secure Firestore
                    metadata nodes protected with strict Firebase Auth security rules mapped directly
                    to authenticated UIDs.
                  </p>
                </div>
                <div className="pt-4 mt-4 bg-canvas/40 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Metadata Isolation:</span>
                    <span className="text-primary font-mono text-[11px]">
                      UID Partitioned / Rule-Locked
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee Card 3 */}
              <div className="bg-surface rounded-xl p-6 flex flex-col justify-between shadow-md group hover:bg-surface-raised transition-all border border-border">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-raised flex items-center justify-center text-file-document group-hover:scale-105 transition-transform border border-border">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Client-Side Decoupling
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Previews, thumbnails, and streaming transcodes execute entirely client-side in
                    your local browser sandbox, preventing third-party introspection or external
                    analytics exfiltration.
                  </p>
                </div>
                <div className="pt-4 mt-4 bg-canvas/40 rounded-lg p-3 border border-border/40">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Execution Sandbox:</span>
                    <span className="text-text-primary font-mono text-[11px]">
                      Local Web Workers &amp; WASM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Data Flow Diagram & Trust Comparison Bento */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Architectural Topology Visualizer (7 Columns) */}
              <div className="lg:col-span-7 bg-surface-container rounded-xl p-6 md:p-8 shadow-lg flex flex-col justify-between border border-border">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary" />
                      <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                        Live Topology: Decoupled Data Flow
                      </h2>
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      Zero Middle-Tier Storage
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                    Unlike legacy cloud storage models that pass raw payloads through central inspection
                    proxies, One Cloud splits control plane routing from the encrypted data plane.
                  </p>

                  {/* SVG Flow Graph */}
                  <div className="bg-canvas/80 rounded-lg p-6 flex flex-col items-center justify-center border border-border/50">
                    <svg
                      className="w-full h-48 max-w-xl text-text-muted"
                      fill="none"
                      viewBox="0 0 540 160"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Client Node */}
                      <rect
                        className="fill-surface stroke-border"
                        strokeWidth="1"
                        height="70"
                        rx="8"
                        width="110"
                        x="10"
                        y="45"
                      />
                      <text
                        className="fill-text-primary text-xs font-semibold"
                        textAnchor="middle"
                        x="65"
                        y="77"
                      >
                        Client Browser
                      </text>
                      <text
                        className="fill-tertiary text-[10px]"
                        textAnchor="middle"
                        x="65"
                        y="95"
                      >
                        WASM + MTProto
                      </text>

                      {/* One Cloud Meta Server */}
                      <rect
                        className="fill-surface-raised stroke-border"
                        strokeWidth="1"
                        height="60"
                        rx="8"
                        width="120"
                        x="210"
                        y="10"
                      />
                      <text
                        className="fill-text-primary text-xs font-semibold"
                        textAnchor="middle"
                        x="270"
                        y="38"
                      >
                        One Cloud Meta
                      </text>
                      <text
                        className="fill-primary text-[10px]"
                        textAnchor="middle"
                        x="270"
                        y="55"
                      >
                        Metadata Only (No Files)
                      </text>

                      {/* Telegram DC */}
                      <rect
                        className="fill-surface stroke-border"
                        strokeWidth="1"
                        height="70"
                        rx="8"
                        width="110"
                        x="420"
                        y="45"
                      />
                      <text
                        className="fill-text-primary text-xs font-semibold"
                        textAnchor="middle"
                        x="475"
                        y="77"
                      >
                        Telegram DC
                      </text>
                      <text
                        className="fill-tertiary text-[10px]"
                        textAnchor="middle"
                        x="475"
                        y="95"
                      >
                        Encrypted Payload
                      </text>

                      {/* Arrows */}
                      {/* Browser to Meta */}
                      <path
                        className="stroke-primary"
                        d="M 120 70 C 160 50, 180 40, 210 40"
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                      <text
                        className="fill-primary text-[9px]"
                        textAnchor="middle"
                        x="165"
                        y="42"
                      >
                        Metadata Sync (JSON)
                      </text>

                      {/* Browser direct to Telegram DC */}
                      <path
                        className="stroke-tertiary"
                        d="M 120 95 L 420 95"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      />
                      <polygon className="fill-tertiary" points="418,91 426,95 418,99" />
                      <text
                        className="fill-tertiary text-[10px] font-semibold"
                        textAnchor="middle"
                        x="270"
                        y="112"
                      >
                        Direct Encrypted MTProto Binary Stream (0 Custody)
                      </text>

                      {/* Blocked Path indicator */}
                      <line
                        className="stroke-danger"
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                        x1="270"
                        x2="270"
                        y1="70"
                        y2="88"
                      />
                      <circle className="fill-canvas stroke-danger" cx="270" cy="80" r="7" />
                      <text
                        className="fill-danger text-[10px] font-bold"
                        textAnchor="middle"
                        x="270"
                        y="83"
                      >
                        ×
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-tertiary" />
                    <span className="text-xs sm:text-sm text-text-secondary">
                      Files never touch One Cloud servers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-xs sm:text-sm text-text-secondary">
                      Direct MTProto handshake with DC
                    </span>
                  </div>
                </div>
              </div>

              {/* Realistic Trust Comparison (5 Columns) */}
              <div className="lg:col-span-5 bg-surface-container rounded-xl p-6 md:p-8 shadow-lg flex flex-col justify-between border border-border">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-base sm:text-lg font-semibold text-text-primary">
                      Realistic Trust Model
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                    We avoid hyperbolic claims like &ldquo;unbreakable military encryption&rdquo; or false
                    compliance certifications. Here is an honest appraisal of our technical boundaries:
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-lg bg-canvas/60 border border-border/50">
                      <div className="flex items-center gap-1.5 text-tertiary text-xs font-semibold mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>What We Strictly Guarantee</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Zero storage custody of binaries. Even under legal compulsion, One Cloud cannot
                        yield your documents because we simply do not host or proxy them.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-canvas/60 border border-border/50">
                      <div className="flex items-center gap-1.5 text-warning text-xs font-semibold mb-1">
                        <Info className="w-4 h-4" />
                        <span>Telegram Infrastructure Dependency</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Payload storage is subject to Telegram’s cloud architecture and terms. Files in
                        Saved Messages are protected by Telegram’s MTProto server-client encryption.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-between text-text-muted text-xs border-t border-border/40">
                  <span>Target Architecture</span>
                  <span className="font-mono text-text-primary">Client-Side First</span>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Security Breakdown (Structured Sections A-D) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
            <div className="mb-8">
              <span className="text-xs text-primary uppercase tracking-widest font-semibold">
                Deep-Dive Specification
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                Technical Security Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
                Transparent technical implementation details covering session tokens, transmission safety,
                tenant boundaries, and account protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section A */}
              <div className="bg-surface rounded-xl p-6 shadow-xs flex flex-col justify-between border border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted font-mono uppercase">SPEC // 01</span>
                    <span className="px-2 py-0.5 rounded bg-brand-subtle text-primary font-mono text-[11px] border border-primary/20">
                      RFC 7519 / OIDC
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border">
                      <Key className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      A. Authentication &amp; Session Handling
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    One Cloud utilizes Firebase Authentication for secure identity management and JSON
                    Web Token (JWT) exchange. Short-lived session claims are validated against strict
                    security rules on every metadata read or write.
                  </p>
                  <ul className="flex flex-col gap-2 text-text-secondary text-xs pt-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Zero Phone Passwords Stored:</strong> One
                        Cloud never asks for or stores your master Telegram phone password.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Scoped Bot API Tokens:</strong> Bot
                        tokens operate with restricted privileges limited strictly to document
                        dispatching.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Isolated Ephemeral Keys:</strong> Temporary
                        credentials expire automatically without leaving persistence footprints.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section B */}
              <div className="bg-surface rounded-xl p-6 shadow-xs flex flex-col justify-between border border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted font-mono uppercase">SPEC // 02</span>
                    <span className="px-2 py-0.5 rounded bg-brand-subtle text-primary font-mono text-[11px] border border-primary/20">
                      MTProto v2.0 / TLS 1.3
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border">
                      <Server className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      B. MTProto Transmission &amp; Data in Transit
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    All data streaming between the client browser and Telegram Data Centers relies on
                    MTProto v2.0 over TLS 1.3 tunnels, guarding against passive network eavesdropping and
                    man-in-the-middle attacks.
                  </p>
                  <ul className="flex flex-col gap-2 text-text-secondary text-xs pt-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">2,048-bit RSA Handshake:</strong> Cryptographic
                        Diffie-Hellman key exchange directly negotiated with Telegram DCs.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">SHA-256 Chunk Verification:</strong> Chunked
                        binary streams validate block integrity sequentially on client download.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">AES-256-IGE Ciphering:</strong> Telegram&apos;s
                        native data channel cipher ensures zero packet inspection in transit.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section C */}
              <div className="bg-surface rounded-xl p-6 shadow-xs flex flex-col justify-between border border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted font-mono uppercase">SPEC // 03</span>
                    <span className="px-2 py-0.5 rounded bg-brand-subtle text-primary font-mono text-[11px] border border-primary/20">
                      Hard Tenant Silos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      C. Access Control &amp; Tenant Isolation
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Multi-tenancy isolation is enforced at the database layer. No user can scan,
                    enumerate, or query metadata nodes belonging to another user.
                  </p>
                  <ul className="flex flex-col gap-2 text-text-secondary text-xs pt-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">No Cross-Account Indexing:</strong> No
                        centralized search indexing aggregates files across independent user accounts.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Row-Level Rule Enforcements:</strong> Firestore
                        security rules reject requests whose token UID does not match node owner.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Strict Zero Shared Drive Leaks:</strong> Personal
                        storage buckets remain isolated to your Telegram channel destination.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section D */}
              <div className="bg-surface rounded-xl p-6 shadow-xs flex flex-col justify-between border border-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted font-mono uppercase">SPEC // 04</span>
                    <span className="px-2 py-0.5 rounded bg-brand-subtle text-primary font-mono text-[11px] border border-primary/20">
                      Shared Responsibility
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      D. User Responsibilities &amp; Hardening
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Security in a zero-custody framework is a collaborative contract. Because we do not
                    store your binaries, safeguarding account credentials is vital.
                  </p>
                  <ul className="flex flex-col gap-2 text-text-secondary text-xs pt-1">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Telegram Two-Step Verification (2FA):</strong> Always
                        configure a secondary cloud password inside your Telegram app settings.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Active Session Auditing:</strong> Regularly
                        review Telegram → Settings → Devices to audit active bot sessions.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Local Browser Cleanliness:</strong> Keep
                        web extensions audited, as client-side tokens reside within your secure browser
                        sandbox.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Security Verification & Responsible Disclosure Card */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
            <div className="bg-surface-raised rounded-xl p-6 md:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-border">
              <div className="flex flex-col gap-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold">
                  <Bug className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Responsible Disclosure Program</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Commitment to Transparency &amp; Vulnerability Reporting
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  We welcome audits and reports from independent security researchers. If you uncover an
                  issue in our client metadata handling or protocol parsing, please report it directly
                  through our encrypted disclosure channel. We respond within 48 hours.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-canvas/70 px-3 py-1.5 rounded font-mono text-xs text-text-primary border border-border/50">
                    <span className="text-text-muted">PGP:</span>
                    <span>4B9E 7712 A860 F502 91C3</span>
                  </div>
                  <a
                    className="text-primary hover:text-brand-hover font-mono text-xs flex items-center gap-1 transition-colors"
                    href="mailto:security@onecloud.dev"
                  >
                    security@onecloud.dev
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="bg-canvas/90 p-5 rounded-xl flex flex-col gap-3 w-full lg:w-80 shrink-0 border border-border">
                <span className="text-xs text-text-muted uppercase font-semibold">
                  Researcher Guidelines
                </span>
                <div className="flex flex-col gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>No user data scraping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>Safe harbor for good-faith audits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>Coordinated disclosure timeline</span>
                  </div>
                </div>
                <Link
                  href="/help"
                  className="mt-2 inline-flex items-center justify-center w-full px-4 py-2 rounded bg-surface hover:bg-surface-hover text-text-primary text-xs font-medium transition-colors border border-border"
                >
                  View Security Hall of Fame
                </Link>
              </div>
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20 w-full">
            <div className="bg-gradient-to-br from-surface to-surface-container rounded-2xl p-8 lg:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-border">
              <div className="flex flex-col gap-2 max-w-xl">
                <span className="text-xs text-tertiary uppercase tracking-wider font-semibold">
                  Get Started with Sovereign Drive
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                  Experience privacy-first cloud storage.
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  No subscriptions, no server lock-in, and zero third-party custody over your personal
                  archive.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-3 text-text-muted text-xs">
                  <Link
                    href="/privacy"
                    className="hover:text-text-primary transition-colors underline decoration-border underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-text-primary transition-colors underline decoration-border underline-offset-4"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="hover:text-text-primary transition-colors underline decoration-border underline-offset-4"
                  >
                    Architecture Docs
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-all shadow-md gap-1"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium bg-surface-raised hover:bg-surface-hover text-text-primary transition-colors border border-border"
                >
                  <span>How It Works</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
