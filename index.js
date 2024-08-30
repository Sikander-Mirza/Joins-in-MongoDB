const express = require('express');
const mongoose = require('mongoose');
const { Customer, Order } = require('./model');

// Initialize Express
const app = express();
app.use(express.json());

// MongoDB Connection URI
const uri = 'mongodb+srv://sikandersunny2017:VWo4sEgFqok4ol3w@cluster0.0g0br.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB using Mongoose (without deprecated options)
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// API to insert a new customer
app.post('/customers', async (req, res) => {
    console.log(req.body);
    try {
        const customer = new Customer(req.body);
        const data = await Customer.create(customer);
        res.status(201).json(data);
        console.log(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to insert a new order
app.post('/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        const data = await Order.create(order)
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// API to get orders with customer info
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('customer_id'); // Populate the customer_id field
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/",(req,res)=>{
    res.send("Hello World");
})


app.get('/inner-join-orders', async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $lookup: {
                    from: 'customers', // Collection to join (use the name of the collection, not the model name)
                    localField: 'customer_id', // Field from the Order collection
                    foreignField: '_id', // Field from the Customer collection
                    as: 'customerInfo' // Output array field
                }
            },
            {
                $unwind: '$customerInfo' // Unwind to flatten the array, simulating an inner join
            }
        ]);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get customers with their orders (Right Outer Join equivalent)
app.get('/right-join-customers', async (req, res) => {
    try {
        const customers = await Customer.aggregate([
            {
                $lookup: {
                    from: 'orders', // Collection to join
                    localField: '_id', // Field from the Customer collection
                    foreignField: 'customer_id', // Field from the Order collection
                    as: 'orders' // Output array field
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    address: 1,
                    orders: { $ifNull: ['$orders', []] } // If there are no orders, return an empty array
                }
            }
        ]);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// API to get a full outer join equivalent between customers and orders
app.get('/full-join-customers-orders', async (req, res) => {
    try {
        const ordersWithCustomers = await Order.aggregate([
            {
                $lookup: {
                    from: 'customers', // Collection to join
                    localField: 'customer_id', // Field from the Order collection
                    foreignField: '_id', // Field from the Customer collection
                    as: 'customerInfo' // Output array field
                }
            },
            {
                $unwind: {
                    path: '$customerInfo',
                    preserveNullAndEmptyArrays: true // To keep orders without a matching customer
                }
            }
        ]);

        const customersWithOrders = await Customer.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'orders'
                }
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: true // To keep customers without matching orders
                }
            }
        ]);
res.json(ordersWithCustomers)
res.json(customersWithOrders)
        const fullOuterJoin = await mongoose.connection.db.collection('orders').aggregate([
            { $unionWith: { coll: 'customers', pipeline: [] } }
        ]).toArray();

        // res.json(fullOuterJoin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start the Express server
const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
