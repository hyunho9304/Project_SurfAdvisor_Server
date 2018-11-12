var express = require('express');
var router = express.Router();

//	cityList 관련
const cityList = require( './cityList' ) ;
router.use( '/cityList' , cityList ) ;

//	search
const search = require( './search/index' ) ;
router.use( '/search' , search ) ;



module.exports = router;
