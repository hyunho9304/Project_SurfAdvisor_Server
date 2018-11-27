/*
	URL : /collection/search/distanceList2
	Description : 검색결과( 거리순 )
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?si_date={선택날짜}&longitude={경도}&latitude={위도}
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../../config/dbPool' ) ;	//	경로하나하나
const distance = require('../../../modules/distance');
const gradeToStar = require( '../../../modules/gradeToStar' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let si_date = req.query.si_date ;
	let longitude = req.query.longitude ;
	let latitude = req.query.latitude ;

	let task = [

		function( callback ) {
			pool.getConnection(function(err , connection ) {
				if(err) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					});
					callback( "getConnection err" );
				} else {
					callback( null , connection ) ;
				}
			});
		} ,

		function( connection , callback ) {

			let selectSearchDistanceQuery = 'SELECT * FROM SurfArea SA , SurfInfo SI WHERE SA.sa_id = SI.sa_id AND SI.si_date = ?' ;

			connection.query( selectSearchDistanceQuery , si_date , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchDistanceQuery err") ;
				} else {

					let list = [] ;

					for( var i = 0 ; i < result.length ; i++ ) {

						let distanceData = distance(latitude, longitude, result[i].sa_latitude , result[i].sa_longitude ) ;

						let data = {

							sa_id : result[i].sa_id ,
							sa_name : result[i].sa_name ,
							si_gradeStar : gradeToStar( result[i].si_grade ) ,
							distance : Number( distanceData.distance ) ,
							distanceUnit : distanceData.unit
						}
						list.push( data ) ;
					}

					list.sort( function( a , b ) {
						let tmpA , tmpB ;

						if( a.distanceUnit === 'Km' )
							tmpA = a.distance * 1000

						if( b.distanceUnit === 'Km' )
							tmpB = b.distance * 1000

						return ( tmpA > tmpB )? 1 : -1 ;
					});
					connection.release() ;
					callback( null , list ) ;
				}
			}) ;
		} ,

		function( list , callback ) {

			res.status(200).send({
				status : "success" ,
				data : list ,
				message : "successful get SearchDistanceList2"
			}) ;
			callback( null , "successful get SearchDistanceList2" ) ;
		}
	] ;

	async.waterfall(task, function(err, result) {

        let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

        if (err)
            console.log(' [ ' + logtime + ' ] ' + err);
        else
            console.log(' [ ' + logtime + ' ] ' + result);
    }); //async.waterfall
}) ;

module.exports = router;













