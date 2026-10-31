const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const sendOTPEmail = require('../utils/mailer');

const router = express.Router();

const generateToken = (id,role) => {
  return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

// ==========================================
// REGISTER ROUTE (Now generates OTP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { firstName, middleName, lastName, suffix, email, phone, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    // Save to OTP table with new fields
    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await db.query(
      `INSERT INTO otp_verifications 
      (first_name, middle_name, last_name, suffix, email, phone, password, otp_code, expires_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, middleName || null, lastName, suffix || null, email, phone, hashedPassword, otpCode, expiresAt]
    );

    await sendOTPEmail(email, otpCode);
    res.status(200).json({ message: 'OTP sent to email', email: email });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check if fields are provided
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // 2. Find the user in the database
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // 3. Compare the typed password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 4. Check if the selected role matches their database role
    if (user.role !== role) {
      return res.status(403).json({ error: `This account is not registered as an ${role}` });
    }

    // 5. Generate VIP Token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const [pending] = await db.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ?',
      [email, otpCode]
    );

    if (pending.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    const userData = pending[0];

    if (new Date() > new Date(userData.expires_at)) {
      await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);
      return res.status(400).json({ error: 'OTP has expired. Please register again.' });
    }

    // Move to real users table with new fields
    const [result] = await db.query(
      `INSERT INTO users 
      (first_name, middle_name, last_name, suffix, email, phone, password, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userData.first_name, userData.middle_name, userData.last_name, userData.suffix, userData.email, userData.phone, userData.password, 'customer']
    );

    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    const token = generateToken(result.insertId, 'customer');

    res.status(201).json({
      message: 'Account verified successfully',
      token,
      user: { 
        id: result.insertId, 
        firstName: userData.first_name, 
        middleName: userData.middle_name,
        lastName: userData.last_name, 
        suffix: userData.suffix,
        email: userData.email, 
        phone: userData.phone,
        role: 'customer' 
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

module.exports = router;
