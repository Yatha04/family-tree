# Family Tree

A modern, free family tree application built with Next.js, React, and Supabase. Create, collaborate, and discover your family connections with our private, no-cost family tree platform.

## Features

- 🌳 **Build Your Tree** - Create your family tree in minutes with our intuitive interface
- 👥 **Collaborate** - Invite family members to help build and share your tree
- 🔍 **Discover** - Automatically discover relationships and family connections
- 🔐 **Private & Secure** - Your family data stays private and secure
- 💰 **Free Forever** - No credit card required, completely free to use

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Database**: Supabase
- **Authentication**: Google OAuth via Supabase
- **UI Components**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd family-tree
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Go to Settings > API to get your project URL and anon key
   - Copy `env.example` to `.env.local` and fill in your Supabase credentials

4. Set up the database:
   - Go to your Supabase dashboard > SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create all tables and policies

5. Configure Google OAuth:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials (Client ID and Secret)
   - Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

6. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
family-tree/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── lib/                 # Utility functions and configurations
│   ├── stores/              # Zustand state management
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
