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

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
