const mongoose = require('mongoose');

// Customer Schema
const customerSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    address: String
});

// Order Schema
const orderSchema = new mongoose.Schema({
    order_id: Number,
    customer_id: {
        type: Number,
        ref: 'Customer' // Reference to the Customer model
    },
    product: String
});

// Create Models
const Customer = mongoose.model('Customer', customerSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Customer, Order };
