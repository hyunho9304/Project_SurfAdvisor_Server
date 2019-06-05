var express = require('express');
var router = express.Router();

//	list 관련
const list = require( './list' ) ;
router.use( '/list' , list ) ;

//	detail 관련
const detail = require( './detail' ) ;
router.use( '/detail' , detail ) ;

module.exports = router;
