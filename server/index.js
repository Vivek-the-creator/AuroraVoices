const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- MongoDB connection ---
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://kevivark0789_db_user:Vikshu24@cluster0.i61xyti.mongodb.net/?appName=Cluster0';

mongoose
  .connect(MONGO_URI, {
    dbName: process.env.MONGO_DB_NAME || 'aurora_voices',
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error', err);
  });

// --- Schemas & Models ---
const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // keeps compatibility with existing frontend
  title: String,
  description: String,
  content: String,
  thumbnail: String,
  language: String,
  genre: String,
  author: String,
  authorId: String,
  authorUsername: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  likes: { type: [String], default: [] }, // array of user ids
  comments: { type: [commentSchema], default: [] },
});

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true },
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
    actorId: { type: String, required: true },
    actorUsername: { type: String, required: true },
    // postId/postTitle are only required for like/comment notifications
    postId: { type: String },
    postTitle: { type: String },
    commentText: { type: String },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: false,
  }
);

// Automatically delete notifications 12 hours after creation
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 12 });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // same id used on frontend
  name: { type: String, required: true },
  email: { type: String, required: true },
  emailLower: { type: String, required: true, unique: true, sparse: true },
  username: { type: String, required: true },
  usernameLower: { type: String, required: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswerHash: { type: String, required: true },
  followers: { type: [String], default: [] }, // userIds that follow this user
  following: { type: [String], default: [] }, // userIds this user follows
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);
const Notification = mongoose.model('Notification', notificationSchema);

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = typeof userDoc.toObject === 'function' ? userDoc.toObject() : userDoc;
  const { passwordHash, securityAnswerHash, emailLower, usernameLower, __v, ...safe } = obj;
  return safe;
};

const normalize = (value) => (value || '').trim().toLowerCase();

// --- Post routes ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    console.error('Failed to fetch posts', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const now = Date.now().toString();
    const post = new Post({
      ...req.body,
      id: now,
      createdAt: new Date(),
      likes: [],
      comments: [],
    });
    const saved = await post.save();
    res.status(201).json(saved.toObject());
  } catch (err) {
    console.error('Failed to create post', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const updated = await Post.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, id: req.params.id },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).end();
    }
    res.json(updated);
  } catch (err) {
    console.error('Failed to update post', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (err) {
    console.error('Failed to delete post', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  const { viewerId } = req.body || {};
  if (!viewerId) {
    return res.status(400).json({ error: 'viewerId is required' });
  }

  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).end();
    }

    const likes = Array.isArray(post.likes) ? post.likes : [];
    const has = likes.includes(viewerId);
    post.likes = has ? likes.filter((id) => id !== viewerId) : [...likes, viewerId];

    await post.save();

    // Create notification only on new like (not unlike) and not for self-like
    if (!has && viewerId !== post.authorId && post.authorId) {
      try {
        const actor = await User.findOne({ id: viewerId }).lean();
        const actorUsername = actor?.username || actor?.name || 'Someone';

        await Notification.create({
          recipientId: post.authorId,
          type: 'like',
          actorId: viewerId,
          actorUsername,
          postId: post.id,
          postTitle: post.title || 'your post',
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.error('Failed to create like notification', notifErr);
      }
    }

    res.json({ likes: post.likes });
  } catch (err) {
    console.error('Failed to toggle like', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  const { comment } = req.body || {};
  if (!comment || !comment.text) {
    return res.status(400).json({ error: 'comment with text is required' });
  }

  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).end();
    }

    const newComment = {
      ...comment,
      id: comment.id || Date.now().toString(),
      createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Notification for comment to post author (if not self-comment)
    if (post.authorId && comment.authorId && comment.authorId !== post.authorId) {
      try {
        await Notification.create({
          recipientId: post.authorId,
          type: 'comment',
          actorId: comment.authorId,
          actorUsername: comment.authorUsername || newComment.author || 'Someone',
          postId: post.id,
          postTitle: post.title || 'your post',
          commentText: newComment.text,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.error('Failed to create comment notification', notifErr);
      }
    }

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to add comment', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// --- Notification routes ---

// Get notifications for a user (newest first). TTL index ensures only last 12 hours are kept.
app.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifications);
  } catch (err) {
    console.error('Failed to fetch notifications', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications for a user as read
app.post('/api/notifications/mark-read', async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    await Notification.updateMany({ recipientId: userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to mark notifications as read', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// --- Auth routes ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, username, password, securityQuestion, securityAnswer } = req.body || {};

  if (
    !name?.trim() ||
    !email?.trim() ||
    !username?.trim() ||
    !password ||
    !securityQuestion ||
    !securityAnswer?.trim()
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters and include uppercase, lowercase, and a number',
    });
  }

  const normalizedEmail = normalize(email);
  const normalizedUsername = normalize(username);

  try {
    const existing = await User.findOne({
      $or: [{ emailLower: normalizedEmail }, { usernameLower: normalizedUsername }],
    });
    if (existing) {
      if (existing.emailLower === normalizedEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(normalize(securityAnswer), 10);
    const newUser = await User.create({
      id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: email.trim(),
      emailLower: normalizedEmail,
      username: username.trim(),
      usernameLower: normalizedUsername,
      passwordHash,
      securityQuestion,
      securityAnswerHash,
    });

    res.status(201).json(sanitizeUser(newUser));
  } catch (err) {
    console.error('Failed to register user', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier?.trim() || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    const normalizedIdentifier = normalize(identifier);
    const user = await User.findOne({
      $or: [{ emailLower: normalizedIdentifier }, { usernameLower: normalizedIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('Failed to login user', err);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

app.post('/api/auth/security-question', async (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier?.trim()) {
    return res.status(400).json({ error: 'Username or email is required' });
  }
  try {
    const user = await User.findOne({
      $or: [{ usernameLower: normalize(identifier) }, { emailLower: normalize(identifier) }],
    }).lean();
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ question: user.securityQuestion });
  } catch (err) {
    console.error('Failed to fetch security question', err);
    res.status(500).json({ error: 'Failed to fetch security question' });
  }
});

app.post('/api/auth/security-verify', async (req, res) => {
  const { identifier, answer } = req.body || {};
  if (!identifier?.trim() || !answer?.trim()) {
    return res.status(400).json({ error: 'Identifier and answer are required' });
  }

  try {
    const user = await User.findOne({
      $or: [{ usernameLower: normalize(identifier) }, { emailLower: normalize(identifier) }],
    });
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const match = await bcrypt.compare(normalize(answer), user.securityAnswerHash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect answer' });
    }
    res.json(sanitizeUser(user));
  } catch (err) {
    console.error('Failed to verify security answer', err);
    res.status(500).json({ error: 'Failed to verify security answer' });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  const { userId, newPassword } = req.body || {};
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'userId and newPassword are required' });
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters and include uppercase, lowercase, and a number',
    });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to change password', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Follow / Unfollow another user
app.post('/api/users/:id/follow', async (req, res) => {
  const targetId = req.params.id;
  const { followerId } = req.body || {};

  if (!followerId) {
    return res.status(400).json({ error: 'followerId is required' });
  }
  if (targetId === followerId) {
    return res.status(400).json({ error: 'You cannot follow yourself' });
  }

  try {
    const [target, follower] = await Promise.all([
      User.findOne({ id: targetId }),
      User.findOne({ id: followerId }),
    ]);

    if (!target || !follower) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = Array.isArray(target.followers) ? target.followers : [];
    const following = Array.isArray(follower.following) ? follower.following : [];

    const alreadyFollowing = followers.includes(followerId);

    if (alreadyFollowing) {
      target.followers = followers.filter((id) => id !== followerId);
      follower.following = following.filter((id) => id !== targetId);
    } else {
      target.followers = [...followers, followerId];
      follower.following = [...following, targetId];

      // Notification: someone started following you
      try {
        await Notification.create({
          recipientId: targetId,
          type: 'follow',
          actorId: followerId,
          actorUsername: follower.username || follower.name || 'Someone',
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.error('Failed to create follow notification', notifErr);
      }
    }

    await Promise.all([target.save(), follower.save()]);

    return res.json({
      isFollowing: !alreadyFollowing,
      followersCount: Array.isArray(target.followers) ? target.followers.length : 0,
      follower: sanitizeUser(follower),
    });
  } catch (err) {
    console.error('Failed to toggle follow', err);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Utility route for debugging stored users (sans sensitive fields)
app.get('/api/users', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => sanitizeUser(u)));
  } catch (err) {
    console.error('Failed to fetch users', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

