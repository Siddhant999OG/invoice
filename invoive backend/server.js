const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/invoiceDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the Invoice schema and model
const InvoiceSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  dueDate: Date,
  paid: Boolean,
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/invoices');
  });

app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

// Invoices route
app.get('/invoices', isAuthenticated, async (req, res) => {
  const invoices = await Invoice.find({ paid: false });
  res.json(invoices);
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
