/**
 * -----------------------------------------------------------------------------
 * D3 Radar Chart : Life Satisfaction
 * -----------------------------------------------------------------------------
 */

 /**
  * Additional help: https://bl.ocks.org/nbremer/21746a9668ffdf6d8242
  */

 /**
  * Vars
  */
 var margin = { top:120, right:70, bottom:70, left:70 },
     //width = 800 - margin.left - margin.right,
     //height = 600 - margin.top - margin.bottom,
     width = Math.min(1000, window.innerWidth - 10) - margin.left - margin.right,
 		height = Math.min(width/1.5, window.innerHeight - margin.top - margin.bottom - 20),
     color = d3.scaleOrdinal(d3.schemeCategory20),
     dotcolor = d3.scaleOrdinal(d3.schemeCategory20),
     circleConstraint = d3.min([ height, width ]),
     radius = d3.scaleLinear().range([ 0, (circleConstraint / 2) ]),
     radians = 2 * Math.PI,
     centerX = width / 2 + margin.left,
     centerY = height / 2 + margin.top;

 // http://www.cs.middlebury.edu/~hnowicki/radarChartImplementation.html
 // Finds the x coordinate to place a point
 var getX = function(r, angle) {
   var adj = Math.sin(angle) * r;
   var xCoord = adj;
   console.log( 'x: ' + xCoord );
   return xCoord;
 }

 // Finds the x coordinate to place a point
 var getY = function(r, angle) {
   var opposite = -Math.cos(angle)*r;
   var yCoord = opposite;
   console.log( 'y: ' + yCoord );
   return yCoord;
 }

 /**
  * SVG
  */
 var svg = d3.select( '#radar' ).append( 'svg' )
   .style( 'background', 'rgba(0,0,0,0.1)' )
   .attr( 'width', width + margin.left + margin.right )
   .attr( 'height', height + margin.top + margin.bottom )
   .append( 'g' )
     .attr( 'class', 'radar' )
     .attr( 'transform', 'translate(' + centerX + ',' + centerY + ')');

 d3.csv( 'https://gist.githubusercontent.com/jekkilekki/2ab5c008ce2d861621c2089a5f3b75c0/raw/cf9eaa09afb52d6fb9f2d2d444caa228c6ff3f2c/lifeData.csv', function( error, data ) {
   var maxValue = 10; // set to 10 as its the max for the evaluations
   data.forEach( function(d) {
     // Make sure we read in the values as numeric values (thus the +d.)
    //  d.twenty16 = +d.twenty16;
    //  d.twenty15 = +d.twenty15;
    //  d.twenty14 = +d.twenty14;
    //  if( d.twenty16 > maxValue )
    //    maxValue = d.twenty16;
    //  if( d.twenty15 > maxValue )
    //    maxValue = d.twenty15;
    //  if( d.twenty14 > maxValue )
    //    maxValue = d.twenty14;
   });

   var topValue = maxValue,
       ticks = [];

   //for( var i = 0; i <= 10; i++ ) {
   for( var i = 10; i >= 0; i-- ) {
     ticks[i] = topValue * i / 10;
   }

   radius.domain([ 0, topValue ]);

   /**
    * Radar Grid
    */
   var circleAxes = svg.selectAll( '.circle-ticks' ).data(ticks)
     .enter().append( 'g' )
       .attr( 'class', 'circle-ticks' );

   // Circle Grid
   circleAxes.append( 'circle' )
     .attr( 'r', function(d) { return radius(d); })
     .attr( 'class', 'circle' )
     .attr( 'stroke', 'rgba(0,0,0,0.5)' )
     .attr( 'fill', 'rgba(255,255,255,0.3)' );

   // Numeric labels for Circle grid
   circleAxes.append( 'text' )
     .attr( 'class', 'level' )
     .attr( 'text-anchor', 'middle' )
     .attr( 'dy', function(d) { return radius(d) - 5; })
     .text( String );

   /**
    * Radar Spokes
    */
   var lineAxes = svg.selectAll( '.line-ticks' ).data( data )
     .enter().append( 'g')
       .attr( 'transform', function(d,i) {
         return 'rotate(' + (( i / data.length * 360 ) - 90 ) + ')translate(' + radius(topValue + 1.125) + ')';
       })
       .attr( 'class', 'line-ticks' );

   // Spoke lines
   lineAxes.append( 'line' )
     .attr( 'x2', -1 * radius(topValue + 2) )
     //.style( 'stroke', '#86B451' )
     .style( 'stroke', 'rgba(0,0,0,0.1)' )
     .style( 'fill', 'none' );

   // Spoke line labels
   lineAxes.append( 'text' )
     .text( function(d) { return d.section; })
     .attr( 'text-anchor', function(d,i) {
       if( i < 8 && i > 4 ) { return 'end'; }
       else if ( i == 0 || i == 4 ) { return 'middle'; }
       else { return 'start'; }
     })
     .attr( 'transform', function(d,i) {
       return 'rotate(' + ( 90 - ( i * 360 / data.length )) + ')';
     })
     .attr( 'dy', '0.3em' );

   /**
    * Radar Data
    */
   var series = d3.keys( data[0] )
     .filter( function(key) { return key !== 'section'; })
     .filter( function(key) { return key !== ''; });

   color.domain( series );

   var lines = color.domain().map(function( name ) {
     return (data.concat( data[0])).map( function(d) {
       console.log( +d[name] );
       return +d[name];
     });
   });

   /**
    * Radar Data Sets
    */
   var sets = svg.selectAll( '.series' )
     .data(series)
     .enter().append( 'g' )
       .attr( 'class', 'series' ),
       rad = [], ang = [];

   // Lines and area inside the lines
   // (use fill-opacity so we can control both - rather than creating double blobs)
   sets.append( 'path' ).data(lines)
     .attr( 'class', 'line area' )
     .attr( 'd', d3.lineRadial()
           .curve( d3.curveCardinal )
           .radius( function(d, i) {
             //console.log( "Radius" + radius(d) );
             rad.push( radius(d) );
             return radius(d);
           })
           .angle(function(d,i) {
             //console.log( (i/data.length ) * radians );
             ang.push((i/data.length) * radians );
             return ( i / data.length ) * radians;
           }))
     .data( series )
       .style( 'stroke-width', 3 )
       .style( 'fill-opacity', 0.5 )
       .style( 'fill', function(d,i) {
         return color(d); } )
       .style( 'stroke', function(d,i) {
         console.log( "Stroke color " + d);
         return color(d);
       });

    console.log( "Radius: " + rad + "\n" + "Angle: " + ang);

   // This data needs BOUND to their lines - not free-standing
   // dots are right, but not bound to their lines properly
   for( var k = 0; k < 3; k++ ) {
     for( var j = k * 9; j < k * 9 + 9; j++ ) {
       if( j < 1 ) { // do nothing with 0,0 - point-0, or it draws twice 
       } else {
      sets.data(series).append( 'circle' )
        .attr( 'class', function(d,i) { return 'dot line-' + (k+1) + ' point-' + j; })
        .attr( 'cx', function(d) { return getX( rad[j], ang[j] )})
        .attr( 'cy', function(d) { return getY( rad[j], ang[j] )})
        .attr( 'r', 6 )
        .style( 'fill', function(i) {
           console.log( "Color " + i );
           console.log( "Color: " + k );
           //if( j < rad.length/2 ) { return color(i); }
           //else {
            //var col = k-3;
             return dotcolor(k);
           //}
         });
        } // end for loop
     }
   }

   // Hover effects for the Series blobs
   sets.on( 'mouseover', function(d,i) {
       // Dim all series
       d3.selectAll( '.series' )
         .transition().duration(200)
         .style( 'opacity', 0.2 )
      // Dim all dots
      d3.selectAll( '.dot' )
        .transition().duration(200)
        .style( 'opacity', 0.2 )
       // Bring back the hovered series
       d3.select( this )
         .transition().duration(200)
         .style( 'opacity', 1 )
        .style( 'fill-opacity', 1 )
      // Bring back the hovered series dots
      d3.selectAll( '.line-' + (i+1) ) // Not working yet
        .transition().duration(200)
        .style( 'opacity', 1 )
     })
     .on( 'mouseout', function(d,i) {
       // Bring back all series
       d3.selectAll( '.series' )
         .transition().duration(200)
         .style( 'opacity', 0.8 )
      // Bring back all dots
      d3.selectAll( '.dot' )
        .transition().duration(200)
        .style( 'opacity', 1 )
     });

   /**
    * Radar Legend
    */
   var legend = svg.selectAll( '.legend' ).data(series)
     .enter().append( 'g' )
       .attr( 'class', 'legend' )
       .attr( 'transform', function(d,i) {
         return 'translate(0,' + i * -20 + ')';
       });

   legend.append( 'rect' )
     .attr( 'x', width/2 )
     .attr( 'y', height/2 )
     .attr( 'width', 18 )
     .attr( 'height', 18 )
     .style( 'fill', function(d,i) { return color(d); });

   legend.append( 'text' )
     .attr( 'x', width/2 - 4 )
     .attr( 'y', height/2 - 4 )
     .attr( 'dy', '1.2em' )
     .style( 'text-anchor', 'end' )
     .text( function(d) {
       return '20' + d.substr(-2);
     });

   /**
    * Radar Chart Title
    */
   var title = d3.select( 'svg' ).append( 'g' )
     .attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')')
     .attr( 'class', 'title' );

   title.append( 'text' )
     .attr( 'x', width/2 )
     .attr( 'y', -60 )
     .attr( 'text-anchor', 'middle' )
     .style( 'font-size', '1.6em' )
     .text( 'Life Satisfaction Chart' );

 });
