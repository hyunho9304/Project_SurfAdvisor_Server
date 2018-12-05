/*
	URL : /collection/search/gradeList
	Description : 검색결과( 등급순 )
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?si_date={선택날짜}&name={선택도시이름}

	si_date , c_name 의 방법으로 데이터있는 지역에 대한 접근
    si_date , longitude , latitude 로 위도경도를 보내 확인하는 방법
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../../config/dbPool' ) ;	//	경로하나하나
const distance = require('../../../modules/distance' );
const gradeToStar = require( '../../../modules/gradeToStar' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let si_date = req.query.si_date ;
	let c_name = req.query.c_name ;
	let longitude = req.query.longitude;
    let latitude = req.query.latitude;

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
			
			if ( longitude == "" || longitude == undefined ) { //	네임으로 할때 

                let selectCoordinatesQuery = 'SELECT * FROM City WHERE c_name = ?';

                connection.query(selectCoordinatesQuery, c_name, function(err, result) {
                    if (err) {
                        res.status(500).send({
                            status: "fail",
                            message: "internal server err"
                        });
                        connection.release();
                        callback("selectCoordinatesQuery err");
                    } else {
                    	console.log("use city name");
                        callback(null, connection, result[0].c_longitude, result[0].c_latitude);
                    }
                });
            } else {
            	console.log("use longitude & latitude");
            	callback( null , connection , longitude , latitude ) ;
            }
		} ,

		function( connection , longitude , latitude , callback ) {

			let selectSearchGradeQuery = 'SELECT * FROM SurfArea SA , SurfInfo SI WHERE SA.sa_id = SI.sa_id AND SI.si_date = ? ORDER BY SI.si_grade DESC , if(ASCII(SUBSTRING(SA.sa_name , 1)) < 128, 9, 1) ASC , SA.sa_name ASC' ;

			connection.query( selectSearchGradeQuery , si_date , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchGradeQuery err") ;
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













