var express = require('express');
var router = express.Router();

//	collection 관련
const collection = require( './collection/index' ) ;
router.use( '/collection' , collection ) ;

//	surfArea 관련
const surfArea = require( './surfArea/index' ) ;
router.use( '/surfArea' , surfArea ) ;

//	setting 관련
const setting = require( './setting/index' ) ;
router.use( '/setting' , setting ) ;

module.exports = router;
