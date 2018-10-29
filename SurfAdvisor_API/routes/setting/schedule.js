const express = require('express');
const router = express.Router();
const pool = require( '../../config/dbPool' ) ;
const async = require( 'async' ) ;
const moment = require( 'moment' ) ;

const fs = require('fs');
var request = require('request');

router.post('/', function(req, res) {

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

            var url = 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchStay';
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'; /* Service Key*/
            queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'); /* 공공데이터포털에서 발급받은 인증키 */
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('2872'); /* 한 페이지 결과 수 */
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 현재 페이지 번호 */
            queryParams += '&' + encodeURIComponent('MobileOS') + '=' + encodeURIComponent('ETC'); /* IOS(아이폰),AND(안드로이드),WIN(원도우폰),ETC */
            queryParams += '&' + encodeURIComponent('MobileApp') + '=' + encodeURIComponent('AppTest'); /* 서비스명=어플명 */
            queryParams += '&' + encodeURIComponent('arrange') + '=' + encodeURIComponent('A'); /*(A=제목순,B=조회순,C=수정순,D=생성일순) 대표이미지가 반드시 있는 정렬 (O=제목순, P=조회순, Q=수정일순, R=생성일순) */
            queryParams += '&' + encodeURIComponent('listYN') + '=' + encodeURIComponent('Y'); /* 목록구분(Y=목록,N=개수) */
            queryParams += '&' + encodeURIComponent('areaCode') + '=' + encodeURIComponent(''); /* 지역코드 */
            queryParams += '&' + encodeURIComponent('sigunguCode') + '=' + encodeURIComponent(''); /* 시군구코드(areaCode 필수) */
            queryParams += '&' + encodeURIComponent('hanOk') + '=' + encodeURIComponent(''); /* 한옥 여부 */
            queryParams += '&' + encodeURIComponent('benikia') + '=' + encodeURIComponent(''); /* 베니키아 여부 */
            queryParams += '&' + encodeURIComponent('goodStay') + '=' + encodeURIComponent(''); /* 굿스테이 여부 */

            request({
                url: url + queryParams,
                method: 'GET'
            }, function(error, response, body) {
                // console.log('Status', response.statusCode);
                // console.log();
                // console.log('Headers', JSON.stringify(response.headers));
                // console.log();
                // console.log('Reponse received', body );
                fs.writeFile(__dirname + "/hotel.xml", body, 'utf8', function(err) {
                    if (err) 
                    	console.log("error : " + err);
                    callback(null, connection);
                });
            });
        },

        function(connection, callback) {

            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();

            fs.readFile(__dirname + "/hotel.xml", function(err, data) {

                parser.parseString(data, function(err, result) {

                	console.log( result.response.body[0].items[0].item.length );

                    for( var i = 0 ; i < result.response.body[0].items[0].item.length ; i++ ){

                    	var elements = Object.keys( result.response.body[0].items[0].item[i] ) ;

                    	var title = "" ;
                    	var address = "" ;
                    	var phoneNumber = "" ;
                    	var longitude = "" ;
                    	var latitude = "" ;
                    	var photo = "" ;
                    	for( var j = 0 ; j < elements.length ; j++ ) {
                    		if( elements[j] == 'title' ) {
                    			title = result.response.body[0].items[0].item[i].title[0] ; continue ;
                    		}
                    		else if( elements[j] == 'addr1' ) {
                    			address = result.response.body[0].items[0].item[i].addr1[0] ; continue ;
                    		}
                    		else if( elements[j] == 'tel' ) {
                    			phoneNumber = result.response.body[0].items[0].item[i].tel[0] ; continue ;
                    		}
                    		else if( elements[j] == 'mapx' ) {
                    			longitude = result.response.body[0].items[0].item[i].mapx[0] ; continue ;
                    		}
                    		else if( elements[j] == 'mapy' ) {
                    			latitude = result.response.body[0].items[0].item[i].mapy[0] ; continue ;
                    		}
                    		else if( elements[j] == 'firstimage' ) {
                    			photo = result.response.body[0].items[0].item[i].firstimage[0] ; continue ;
                    		}
                    		else
                    			continue ;
                    	}

                 		let insertHotelQuery = 'INSERT INTO Hotel VALUES( ? , ? , ? , ? , ? , ? , ? )' ;
						let queryArr = [ null , title , phoneNumber , address , longitude , latitude , photo ] ;

						connection.query( insertHotelQuery , queryArr , function( err , result ) {
							if(err) {
								res.status(500).send({
									status : "fail" ,
									message : "internal server err"
								}) ;
								connection.release() ;
								callback( "insertHotelQuery err") ;
							}
						}) ;
                    }
                });
                res.status(201).send({
                	status: "success",
                	message: "successful get"
            	});
                connection.release();
                callback(null, "successful get");
            });
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