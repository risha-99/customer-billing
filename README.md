# Customer Billing System

A customer management and invoicing application built with Next.js, TypeScript, and IndexedDB for client-side storage.

## Features

**Customer Management**
- Multi-step customer creation form with validation
- Personal info, billing/shipping addresses
- Email duplicate checking
- Customer directory with search

**Invoice Management** 
- Create invoices with dynamic item management
- Real-time tax and total calculations
- Invoice history per customer
- Paid/unpaid status tracking

**Technical**
- IndexedDB storage via localforage
- Form validation with Zod + React Hook Form
- Repository pattern for data access
- Modern card-based UI with Tailwind CSS

## Tech Stack

- Next.js 15 with TypeScript
- React Hook Form + Zod validation
- IndexedDB (localforage)
- Tailwind CSS

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

**Creating Customers**
1. Go to Customer Management
2. Complete the 3-step form (personal info → addresses → review)
3. View customers in the directory below

**Creating Invoices**
1. Go to Invoice Module
2. Select customer and set dates
3. Add items with descriptions, prices, quantities, and tax rates
4. Review totals and create invoice

## Project Structure

```
app/
├── components/
│   ├── CustomerForm.tsx    # Multi-step customer form
│   ├── CustomerList.tsx    # Customer directory
│   └── Header.tsx          # Navigation
├── lib/
│   ├── customerRepository.ts
│   ├── invoiceRepository.ts
│   ├── schemas.ts
│   └── invoiceSchemas.ts
├── invoice/
│   └── page.tsx            # Invoice management
└── page.tsx                # Customer management
```

## Key Implementation Details

The app uses a repository pattern to abstract IndexedDB operations:

```typescript
// Customer operations
customerRepository.add(customer)
customerRepository.getAll()
customerRepository.findByEmail(email)

// Invoice operations  
invoiceRepository.add(invoice)
invoiceRepository.getByCustomer(customerId)
```

Forms use Zod schemas with React Hook Form for validation, including cross-field rules and async email checking.

## License

MIT