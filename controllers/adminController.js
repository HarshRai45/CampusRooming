const Room = require('../models/Room');
const User = require('../models/User');

exports.dashboard = async (req, res) => {
  const [pendingCount, approvedCount, rejectedCount, userCount] = await Promise.all([
    Room.countDocuments({ status: 'pending' }),
    Room.countDocuments({ status: 'approved' }),
    Room.countDocuments({ status: 'rejected' }),
    User.countDocuments({}),
  ]);
  const recentPending = await Room.find({ status: 'pending' })
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.render('admin/dashboard', {
    title: 'Admin dashboard',
    stats: { pendingCount, approvedCount, rejectedCount, userCount },
    recentPending,
  });
};

// One queue, filterable by status tab.
exports.listRooms = async (req, res) => {
  const status = ['pending', 'approved', 'rejected', 'all'].includes(req.query.status)
    ? req.query.status
    : 'pending';
  const filter = status === 'all' ? {} : { status };
  const rooms = await Room.find(filter).populate('postedBy', 'name email').sort({ createdAt: -1 });
  res.render('admin/rooms', { title: 'Room submissions', rooms, status });
};

exports.approveRoom = async (req, res) => {
  await Room.findByIdAndUpdate(req.params.id, {
    status: 'approved',
    rejectionReason: '',
    reviewedAt: new Date(),
    reviewedBy: req.session.user.id,
  });
  res.redirect('back-to-queue' in req.query ? req.query['back-to-queue'] : '/admin/rooms?status=pending');
};

exports.rejectRoom = async (req, res) => {
  const { reason } = req.body;
  await Room.findByIdAndUpdate(req.params.id, {
    status: 'rejected',
    rejectionReason: reason || 'Did not meet listing guidelines.',
    reviewedAt: new Date(),
    reviewedBy: req.session.user.id,
  });
  res.redirect('/admin/rooms?status=pending');
};

exports.listUsers = async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Users', users });
};

exports.setUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['student', 'lister', 'admin'].includes(role)) {
    return res.status(400).render('error', { title: 'Invalid role', message: 'That role does not exist.' });
  }
  await User.findByIdAndUpdate(req.params.id, { role });
  res.redirect('/admin/users');
};
