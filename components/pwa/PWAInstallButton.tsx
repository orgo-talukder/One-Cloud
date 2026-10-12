'use client';



interface PWAInstallButtonProps {
  variant?: 'button' | 'badge' | 'sidebar' | 'banner';
  className?: string;
}

export function PWAInstallButton(_props?: PWAInstallButtonProps) {
  // Completely removed per user request: no install button, no modal popup
  return null;
}

