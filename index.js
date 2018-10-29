var express = require('express');
var router = express.Router();

//	schedule 관련
const schedule = require( './schedule' ) ;
router.use( '/schedule' , schedule ) ;

module.exports = router;
