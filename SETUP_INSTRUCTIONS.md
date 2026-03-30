# Setup Instructions for Sample Order Management System

## Quick Start

### 1. Install Dependencies
```bash
cd H:\sample-order-app
npm install
```

### 2. Configure Supabase
1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Project Settings → API
3. Update `.env.local` with your actual credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Set Up Database
1. Go to your Supabase project SQL Editor
2. Copy the entire SQL from `db/schema.sql`
3. Run the SQL to create all tables and indexes

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Connection
Open your browser and visit:
- http://localhost:3000 - Landing page
- http://localhost:3000/api/test-db - Database test endpoint

## Troubleshooting

### Error: "Missing Supabase environment variables"
1. Make sure `.env.local` exists in the project root
2. Check that variables are spelled correctly
3. Restart the development server after changing environment variables

### Error: "Database connection failed"
1. Verify your Supabase project is active
2. Check that you have internet connectivity
3. Ensure database tables are created using the schema

### TypeScript Errors
These are expected until dependencies are installed:
```bash
npm install
```

## Next Steps After Setup

1. **Create Sample Data**: Add test clients and orders
2. **Build Frontend**: Implement dashboard and order management pages
3. **Add Authentication**: Integrate Supabase Auth
4. **File Upload**: Configure Supabase Storage for design files
5. **Deploy**: Deploy to Vercel with environment variables

## Project Structure

```
H:/sample-order-app/
├── app/                    # Next.js App Router pages
├── components/            # React components
├── lib/                   # Utilities (Supabase client)
├── db/                    # Database schema
├── public/               # Static assets
└── uploads/              # Local file uploads (dev)
```

## API Endpoints

- `GET /api/test-db` - Test database connection
- More endpoints to be added for orders, clients, etc.

## Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# TypeScript check
npx tsc --noEmit
```

## Deployment to Vercel

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Need Help?

1. Check Supabase documentation: https://supabase.com/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review the README.md file for detailed information