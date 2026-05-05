import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema({
    cakeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cake',
        required: true,
    },
    ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CakeIngredient',
        required: true,
    },
    totalCost: {
        type: Number,
        required: false,
    },
    measure: {
        type: String,
        required: false,
    },
    each: {
        type: Number,
        required: false,
    },
    totalEach: {
        type: Number,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('RecipeIngredient', recipeIngredientSchema);
