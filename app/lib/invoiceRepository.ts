import localforage from "localforage";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxRate: number; // percent e.g. 10 means 10%
};

export type Invoice = {
  id: string;
  customerId: string;
  date: string; // ISO
  dueDate: string; // ISO
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: "paid" | "unpaid";
  createdAt: string;
};

const STORE_KEY = "invoices";

export class InvoiceRepository {
  private store: LocalForage;
  constructor(namespace: string = STORE_KEY) {
    this.store = localforage.createInstance({ name: `app:${namespace}` });
  }

  private async readAllInternal(): Promise<Record<string, Invoice>> {
    return (await this.store.getItem<Record<string, Invoice>>(STORE_KEY)) || {};
  }
  private async writeAllInternal(map: Record<string, Invoice>) {
    await this.store.setItem(STORE_KEY, map);
  }

  async add(invoice: Omit<Invoice, "id" | "createdAt">): Promise<Invoice> {
    const id = crypto.randomUUID();
    const newInvoice: Invoice = { ...invoice, id, createdAt: new Date().toISOString() };
    const map = await this.readAllInternal();
    map[id] = newInvoice;
    await this.writeAllInternal(map);
    return newInvoice;
  }

  async getByCustomer(customerId: string): Promise<Invoice[]> {
    const map = await this.readAllInternal();
    return Object.values(map)
      .filter((i) => i.customerId === customerId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async all(): Promise<Invoice[]> {
    const map = await this.readAllInternal();
    return Object.values(map);
  }
}

export const invoiceRepository = new InvoiceRepository();


