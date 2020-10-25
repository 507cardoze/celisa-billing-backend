const { database } = require('../../database/database');

const getAllPaises = () => {
    return database
        .select("*")
        .from("pais")
        .then(pais => {
            return pais
        }).catch(error => {
            return error;
        })
}


module.exports.getAllPaises = getAllPaises;