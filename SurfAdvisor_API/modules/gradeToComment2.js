/*
  Description : 등급 -> 코멘트
*/

module.exports = function( grade ) {

	if( grade >= 0 && grade < 0.5 )
		return "파도없음" ;
	else if( grade >= 0.5 && grade < 3.5 )
		return "초급" ;
	else if( grade >= 3.5 && grade < 6.5 )
		return "중급" ;
	else
		return "상급" ;
}