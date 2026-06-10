import { AsyncLocalStorage } from "async_hooks";

interface TenantStore {
  companyId?: number;
}

/**
 * Contexto por requisição (multi-tenant).
 *
 * Uma requisição HTTP autenticada roda dentro deste storage com o companyId do
 * usuário. Os hooks do Sequelize (ver src/database/index.ts) leem esse valor e
 * filtram/preenchem `companyId` automaticamente.
 *
 * Fluxos sem contexto (jobs, webhooks, sockets, seeds, migrations) retornam
 * `undefined` — os hooks viram no-op, preservando o comportamento atual. A
 * isolação desses fluxos virá a partir do canal/conexão (companyId do recurso).
 */
const storage = new AsyncLocalStorage<TenantStore>();

export const tenantStorage = storage;

export const runWithTenant = (
  store: TenantStore,
  callback: () => void
): void => {
  storage.run(store, callback);
};

export const getTenantId = (): number | undefined =>
  storage.getStore()?.companyId;

export const setTenantId = (companyId: number): void => {
  const store = storage.getStore();
  if (store) {
    store.companyId = companyId;
  }
};
