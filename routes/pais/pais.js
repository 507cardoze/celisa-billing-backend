const router = require('express').Router();
const verify = require('../../functions/verifytoken');
const {getAllPaises} = require('./model.js');

router.get('/all', verify, async (req, res) => {
    try {
      const query = await getAllPaises();
      console.log("entregando data de paises ...")
      res.status(200).json(query);
    } catch (error) {
      res.status(400).json(error);
    }
  });


module.exports = router;