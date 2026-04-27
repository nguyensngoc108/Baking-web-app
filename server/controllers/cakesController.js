import Cake from '../models/Cake.js';


// Get signature cake
export const getSignatureCake = async (req, res) => {
  try {
    const signatureCake = await Cake.findOne({ isSignature: true });
    if (!signatureCake) {
      return res.status(404).json({ message: 'No signature cake set' });
    }
    res.json(signatureCake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cakes
export const getAllCakes = async (req, res) => {
  try {
    const cakes = await Cake.find();
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single cake
export const getCakeById = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

