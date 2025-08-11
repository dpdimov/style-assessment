# Style Assessment App

A modern React-based assessment application converted from a WordPress plugin, built with Next.js and designed for deployment on Vercel.

## Features

- **Interactive Assessment**: Dynamic slider interface with visual feedback
- **Real-time Progress**: Visual progress tracking through assessment
- **Multi-language Support**: English, Spanish, and Russian languages
- **Results Analysis**: Detailed analysis with recommendations
- **PDF Reports**: Downloadable assessment reports
- **Authentication**: Simple email-based authentication
- **Responsive Design**: Works on all device sizes
- **Modern Tech Stack**: React, Next.js, TypeScript, Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (Vercel serverless functions)
- **Authentication**: Custom lightweight auth system
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd style-assessment
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

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (serverless functions)
│   │   ├── saveResults/   # Save assessment results
│   │   ├── getResults/    # Fetch assessment results
│   │   └── generatePDF/   # PDF generation
│   ├── results/           # Results page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── Assessment.tsx     # Main assessment component
│   ├── AssessmentSlider.tsx # Slider component
│   └── LoginModal.tsx     # Authentication modal
├── lib/                  # Utility libraries
│   └── auth.ts           # Authentication utilities
└── public/               # Static assets
```

## Key Components

### AssessmentSlider
Interactive slider with visual column feedback, converted from the original jQuery-based implementation.

### Assessment  
Manages the overall assessment flow, question progression, and result calculation.

### LoginModal
Simple authentication interface for user identification.

## API Endpoints

### POST /api/saveResults
Saves assessment results and returns analysis.

### GET /api/getResults
Retrieves user's assessment results.

### POST /api/generatePDF
Generates downloadable PDF reports.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure build settings (Next.js preset)
3. Deploy automatically on commits

### Manual Vercel Deployment

```bash
npm install -g vercel
vercel
```

### Environment Variables

For production, you may want to add:

```env
NEXT_PUBLIC_API_URL=your-api-url
DATABASE_URL=your-database-url (if using a real database)
```

## Configuration

### Multi-language Support
Languages are configured in the API routes. Currently supports:
- English (default)
- Spanish (es)
- Russian (ru)

### Assessment Questions
Questions are currently hardcoded in `app/page.tsx`. In production, these should come from a database or CMS.

## Migration from WordPress Plugin

This app was converted from the original WordPress plugin files:
- `esa.js` → Modern React components with hooks
- `esa.php` → Next.js API routes and serverless functions
- jQuery DOM manipulation → React state management
- WordPress authentication → Custom auth system

## Development

### Adding New Questions
Edit the `sampleQuestions` array in `app/page.tsx` or connect to a database/CMS.

### Customizing Analysis
Modify the analysis logic in `/api/saveResults/route.ts`.

### Styling
The app uses Tailwind CSS. Custom styles are in `app/globals.css`.

### Authentication
Currently uses a simple demo auth system. For production, consider:
- NextAuth.js
- Auth0
- Firebase Auth
- Supabase Auth

## Production Considerations

1. **Database**: Replace mock data with a real database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Implement proper auth with password hashing and JWT tokens
3. **PDF Generation**: Add a proper PDF library like Puppeteer or PDFKit
4. **Analytics**: Add tracking for assessment completions
5. **Rate Limiting**: Implement API rate limiting
6. **Caching**: Add Redis or similar for session management
7. **Error Handling**: Implement comprehensive error tracking
8. **Testing**: Add unit and integration tests

## License

This project is based on the original WordPress ESA plugin and is provided as-is for educational and development purposes.