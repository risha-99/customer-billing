# Customer Billing System

A modern, full-featured customer management and invoice billing application built with Next.js, React, and TypeScript. This application demonstrates advanced client-side data management using IndexedDB, complex form validation with Zod, and a complete customer billing workflow.

## 🌟 Features

### Customer Management
- **Multi-step Customer Creation**: 3-step form with validation
  - Personal Information (name, email, phone)
  - Address Information (billing/shipping with copy option)
  - Review & Submit step
- **Advanced Validation**: Cross-field validation and async email duplicate checking
- **Customer Directory**: Professional table view with search and status indicators
- **Repository Pattern**: Clean data access layer with IndexedDB persistence

### Invoice Management
- **Dynamic Invoice Creation**: Real-time calculation of totals
- **Item Management**: Add/remove items with automatic tax calculation
- **Customer Selection**: Dropdown integration with customer database
- **Invoice History**: View all invoices for selected customers
- **Status Tracking**: Paid/Unpaid status with visual indicators

### Technical Features
- **IndexedDB Storage**: Client-side persistence using localforage
- **Form Validation**: Zod schemas with React Hook Form integration
- **Real-time Updates**: Live calculation and form validation
- **Repository Pattern**: Clean separation of data access logic
- **Modern UI**: Card-based design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **UI Library**: React 19+ with React Hook Form
- **Styling**: Tailwind CSS 4
- **Data Storage**: IndexedDB via localforage
- **Validation**: Zod schemas with @hookform/resolvers
- **State Management**: React hooks and form state
- **Design System**: Custom card-based UI components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Application Structure

### Pages
- **`/`** - Customer Management (Create customers, view directory)
- **`/invoice`** - Invoice Management (Create invoices, view history)

### Key Components
- **`CustomerForm`** - Multi-step customer creation with validation
- **`CustomerList`** - Professional customer directory table
- **`InvoiceForm`** - Dynamic invoice creation with real-time totals
- **`Header`** - Navigation between modules

### Data Models
- **Customer**: Personal info, billing/shipping addresses
- **Invoice**: Customer reference, items, totals, status
- **InvoiceItem**: Description, quantity, price, tax rate

## 🔧 Architecture

### Repository Pattern
```typescript
// Clean data access layer
customerRepository.add(customer)
customerRepository.getAll()
customerRepository.findByEmail(email)

invoiceRepository.add(invoice)
invoiceRepository.getByCustomer(customerId)
```

### Validation Schemas
```typescript
// Zod schemas with cross-field validation
personalInfoSchema.refine(emailOrPhoneRequired)
customerFormSchema.transform(addressCopying)
invoiceInputSchema.array(itemValidation)
```

### Form Management
```typescript
// React Hook Form with Zod resolver
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onChange" // Real-time validation
})
```

## 📋 Usage Guide

### Creating Customers
1. Navigate to the Customer Management page
2. Fill out the 3-step form:
   - **Step 1**: Enter name and contact information
   - **Step 2**: Add billing and shipping addresses
   - **Step 3**: Review and submit
3. View created customers in the directory below

### Creating Invoices
1. Navigate to the Invoice Module
2. Select a customer from the dropdown
3. Set invoice and due dates
4. Add invoice items:
   - Enter description, price, quantity
   - Select tax rate (0%, 5%, 10%, 18%, 25%)
   - View real-time totals
5. Review summary and create invoice
6. View invoice history for the selected customer

## 🎨 Design Features

### Modern Card-Based UI
- Clean, professional design language
- Consistent spacing and typography
- Responsive layouts for mobile/desktop
- Interactive hover states and transitions

### Visual Feedback
- Real-time form validation with error messages
- Loading states with spinner animations
- Color-coded status indicators
- Progress tracking in multi-step forms

### User Experience
- Intuitive navigation between modules
- Helpful placeholder text and tooltips
- Empty states with guidance
- Keyboard and mouse interaction support

## 🔍 Technical Implementation

### Data Persistence
- **IndexedDB**: Browser-native storage for offline capability
- **localforage**: Simplified IndexedDB API with fallbacks
- **Repository Pattern**: Abstract data access with clean interfaces

### Form Validation
- **Cross-field Rules**: Email or phone required validation
- **Async Validation**: Real-time email duplicate checking
- **Type Safety**: Full TypeScript integration with Zod

### State Management
- **React Hook Form**: Efficient form state management
- **Real-time Updates**: onChange mode for immediate feedback
- **Optimistic Updates**: Instant UI updates with persistence

## 📦 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── CustomerForm.tsx # Multi-step customer creation
│   ├── CustomerList.tsx # Customer directory table
│   └── Header.tsx       # Navigation header
├── lib/                 # Business logic and utilities
│   ├── customerRepository.ts    # Customer data access
│   ├── invoiceRepository.ts     # Invoice data access
│   ├── schemas.ts              # Customer validation schemas
│   └── invoiceSchemas.ts       # Invoice validation schemas
├── invoice/            # Invoice module pages
│   └── page.tsx       # Invoice creation and management
├── globals.css        # Global styles and Tailwind imports
├── layout.tsx         # Root layout with header
└── page.tsx          # Customer management homepage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy on Vercel
The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with automatic builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Forms powered by [React Hook Form](https://react-hook-form.com/)
- Validation with [Zod](https://zod.dev/)
- Storage via [localforage](https://localforage.github.io/localForage/)