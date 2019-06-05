/*
  Description : 수온 -> 옷 등급( 2 ~ 9 )
*/

module.exports = function( waterTemperature ) {

	if( waterTemperature > 4 && waterTemperature <= 7 )
		return 2 ;
	else if( waterTemperature > 7 && waterTemperature <= 10 )
		return 3 ;
	else if( waterTemperature > 10 && waterTemperature <= 13 )
		return 4 ;
	else if( waterTemperature > 13 && waterTemperature <= 16 )
		return 5 ;
	else if( waterTemperature > 16 && waterTemperature <= 19 )
		return 6 ;
	else if( waterTemperature > 19 && waterTemperature <= 22 )
		return 7 ;
	else if( waterTemperature > 22 && waterTemperature <= 25 )
		return 8 ;
	else
		return 9 ;
}