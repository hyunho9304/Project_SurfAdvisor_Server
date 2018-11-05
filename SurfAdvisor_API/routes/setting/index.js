var express = require('express');
var router = express.Router();

//	schedule 관련
const schedule = require( './schedule' ) ;
router.use( '/schedule' , schedule ) ;

//	photo upload 관련
const photo = require( './photo' ) ;
router.use( '/photo' , photo ) ;


module.exports = router;
