
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

    function findUsers(){
        connectDatabase();
        return global.connection.collection("users").find({}).toArray();
    }

    function findUser(id){
        connectDatabase();
        const objectId = new ObjectId(id);
        return global.connection.collection("users")
        .findOne({_id: objectId});
    }

    function insertUsers(test){
        connectDatabase();
        return global.connection.collection("users").insertOne(test);
    }

    function updateUsers(id, users){
        connectDatabase();
        const objectId = new ObjectId(id);
       
        return global.connection.collection("users").
        updateOne({_id: objectId}, {$set: users});
       
    }

    function deleteUsers(id){
        connectDatabase();
        const objectId = new ObjectId(id);
        return global.connection.collection("users").
        deleteOne({_id: objectId});
    }


    module.exports = {findUsers,insertUsers,
         updateUsers, deleteUsers, findUser}