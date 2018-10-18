var express = require('express');
var router = express.Router();

//	collection 관련
const collection = require( './collection/index' ) ;
router.use( '/collection' , collection ) ;

//	surfArea 관련
const surfArea = require( './surfArea/index' ) ;
router.use( '/surfArea' , surfArea ) ;

module.exports = router;
