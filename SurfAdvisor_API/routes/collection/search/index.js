var express = require('express');
var router = express.Router();

//	gradeList
const gradeList = require( './gradeList' ) ;
router.use( '/gradeList' , gradeList ) ;

//	distanceList
const distanceList = require( './distanceList' ) ;
router.use( '/distanceList' , distanceList ) ;

module.exports = router;
