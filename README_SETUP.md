# more AI Backend Setup

This guide will help you set up the backend server for the more AI mental health platform.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

1. **Install Dependencies**

   Open a terminal in the project directory and run:

   ```bash
   npm install
   ```

   This will install:
   - Express (web server)
   - OpenAI (OpenAI API client)
   - CORS (for cross-origin requests)
   - dotenv (for environment variables)

2. **Set Up Environment Variables**

   Create a `.env` file in the root directory and set your own OpenAI key. Do not commit this file.

   ```env
   OPENAI_API_KEY=your-openai-api-key
   PORT=3000
   NODE_ENV=development
   ```

3. **Start the Server**

   Run the server:

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

4. **Verify the Server is Running**

   Open your browser and visit:
   ```
   http://localhost:3000/health
   ```

   You should see: `{"status":"ok"}`

## Using the AI Chat

1. Make sure the backend server is running (`npm start`)
2. Open the website in your browser
3. Complete the onboarding flow
4. Navigate to the AI Chat page
5. The chat will now use the real OpenAI API instead of mock responses

## API Endpoints

### POST `/api/ai/chat`
Send a message to the AI and get a response.

**Request Body:**
```json
{
  "message": "I've been feeling anxious lately",
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

### GET `/api/ai/summary/:conversationId`
Get a summary of the conversation.

## Troubleshooting

### Server won't start
- Make sure port 3000 is not already in use
- Check that all dependencies are installed: `npm install`

### API errors
- Verify the OpenAI API key is correct
- Check your internet connection
- Make sure you have credits in your OpenAI account

### CORS errors
- The server is configured to allow requests from `localhost`
- If deploying, update CORS settings in `server.js`

## Production Deployment

For production:

1. Set `NODE_ENV=production` in your environment
2. Use environment variables for the API key (never commit it to git)
3. Use a process manager like PM2: `pm2 start server.js`
4. Set up proper CORS for your domain
5. Use HTTPS for secure API communication

## Security Notes

⚠️ **Important**: The API key is currently in the code for development. For production:
- Never commit API keys to version control
- Use environment variables
- Consider using a backend proxy service
- Implement rate limiting
- Add authentication if needed
