/*
	URL : /surfArea/info
	Description : 근처 정보
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?sa_id={선택도시 index}
*/

const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool');
const distance = require('../../modules/distance');
const async = require('async');
const moment = require('moment');

router.get('/', function(req, res) {

    let sa_id = req.query.sa_id;

    let task = [

        function(callback) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    callback("getConnection err");
                } else {
                    callback(null, connection);
                }
            });
        },

        function(connection, callback) {

            let selectCoordinatesQuery = 'SELECT * FROM SurfArea WHERE sa_id = ?';

            connection.query(selectCoordinatesQuery, sa_id, function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectCoordinatesQuery err");
                } else {
                    callback(null, connection, result[0].sa_longitude, result[0].sa_latitude);
                }
            });
        },

        function(connection, longitude, latitude, callback) {

            let selectSearchSurfShopQuery = 'SELECT * FROM SurfShop';

            connection.query(selectSearchSurfShopQuery, function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectSearchSurfShopQuery err");
                } else {

                    var surfShopList = [];

                    for (var i = 0; i < result.length ; i++) {

                        let distanceData = distance(latitude, longitude, result[i].ss_latitude, result[i].ss_longitude);

                        var tmpDistance = Number(distanceData.distance);
                        if (distanceData.unit === 'Km')
                            tmpDistance = Number(distanceData.distance) * 1000 ;

                        if (tmpDistance < 5000 ) {

                            let data = {
                            	ss_photo: result[i].ss_photo,
                                ss_name: result[i].ss_name,
                                ss_site: result[i].ss_site,
                                ss_introduction: result[i].ss_introduction,
                                ss_time: result[i].ss_time,
                                ss_address: result[i].ss_address,
                                ss_longitude: result[i].ss_longitude,
                                ss_latitude: result[i].ss_latitude,
                                ss_phoneNumber: result[i].ss_phoneNumber,
                                distance: Number(distanceData.distance),
                                distanceUnit: distanceData.unit
                            }
                            surfShopList.push(data);
                        }
                    }

                    surfShopList.sort(function(a, b) {
                        var tmpA = a.distance;
                        var tmpB = b.distance;

                        if( a.distanceUnit === 'Km' )
                        	tmpA = a.distance * 1000 ;

                        if( b.distanceUnit === 'Km' )
                        	tmpB = b.distance * 1000 ;

                        return ( tmpA >= tmpB )? 1 : -1 ;
                    });

                    // console.log("hi");
                    // console.log( surfShopList.length );

                    // var fifteenSurfShopList = [] ;
                    // for( var i = 0 ; i < 15 ; i++ )
                    // 	fifteenSurfShopList.push( surfShopList[i] ) ;

                    // console.log("hi");
                    // console.log( fifteenSurfShopList.length );

                    callback(null, connection, longitude, latitude, surfShopList );
                }
            });
        },

        function(connection, longitude, latitude, surfShopList, callback) {

            let selectSearchRestaurantQuery = 'SELECT * FROM Restaurant';

            connection.query(selectSearchRestaurantQuery, function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectSearchRestaurantQuery err");
                } else {

                    let restaurantList = [];

                    for (var i = 0; i < result.length ; i++) {

                        let distanceData = distance(latitude, longitude, result[i].r_latitude, result[i].r_longitude);

                        var tmpDistance = Number(distanceData.distance) ;
                        if (distanceData.unit === 'Km')
                            tmpDistance = Number(distanceData.distance) * 1000 ;

                        if (tmpDistance < 5000 ) {

                            let data = {
                            	r_photo : result[i].r_photo ,
                                r_name: result[i].r_name,
                                r_explain1 : result[i].r_explain1 ,
                                r_explain2 : result[i].r_explain2 ,
                                r_time : result[i].r_time ,
                                r_address : result[i].r_address ,
                                r_longitude: result[i].r_longitude,
                                r_latitude: result[i].r_latitude,
                                r_phoneNumber : result[i].r_phoneNumber ,
                                distance: Number(distanceData.distance) ,
                                distanceUnit: distanceData.unit
                            }
                            restaurantList.push(data);
                        }
                    }

                    restaurantList.sort(function(a, b) {
                        var tmpA = a.distance;
                        var tmpB = b.distance;

                        if (a.distanceUnit === 'Km')
                            tmpA = a.distance * 1000;

                        if (b.distanceUnit === 'Km')
                            tmpB = b.distance * 1000;

                        return ( tmpA >= tmpB )? 1 : -1 ;
                    });
                    callback(null, connection, longitude, latitude, surfShopList, restaurantList);
                }
            });
        },

        function(connection, longitude, latitude, surfShopList, restaurantList, callback) {

            let selectSearchHotelQuery = 'SELECT * FROM Hotel';

            connection.query(selectSearchHotelQuery, function(err, result) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    connection.release();
                    callback("selectSearchHotelQuery err");
                } else {

                    let hotelList = [];

                    for (var i = 0; i < result.length ; i++) {

                        let distanceData = distance(latitude, longitude, result[i].h_latitude, result[i].h_longitude);

                        let tmpDistance = Number(distanceData.distance) ;
                        if (distanceData.unit === 'Km')
                            tmpDistance = Number(distanceData.distance) * 1000 ;

                        if (tmpDistance < 5000 ) {

                            let data = {
                            	h_photo : result[i].h_photo ,
                                h_name: result[i].h_name,
                                h_address : result[i].h_address ,
                                h_longitude: result[i].h_longitude,
                                h_latitude: result[i].h_latitude,
                                h_phoneNumber : result[i].h_phoneNumber ,
                                distance: Number(distanceData.distance),
                                distanceUnit: distanceData.unit
                            }
                            hotelList.push(data);
                        }
                    }

                    hotelList.sort(function(a, b) {
                        var tmpA = a.distance;
                        var tmpB = b.distance;

                        if (a.distanceUnit === 'Km')
                            tmpA = a.distance * 1000;

                        if (b.distanceUnit === 'Km')
                            tmpB = b.distance * 1000;

                        return ( tmpA >= tmpB )? 1 : -1 ;
                    });
                    connection.release();
                    callback(null, surfShopList, restaurantList, hotelList);
                }
            });
        },

        function(surfShopList, restaurantList, hotelList, callback) {

            res.status(200).send({
                status: "success",
                data: {
                    surfShopList: surfShopList,
                    restaurantList: restaurantList,
                    hotelList: hotelList
                },
                message: "successful get surfAreaInfo"
            });
            callback(null, "successful get surfAreaInfo");
        }
    ];

    async.waterfall(task, function(err, result) {

        let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

        if (err)
            console.log(' [ ' + logtime + ' ] ' + err);
        else
            console.log(' [ ' + logtime + ' ] ' + result);
    }); //async.waterfall
});

module.exports = router;