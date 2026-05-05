import Cake from "../models/Cake.js";
import RecipeIngredient from "../models/RecipeIngredient.js";
import CakeIngredient from "../models/CakeIngredient.js";
import Admin from "../models/Admin.js";
import PackagingOption from "../models/PackagingOption.js";
import Category from "../models/Category.js";
import { uploadImage, deleteImage } from "../utils/imageService.js";

export const getRecipeIngredients = async (req, res) => {
  try {
    const cakes = await Cake.find();

    const cakesWithIngredients = await Promise.all(
      cakes.map(async (cake) => {
        const ingredients = await RecipeIngredient.find({
          cakeId: cake._id,
        }).populate("ingredientId");
        return { ...cake.toObject(), ingredients };
      }),
    );

    const cakesWithCosts = cakesWithIngredients.map((cake) => {
      const totalRecipeCost = cake.ingredients.reduce((sum, ing) => {
        const cost = (ing.totalCost / ing.measure) * ing.each;
        return sum + cost;
      }, 0);

      return {
        ...cake,
        totalRecipeCost: Math.round(totalRecipeCost * 100) / 100,
      };
    });

    res
      .status(200)
      .json({
        message: "Cakes and ingredients retrieved successfully",
        data: cakesWithCosts,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecipeIngredients = async (req, res) => {
  try {
    // this function will edit the ingredients of a cake, it will receive the cake id and edit the RecipeIngredient collection
    const { cakeId, ingredients } = req.body;

    // Validate cakeId
    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return res.status(404).json({ message: "Cake not found" });
    }
    // Validate ingredients
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ message: "Ingredients must be an array" });
    }
    for (let ing of ingredients) {
      if (
        !ing.ingredientId ||
        ing.totalCost === undefined ||
        !ing.measure ||
        ing.each === undefined ||
        ing.totalEach === undefined
      ) {
        return res
          .status(400)
          .json({
            message:
              "Each ingredient must have ingredientId, totalCost, measure, each, and totalEach",
          });
      }
    }

    // Delete old ingredients for the cake
    await RecipeIngredient.deleteMany({ cakeId: cakeId });

    // Create new ingredients for the cake
    const recipeIngredients = ingredients.map((ing) => ({
      cakeId: cakeId,
      ingredientId: ing.ingredientId,
      totalCost: ing.totalCost,
      measure: ing.measure,
      each: ing.each,
      totalEach: ing.totalEach,
    }));

    await RecipeIngredient.insertMany(recipeIngredients);

    res.status(200).json({ message: "Cake ingredients updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeRecipeIngredient = async (req, res) => {
  try {
    const { cakeId, ingredientId } = req.body;
    await RecipeIngredient.findOneAndDelete({
      cakeId: cakeId,
      ingredientId: ingredientId,
    });
    res.status(200).json({ message: "Ingredient removed from cake successfully" });
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Set or create signature cake (Admin only)
export const createSignatureCake = async (req, res) => {
  try {
    console.log("Creating signature cake:", req.body);

    // Create cake without ingredients first
    const cakeData = { ...req.body };
    delete cakeData.ingredients;

    // Remove signature flag from all cakes
    await Cake.updateMany({}, { isSignature: false });

    // Create new signature cake
    const cake = new Cake({
      ...cakeData,
      isSignature: true,
    });
    const savedCake = await cake.save();

    // Handle ingredients if provided
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map((ing) => ing.ingredientId);

      // Validate all ingredient ids exist
      const validIngredients = await CakeIngredient.find({
        _id: { $in: ingredientIds },
      });
      if (validIngredients.length !== ingredientIds.length) {
        await Cake.findByIdAndDelete(savedCake._id);
        return res
          .status(400)
          .json({ message: "One or more ingredient IDs are invalid" });
      }

      // Validate fields
      for (let ing of req.body.ingredients) {
        if (
          !ing.ingredientId ||
          ing.totalCost === undefined ||
          !ing.measure ||
          ing.each === undefined ||
          ing.totalEach === undefined
        ) {
          await Cake.findByIdAndDelete(savedCake._id);
          return res
            .status(400)
            .json({
              message:
                "Each ingredient must have ingredientId, totalCost, measure, each, and totalEach",
            });
        }
      }

      // Create RecipeIngredient entries
      const recipeIngredients = req.body.ingredients.map((ing) => ({
        cakeId: savedCake._id,
        ingredientId: ing.ingredientId,
        totalCost: ing.totalCost,
        measure: ing.measure,
        each: ing.each,
        totalEach: ing.totalEach,
      }));

      await RecipeIngredient.insertMany(recipeIngredients);
    }

    const recipeIngredients = await RecipeIngredient.find({
      cakeId: savedCake._id,
    }).populate("ingredientId");
    res
      .status(201)
      .json({ ...savedCake.toObject(), ingredients: recipeIngredients });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update signature cake (Admin only)
export const updateSignatureCake = async (req, res) => {
  try {
    console.log("Updating signature cake:", req.params.id);

    const cakeData = { ...req.body };
    const ingredients = cakeData.ingredients;
    delete cakeData.ingredients;

    // Validate ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      const ingredientIds = ingredients.map((ing) => ing.ingredientId);
      const validIngredients = await CakeIngredient.find({
        _id: { $in: ingredientIds },
      });
      if (validIngredients.length !== ingredientIds.length) {
        return res
          .status(400)
          .json({ message: "One or more ingredient IDs are invalid" });
      }

      for (let ing of ingredients) {
        if (
          !ing.ingredientId ||
          ing.totalCost === undefined ||
          !ing.measure ||
          ing.each === undefined ||
          ing.totalEach === undefined
        ) {
          return res
            .status(400)
            .json({
              message:
                "Each ingredient must have ingredientId, totalCost, measure, each, and totalEach",
            });
        }
      }

      // Delete old and create new recipe ingredients
      await RecipeIngredient.deleteMany({ cakeId: req.params.id });

      const recipeIngredients = ingredients.map((ing) => ({
        cakeId: req.params.id,
        ingredientId: ing.ingredientId,
        totalCost: ing.totalCost,
        measure: ing.measure,
        each: ing.each,
        totalEach: ing.totalEach,
      }));

      await RecipeIngredient.insertMany(recipeIngredients);
    }

    // Remove signature flag from all other cakes
    await Cake.updateMany(
      { _id: { $ne: req.params.id } },
      { isSignature: false },
    );

    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { ...cakeData, isSignature: true },
      { new: true },
    );
    if (!cake) return res.status(404).json({ message: "Cake not found" });

    const recipeIngredients = await RecipeIngredient.find({
      cakeId: req.params.id,
    }).populate("ingredientId");
    res.json({ ...cake.toObject(), ingredients: recipeIngredients });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create cake (Admin only)
export const createCake = async (req, res) => {
  try {
    const adminId = req.admin._id;
    console.log("Creating cake:", req.body);

    // Check if cake with same name already exists
    const existingCake = await Cake.findOne({
      name: req.body.name.trim().toLowerCase(),
    });
    if (existingCake) {
      return res
        .status(400)
        .json({ message: "Cake with this name already exists" });
    }

    // Create cake without ingredients first
    const cakeData = { ...req.body };
    delete cakeData.ingredients; // Remove ingredients from cake data

    const cake = new Cake({ ...cakeData, createdBy: adminId });
    const savedCake = await cake.save();

    // Handle ingredients if provided
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      const ingredientIds = req.body.ingredients.map((ing) => ing.ingredientId);

      // Validate all ingredient ids exist
      const validIngredients = await CakeIngredient.find({
        _id: { $in: ingredientIds },
      });
      if (validIngredients.length !== ingredientIds.length) {
        // Delete the cake since ingredients are invalid
        await Cake.findByIdAndDelete(savedCake._id);
        return res
          .status(400)
          .json({ message: "One or more ingredient IDs are invalid" });
      }

      // Validate that each ingredient has required fields
      for (let ing of req.body.ingredients) {
        if (
          !ing.ingredientId ||
          ing.totalCost === undefined ||
          !ing.measure ||
          ing.each === undefined ||
          ing.totalEach === undefined
        ) {
          await Cake.findByIdAndDelete(savedCake._id);
          return res
            .status(400)
            .json({
              message:
                "Each ingredient must have ingredientId, totalCost, measure, each, and totalEach",
            });
        }
      }

      // Create RecipeIngredient entries
      const recipeIngredients = req.body.ingredients.map((ing) => ({
        cakeId: savedCake._id,
        ingredientId: ing.ingredientId,
        totalCost: ing.totalCost || 0,
        measure: ing.measure || "",
        each: ing.each || 0,
        totalEach: ing.totalEach || 0,
      }));

      await RecipeIngredient.insertMany(recipeIngredients);
    }

    // Fetch the cake with populated ingredients
    const cakeWithIngredients = await Cake.findById(savedCake._id);
    const recipeIngredients = await RecipeIngredient.find({
      cakeId: savedCake._id,
    }).populate("ingredientId");

    res
      .status(201)
      .json({
        ...cakeWithIngredients.toObject(),
        ingredients: recipeIngredients,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cake (Admin only)
export const updateCake = async (req, res) => {
  try {
    console.log("Updating cake:", req.params.id);
    const adminId = req.admin._id;

    const cakeData = { ...req.body };
    const ingredients = cakeData.ingredients;
    delete cakeData.ingredients; // Remove ingredients from cake update data

    // Validate ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      const ingredientIds = ingredients.map((ing) => ing.ingredientId);
      const validIngredients = await CakeIngredient.find({
        _id: { $in: ingredientIds },
      });
      if (validIngredients.length !== ingredientIds.length) {
        return res
          .status(400)
          .json({ message: "One or more ingredient IDs are invalid" });
      }

      // Validate that each ingredient has required fields
      for (let ing of ingredients) {
        if (
          !ing.ingredientId ||
          ing.totalCost === undefined ||
          !ing.measure ||
          ing.each === undefined ||
          ing.totalEach === undefined
        ) {
          return res
            .status(400)
            .json({
              message:
                "Each ingredient must have ingredientId, totalCost, measure, each, and totalEach",
            });
        }
      }

      // Delete old recipe ingredients and create new ones
      await RecipeIngredient.deleteMany({ cakeId: req.params.id });

      const recipeIngredients = ingredients.map((ing) => ({
        cakeId: req.params.id,
        ingredientId: ing.ingredientId,
        totalCost: ing.totalCost || 0,
        measure: ing.measure || "",
        each: ing.each || 0,
        totalEach: ing.totalEach || 0,
      }));

      await RecipeIngredient.insertMany(recipeIngredients);
    }

    const cake = await Cake.findByIdAndUpdate(
      req.params.id,
      { ...cakeData, updatedBy: adminId },
      { new: true },
    );

    if (!cake) return res.status(404).json({ message: "Cake not found" });

    // Fetch recipe ingredients
    const recipeIngredients = await RecipeIngredient.find({
      cakeId: req.params.id,
    }).populate("ingredientId");
    res.json({ ...cake.toObject(), ingredients: recipeIngredients });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addIngredient = async (req, res) => {
  try {
    const adminId = req.admin._id;
    console.log("admin id:", adminId);
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });
    // add new ingredient to CakeIngredient collection, check if the name exists
    const { name } = req.body;
    const existingIngredient = await CakeIngredient.findOne({
      name: name.trim().toLowerCase(),
    });
    if (existingIngredient) {
      return res.status(400).json({ message: "Ingredient already exists" });
    }
    const newIngredient = new CakeIngredient({
      name: name.trim().toLowerCase(),
    });
    const savedIngredient = await newIngredient.save();
    res.status(201).json(savedIngredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getIngredients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ingredients = await CakeIngredient.find(query);
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });
    const ingredient = await CakeIngredient.findByIdAndDelete(req.params.id);
    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });
    // Also delete all recipe ingredients that use this ingredient
    await RecipeIngredient.deleteMany({ ingredientId: req.params.id });
    res.json({ message: "Ingredient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete cake (Admin only)
export const deleteCake = async (req, res) => {
  try {
    console.log("Deleting cake:", req.params.id);
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });
    const cake = await Cake.findByIdAndDelete(req.params.id);
    if (!cake) return res.status(404).json({ message: "Cake not found" });
    res.json({ message: "Cake deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Packaging Options Management

// Create packaging option (Admin only)
export const createPackagingOption = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });

    const { name, price } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Check if packaging option already exists
    const existingOption = await PackagingOption.findOne({
      name: name.trim().toLowerCase(),
    });
    if (existingOption) {
      return res
        .status(400)
        .json({ message: "Packaging option with this name already exists" });
    }

    const packagingOption = new PackagingOption({
      name: name.trim().toLowerCase(),
      price: parseFloat(price),
    });

    const savedOption = await packagingOption.save();
    res.status(201).json(savedOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all packaging options
export const getPackagingOptions = async (req, res) => {
  try {
    const options = await PackagingOption.find();
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update packaging option (Admin only)
export const updatePackagingOption = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });

    const { name, price, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim().toLowerCase();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check if name already exists (if being updated)
    if (name) {
      const existingOption = await PackagingOption.findOne({
        name: name.trim().toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (existingOption) {
        return res
          .status(400)
          .json({ message: "Packaging option with this name already exists" });
      }
    }

    const packagingOption = await PackagingOption.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!packagingOption) {
      return res.status(404).json({ message: "Packaging option not found" });
    }

    res.json(packagingOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete packaging option (Admin only)
export const deletePackagingOption = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(403).json({ message: "Unauthorized" });

    const packagingOption = await PackagingOption.findByIdAndDelete(
      req.params.id,
    );
    if (!packagingOption) {
      return res.status(404).json({ message: "Packaging option not found" });
    }

    res.json({ message: "Packaging option deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Category Management ──────────────────────────────────────────────────────

const toSlug = (name) =>
  name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

export const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug = toSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = new Category({
      name: name.trim(),
      slug,
      description: description || '',
      color: color || '#6366f1',
    });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const updateData = {};

    if (name) {
      const newSlug = toSlug(name);
      const conflict = await Category.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (conflict) return res.status(400).json({ message: "Category name already exists" });

      const old = await Category.findById(req.params.id);
      if (old && old.slug !== newSlug) {
        await Cake.updateMany({ category: old.slug }, { category: newSlug });
      }
      updateData.name = name.trim();
      updateData.slug = newSlug;
    }
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
