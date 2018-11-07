/*
    URL : /setting/restaurantPhoto
    Description : 식당 사진데이터 업로드
    Content-type : x-www-form-urlencoded
    method : POST - query
*/
const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require('moment');

const upload = require( '../../modules/AWS-S3') ;

router.put('/', upload.array('photo', 10000), function(req, res) {

    var photoNameList = [];
    var photoList = [];
    for (var i = 0; i < req.files.length; i++) {
        var tmpName = req.files[i].originalname;
        var index = tmpName.indexOf(".");
        photoNameList.push(tmpName.substring(0, index));
        photoList.push(req.files[i].location);
    }

    let task = [

        function(callback) {
            pool.getConnection(function(err, connection) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        msg: "internal server err"
                    });
                    callback("getConnection err");
                } else {
                    callback(null, connection);
                }
            }); //	getConnection
        }, //	function

        function(connection, callback) {

            for (var i = 0; i < req.files.length; i++) {

                let updateRestaurantPhotoQuery = 'UPDATE Restaurant SET r_photo = ? WHERE r_id = ?';
                let queryArr = [photoList[i], photoNameList[i]];

                connection.query(updateRestaurantPhotoQuery, queryArr, function(err, result) {
                    if (err) {
                        res.status(500).send({
                            status: "fail",
                            msg: "internal server err"
                        });
                        callback("updateRestaurantPhotoQuery err");
                    }
                });
            }
            res.status(201).send({
                status: "success",
                message: "successful updateRestaurantPhotoQuery"
            });
            connection.release();
            callback(null, "successful updateRestaurantPhotoQuery");
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