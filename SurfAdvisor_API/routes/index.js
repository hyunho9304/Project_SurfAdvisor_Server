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


//	weather 관련
const weather = require( './weather/index' ) ;
router.use( '/weather' , weather ) ;




//	도메인 설정 위한 통신상태 확인 인증
router.get( '/' , function( req , res ) {
	res.status(200).send("Welcome advisor surf!" ) ;
})

module.exports = router;
