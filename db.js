//db.js
const { ObjectId, MongoClient } = require("mongodb");


const PAGE_SIZE =5;

async function connect() {
    if (global.connection) return global.connection;

    const client = new MongoClient(process.env.MONGODB_CONNECTION);

    try {
        await client.connect();
        global.connection = client.db(process.env.MONGODB_DATABASE);
        console.log("Connected!");
    } catch (err) {
        console.error(err);
        global.connection = null;
    }

    return global.connection;
}

// customers

async function countCustomers() {
    const connection = await connect();
    return connection
        .collection("customers")
        .countDocuments();
        
}

async function findCustomers(page = 1) {
   
    const totalSkip = (page - 1) * PAGE_SIZE;
   
    const connection = await connect();
    return connection
        .collection("customers")
        .find({})
        .skip(totalSkip)
        .limit(PAGE_SIZE)
        .toArray();
}

async function findCustomer(id) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("customers")
        .findOne({ _id: objectId });
}

async function insertCustomer(customer) {
    const connection = await connect();
    return connection
        .collection("customers")
        .insertOne(customer);
}

async function updateCustomer(id, customer) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("customers")
        .updateOne({ _id: objectId }, { $set: customer });
}

async function deleteCustomer(id) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("customers")
        .deleteOne({ _id: objectId });
}


//users

async function countUsers() {
    const connection = await connect();
    return connection
        .collection("users")
        .countDocuments();
        
}

async function findUsers(page = 1) {
   
    const totalSkip = (page - 1) * PAGE_SIZE;
   
    const connection = await connect();
    return connection
        .collection("users")
        .find({})
        .skip(totalSkip)
        .limit(PAGE_SIZE)
        .toArray();
}

async function findUser(id) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("users")
        .findOne({ _id: objectId });
}

async function insertUser(user) {
    const connection = await connect();
    return connection
        .collection("users")
        .insertOne(user);
}

async function updateUser(id, user) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("users")
        .updateOne({ _id: objectId }, { $set: user });
}

async function deleteUser(id) {
    const objectId = ObjectId.createFromHexString(id);
    const connection = await connect();
    return connection
        .collection("users")
        .deleteOne({ _id: objectId });
}




module.exports = {
    PAGE_SIZE,
    findCustomers,
    insertCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomer,
    countCustomers,
    findUsers,
    insertUser,
    updateUser,
    deleteUser,
    findUser,
    countUsers,
   
   
    connect
}