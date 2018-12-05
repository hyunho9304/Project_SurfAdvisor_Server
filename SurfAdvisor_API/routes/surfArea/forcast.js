/*
	URL : /surfArea/forcast
	Description : 검색결과( 디테일 )
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?si_date={선택날짜}&sa_id={선택도시index}
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../config/dbPool' ) ;
const gradeToStar = require( '../../modules/gradeToStar' ) ;
const gradeToComment = require( '../../modules/gradeToComment' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let si_date = req.query.si_date ;
	let sa_id = req.query.sa_id ;

	let splitDate = si_date.split('.') ;
	let month = splitDate[1] ;

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

			let selectDetailQuery = 'SELECT * FROM SurfInfo SI , SurfArea SA WHERE SI.sa_id = SA.sa_id AND SI.si_date = ? AND SI.sa_id = ?' ;
			let queryArr = [ si_date , sa_id ] ;
			connection.query( selectDetailQuery , queryArr , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectDetailQuery err") ;
				} else {
					callback( null , connection , result[0] ) ;
				}
			}) ;
		} ,

		function( connection , object , callback ) {

			let selectTemperatureQuery = 'SELECT wt_grade FROM WaterTemperature WHERE sa_id = ? AND wt_month = ?' ;
			let queryArr = [ sa_id , month ] ;

			connection.query( selectTemperatureQuery , queryArr , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectTemperatureQuery err") ;
				} else {
					callback( null , connection , object , result[0].wt_grade ) ;
				}
			}) ;
		} ,

		function( connection , object , wt_grade , callback ) {

			let selectDetailForcastQuery = 'SELECT * FROM SurfInfoDetail WHERE sa_id = ? AND sid_date = ? ORDER BY sid_time ASC' ;
			let queryArr = [ sa_id , si_date ] ;

			connection.query( selectDetailForcastQuery , queryArr , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectDetailForcastQuery err") ;
				} else {

					let list = [] ;

					for( var i = 0 ; i < result.length ; i++ ) {

						let data = {
							sid_time : result[i].sid_time ,
							sid_wave : result[i].sid_wave ,
							sid_gradeStar : gradeToStar( result[i].sid_grade )
						}
						list.push( data ) ;
					}
					connection.release() ;
					callback( null , object , wt_grade , list ) ;
				}
			}) ;
		} ,

		function( object , wt_grade , list , callback ) {
			
			res.status(200).send({
				status : "success" ,
				data : {
					sa_name : object.sa_name ,
					si_gradeStar : gradeToStar( object.si_grade ) , 
					si_wave : object.si_wave ,
					si_wind : object.si_wind ,
					si_riding : object.si_riding ,
					si_wear : wt_grade ,
					si_gradeComment : gradeToComment( object.si_grade ) ,
					forcast : list
				} ,
				message : "successful get surfAreaForcast"
			}) ;
			callback( null , "successful get surfAreaForcast" ) ;
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














