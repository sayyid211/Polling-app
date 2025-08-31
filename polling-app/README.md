# PollApp - Modern Polling Platform

A modern, responsive polling application built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn UI components. Create polls, vote, and see real-time results with a beautiful, intuitive interface.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Poll Creation**: Create polls with multiple options and customizable settings
- **Voting System**: Intuitive voting interface with real-time updates
- **Poll Management**: Browse, search, and filter polls
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Results**: See voting results with progress bars and statistics
- **Modern UI**: Built with Shadcn UI components for a consistent design

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Authentication**: Custom auth system (ready for integration)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── polls/             # Poll-related pages
│   │   ├── create/        # Create poll page
│   │   └── page.tsx       # Polls listing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/            # Layout components
│   │   └── Header.tsx
│   ├── polls/             # Poll-related components
│   │   ├── CreatePollForm.tsx
│   │   └── PollCard.tsx
│   └── ui/                # Shadcn UI components
├── lib/                   # Utility libraries
│   ├── api.ts            # API client and mock data
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── index.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd polling-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features Explained

### Authentication System
- Custom authentication state management with Zustand
- Login and registration forms with validation
- Protected routes for authenticated users
- User profile management

### Poll Management
- Create polls with multiple options (2-10 options)
- Support for single and multiple vote polls
- Real-time voting with optimistic updates
- Search and filter functionality
- Poll status tracking (active/closed)

### UI/UX Features
- Responsive design that works on all screen sizes
- Modern, accessible components from Shadcn UI
- Smooth animations and transitions
- Loading states and error handling
- Intuitive navigation and user flow

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Shadcn UI
The project uses Shadcn UI components. To add new components:

```bash
npx shadcn@latest add <component-name>
```

## 🚧 Development Status

### ✅ Completed
- [x] Project structure and scaffolding
- [x] Authentication components and pages
- [x] Poll creation and voting components
- [x] Responsive layout and navigation
- [x] Mock data and API structure
- [x] TypeScript type definitions

### 🔄 In Progress
- [ ] Backend API integration
- [ ] Database setup
- [ ] Real authentication system
- [ ] Poll sharing functionality

### 📋 Planned Features
- [ ] Real-time updates with WebSockets
- [ ] Poll analytics and charts
- [ ] User profile management
- [ ] Poll categories and tags
- [ ] Email notifications
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) for state management
