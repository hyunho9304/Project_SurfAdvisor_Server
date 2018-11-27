var express = require('express');
var router = express.Router();

//	distanceList
const distanceList = require( './distanceList' ) ;
router.use( '/distanceList' , distanceList ) ;

//	gradeList
const gradeList = require( './gradeList' ) ;
router.use( '/gradeList' , gradeList ) ;

module.exports = router;
