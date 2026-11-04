import fs from 'fs';
import path from 'path';
import { CitizenProfile, ExtractedDocument, ChatMessage } from '@/types';

interface DatabaseSchema {
  profiles: Record<string, CitizenProfile>;
  chatSessions: Record<string, ChatMessage[]>;
  documents: Record<string, ExtractedDocument[]>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'sarkari_sahayak_db.json');

// Initialize local DB directory & file
function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      profiles: {},
      chatSessions: {},
      documents: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading DB file, recreating:', error);
    const initialData: DatabaseSchema = { profiles: {}, chatSessions: {}, documents: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB file:', error);
  }
}

export const db = {
  getProfile(sessionId: string): CitizenProfile | null {
    const data = ensureDb();
    return data.profiles[sessionId] || null;
  },

  saveProfile(sessionId: string, profile: CitizenProfile): void {
    const data = ensureDb();
    data.profiles[sessionId] = profile;
    saveDb(data);
  },

  getMessages(sessionId: string): ChatMessage[] {
    const data = ensureDb();
    return data.chatSessions[sessionId] || [];
  },

  saveMessage(sessionId: string, message: ChatMessage): void {
    const data = ensureDb();
    if (!data.chatSessions[sessionId]) {
      data.chatSessions[sessionId] = [];
    }
    data.chatSessions[sessionId].push(message);
    saveDb(data);
  },

  clearSession(sessionId: string): void {
    const data = ensureDb();
    delete data.profiles[sessionId];
    delete data.chatSessions[sessionId];
    delete data.documents[sessionId];
    saveDb(data);
  },

  getDocuments(sessionId: string): ExtractedDocument[] {
    const data = ensureDb();
    return data.documents[sessionId] || [];
  },

  saveDocument(sessionId: string, doc: ExtractedDocument): void {
    const data = ensureDb();
    if (!data.documents[sessionId]) {
      data.documents[sessionId] = [];
    }
    data.documents[sessionId].push(doc);
    saveDb(data);
  }
};
