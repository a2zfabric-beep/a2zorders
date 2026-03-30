# Sample Order Management System

A production-ready sample order management system built with Next.js, Supabase, and TypeScript.

## Features

- **Dashboard with Analytics**: Real-time metrics and visualizations
- **Sample Order Management**: Create, view, and manage sample orders
- **Multi-style Orders**: Support for multiple styles per order
- **File Upload**: Design files and logos with Supabase Storage
- **Order Status Tracking**: 6-stage workflow (draft → submitted → in_review → sampling_in_progress → ready → dispatched)
- **Client Management**: Track clients and their orders
- **Automation Ready**: Batch processing and email automation support

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Database**: Supabase PostgreSQL with Row Level Security
- **File Storage**: Supabase Storage
- **Deployment**: Vercel

## Project Structure

```
sample-order-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (pages)            # Application pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── orders/            # Order management components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
├── db/                    # Database schema and migrations
│   └── schema.sql         # Complete database schema
├── public/                # Static assets
└── uploads/               # Local file uploads (development)
```

## Database Schema

The system uses a comprehensive database schema with the following tables:

1. **clients** - Client information
2. **sample_orders** - Main orders table with status tracking
3. **order_styles** - Styles within each order
4. **design_files** - Design files for printed styles
5. **logos** - Logo files for garments
6. **order_files** - Order-level documents (tech packs, references)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sample-order-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials.

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL from `db/schema.sql` in the Supabase SQL editor
   - Configure Row Level Security policies as needed

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `GET /api/test-db` - Test database connection
- `GET /api/orders` - List orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order
- `POST /api/upload` - File upload endpoint

## Order Status Workflow

```
draft → submitted → in_review → sampling_in_progress → ready → dispatched
```

## Validation Rules

### Quick Order Mode
- Quantity: Required
- File Upload: Required

### Structured Order Mode
- Item Number: Required
- Style Name: Required
- Print Type: Required
- Quantity: Required (must be > 0)
- Fabric: Optional
- Color/Design: Conditional based on print type

## File Storage

- **Design Files**: PDF, JPG, PNG, AI formats
- **Logo Files**: PNG, JPG, SVG formats
- **Storage Provider**: Supabase Storage (configurable to S3/Cloudinary)

## Deployment

1. Push your code to GitHub/GitLab
2. Connect to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Development

- Use `npm run dev` for development
- Use `npm run build` for production build
- Use `npm start` for production server

## License

MIT