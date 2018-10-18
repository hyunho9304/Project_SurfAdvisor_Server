/*
	URL : /surfArea/info
	Description : 근처 정보
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?sa_id={선택도시 index}
*/

const express = require('express');
const router = express.Router();
const pool = require( '../../config/dbPool' ) ;
const distance = require('../../modules/distance');
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

router.get( '/' , function( req , res ) {

	let sa_id = req.query.sa_id ;

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

			let selectCoordinatesQuery = 'SELECT * FROM SurfArea WHERE sa_id = ?' ;

			connection.query( selectCoordinatesQuery , sa_id , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectCoordinatesQuery err") ;
				} else {
					callback( null , connection , result[0].sa_longitude , result[0].sa_latitude ) ;
				}
			}) ;
		} ,

		function( connection , longitude , latitude , callback ) {

			let selectSearchSurfShopQuery = 'SELECT * FROM SurfShop' ;

			connection.query( selectSearchSurfShopQuery , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchSurfShopQuery err") ;
				} else {

					let surfShopList = [] ;

					for( var i = 0 ; i < result.length ; i++ ) {

						let distanceData = distance(latitude, longitude, result[i].ss_latitude , result[i].ss_longitude ) ;

						let tmpDistance ;
						if( distanceData.unit === 'Km' )
							tmpDistance = Number(distanceData.distance ) * 1000 ;

						if( tmpDistance <= 100000 ) {

							let data = {
								ss_photo : result[i].ss_photo ,
								ss_name : result[i].ss_name ,
								ss_site : result[i].ss_site ,
								ss_introduction : result[i].ss_introduction ,
								ss_time : result[i].ss_time ,
								ss_address : result[i].ss_address ,
								ss_longitude : result[i].ss_longitude ,
								ss_latitude : result[i].ss_latitude ,
								ss_phoneNumber : result[i].ss_phoneNumber ,
								distance : Number( distanceData.distance ) ,
								distanceUnit : distanceData.unit
							}
							surfShopList.push( data ) ;
						}
					}

					surfShopList.sort( function( a , b ) {
						let tmpA , tmpB ;

						if( a.distanceUnit === 'Km' )
							tmpA = a.distance * 1000 ;

						if( b.distanceUnit === 'Km' )
							tmpB = b.distance * 1000 ;

						return tmpA > tmpB
					});
					callback( null , connection , longitude , latitude , surfShopList ) ;
				}
			}) ;
		} ,

		function( connection , longitude , latitude , surfShopList , callback ) {

			let selectSearchRestaurantQuery = 'SELECT * FROM Restaurant' ;

			connection.query( selectSearchRestaurantQuery , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchRestaurantQuery err") ;
				} else {

					let restaurantList = [] ;

					for( var i = 0 ; i < result.length ; i++ ) {

						let distanceData = distance(latitude, longitude, result[i].r_latitude , result[i].r_longitude ) ;

						let tmpDistance ;
						if( distanceData.unit === 'Km' )
							tmpDistance = Number(distanceData.distance ) * 1000 ;

						if( tmpDistance > 0 ) {

							let data = {
								r_name : result[i].r_name ,
								r_longitude : result[i].r_longitude ,
								r_latitude : result[i].r_latitude ,
								distance : Number( distanceData.distance ) ,
								distanceUnit : distanceData.unit
							}
							restaurantList.push( data ) ;
						}
					}

					restaurantList.sort( function( a , b ) {
						let tmpA , tmpB ;

						if( a.distanceUnit === 'Km' )
							tmpA = a.distance * 1000 ;

						if( b.distanceUnit === 'Km' )
							tmpB = b.distance * 1000 ;

						return tmpA > tmpB
					});
					callback( null , connection , longitude , latitude , surfShopList , restaurantList ) ;
				}
			}) ;
		} ,

		function( connection , longitude , latitude , surfShopList , restaurantList , callback ) {

			let selectSearchHotelQuery = 'SELECT * FROM Hotel' ;

			connection.query( selectSearchHotelQuery , function(err , result) {
				if( err ) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectSearchHotelQuery err") ;
				} else {

					let hotelList = [] ;

					for( var i = 0 ; i < result.length ; i++ ) {

						let distanceData = distance(latitude, longitude, result[i].h_latitude , result[i].h_longitude ) ;

						let tmpDistance ;
						if( distanceData.unit === 'Km' )
							tmpDistance = Number(distanceData.distance ) * 1000 ;

						if( tmpDistance > 0 ) {

							let data = {
								h_name : result[i].h_name ,
								h_longitude : result[i].h_longitude ,
								h_latitude : result[i].h_latitude ,
								distance : Number( distanceData.distance ) ,
								distanceUnit : distanceData.unit
							}
							hotelList.push( data ) ;
						}
					}

					hotelList.sort( function( a , b ) {
						let tmpA , tmpB ;

						if( a.distanceUnit === 'Km' )
							tmpA = a.distance * 1000 ;

						if( b.distanceUnit === 'Km' )
							tmpB = b.distance * 1000 ;

						return tmpA > tmpB
					});
					connection.release() ;
					callback( null , surfShopList , restaurantList , hotelList ) ;
				}
			}) ;
		} ,

		function( surfShopList , restaurantList , hotelList , callback ) {

			res.status(200).send({
				status : "success" ,
				data : {
					surfShopList : surfShopList ,
					restaurantList : restaurantList ,
					hotelList : hotelList
				} ,
				message : "successful get surfAreaInfo"
			}) ;
			callback( null , "successful get surfAreaInfo" ) ;
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













