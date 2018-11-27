var express = require('express');
var router = express.Router();

//	distanceList
const distanceList = require( './distanceList' ) ;
router.use( '/distanceList' , distanceList ) ;

//	distanceList2
const distanceList2 = require( './distanceList2' ) ;
router.use( '/distanceList2' , distanceList2 ) ;

//	gradeList
const gradeList = require( './gradeList' ) ;
router.use( '/gradeList' , gradeList ) ;

//	gradeList2
const gradeList2 = require( './gradeList2' ) ;
router.use( '/gradeList2' , gradeList2 ) ;

module.exports = router;
