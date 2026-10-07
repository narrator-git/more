# more - Mental Wellness Platform

A comprehensive digital platform for mental wellness that connects users with licensed therapists through an AI-powered matching system.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Code Organization](#code-organization)
- [Maintenance Guide](#maintenance-guide)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Styling Guidelines](#styling-guidelines)
- [Troubleshooting](#troubleshooting)

## Overview

**more** is a multi-page web application that provides:
- User onboarding with detailed questionnaire
- AI-powered chat for initial mental health assessment
- Therapist selection and booking system
- User dashboard with session management

### Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-4.1-mini API
- **Storage**: localStorage (client-side), in-memory (server-side)
- **Fonts**: Agrandir (custom fonts)

### Brand Colors

- Primary: `#6ab12f` (most used)
- Secondary: `#8fda4e`
- Tertiary: `#f3e16d`, `#f9a71a`, `#f54e29`

## Project Structure

```
more/
├── index.html                 # Landing page
├── onboarding.html            # Questionnaire flow
├── ai-chat.html               # AI conversation interface
├── therapist-selection.html   # Therapist listing page
├── therapist-profile.html     # Therapist details & booking
├── dashboard.html             # User dashboard
│
├── styles.css                 # Global styles (all pages)
├── script.js                  # Landing page scripts
│
├── js/
│   ├── data.js               # Data management & mock therapists
│   ├── onboarding.js         # Onboarding questionnaire logic
│   ├── ai-chat.js           # AI chat interface logic
│   ├── therapist-selection.js # Therapist listing & filtering
│   ├── booking.js           # Calendar & booking logic
│   └── dashboard.js         # Dashboard & session management
│
├── server.js                 # Express backend server
├── package.json              # Node.js dependencies
│
├── fonts/                    # Agrandir font files
├── images/                   # Therapist photos
│
├── README.md                 # This file
├── README_SETUP.md           # Backend setup guide
└── .gitignore                # Git ignore rules
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Modern web browser

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   Or use the quick start script:
   ```bash
   ./start-server.sh
   ```

3. **Open the website:**
   - Visit `http://localhost:3000` after the server starts. The pages, accounts, therapist list, and bookings are served by this app.

GitHub Pages serves the pages. Accounts, therapist data, and AI chat call the Node server. The OpenAI key stays in that server's `.env` and is not included in the website.

### Environment Setup

The backend server uses environment variables (optional):
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Architecture

### Data Flow

```
Landing Page → Onboarding → AI Chat → Therapist Selection → Booking → Dashboard
```

### Page Flow Logic

1. **Landing Page** (`index.html`)
   - Entry point
   - Buttons redirect to onboarding

2. **Onboarding** (`onboarding.html` + `js/onboarding.js`)
   - Multi-step questionnaire (8 questions)
   - Validates inputs before proceeding
   - Saves progress to localStorage
   - Redirects to AI chat on completion

3. **AI Chat** (`ai-chat.html` + `js/ai-chat.js`)
   - Requires completed onboarding
   - Sends messages to backend API
   - Displays AI responses
   - Shows "Continue" button after 5+ exchanges

4. **Therapist Selection** (`therapist-selection.html` + `js/therapist-selection.js`)
   - Requires completed onboarding and AI chat
   - Displays therapists from `js/data.js`
   - Filtering by specialization, price, rating
   - Search functionality

5. **Therapist Profile & Booking** (`therapist-profile.html` + `js/booking.js`)
   - Shows therapist details
   - Calendar with available time slots
   - Creates booking and saves to localStorage
   - Redirects to dashboard

6. **Dashboard** (`dashboard.html` + `js/dashboard.js`)
   - Shows upcoming sessions
   - Displays next session prominently
   - Session history
   - Links to book more sessions

### Data Storage

**Client-side (localStorage):**
- `userProfile`: User onboarding data
- `aiConversation`: Chat message history
- `bookings`: User's booked sessions
- `onboardingProgress`: Temporary onboarding state

**Server-side (in-memory):**
- `conversationContexts`: Map of conversation histories
- Note: In production, use a database (PostgreSQL, MongoDB, etc.)

## Code Organization

### Frontend JavaScript Files

#### `js/data.js`
**Purpose**: Central data management and utilities

**Key Functions:**
- `DataManager.saveUserProfile(profile)`: Save user onboarding data
- `DataManager.getUserProfile()`: Retrieve user profile
- `DataManager.addMessage(sender, message)`: Add chat message
- `DataManager.saveBooking(booking)`: Create new booking
- `DataManager.getAllTherapists()`: Get all therapist data
- `DataManager.getTherapistById(id)`: Get specific therapist

**Mock Data:**
- `mockTherapists`: Array of 10 therapist objects
- Each therapist has: id, name, photo, specialization, experience, rating, price, bio, languages, availability

#### `js/onboarding.js`
**Purpose**: Handle multi-step questionnaire

**Key Functions:**
- `initOnboarding()`: Initialize questionnaire
- `renderQuestion()`: Display current question
- `handleNext()`: Validate and proceed to next question
- `completeOnboarding()`: Save profile and redirect

**Question Types:**
- `number`: Age input
- `text`: Location input
- `select`: Gender dropdown
- `radio`: Single choice (previous therapy, communication style)
- `multiselect`: Multiple concerns
- `range`: Urgency scale (1-10)
- `textarea`: Financial considerations

#### `js/ai-chat.js`
**Purpose**: AI chat interface and API communication

**Key Functions:**
- `initAIChat()`: Initialize chat interface
- `handleSendMessage()`: Send user message to API
- `generateAIResponse()`: Call backend API and display response
- `checkConversationComplete()`: Show continue button when ready

**API Integration:**
- Endpoint: `http://localhost:3000/api/ai/chat`
- Sends: message, conversationId, userProfile
- Receives: response, hasEnoughInfo, messageCount

#### `js/therapist-selection.js`
**Purpose**: Therapist listing and filtering

**Key Functions:**
- `initTherapistSelection()`: Load and display therapists
- `setupFilters()`: Initialize filter controls
- `applyFilters()`: Filter therapists by criteria
- `renderTherapists()`: Display therapist cards

**Filtering:**
- Search by name/specialization/bio
- Filter by specialization
- Filter by max price (slider)
- Filter by min rating (slider)

#### `js/booking.js`
**Purpose**: Calendar and time slot selection

**Key Functions:**
- `initBooking()`: Load therapist and render calendar
- `renderCalendar()`: Generate calendar view
- `getAvailabilityForDate()`: Get available times for a day
- `handleBooking()`: Create booking and save

**Calendar Logic:**
- Shows next 4 weeks
- Displays available time slots per day
- Filters out past times for today
- Highlights selected date/time

#### `js/dashboard.js`
**Purpose**: Display user sessions and bookings

**Key Functions:**
- `initDashboard()`: Load and render dashboard
- `renderNextSession()`: Show upcoming session prominently
- `renderUpcomingSessions()`: List all upcoming sessions
- `renderSessionHistory()`: Show completed sessions

### Backend Server

#### `server.js`
**Purpose**: Express server for AI chat API

**Endpoints:**
- `POST /api/ai/chat`: Send message, get AI response
- `GET /api/ai/summary/:conversationId`: Get conversation summary
- `GET /health`: Health check

**AI Configuration:**
- Model: `gpt-4.1-mini`
- Temperature: 0.7
- Max tokens: 200
- System prompt: Configured for mental health support

### Styling

#### `styles.css`
**Organization:**
1. Global styles (reset, fonts, body)
2. Header & Navigation
3. Landing page (hero, buttons)
4. Stats section
5. Therapist section
6. Separator
7. AI section
8. New pages styles (onboarding, chat, etc.)
9. Responsive design (media queries)

**Key Classes:**
- `.btn`, `.btn-primary`, `.btn-outline`: Button styles
- `.form-input`, `.form-select`, `.form-textarea`: Form elements
- `.message`, `.message-user`, `.message-ai`: Chat bubbles
- `.therapist-card`: Therapist display cards
- `.time-slot`: Calendar time slot buttons

## Maintenance Guide

### Adding a New Therapist

1. **Add to `js/data.js`:**
   ```javascript
   {
       id: 't11',
       name: 'Dr. New Therapist',
       photo: 'images/therapist-item-6-...png', // Add image first
       specialization: ['Anxiety', 'Depression'],
       experience: 10,
       rating: 4.8,
       price: 130,
       bio: 'Therapist bio...',
       languages: ['English'],
       availability: [
           { day: 'Monday', times: ['09:00', '10:00'] },
           // ...
       ]
   }
   ```

2. **Add therapist photo to `images/` folder**

3. **Update photo path** in therapist object

### Modifying Onboarding Questions

1. **Edit `js/onboarding.js`:**
   - Modify `onboardingQuestions` array
   - Add/remove questions
   - Change question types or options

2. **Update validation** if needed in `validateAnswer()` function

### Changing AI Behavior

1. **Edit `server.js`:**
   - Modify `SYSTEM_PROMPT` constant
   - Adjust `temperature` (0.0-1.0, higher = more creative)
   - Change `max_tokens` for response length

2. **Update conversation logic** in `js/ai-chat.js`:
   - Modify `MIN_CONVERSATION_LENGTH` for when to show continue button
   - Adjust response handling

### Updating Styles

1. **Brand Colors:**
   - Search for color codes in `styles.css`
   - Replace: `#6ab12f`, `#8fda4e`, `#f3e16d`, `#f9a71a`, `#f54e29`

2. **Component Styles:**
   - Each page has its own section in `styles.css`
   - Look for comments like `/* Onboarding Page */`
   - Modify classes within those sections

### Adding a New Page

1. **Create HTML file** (e.g., `new-page.html`)
2. **Create JavaScript file** (e.g., `js/new-page.js`)
3. **Add styles** to `styles.css` under new section
4. **Add navigation links** in header of relevant pages
5. **Update routing logic** if needed

### Database Migration (Future)

Currently using localStorage and in-memory storage. To migrate to database:

1. **Choose database** (PostgreSQL, MongoDB, etc.)
2. **Update `js/data.js`:**
   - Replace localStorage calls with API calls
   - Create API endpoints in `server.js`
3. **Update `server.js`:**
   - Add database connection
   - Replace `conversationContexts` Map with database queries
   - Add user authentication if needed

## Development Workflow

### Running Locally

1. **Start backend:**
   ```bash
   npm start
   ```

2. **Open frontend:**
   - Use a local server (e.g., VS Code Live Server)
   - Or: `python -m http.server 8000`
   - Open `http://localhost:8000`

3. **Development mode** (auto-reload):
   ```bash
   npm run dev
   ```

### Testing Flow

1. **Complete onboarding** → Check localStorage for `userProfile`
2. **Chat with AI** → Verify API calls in browser console
3. **Select therapist** → Check filtering works
4. **Book session** → Verify booking saved to localStorage
5. **View dashboard** → Check sessions display correctly

### Debugging

**Frontend:**
- Open browser DevTools (F12)
- Check Console for errors
- Check Application → Local Storage for data
- Check Network tab for API calls

**Backend:**
- Check terminal for server logs
- API errors logged to console
- Test endpoints with: `curl http://localhost:3000/health`

### Code Style Guidelines

1. **JavaScript:**
   - Use camelCase for variables/functions
   - Use descriptive function names
   - Add comments for complex logic
   - Keep functions focused (single responsibility)

2. **CSS:**
   - Use BEM-like naming for components
   - Group related styles together
   - Use brand colors consistently
   - Mobile-first responsive design

3. **HTML:**
   - Semantic HTML5 elements
   - Descriptive alt text for images
   - Proper form labels
   - ARIA attributes where needed

## API Documentation

### POST /api/ai/chat

**Request:**
```json
{
  "message": "I've been feeling anxious",
  "conversationId": "conv-1234567890-abc123",
  "userProfile": {
    "age": 28,
    "gender": "Female",
    "concerns": ["Anxiety", "Stress"],
    ...
  }
}
```

**Response:**
```json
{
  "response": "I understand that anxiety can be overwhelming...",
  "hasEnoughInfo": false,
  "messageCount": 3
}
```

### GET /api/ai/summary/:conversationId

**Response:**
```json
{
  "summary": "user: Hello\nai: Hi there...",
  "messageCount": 5
}
```

## Styling Guidelines

### Brand Colors Usage

- **#6ab12f** (Primary Green): Main buttons, primary actions, headings
- **#8fda4e** (Secondary Green): Borders, accents, hover states
- **#f3e16d** (Yellow): Highlights, feature badges
- **#f9a71a** (Orange): Warnings, important notices
- **#f54e29** (Red): Errors, urgent actions

### Typography

- **Headings**: Agrandir font family
- **Body**: System fonts fallback
- **Sizes**: Responsive (use rem/em, not fixed px)

### Spacing

- Consistent padding: 20px, 40px, 60px
- Gap between elements: 16px, 20px, 30px
- Border radius: 8px (small), 12px (medium), 16px (large), 50px (pill)

## Troubleshooting

### Backend Server Won't Start

- **Port in use**: Change `PORT` in `.env` or `server.js`
- **Missing dependencies**: Run `npm install`
- **API key error**: Check OpenAI API key is valid

### Frontend Not Loading Data

- **Check localStorage**: Open DevTools → Application → Local Storage
- **Check API calls**: Network tab → Look for failed requests
- **CORS errors**: Ensure backend is running and CORS is enabled

### Images Not Displaying

- **Check file paths**: Images should be in `images/` folder
- **Path format**: Use relative paths `images/filename.png`
- **File names**: Match exactly (case-sensitive)

### AI Chat Not Working

- **Backend running?**: Check `http://localhost:3000/health`
- **API key valid?**: Check server logs for errors
- **Network errors**: Check browser console for CORS or connection issues

### Calendar Not Showing Times

- **Check availability data**: Verify therapist has availability in `js/data.js`
- **Date logic**: Ensure current date/time logic is correct
- **Timezone issues**: All times are in local timezone

## Contributing

When making changes:

1. **Test thoroughly** across all pages
2. **Check responsive design** on mobile/tablet
3. **Verify localStorage** data persists correctly
4. **Test API integration** with backend running
5. **Update documentation** if adding new features

## License

See LICENSE file for details.

---

**Maintained by**: Murad gotdu  
**Last Updated**: January 2025
