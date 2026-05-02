import { useEffect, useRef } from 'react';
import { db, initializeDatabase } from '@/infrastructure/database/db';

/**
 * Hook que garante que o IndexedDB foi inicializado no cliente antes de operações
 * Resolve race conditions entre SSR e operações de leitura/escrita no IndexedDB
 */
export function useInitializeDatabase() {
  const initRef = useRef<Promise<typeof db> | null>(null);

  useEffect(() => {
    // Garantir que o banco é inicializado apenas uma vez
    if (!initRef.current) {
      initRef.current = initializeDatabase().catch((error) => {
        console.error('Failed to initialize database in hook:', error);
        throw error;
      });
    }
  }, []);

  return {
    /**
     * Aguarda a inicialização do banco e garante que está pronto
     */
    ensureInitialized: async () => {
      if (!initRef.current) {
        initRef.current = initializeDatabase();
      }
      return initRef.current;
    },
  };
}
