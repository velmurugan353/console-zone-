const path = require('path');
// Only load dotenv in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
}

console.log('DEBUG: process.env.MONGODB_URI =', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User.cjs');
const Product = require('./models/Product.cjs');
const Submission = require('./models/Submission.cjs');
const Rental = require('./models/Rental.cjs');
const KYC = require('./models/KYC.cjs');
const Order = require('./models/Order.cjs');
const Notification = require('./models/Notification.cjs');
const NotificationLog = require('./models/NotificationLog.cjs');
const Repair = require('./models/Repair.cjs');
const SellRequest = require('./models/SellRequest.cjs');
const Inventory = require('./models/Inventory.cjs');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'consolezone_secret_key_123';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const PORT = process.env.PORT || 5010;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consolezone';

// Database Connection with Caching for Serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    console.log(`⏳ Connecting to MongoDB...`);
    mongoose.set('bufferCommands', false); // Disable buffering
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds instead of 30
    });
    console.log('✅ Connected to MongoDB');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Initial connection for non-production
if (process.env.NODE_ENV !== 'production') {
  connectDB().catch(err => console.error('Early DB connection failed:', err.message));
}

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DATABASE_CONNECTION_ERROR:', err);
    res.status(500).json({ error: 'Database connection failed.', details: err.message });
  }
});

// Use /tmp for uploads on Vercel/Production
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error('Error creating upload dir:', e.message);
  }
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const generateCZID = () => {
  return 'CZ-' + Math.random().toString(36).substring(2, 7).toUpperCase();
};

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware to verify Admin role
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        username: name,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        role: 'user',
        consolezone_id: generateCZID()
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role, kyc_status: user.kyc_status, consolezone_id: user.consolezone_id } });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(400).json({ error: 'Google authentication failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      username,
      password: hashedPassword,
      phone,
      role: 'user',
      consolezone_id: generateCZID()
    });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role, kyc_status: user.kyc_status, consolezone_id: user.consolezone_id } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    if (role && user.role !== role) {
      return res.status(403).json({ error: `Access denied. You do not have ${role} privileges.` });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role, kyc_status: user.kyc_status, consolezone_id: user.consolezone_id } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword, adminKey } = req.body;
    const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY || 'consolezone_admin_reset_2024';
    if (!email || !newPassword) return res.status(400).json({ error: 'Email and newPassword required' });
    if (adminKey !== ADMIN_RESET_KEY) return res.status(403).json({ error: 'Invalid admin key' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/setup', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 5) return res.status(403).json({ error: 'Setup already completed.' });
    const admins = [
      { email: 'admin@consolezone.com', username: 'Admin' },
      { email: 'Cheersediting@gmail.com', username: 'Chief Administrator' }
    ];
    const results = [];
    for (const data of admins) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = new User({
          ...data,
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
          consolezone_id: generateCZID()
        });
        await user.save();
        results.push(`Created ${data.email}`);
      } else {
        user.role = 'admin';
        user.password = await bcrypt.hash('admin123', 10);
        await user.save();
        results.push(`Updated ${data.email}`);
      }
    }
    res.json({ message: 'Setup successful', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    let kyc_address = null;
    if (user.kyc_status === 'APPROVED') {
      const kyc = await KYC.findOne({ userId: user._id });
      if (kyc) kyc_address = kyc.address;
    }
    res.json({ ...user.toObject(), kyc_address });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/:id/role', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Product Routes
app.post('/api/products', auth, admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory Routes
app.get('/api/inventory', auth, admin, async (req, res) => {
  try {
    const items = await Inventory.find().sort({ purchaseDate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', auth, admin, async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/inventory/:id/status', auth, admin, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/inventory/:id/maintenance', auth, admin, async (req, res) => {
  try {
    const { type, technician, notes, cost, healthUpdate, nextStatus } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Asset not found' });
    const record = { date: new Date(), type, technician, notes, cost };
    item.maintenanceHistory.push(record);
    if (healthUpdate !== undefined) item.health = healthUpdate;
    if (nextStatus) item.status = nextStatus;
    item.lastService = new Date();
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', auth, admin, async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/inventory/seed', auth, admin, async (req, res) => {
  try {
    const consoleDefs = [
      { id: 'ps5', name: 'Sony PlayStation 5', category: 'Console', count: 5, price: 900, val: 49999 },
      { id: 'xbox', name: 'Xbox Series X', category: 'Console', count: 3, price: 800, val: 44999 },
      { id: 'switch', name: 'Nintendo Switch OLED', category: 'Console', count: 4, price: 600, val: 32999 },
      { id: 'vr', name: 'Meta Quest 3', category: 'VR Gear', count: 2, price: 1200, val: 45999 }
    ];
    const items = [];
    for (const consoleDef of consoleDefs) {
      for (let i = 0; i < consoleDef.count; i++) {
        items.push({
          name: consoleDef.name,
          consoleId: consoleDef.id,
          category: consoleDef.category,
          status: 'Available',
          health: 100,
          usageCount: 0,
          lastService: new Date(),
          location: 'Secure_Bay_Alpha',
          serialNumber: `SN-${consoleDef.id.toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          purchaseDate: new Date(),
          basePricePerDay: consoleDef.price,
          purchasePrice: consoleDef.val,
          kitRequired: ['Console', 'Controller', 'HDMI 2.1', 'Power Lead']
        });
      }
    }
    await Inventory.deleteMany({});
    const seeded = await Inventory.insertMany(items);
    res.json(seeded);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Rental Routes
app.get('/api/rentals', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const rentals = await Rental.find(query).populate('userId', 'username email kyc_status');
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rentals/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const rentals = await Rental.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/rentals/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (req.user.role !== 'admin' && rental.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const updates = req.user.role === 'admin' ? req.body : { status: req.body.status };
    const updatedRental = await Rental.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedRental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/rentals/catalog', auth, admin, async (req, res) => {
  try {
    const rental = new Rental(req.body);
    await rental.save();
    res.status(201).json(rental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/rentals/:id', auth, admin, async (req, res) => {
  try {
    await Rental.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rental deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const normalizeAddress = (addr) => (addr || '').toLowerCase().replace(/[^a-z0-9]/g, '');

app.post('/api/rentals', auth, async (req, res) => {
  try {
    const { shippingAddress, deliveryMethod, startDate, pickupSlot } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.kyc_status !== 'APPROVED') {
      return res.status(403).json({ error: 'KYC_NOT_APPROVED: Identity verification required for hardware deployment.' });
    }
    if (deliveryMethod === 'delivery') {
      const kyc = await KYC.findOne({ userId });
      if (!kyc) return res.status(404).json({ error: 'KYC record not found' });
      if (normalizeAddress(shippingAddress) !== normalizeAddress(kyc.address)) {
        return res.status(403).json({ error: 'ADDRESS_MISMATCH: Deliveries are strictly restricted to your verified KYC residency.' });
      }
    }
    if (pickupSlot && startDate) {
      const slotDate = new Date(startDate).toISOString().split('T')[0];
      const existingPickups = await Rental.countDocuments({
        'pickupSlot.slotId': pickupSlot.slotId,
        startDate: { $gte: new Date(slotDate + 'T00:00:00'), $lt: new Date(slotDate + 'T23:59:59') },
        status: { $nin: ['cancelled', 'completed', 'returned'] }
      });
      const maxBookings = pickupSlot.maxBookings || 3;
      if (existingPickups >= maxBookings) {
        return res.status(409).json({ error: 'SLOT_UNAVAILABLE: This time slot is fully booked. Please select another slot.' });
      }
    }
    if (deliveryMethod === 'pickup') {
      const rentalCount = await Rental.countDocuments({ userId });
      if (rentalCount === 0) {
        return res.status(403).json({ error: 'FIRST_TIME_RESTRICTION: First-time deployment requires Home Delivery for security validation.' });
      }
    }
    const rental = new Rental({ ...req.body, userId });
    await rental.save();
    res.status(201).json(rental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/rentals/slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date).toISOString().split('T')[0];
    const dayStart = new Date(targetDate + 'T00:00:00');
    const dayEnd = new Date(targetDate + 'T23:59:59');
    const bookings = await Rental.find({
      startDate: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ['cancelled', 'completed', 'returned'] }
    });
    const slots = [
      { id: 'morning', label: 'Morning', startTime: '10:00', endTime: '12:00', maxBookings: 3 },
      { id: 'midday', label: 'Midday', startTime: '12:00', endTime: '14:00', maxBookings: 3 },
      { id: 'afternoon', label: 'Afternoon', startTime: '14:00', endTime: '16:00', maxBookings: 3 },
      { id: 'late-afternoon', label: 'Late Afternoon', startTime: '16:00', endTime: '18:00', maxBookings: 3 },
      { id: 'evening', label: 'Evening', startTime: '18:00', endTime: '20:00', maxBookings: 3 }
    ];
    const slotAvailability = slots.map(slot => {
      const slotBookings = bookings.filter(b => b.pickupSlot?.slotId === slot.id);
      return {
        ...slot,
        bookedCount: slotBookings.length,
        available: slot.maxBookings - slotBookings.length,
        isAvailable: slot.maxBookings - slotBookings.length > 0
      };
    });
    res.json(slotAvailability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory/available', async (req, res) => {
  try {
    const { startDate, endDate, consoleId } = req.query;
    if (!startDate || !endDate || !consoleId) {
      return res.status(400).json({ error: 'Missing required parameters: startDate, endDate, consoleId' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const units = await Inventory.find({ consoleId, status: { $ne: 'Retired' } });
    const overlappingRentals = await Rental.find({
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
      status: { $nin: ['cancelled', 'completed', 'returned'] }
    });
    const rentedUnitIds = overlappingRentals.map(r => r.unitId);
    const availableUnits = units.filter(u => !rentedUnitIds.includes(u._id.toString()) && u.status === 'Available');
    res.json({
      available: availableUnits.length,
      units: availableUnits.map(u => ({ id: u._id, serialNumber: u.serialNumber })),
      total: units.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// KYC Routes
app.post('/api/kyc/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.get('/api/kyc-all', auth, admin, async (req, res) => {
  try {
    const kycs = await KYC.find().sort({ submittedAt: -1 });
    res.json(kycs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kyc/:userId', auth, admin, async (req, res) => {
  try {
    const { userId } = req.params;
    await KYC.findOneAndDelete({ userId });
    await User.findByIdAndUpdate(userId, { kyc_status: null, kyc_resubmissions: 0 });
    res.json({ message: 'KYC record purged and status reset.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/kyc/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const kyc = await KYC.findOne({ userId: req.params.userId });
    res.json(kyc || { status: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kyc', auth, async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    console.log(`Processing KYC for user: ${userId}`);
    
    if (req.user.id !== userId) {
      console.warn(`Auth mismatch: Token user ${req.user.id} vs requested user ${userId}`);
      return res.status(403).json({ error: 'Access denied. User ID mismatch.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const existingKyc = await KYC.findOne({ userId });
    console.log(`Existing KYC status: ${existingKyc?.status || 'none'}`);

    if (existingKyc?.status === 'REJECTED' && !existingKyc.resubmissionAllowed) {
      return res.status(403).json({ error: 'KYC_REJECTED_PERMANENT: Further resubmissions are not allowed.' });
    }

    const canResubmit = !existingKyc || existingKyc.status === 'REJECTED' || existingKyc.status === 'REVERIFICATION_REQUESTED';
    if (!canResubmit) {
      console.warn(`Blocking resubmission. Status: ${existingKyc.status}`);
      return res.status(400).json({ error: 'KYC_ALREADY_EXISTS: A verification process is already active or complete.' });
    }

    const resubmissions = user.kyc_resubmissions || 0;
    if (existingKyc?.status === 'REJECTED' && resubmissions >= 3) {
      await KYC.findOneAndUpdate({ userId }, { resubmissionAllowed: false });
      return res.status(403).json({ error: 'KYC_LIMIT_EXCEEDED: Maximum resubmission attempts (3) reached.' });
    }

    // Reports simulation...
    const reports = [{
      agentName: 'Document Specialist',
      status: 'PASS',
      message: 'Primary ID validated.',
      details: `Extracted Name: ${data.fullName}`,
      timestamp: new Date()
    }];
    
    // ... (rest of reports)
    reports.push(
      { agentName: 'Biometric Analyst', status: 'PASS', message: 'Facial match successful.', details: 'Liveness check PASSED.', timestamp: new Date() },
      { agentName: 'Compliance Officer', status: 'PASS', message: 'No risk indicators found.', details: 'Verified.', timestamp: new Date() }
    );

    const trustScore = 95;
    const status = 'MANUAL_REVIEW';

    const kycUpdate = { 
      ...data, 
      agentReports: reports,
      trustScore,
      status,
      updatedAt: Date.now(),
      submittedAt: existingKyc?.status === 'REJECTED' ? new Date() : existingKyc?.submittedAt || new Date(),
      resubmissionAllowed: true,
      rejectionReason: null
    };

    console.log('Saving KYC record...');
    const kyc = await KYC.findOneAndUpdate({ userId }, kycUpdate, { upsert: true, new: true });
    
    const userUpdate = { kyc_status: status, last_kyc_submission: new Date() };
    if (existingKyc?.status === 'REJECTED') { userUpdate.kyc_resubmissions = resubmissions + 1; }
    
    await User.findByIdAndUpdate(userId, userUpdate);
    console.log('KYC submission successful');
    res.json(kyc);
  } catch (err) {
    console.error('KYC submission error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/kyc/:id/status', auth, admin, async (req, res) => {
  try {
    const { status, notes, verifiedBy, verifiedAt, rejectionReason, allowResubmission } = req.body;
    const updateData = { status, adminNotes: notes, verifiedBy, verifiedAt };
    if (status === 'REJECTED' || status === 'REVERIFICATION_REQUESTED') {
      updateData.rejectionReason = rejectionReason || 'Documents did not meet verification criteria.';
      updateData.resubmissionAllowed = allowResubmission !== false;
    }
    const kyc = await KYC.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (kyc) { await User.findByIdAndUpdate(kyc.userId, { kyc_status: status }); }
    res.json(kyc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Order Routes
app.get('/api/orders', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.kyc_status !== 'APPROVED') {
      return res.status(403).json({ error: 'KYC_NOT_APPROVED: Identity verification required for orders.' });
    }
    const kyc = await KYC.findOne({ userId });
    if (!kyc) return res.status(404).json({ error: 'KYC record not found' });
    if (normalizeAddress(shippingAddress) !== normalizeAddress(kyc.address)) {
      return res.status(403).json({ error: 'ADDRESS_MISMATCH: Deliveries are strictly restricted to your verified KYC residency.' });
    }
    const order = new Order({ ...req.body, userId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', auth, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Notification Routes
app.get('/api/notifications/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/diag', (req, res) => {
  const uri = process.env.MONGODB_URI || 'not set';
  const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown';
  res.json({ 
    uri: uri.replace(/:([^@]+)@/, ':****@'),
    dbName: dbName
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    try {
      await connectDB();
    } catch (err) {
      console.error('Initial DB connection failed');
    }
  });
}

module.exports = app;
