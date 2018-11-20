/*
  Description : 등급 -> 코멘트
*/

module.exports = function( grade ) {

  if( grade >= 0 && grade < 2.5 )
    return "초급자"
  else if( grade >= 2.5 && grade < 7.5 )
    return "중급자"
  else
    return "상급자"
}