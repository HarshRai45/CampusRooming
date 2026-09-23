require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const { attachUser } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusrooming' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  })
);

app.use(attachUser);

app.use('/', authRoutes);
app.use('/', roomRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', { title: 'Page not found', message: "That page doesn't exist." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Something broke', message: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusRooming running on port ${PORT}`);
});
