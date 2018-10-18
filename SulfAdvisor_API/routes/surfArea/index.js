var express = require('express');
var router = express.Router();

//	forcast
const forcast = require( './forcast' ) ;
router.use( '/forcast' , forcast ) ;

//	info
const info = require( './info' ) ;
router.use( '/info' , info ) ;

module.exports = router;
