const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One cart per user
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            price: Number,
            image: String,
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1'],
                default: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    // Calculate total items
    this.totalItems = this.items.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
    
    // Calculate total price
    this.totalPrice = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;