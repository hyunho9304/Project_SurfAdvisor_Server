var express = require('express');
var router = express.Router();

//	cityList 관련
const cityList = require( './cityList' ) ;
router.use( '/cityList' , cityList ) ;

//	searchGrade
const searchGrade = require( './searchGrade' ) ;
router.use( '/searchGrade' , searchGrade ) ;

module.exports = router;
