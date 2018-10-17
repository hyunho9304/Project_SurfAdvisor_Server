var express = require('express');
var router = express.Router();

//	collection 관련
const collection = require( './collection/index' ) ;
router.use( '/collection' , collection ) ;

module.exports = router;
