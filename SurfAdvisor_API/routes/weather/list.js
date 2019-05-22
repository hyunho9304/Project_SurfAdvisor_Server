/*
	URL : /weather/list
	Description : 기상정보 목록
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?si_date={선택날짜}
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../config/dbPool' ) ;
const distance = require('../../modules/distance' );
const gradeToComment = require( '../../modules/gradeToComment' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let si_date = req.query.si_date ;

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

			let selectTemperatureQuery = 'SELECT * FROM WaterTemperature WT , SurfArea SA WHERE SA.sa_id = WT.sa_id AND wt_month = ? ORDER BY if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC' ;

			connection.query( selectTemperatureQuery , month , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectTemperatureQuery err") ;
				} else {
					console.log( result );
					callback( null , connection , result ) ;
				}
			}) ;

		} ,

		function( connection , wearList , callback ) {

			let selectSearchGradeQuery = 'SELECT * FROM SurfArea SA , SurfInfo SI WHERE SA.sa_id = SI.sa_id AND SI.si_date = ? ORDER BY if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC' ;

			connection.query( selectSearchGradeQuery , si_date , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchGradeQuery err") ;
				} else {
					callback( null , connection , wearList , result ) ;
				}
			}) ;
		} ,

		function( connection , wearList , object , callback ) {

			let selectDetailForcastQuery = 'SELECT * FROM SurfArea SA , SurfInfoDetail SID WHERE SA.sa_id = SID.sa_id AND sid_date = ? ORDER BY if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC , sid_time ASC' ;
			let queryArr = [ si_date ] ;

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

					for( var i = 0 ; i < object.length ; i++ ) {

						for( var j = 0 ; j < result.length ; j++ ) {


						}

						let indata = {

							si_wave : object[i].si_wave ,
							si_wind : object[i].si_wind ,
							si_riding : object[i].si_riding ,
							si_wear : wearList[i].wt_grade
						}

						let data = {

							sa_name : object[i].sa_name ,
							sa_latitude : object[i].sa_latitude ,
							sa_longitude : object[i].sa_longitude ,
							si_gradeComment : gradeToComment( object[i].si_grade ) ,
							detailData : indata
						}

						list.push( data ) ;
					}
					connection.release() ;
					callback( null , list ) ;
				}
			}) ;
		} ,

		function( list , callback ) {

			res.status(200).send({
				status : "success" ,
				data : list ,
				message : "successful get SearchGradeList"
			}) ;
			callback( null , "successful get SearchGradeList" ) ;
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














