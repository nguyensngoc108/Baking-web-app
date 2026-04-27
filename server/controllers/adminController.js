import Cake from '../models/Cake.js';
import cakeIngredient from '../models/cakeIngredient.js';
import Admin from '../models/Admin.js';





// Set or create signature cake (Admin only)
export const createSignatureCake = async (req, res) => {
  try {
    console.log('Creating signature cake:', req.body);
    // Validate ingredients - check if all ingredient ids exist and have required fields
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredientId);
      const validIngredients = await cakeIngredient.find({ _id: { $in: ingredientIds } });
      if (validIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ message: 'One or more ingredient IDs are invalid' });
      }
      // Validate that each ingredient has required fields
      for (let ing of req.body.ingredients) {
        if (!ing.ingredientId || ing.totalCost === undefined || !ing.measure || ing.each === undefined || ing.totalEach === undefined) {
          return res.status(400).json({ message: 'Each ingredient must have ingredientId, totalCost, measure, each, and totalEach' });
        }
      }
    }
    // Remove signature flag from all cakes
    await Cake.updateMany({}, { isSignature: false });

    // Create new signature cake
    const cake = new Cake({
      ...req.body,
      isSignature: true,
    });
    const savedCake = await cake.save();
    res.status(201).json(savedCake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update signature cake (Admin only)
export const updateSignatureCake = async (req, res) => {
  try {
    console.log('Updating signature cake:', req.params.id);
    // Validate ingredients if provided
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredientId);
      const validIngredients = await cakeIngredient.find({ _id: { $in: ingredientIds } });
      if (validIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ message: 'One or more ingredient IDs are invalid' });
      }
      // Validate that each ingredient has required fields
      for (let ing of req.body.ingredients) {
        if (!ing.ingredientId || ing.totalCost === undefined || !ing.measure || ing.each === undefined || ing.totalEach === undefined) {
          return res.status(400).json({ message: 'Each ingredient must have ingredientId, totalCost, measure, each, and totalEach' });
        }
      }
    }
    // Remove signature flag from all other cakes
    await Cake.updateMany({ _id: { $ne: req.params.id } }, { isSignature: false });

    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isSignature: true },
      { new: true }
    );
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create cake (Admin only)
export const createCake = async (req, res) => {
  try {
    const adminId = req.admin._id;
    console.log('Creating cake:', req.body);
    // Validate ingredients - check if all ingredient ids exist and have required fields
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredientId);
      const validIngredients = await cakeIngredient.find({ _id: { $in: ingredientIds } });
      if (validIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ message: 'One or more ingredient IDs are invalid' });
      }
      // Validate that each ingredient has required fields
      for (let ing of req.body.ingredients) {
        if (!ing.ingredientId || ing.totalCost === undefined || !ing.measure || ing.each === undefined || ing.totalEach === undefined) {
          return res.status(400).json({ message: 'Each ingredient must have ingredientId, totalCost, measure, each, and totalEach' });
        }
      }
    }

    const cake = new Cake({ ...req.body, createdBy: adminId });
    const savedCake = await cake.save();
    res.status(201).json(savedCake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update cake (Admin only)
export const updateCake = async (req, res) => {
  try {
    console.log('Updating cake:', req.params.id);
    const adminId = req.admin._id;
    // Validate ingredients if provided
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map(ing => ing.ingredientId);
      const validIngredients = await cakeIngredient.find({ _id: { $in: ingredientIds } });
      if (validIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ message: 'One or more ingredient IDs are invalid' });
      }
      // Validate that each ingredient has required fields
      for (let ing of req.body.ingredients) {
        if (!ing.ingredientId || ing.totalCost === undefined || !ing.measure || ing.each === undefined || ing.totalEach === undefined) {
          return res.status(400).json({ message: 'Each ingredient must have ingredientId, totalCost, measure, each, and totalEach' });
        }
      }
    }

    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: adminId },
      { new: true }
    );
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addIngredient = async (req, res) => {
  try {
    const adminId = req.admin._id;
    console.log("admin id:", adminId);
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: 'Unauthorized' });
    // add new ingredient to to cakeIngredient collection , check if the name exists in the collection,
    const { name } = req.body;
    const existingIngredient = await cakeIngredient.findOne({
      name: name.trim().toLowerCase()
    });
    if (existingIngredient) {
      return res.status(400).json({ message: 'Ingredient already exists' });
    }
    const newIngredient = new cakeIngredient({ name: name.trim().toLowerCase() });
    const savedIngredient = await newIngredient.save();
    res.status(201).json(savedIngredient);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getIngredients = async (req, res) => {
  try {
    const ingredients = await cakeIngredient.find();
    res.json(ingredients);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteIngredient = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: 'Unauthorized' });
    const ingredient = await cakeIngredient.findByIdAndDelete(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    res.json({ message: 'Ingredient deleted' });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  
     
// Delete cake (Admin only)
export const deleteCake = async (req, res) => {
  try {
    console.log('Deleting cake:', req.params.id);
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: 'Unauthorized' });
    const cake = await Cake.findByIdAndDelete(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json({ message: 'Cake deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
