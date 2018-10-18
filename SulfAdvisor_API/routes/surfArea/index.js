var express = require('express');
var router = express.Router();

//	forcast
const forcast = require( './forcast' ) ;
router.use( '/forcast' , forcast ) ;

module.exports = router;
