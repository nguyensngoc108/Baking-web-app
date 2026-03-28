import bcyptjs from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { generateAdminToken, generateUserToken } from '../middleware/authMiddleware.js';

// Admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login request received:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcyptjs.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateAdminToken(admin);

    console.log('Login successful for:', email);
    res.json({ 
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin registration
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Registration request received:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Password will be hashed by Admin model's pre-save hook
    const admin = new Admin({ email, password });
    const savedAdmin = await admin.save();

    console.log('Admin registered successfully:', email);

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: savedAdmin._id,
        email: savedAdmin.email
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};


// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('User login request received:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcyptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateUserToken(user);

    console.log('User login successful for:', email);
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// User registration
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, gender, email, phone, password, street, city, postalCode, dietaryRestrictions } = req.body;

    console.log('User registration request received:', { email });

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !street || !city || !postalCode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    
    // Combine address fields
    const address = `${street}, ${city}, ${postalCode}`;
    
    // Combine details
    const details = `Dietary Restrictions: ${dietaryRestrictions || 'None'}`;

    // Create new user - Password will be hashed by User model's pre-save hook
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      address,
      details
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = generateUserToken(savedUser);

    console.log('User registered successfully:', email);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

