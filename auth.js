const { connect } = require ("./db");

async function findUser(name){
    const connection = await connect ();
    return connection
        .collection("users")
        .findOne({name});
}

module.exports = {
    
    findUser
}