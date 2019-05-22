/*
	URL : /weather
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

					let timeData = [ 6 , 9 , 12 , 15 , 18 ] ;
					let list = [] ;

					for( var i = 0 ; i < object.length ; i++ ) {

						let waveData = [] ;
						let maxWaveTime = -1 ;
						let maxWave = -1 ;
						var cnt = 0 ;

						for( var j = 0 ; j < result.length ; j++ ) {

							if( object[i].sa_name == result[j].sa_name ) {

								if( result[j].sid_time === timeData[0] || result[j].sid_time == timeData[1] || result[j].sid_time == timeData[2] || result[j].sid_time == timeData[3] || result[j].sid_time == timeData[4] ) {
									cnt++ ;
									waveData.push( result[j].sid_wave ) ;

									if( maxWave < result[j].sid_wave ) {
										maxWaveTime = result[j].sid_time ;
										maxWave = result[j].sid_wave ;
									}
								}
							}

							if( cnt == 5 ) {
								cnt = 0 ;
								break ;
							}
						}

						let inData1 = {

							sa_name : object[i].sa_name ,
							sa_latitude : object[i].sa_latitude ,
							sa_longitude : object[i].sa_longitude ,
							si_gradeComment : gradeToComment( object[i].si_grade )
						}

						let inData2 = {

							si_wave : object[i].si_wave ,
							si_wind : object[i].si_wind ,
							si_riding : object[i].si_riding ,
							si_wear : wearList[i].wt_grade
						}

						let inData3 = {

							maxWaveTime : maxWaveTime ,
							maxWave : maxWave ,
							six : waveData[0] ,
							nine : waveData[1] ,
							twelve : waveData[2] ,
							fifteen : waveData[3] ,
							eighteen : waveData[4]
						}

						let data = {

							basicData : inData1 ,
							detailData : inData2 ,
							waveData : inData3
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














