var express = require('express');
var router = express.Router();

//	schedule 관련
const schedule = require( './schedule' ) ;
router.use( '/schedule' , schedule ) ;

//	photo surfShopPhoto upload 관련
const surfShopPhoto = require( './surfShopPhoto' ) ;
router.use( '/surfShopPhoto' , surfShopPhoto ) ;


module.exports = router;
