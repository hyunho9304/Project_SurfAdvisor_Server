var express = require('express');
var router = express.Router();

//	gradeList
const gradeList = require( './gradeList' ) ;
router.use( '/gradeList' , gradeList ) ;

//	distanceList
const distanceList = require( './distanceList' ) ;
router.use( '/distanceList' , distanceList ) ;

//	iOSgradeList
const iOSgradeList = require( './iOSgradeList' ) ;
router.use( '/iOSgradeList' , iOSgradeList ) ;

//	iOSdistanceList
const iOSdistanceList = require( './iOSdistanceList' ) ;
router.use( '/iOSdistanceList' , iOSdistanceList ) ;

module.exports = router;
