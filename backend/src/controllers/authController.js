const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
          customer: {
            create: {
              name,
              email,
              phone,
              address: address || ''
            }
        }
      },
      include: {
        customer: true
      }
    });

    const token = jwt.sign({ userId: user.id, customerId: user.customer.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customer.id }
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    const customerId = user.customer ? user.customer.id : null;
    const token = jwt.sign({ userId: user.id, customerId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, customerId }
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, customer: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PATCH /api/auth/me — logged-in user updates own name/email/address/password.
// Issues a fresh token so the customer stays logged in. Never returns password.
const updateMe = async (req, res) => {
  try {
    const { name, email, address, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { customer: true }
    });
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const userData = {};
    const customerData = {};
    let emailChanged = false;

    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ success: false, error: { code: 'NAME_REQUIRED', message: 'Name cannot be empty' } });
      if (n !== user.name) { userData.name = n; customerData.name = n; }
    }

    if (email !== undefined) {
      const e = String(email).trim();
      if (!EMAIL_RE.test(e)) return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' } });
      if (e !== user.email) {
        const taken = await prisma.user.findUnique({ where: { email: e } });
        if (taken) return res.status(400).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'This email is already registered to another account' } });
        userData.email = e; customerData.email = e; emailChanged = true;
      }
    }

    if (address !== undefined) {
      customerData.address = String(address);
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, error: { code: 'CURRENT_PASSWORD_REQUIRED', message: 'Enter your current password to set a new one' } });
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(401).json({ success: false, error: { code: 'CURRENT_PASSWORD_INCORRECT', message: 'Current password is incorrect' } });
      if (String(newPassword).length < 6) return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: 'New password must be at least 6 characters' } });
      userData.password = await bcrypt.hash(String(newPassword), 10);
    } else if (currentPassword) {
      return res.status(400).json({ success: false, error: { code: 'NEW_PASSWORD_REQUIRED', message: 'Enter a new password (min 6 characters)' } });
    }

    if (Object.keys(userData).length === 0 && Object.keys(customerData).length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NOTHING_TO_UPDATE', message: 'No changes to save' } });
    }

    // Apply updates atomically; create the customer row if this login has none
    // (e.g. legacy admin) and profile fields were sent.
    const ops = [];
    if (Object.keys(userData).length > 0) {
      ops.push(prisma.user.update({ where: { id: user.id }, data: userData }));
    }
    if (Object.keys(customerData).length > 0) {
      if (user.customer) {
        ops.push(prisma.customer.update({ where: { id: user.customer.id }, data: customerData }));
      } else {
        ops.push(prisma.customer.create({
          data: {
            userId: user.id,
            name: customerData.name || userData.name || user.name,
            email: customerData.email || userData.email || user.email,
            phone: user.phone,
            address: customerData.address || ''
          }
        }));
      }
    }
    await prisma.$transaction(ops);

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      include: { customer: true }
    });

    // Fresh token (same claims) — keeps the customer logged in after the update.
    const customerId = updated.customer ? updated.customer.id : req.user.customerId || null;
    const token = jwt.sign({ userId: updated.id, customerId, role: updated.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, customerId }
      },
      message: emailChanged ? 'Profile updated. Please use your new email next time you sign in.' : 'Profile updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

module.exports = { register, login, getMe, updateMe };
