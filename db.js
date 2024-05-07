
const mongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function connectDatabase(){
if(!global.connection)
    mongoClient.connect(process.env.MONGODB_CONNECTION,

        { useUnifiedTopology:true})
        
        .then(connection=>{
            global.connection = connection.db("test");
            console.log("Connected!");
        })
        .catch(error => {
            console.log(error);
            global.connection = null;

        });
 
}  

    function findCustomers(){
        connectDatabase();
        return global.connection.collection("customers").find({}).toArray();
    }

    function findUser(id){
        connectDatabase();
        const objectId = new ObjectId(id);
        return global.connection.collection("customers")
        .findOne({_id: objectId});
    }

    function insertCustomers(test){
        connectDatabase();
        return global.connection.collection("customers").insertOne(test);
    }

    function updateCustomers(id, customers){
        connectDatabase();
        const objectId = new ObjectId(id);
       
        return global.connection.collection("customers").
        updateOne({_id: objectId}, {$set: customers});
       
    }

    function deleteCustomers(id){
        connectDatabase();
        const objectId = new ObjectId(id);
        return global.connection.collection("customers").
        deleteOne({_id: objectId});
    }


    module.exports = {findCustomers,insertCustomers,
         updateCustomers, deleteCustomers, findUser}