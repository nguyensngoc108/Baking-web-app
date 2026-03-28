import User from '../models/User.js';


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id
        .select('-password'));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  }
    catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id
        .select('-password'));
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.gender = req.body.gender || user.gender;
    user.address = req.body.address || user.address;
    user.phone = req.body.phone || user.phone;
    user.details = req.body.details || user.details;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { currentPassword, newPassword } = req.body;

        // Check if current password is correct
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Update to new password
        user.password = newPassword; // This will be hashed by the pre-save hook
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

