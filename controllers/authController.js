const User = require('../models/User');

exports.showRegister = (req, res) => {
  res.render('register', { title: 'Create account', error: null, form: {} });
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, phone } = req.body;
  try {
    if (!name || !email || !password) {
      return res.render('register', {
        title: 'Create account',
        error: 'Fill in your name, email, and a password.',
        form: req.body,
      });
    }
    if (password !== confirmPassword) {
      return res.render('register', {
        title: 'Create account',
        error: 'Passwords do not match.',
        form: req.body,
      });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.render('register', {
        title: 'Create account',
        error: 'An account with that email already exists.',
        form: req.body,
      });
    }

    const user = await User.create({ name, email, password, phone });
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'Create account',
      error: 'Something went wrong creating your account. Try again.',
      form: req.body,
    });
  }
};

exports.showLogin = (req, res) => {
  res.render('login', {
    title: 'Log in',
    error: req.session.flashError || null,
    form: {},
  });
  delete req.session.flashError;
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', {
        title: 'Log in',
        error: 'Email or password is incorrect.',
        form: { email },
      });
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    const dest = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(dest);
  } catch (err) {
    console.error(err);
    res.render('login', {
      title: 'Log in',
      error: 'Something went wrong logging you in. Try again.',
      form: { email },
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
