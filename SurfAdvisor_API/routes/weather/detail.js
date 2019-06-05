/*
	URL : /weather
	Description : 기상정보 목록
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?si_date={선택날짜}&sa_id={선택해변}
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../config/dbPool' ) ;
const distance = require('../../modules/distance' );
const gradeToStar = require( '../../modules/gradeToStar' ) ;
const gradeToComment = require( '../../modules/gradeToComment2' ) ;
const waterTemperatureToWearGrade = require( '../../modules/waterTemperatureToWearGrade' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let si_date = req.query.si_date ;
	let sa_id = req.query.sa_id ;

	let splitDate = si_date.split('.') ;
	let month = splitDate[1] ;
	let day = splitDate[2] ;

	let temperatureMonth = Number( splitDate[1] ) ;
	let temperatureDay = Number( splitDate[2] ) ;

	let waterTemperatureDate = "2019." + temperatureMonth + "." + temperatureDay ;

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

			let selectSurfAreaWaterTemperatureQuery = 'SELECT SAWT.temperature_celcius FROM SurfArea SA , SurfAreaWaterTemperature SAWT WHERE SA.sa_id = SAWT.sa_id AND SA.sa_id = ? AND SAWT.temperature_date = ? ORDER BY if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC' ;
			let queryArr = [ sa_id , waterTemperatureDate ] ;

			connection.query( selectSurfAreaWaterTemperatureQuery , queryArr , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSurfAreaWaterTemperatureQuery err") ;
				} else {
					callback( null , connection , result ) ;
				}
			}) ;
		} ,

		function( connection , surfAreaWaterTemperature , callback ) {

			let selectSearchGradeQuery = 'SELECT * FROM SurfArea SA , SurfInfo SI WHERE SA.sa_id = SI.sa_id AND SI.si_date = ? AND SA.sa_id = ?' ;
			let queryArr = [ si_date , sa_id ] ;

			connection.query( selectSearchGradeQuery , queryArr , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchGradeQuery err") ;
				} else {
					callback( null , connection , surfAreaWaterTemperature , result ) ;
				}
			}) ;
		} ,

		function( connection , surfAreaWaterTemperature , object , callback ) {

			let selectDetailForcastQuery = 'SELECT * FROM SurfArea SA , SurfInfoDetail SID WHERE SA.sa_id = SID.sa_id AND sid_date = ? AND SA.sa_id = ? ORDER BY if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC , sid_time ASC' ;
			let queryArr = [ si_date , sa_id ] ;

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
					let forcast = [] ;
					let maxWaveTime = -1 ;
					let maxWave = -1 ;
					var cnt = 0 ;


					for( var j = 0 ; j < result.length ; j++ ) {

						if( object[0].sa_name == result[j].sa_name ) {
			
							if( result[j].sid_time == timeData[0] || result[j].sid_time == timeData[1] || result[j].sid_time == timeData[2] || result[j].sid_time == timeData[3] || result[j].sid_time == timeData[4] ) {
								cnt++ ;
									
								let data = {

									sid_time : result[j].sid_time ,
									sid_wave : result[j].sid_wave ,
									sid_grade : result[j].sid_grade ,
									sid_gradeToStar : gradeToStar( result[j].sid_grade ) ,
									sid_gradeToComment : gradeToComment( result[j].sid_grade )

								}
								forcast.push( data ) ;

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

						sa_name : object[0].sa_name ,
						si_grade : object[0].si_grade ,
						si_gradeToStar : gradeToStar( object[0].si_grade ) ,
						si_gradeToComment : gradeToComment( object[0].si_grade ) , 
						waterTemperature : surfAreaWaterTemperature[0].temperature_celcius
					}

					let inData2 = {

						si_wave : object[0].si_wave ,
						si_wind : object[0].si_wind ,
						si_riding : object[0].si_riding ,
						si_wear : waterTemperatureToWearGrade( surfAreaWaterTemperature[0].temperature_celcius )
					}

					let inData3 = {

						maxWaveTime : maxWaveTime ,
						maxWave : maxWave ,
						forcast : forcast
					}

					let data = {
						
						basicData : inData1 ,
						detailData : inData2 ,
						waveData : inData3
					}

					connection.release() ;
					callback( null , data ) ;
				}
			}) ;
		} ,

		function( resultData , callback ) {

			res.status(200).send({
				status : "success" ,
				data : resultData ,
				message : "get a successful weather detail"
			}) ;
			callback( null , "get asuccessful weather detail" ) ;
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