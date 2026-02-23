# 📝 Aurora Voices - The Poetry Blog

A modern, responsive blog application built with React.js and CSS. This application allows users to create, read, edit, and delete blog posts with a beautiful user interface.

## ✨ Features

### Core Features
- **Homepage** - Display a list of all blog posts
- **Blog Post Details** - View individual blog posts with full content
- **Add New Post** - Create new blog posts with title and content
- **User Authentication** - Sign up, login, and logout functionality
- **Edit/Delete Posts** - Authors can edit or delete their own posts
- **View Liked Posts** - Users can view the posts that they've liked earlier
- **Searchbar** - Users can search based on the name of the poem/poet or genre
- **Notifications** - Users receive notifications if someone likes/comments on their post
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Data Persistence** - Uses MongoDB Atlas to save posts and user data

## 🚀 Tech Stack

- **Frontend**: React.js
- **Backend**: Express.js, Node.js
- **Routing**: React Router DOM
- **Styling**: Custom CSS with modern design principles
- **State Management**: React Hooks (useState, useEffect)
- **Data Persistence**: MongoDB Atlas
- **Build Tool**: Create React App

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AuroraVoices
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── HomePage.js          # Main homepage component
│   ├── HomePage.css
│   ├── PostCard.js          # Individual post card component
│   ├── PostCard.css
│   ├── PostDetail.js        # Detailed post view component
│   ├── PostDetail.css
│   ├── AddPost.js           # Create new post component
│   ├── AddPost.css
│   ├── Login.js             # User login component
│   ├── Register.js          # User registration component
│   ├── Auth.css             # Authentication styling
|   ├── Navbar.js
|   ├── Navbar.css
|   ├── ProfileSidebar.js
|   ├── ProfileSidebar.css
|   └── pages/
|       ├── LikedPosts.js
|       ├── MyPosts.js
|       ├── MyProfile.js
|       └── Settings.js
├── App.js                   # Main application component
├── App.css                  # Main application styling
├── index.js                 # Application entry point
└── index.css                # Global styles
```

## 🎯 Usage

### For Users
1. **Browse Posts**: Visit the homepage to see all published blog posts
2. **Read Posts**: Click on any post to read the full content
3. **Create Account**: Register for a new account to create posts
4. **Sign In**: Use your credentials to access your account
5. **Create Posts**: Click "Add Post" to create new blog posts
6. **Manage Posts**: Edit or delete your own posts
7. **Like Posts**: Appreciate others by liking and commenting on their posts 

### For Developers
1. **Add New Features**: Extend the existing components
2. **Customize Styling**: Modify CSS files for different themes
3. **Add Backend**: Integrate with a real database and API
4. **Deploy**: Use the build command to create production files

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner



## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Responsive Layout**: Mobile-first approach with breakpoints
- **Color Scheme**: Professional blue and gray palette
- **Typography**: Inter font family for excellent readability
- **Interactive Elements**: Hover effects and smooth transitions
- **Form Design**: Beautiful, accessible form components

## 🔒 Authentication

The application includes a complete authentication system:
- User registration with validation
- Secure login functionality
- Add Security questions to retrieve your account
- Session management with MongoDB Atlas
- Protected routes for post creation
- User-specific post management

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🌐 Live Demo
🔗 https://aurora-voices.vercel.app/

Deployed using **Vercel** & **Render**
(Just wait for few seconds for the content to load)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

---

**Built with ❤️ using React.js**

Then restart the dev server:

```
npm start
```






