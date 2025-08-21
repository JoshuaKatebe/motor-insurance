# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15 motor insurance web application with Firebase integration. The application allows users to get insurance quotes, purchase policies, manage claims, and access their insurance documents.

## Tech Stack

- **Framework**: Next.js 15.4.4 with TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication & Database**: Firebase (Auth, Firestore, Storage)
- **Forms**: React Hook Form with Zod validation
- **Email**: Resend API
- **Package Manager**: npm

## Environment Setup

Create a `.env.local` file with the following Firebase and service configurations:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Email Service
RESEND_API_KEY=

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Key Dependencies

- **recharts**: Used for data visualization and charts in the analytics dashboard

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── quotes/           # Quote management
│   ├── policies/         # Policy management
│   ├── claims/           # Claims management
│   ├── login/            # Authentication pages
│   └── signup/
├── components/           # React components
│   ├── skeletons/       # Loading skeleton components
│   └── SideBar.tsx      # Main navigation
├── lib/                 # Core business logic
│   ├── firebase.ts      # Firebase initialization
│   ├── email.ts         # Email service templates
│   ├── premiumCalculator.ts  # Premium calculation logic
│   ├── quotesService.ts      # Quote management service
│   ├── policiesService.ts    # Policy management service
│   ├── claimsService.ts      # Claims management service
│   └── dashboardService.ts   # Dashboard data service
├── types/               # TypeScript type definitions
│   └── index.ts         # Main type definitions
└── contexts/            # React contexts

```

## Key Application Features

### Premium Calculation System
The application uses a tiered premium calculation system (`src/lib/premiumCalculator.ts`):
- Base premium: K500
- Coverage fees: Third-party (K1000), Comprehensive (K3000), Fire & Theft (K2000)
- Vehicle age adjustment: K100 for vehicles over 10 years old
- Additional driver fee: K200 per driver
- Tax rate: 3%

### Firebase Services
- **Authentication**: Email/password and Google sign-in
- **Firestore**: Stores quotes, policies, claims, and user data
- **Storage**: Document and image uploads for claims and policies

### Email Notifications
The application sends automated emails for:
- Welcome messages
- Quote generation confirmations
- Payment confirmations
- Claim submission notifications

## Type System

The application uses comprehensive TypeScript interfaces for:
- `PersonalDetails`: User personal information
- `VehicleDetails`: Vehicle specifications
- `CoverageDetails`: Insurance coverage options
- `Quote`: Complete quote information
- `Policy`: Active insurance policies
- `Claim`: Insurance claims
- `User`: User profile data

## Development Guidelines

### Working with Firebase
- Firebase is initialized in `src/lib/firebase.ts`
- Always check for existing app instances before initialization
- Use environment variables for all Firebase configuration

### State Management
- The application uses React Context for global state
- Service files in `src/lib/` handle Firebase operations
- Components should import services rather than directly accessing Firebase

### Form Handling
- Forms use React Hook Form with Zod validation
- Validation schemas should be defined alongside form components
- Use the `@hookform/resolvers` package for Zod integration

### API Routes and Server Actions
- This is a client-side application with Firebase as the backend
- No API routes are currently implemented
- All data operations go through Firebase SDK

## Testing

No test configuration is currently set up. Consider adding:
- Jest for unit testing
- React Testing Library for component testing
- Cypress or Playwright for E2E testing

## Deployment Considerations

- Ensure all environment variables are set in production
- Firebase security rules should be properly configured
- Consider implementing rate limiting for Firebase operations
- Set up proper error monitoring (e.g., Sentry)

## Common Issues and Solutions

### Firebase Authentication
- If authentication fails, verify Firebase project settings
- Check that email/password authentication is enabled in Firebase Console
- Ensure the domain is authorized in Firebase Authentication settings

### Build Issues
- Clear `.next` folder and `node_modules` if experiencing build issues
- Ensure Node.js version is >= 20.0.0 (required by Firebase)
- Check that all TypeScript types are properly defined

### Development Server
- The app uses Turbopack by default (`--turbopack` flag in dev script)
- If experiencing issues with Turbopack, remove the flag from package.json
