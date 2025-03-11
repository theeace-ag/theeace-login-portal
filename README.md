# THEEACE Login System

A secure login system with admin functionality for user management.

## Features

- User authentication
- Admin portal for user management
- Bulk user import via CSV
- Responsive design
- Secure password handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## CSV Format

The bulk import feature accepts CSV files in the following format:
```csv
username,userId,passkey
user1,12345,password1
user2,67890,password2
```

## Deployment

This application can be deployed to various platforms:

### Render.com (Recommended)

1. Create a new account on [Render](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the deployment:
   - Name: your-app-name
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"

### Environment Variables

- `PORT`: The port number (default: 5000)

## File Structure

- `server.js`: Main server file
- `admin.html`: Admin portal interface
- `admin.js`: Admin functionality
- `script.js`: Login functionality
- `styles.css`: Styling
- `users.json`: User database 