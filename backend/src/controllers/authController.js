const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizeIndianPhone, isValidPincode } = require('../utils/phone');

const register = async (req, res) => {
  try {
    const { name, email, phone, address, pincode, password } = req.body;

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: { code: 'PHONE_REQUIRED', message: 'Your WhatsApp number is required. Please enter a valid 10-digit Indian mobile number.' } });
    }
    if (pincode !== undefined && String(pincode).trim() && !isValidPincode(pincode)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PINCODE', message: 'Please enter a valid 6-digit Indian pincode.' } });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists with this phone number' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: normalizedPhone,
        password: hashedPassword,
        customer: {
          create: {
            name,
            email: email || null,
            phone: normalizedPhone,
            address: address || '',
            pincode: pincode !== undefined && String(pincode).trim() ? String(pincode).trim() : null,
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
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, customerId: user.customer.id }
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

// Customer login — CUSTOMER accounts only. Admin accounts are rejected here
// so the customer-facing login can never be used to authenticate as an admin.
// Admins must use POST /api/auth/admin/login (used only by /admin).
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PHONE', message: 'Please enter a valid 10-digit Indian mobile number.' } });
    }

    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: { customer: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'ADMIN_LOGIN_REQUIRED', message: 'Admin accounts must sign in via the admin portal.' } });
    }

    const customerId = user.customer ? user.customer.id : null;
    const token = jwt.sign({ userId: user.id, customerId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, customerId }
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

// Admin login — ADMIN / SUPER_ADMIN accounts only. Used exclusively by the
// /admin back-office UI (which stores its session under separate
// eskraft-admin-* localStorage keys). Customer accounts are rejected here
// so the two authentication flows stay completely separate.
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_REQUIRED', message: 'Email is required' } });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { customer: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'NOT_AN_ADMIN', message: 'Not an admin account' } });
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

// PATCH /api/auth/me — logged-in user updates own name/email/phone/address/password.
// Issues a fresh token so the customer stays logged in. Never returns password.
// Scoped strictly to req.user.userId so one customer can never update another.
const updateMe = async (req, res) => {
  try {
    const { name, email, phone, address, pincode, whatsappMarketingOptIn, currentPassword, newPassword } = req.body;

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
    let phoneChanged = false;

    if (name !== undefined) {
      const n = String(name).trim();
      if (!n) return res.status(400).json({ success: false, error: { code: 'NAME_REQUIRED', message: 'Name cannot be empty' } });
      if (n !== user.name) { userData.name = n; customerData.name = n; }
    }

    if (email !== undefined) {
      const e = String(email).trim();
      if (e && !EMAIL_RE.test(e)) return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address' } });
      if (e !== (user.email || '')) {
        if (e) {
          const taken = await prisma.user.findUnique({ where: { email: e } });
          if (taken) return res.status(400).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'This email is already registered to another account' } });
        }
        userData.email = e || null; customerData.email = e || null; emailChanged = true;
      }
    }

    if (phone !== undefined) {
      const raw = String(phone).trim();
      if (raw === '') {
        return res.status(400).json({ success: false, error: { code: 'PHONE_REQUIRED', message: 'Your WhatsApp number is required. Please enter a valid 10-digit Indian mobile number.' } });
      } else {
        const normalized = normalizeIndianPhone(raw);
        if (!normalized) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_PHONE', message: 'Please enter a valid 10-digit Indian mobile number.' } });
        }
        if (normalized !== (user.phone || '')) {
          const phoneTaken = await prisma.user.findUnique({ where: { phone: normalized } });
          if (phoneTaken && phoneTaken.id !== user.id) {
            return res.status(400).json({ success: false, error: { code: 'PHONE_TAKEN', message: 'This phone number is already registered to another account' } });
          }
          userData.phone = normalized;
          customerData.phone = normalized;
          phoneChanged = true;
        }
      }
    }

    if (address !== undefined) {
      customerData.address = String(address);
    }

    if (pincode !== undefined) {
      const pin = String(pincode).trim();
      if (pin === '') {
        if (user.customer?.pincode != null) customerData.pincode = null;
      } else {
        if (!isValidPincode(pin)) {
          return res.status(400).json({ success: false, error: { code: 'INVALID_PINCODE', message: 'Please enter a valid 6-digit Indian pincode.' } });
        }
        if (pin !== (user.customer?.pincode || '')) customerData.pincode = pin;
      }
    }

    // Marketing WhatsApp consent — strictly separate from the mandatory
    // order-communication phone number. Only set when explicitly provided.
    if (whatsappMarketingOptIn !== undefined) {
      const optIn = Boolean(whatsappMarketingOptIn);
      if (optIn !== Boolean(user.customer?.whatsappMarketingOptIn)) {
        customerData.whatsappMarketingOptIn = optIn;
      }
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
            phone: customerData.phone ?? userData.phone ?? user.phone,
            address: customerData.address || '',
            pincode: customerData.pincode ?? null,
            whatsappMarketingOptIn: customerData.whatsappMarketingOptIn ?? false,
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
        user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, customerId }
      },
      message: phoneChanged ? 'Profile updated. Please use your new phone number next time you sign in.' : (emailChanged ? 'Profile updated. Please use your new email next time you sign in.' : 'Profile updated successfully')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

module.exports = { register, login, adminLogin, getMe, updateMe };
