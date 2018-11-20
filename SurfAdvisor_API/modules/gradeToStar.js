/*
  Description : 등급 -> 별점
*/

module.exports = function( grade ) {

  if( grade < 0.5 )
    return 0 ;
  else if( grade >= 0.5 && grade < 1.5 )
    return 0.5 ;
  else if( grade >= 1.5 && grade < 2.5 )
    return 1 ;
  else if( grade >= 2.5 && grade < 3.5 )
    return 1.5 ;
  else if( grade >= 3.5 && grade < 4.5 )
    return 2 ;
  else if( grade >= 4.5 && grade < 5.5 )
    return 2.5 ;
  else if( grade >= 5.5 && grade < 6.5 )
    return 3 ;
  else if( grade >= 6.5 && grade < 7.5 )
    return 3.5 ;
  else if( grade >= 7.5 && grade < 8.5 )
    return 4 ;
  else if( grade >= 8.5 && grade < 9.5 )
    return 4.5 ;
  else
    return 5 ;
}