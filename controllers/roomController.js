const Room = require('../models/Room');

// Public listing: only approved rooms, with search + filters.
exports.listRooms = async (req, res) => {
  const { q, type, maxPrice, sort } = req.query;
  const filter = { status: 'approved' };

  if (q) filter.$text = { $search: q };
  if (type) filter.roomType = type;
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };

  let query = Room.find(filter).populate('postedBy', 'name');
  if (sort === 'price_asc') query = query.sort({ price: 1 });
  else if (sort === 'price_desc') query = query.sort({ price: -1 });
  else query = query.sort({ createdAt: -1 });

  const rooms = await query.exec();

  res.render('index', {
    title: 'Find a room near campus',
    rooms,
    filters: { q: q || '', type: type || '', maxPrice: maxPrice || '', sort: sort || '' },
  });
};

exports.showRoom = async (req, res) => {
  const room = await Room.findById(req.params.id).populate('postedBy', 'name email phone');
  if (!room) {
    return res.status(404).render('error', { title: 'Not found', message: 'That listing does not exist.' });
  }
  const isOwnerOrAdmin =
    req.session.user &&
    (req.session.user.role === 'admin' || String(room.postedBy._id) === req.session.user.id);
  if (room.status !== 'approved' && !isOwnerOrAdmin) {
    return res.status(404).render('error', { title: 'Not found', message: 'That listing is not public yet.' });
  }
  res.render('room-detail', { title: room.title, room });
};

exports.showSubmitForm = (req, res) => {
  res.render('submit-room', { title: 'List a room', error: null, form: {} });
};

exports.submitRoom = async (req, res) => {
  try {
    const { title, description, roomType, price, location, distanceToCampus, amenities, contactPhone, contactEmail } =
      req.body;

    if (!title || !description || !price || !location) {
      return res.render('submit-room', {
        title: 'List a room',
        error: 'Fill in the title, description, price, and location.',
        form: req.body,
      });
    }

    const images = (req.files || []).map((f) => `/img/rooms/${f.filename}`);

    await Room.create({
      title,
      description,
      roomType,
      price,
      location,
      distanceToCampus,
      amenities: amenities ? amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
      images,
      contactPhone,
      contactEmail,
      postedBy: req.session.user.id,
      status: 'pending',
    });

    res.render('submit-success', { title: 'Listing submitted' });
  } catch (err) {
    console.error(err);
    res.render('submit-room', {
      title: 'List a room',
      error: 'Something went wrong submitting your listing. Try again.',
      form: req.body,
    });
  }
};

// A user's own listings, with their status.
exports.myRooms = async (req, res) => {
  const rooms = await Room.find({ postedBy: req.session.user.id }).sort({ createdAt: -1 });
  res.render('my-rooms', { title: 'My listings', rooms });
};

exports.deleteOwnRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).render('error', { title: 'Not found', message: 'That listing does not exist.' });
  const isOwner = String(room.postedBy) === req.session.user.id;
  const isAdmin = req.session.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).render('error', { title: 'Not allowed', message: 'You can only remove your own listings.' });
  }
  await room.deleteOne();
  res.redirect(isAdmin ? '/admin/rooms' : '/my-rooms');
};
