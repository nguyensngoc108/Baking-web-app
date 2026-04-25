# S2UGAR - Cake Sales Website

A full-stack web application for selling homemade cakes online with admin management and email notifications.

## Features

- **Customer Features:**
  - Browse available cakes with descriptions and prices
  - Place custom orders with delivery dates
  - Special requests for custom cakes
  - Order confirmation via email

- **Admin Features:**
  - Admin login panel
  - Add new cakes weekly
  - Update cake information
  - Delete cakes from catalog
  - Receive email notifications for new orders

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB (Atlas - free tier)
- Nodemailer for email service
- JWT for authentication
- Cloudinary for image hosting (optional)

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS for styling

## Free Hosting Options

### Backend
- **Render** - Free tier for Node.js apps (https://render.com)
- **Railway** - Free tier available (https://railway.app)
- **Fly.io** - Free credits (https://fly.io)

### Frontend
- **Vercel** - Optimized for React (https://vercel.com)
- **Netlify** - Simple React deployment (https://netlify.com)
- **GitHub Pages** - Static hosting (https://pages.github.com)

### Database
- **MongoDB Atlas** - Free tier 512MB (https://www.mongodb.com/cloud/atlas)

### Email Service
- **Gmail** - Free with app passwords
- **SendGrid** - 100 emails/day free (https://sendgrid.com)

### Image Hosting
- **Cloudinary** - Free tier with 25GB storage (https://cloudinary.com)

## Project Structure

```
Baking project/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── models/
│   │   ├── Cake.js
│   │   ├── Order.js
│   │   └── Admin.js
│   ├── routes/
│   │   ├── cakes.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   └── auth.js
│   ├── middleware/
│   ├── utils/
│   │   └── emailService.js
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── OrderPage.js
    │   │   └── AdminPage.js
    │   ├── hooks/
    │   ├── context/
    │   ├── utils/
    │   ├── styles/
    │   │   ├── index.css
    │   │   └── App.css
    │   ├── App.js
    │   ├── index.js
    │   └── package.json
    └── .gitignore
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file using `.env.example` as template

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ADMIN_PASSWORD=your_admin_password
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Next Steps

1. Set up MongoDB Atlas account and get connection string
2. Configure email service (Gmail with app password)
3. Create admin authentication system
4. Add image upload functionality
5. Implement payment gateway (if needed)
6. Design UI/UX improvements
7. Deploy to free hosting platforms

## Environment Variables

See `.env.example` in the server folder for required environment variables.

## License

This project is free to use for personal projects.
