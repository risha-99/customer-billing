import localforage from "localforage";

export type CustomerId = string;

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Customer = {
  id: CustomerId;
  name: string;
  email?: string;
  phone?: string;
  billingAddress: Address;
  shippingAddress: Address;
  createdAt: string;
};

const STORE_KEY = "customers";

// Repository Pattern encapsulating persistence and retrieval logic
export class CustomerRepository {
  private store: LocalForage;

  constructor(namespace: string = STORE_KEY) {
    this.store = localforage.createInstance({ name: `app:${namespace}` });
  }

  private async readAllInternal(): Promise<Record<CustomerId, Customer>> {
    const existing = (await this.store.getItem<Record<CustomerId, Customer>>(STORE_KEY)) || {};
    return existing;
  }

  private async writeAllInternal(map: Record<CustomerId, Customer>): Promise<void> {
    await this.store.setItem(STORE_KEY, map);
  }

  async getAll(): Promise<Customer[]> {
    debugger;
    const map = await this.readAllInternal();
    return Object.values(map).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async findByEmail(email: string): Promise<Customer | undefined> {
    const all = await this.getAll();
    return all.find((c) => (c.email || "").toLowerCase() === email.toLowerCase());
  }

  async add(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const id = crypto.randomUUID();
    const newCustomer: Customer = { ...customer, id, createdAt: new Date().toISOString() };
    const map = await this.readAllInternal();
    map[id] = newCustomer;
    await this.writeAllInternal(map);
    return newCustomer;
  }

  async clear(): Promise<void> {
    await this.writeAllInternal({});
  }
}

export const customerRepository = new CustomerRepository();


