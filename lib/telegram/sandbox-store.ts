// In-memory / persistent simulated Saved Messages storage for Sandbox Demo Mode

export interface SandboxMessage {
  messageId: number;
  chatId: string; // 'me' (Saved Messages)
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  dataBase64: string;
  uploadedAt: string;
}

// Global store to survive hot-reloads during session
const globalForSandbox = globalThis as unknown as {
  sandboxStore?: Map<string, SandboxMessage>;
  nextMessageId?: number;
};

if (!globalForSandbox.sandboxStore) {
  globalForSandbox.sandboxStore = new Map<string, SandboxMessage>();
  globalForSandbox.nextMessageId = 1001;
}

const store = globalForSandbox.sandboxStore;

export const SandboxTelegramStore = {
  saveMessage(
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer
  ): SandboxMessage {
    const id = globalForSandbox.nextMessageId!++;
    const message: SandboxMessage = {
      messageId: id,
      chatId: 'me',
      fileName,
      mimeType,
      fileSizeBytes: fileBuffer.length,
      dataBase64: fileBuffer.toString('base64'),
      uploadedAt: new Date().toISOString(),
    };
    store.set(String(id), message);
    return message;
  },

  getMessage(messageId: number): SandboxMessage | null {
    return store.get(String(messageId)) || null;
  },

  deleteMessage(messageId: number): boolean {
    return store.delete(String(messageId));
  },

  listMessages(): SandboxMessage[] {
    return Array.from(store.values());
  },

  clear(): void {
    store.clear();
  },
};
