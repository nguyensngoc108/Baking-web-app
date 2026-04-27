import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId :{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [{
        cakeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cake',
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
})

export default mongoose.model("Cart", cartSchema);