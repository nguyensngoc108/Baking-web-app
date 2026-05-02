import Cake from '../models/Cake.js';
import RecipeIngredient from '../models/RecipeIngredient.js';
import CakeIngredient from '../models/CakeIngredient.js';


// Get signature cake
export const getSignatureCake = async (req, res) => {
  try {
    const signatureCake = await Cake.findOne({ isSignature: true });
    if (!signatureCake) {
      return res.status(404).json({ message: 'No signature cake set' });
    }
    const ingredients = await RecipeIngredient.find({ cakeId: signatureCake._id }).populate('ingredientId');
    res.json({ ...signatureCake.toObject(), ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cakes
export const getAllCakes = async (req, res) => {
  try {
    const cakes = await Cake.find();
    
    // Fetch ingredients for each cake (only show ingredient names)
    const cakesWithIngredients = await Promise.all(
      cakes.map(async (cake) => {
        const recipeIngredients = await RecipeIngredient.find({ cakeId: cake._id }).populate('ingredientId');
        const ingredients = recipeIngredients.map(ing => ({
          id: ing.ingredientId._id,
          name: ing.ingredientId.name
        }));
        return { ...cake.toObject(), ingredients };
      })
    );
    
    res.json(cakesWithIngredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single cake
export const getCakeById = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    
    const ingredients = await RecipeIngredient.find({ cakeId: req.params.id }).populate('ingredientId');
    res.json({ ...cake.toObject(), ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

