// Makes the logged-in user (if any) available to every view as `currentUser`.
function attachUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
}

// Blocks the route unless someone is logged in.
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.session.flashError = 'Log in to continue.';
    return res.redirect('/login');
  }
  next();
}

// Blocks the route unless the logged-in user is an admin.
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Not allowed',
      message: "This page is for admins only.",
    });
  }
  next();
}

// Redirects logged-in users away from login/register pages.
function redirectIfAuthed(req, res, next) {
  if (req.session.user) return res.redirect('/');
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin, redirectIfAuthed };
