import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromEvent, throttleTime, map, scan } from 'rxjs';
import * as d3 from "d3";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'charts';
  svg: any;
  data: any;
  width = 400;
  height = 400;
  margin = 100;
  centerX = this.width / 2;
  centerY = this.height / 2;
  maxValues: Array<number> = [];
  axes: Array<any> = [];

  radius = d3.scaleLinear().range([0, 100]);
  radians = 2 * Math.PI;

  circle: any;
  lineGroups: any;
  polygonSets: any;
  colors : string[] = ["blue", "green", "red", "lightblue", "lightgreen", "pink"];


  /**
   *
   */
  constructor() {
    this.data = {
      attributes: ["a1", "a2", "a3", "a4", "a5", "a6", "a7","a8", "a9", "a10", "a11", "a12", "a13", "a14"],
      values: [
        { a1: 55, a2: 10, a3: 20, a4: 2, a5: 3, a6: 45, a7: 31 ,a8: 15, a9: 35, a10: 20, a11: 23, a12: 3, a13: 45, a14: 4 },
        //{ a1: 5, a2: 1, a3: 30, a4: 20, a5: 65, a6: 5, a7: 3,a8: 52, a9: 10, a10: 20, a11: 2, a12: 3, a13: 45, a14: 43 },
        //{ a1: 1, a2: 20, a3: 11, a4: 22, a5: 33, a6: 35, a7: 69 ,a8: 10, a9: 30, a10: 20, a11: 2, a12: 3, a13: 45, a14: 43},
        { a1: 3, a2: 68, a3: 24, a4: 12, a5: 33, a6: 4, a7: 23 ,a8: 36, a9: 18, a10: 20, a11: 75, a12: 31, a13: 45, a14: 32},
        //{ a1: 78, a2: 54, a3: 36, a4: 80, a5: 25, a6: 51, a7: 33 ,a8: 74, a9: 13, a10: 20, a11: 2, a12: 3, a13: 45, a14: 43},
        { a1: 15, a2: 21, a3: 64, a4: 32, a5: 3, a6: 5, a7: 9 ,a8: 31, a9: 21, a10: 20, a11: 29, a12: 23, a13: 45, a14: 16}
      ]
    };



  }

   getX = function(r: number, angle: number) {
    var adj = Math.sin(angle) * r;
    var xCoord = adj;
    console.log( 'x: ' + xCoord );
    return xCoord;
  }
 
  // Finds the x coordinate to place a point
  getY = function(r: number, angle: number) {
    var opposite = -Math.cos(angle)*r;
    var yCoord = opposite;
    console.log( 'y: ' + yCoord );
    return yCoord;
  }

  ngOnInit(): void {
    this.svg = d3.select('#radar').append('svg')
      .style('background', 'rgba(0,0,0,0.1)')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('class', 'radar')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');

    this.circle = this.svg.append('g')
      .append('circle')
      .attr('r', 100).attr('stroke', 'rgba(0,0,0,0.5)')
      .attr('fill', 'rgba(255,255,255,0.3)')
      .attr('transform', 'translate(' + (this.margin) + ',' + (this.margin) + ')');

    this.svg.append('g')
      .append('circle')
      .attr('r', 2).attr('stroke', 'rgba(0,0,0,0.5)')
      .attr('fill', 'rgba(0,0,0,0.3)')
      .attr('transform', 'translate(' + 100 + ',' + 100 + ')');

    this.lineGroups = this.svg.append('g')
      .attr('stroke', 'rgba(255,0,0,0.5)')
      .attr('fill', 'rgba(255,0,0,0.3)')
      .attr('transform', 'translate(' + (this.margin) + ',' + (this.margin) + ')');

    this.polygonSets = this.svg.append('g')
      .attr('stroke', 'rgba(255,0,0,0.5)')
      .attr('fill', 'rgba(255,0,0,0.3)')
      .attr('transform', 'translate(' + (this.margin) + ',' + (this.margin) + ')');




    this.maxValues = this.getMaxValues();

    this.radius = this.radius.domain([0, Math.max(...this.maxValues)]);

    this.addAxis();
    this.addDataSets();
  }

  getMaxValues(): any {
    let max = this.data.attributes.map((d: any) => {
      let atrs = this.data.values.map((at: any) => { return at[d] })
      return atrs;
    }).map((v: any) => { return Math.max(...v) });
    return max;
  }

  addAxis(): any {
    console.log(Math.max(...this.maxValues) + 1.125, this.maxValues)
    let xes = this.data.attributes.forEach((a: string | number, i: number) => {
      let topValue = Math.max(...this.maxValues)
      let dataLength = this.data.attributes.length;
      console.log(a, i);
      let xUi = this.lineGroups.append('g')
        .attr('transform', (d: any, j: number) => {
          console.log(d, i)
          return 'rotate(' + ((i / dataLength * 360) - 90) + ')translate(' + this.radius(topValue + 1.125) + ')';
        }).style('z-index', '100')



      xUi.append('line')
        .attr('x2', -1 * this.radius(topValue + 2))
        //.style( 'stroke', '#86B451' )
        .style('stroke', 'rgba(0,0,0,0.5)')
        .style('fill', 'none');


      //xUi.append()
      return {
        key: a,
        ui: xUi
      }
    })
  }

  addDataSets() : any {
    let xes = this.data.values.forEach((val: any, i: number) => {
      let topValue = Math.max(...this.maxValues)
      let dataLength = this.data.attributes.length;
      //console.log(a, i);
      //let xUi = 
      let points: string[] = [];

      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          const element = val[key];
          const keyIndex = this.data.attributes.indexOf(key)
          //console.log(keyIndex)
          const x = this.getX( this.radius(element), (keyIndex / this.data.attributes.length) * this.radians )
          const y = this.getY( this.radius(element), (keyIndex / this.data.attributes.length) * this.radians )
          points.push(x + "," + y)

          this.polygonSets.append('circle')
            // .attr('transform', (d: any, j: number) => {
            //   console.log(d, i)
            //   return 'rotate(' + ((i / dataLength * 360) - 90) + ')translate(' + this.radius(topValue + 1.125) + ')';
            // })
            .attr( 'cx', x)
            .attr( 'cy', y)
            .attr( 'r', 2 )
            .attr('fill', this.colors[i])
            .style('z-index', '100')



            console.log(element, this.getX(this.radius(element), (keyIndex / this.data.attributes.length) * this.radians))
          }
        }

        this.polygonSets.append('polyline')
        .attr('points', points.join(" ") + " " + points[0] )
        .attr('fill', this.colors[i])
        .attr('opacity', 0.3)



      


      //xUi.append()
      return {
        key: i,
        //ui: xUi
      }
    })

  }
}
