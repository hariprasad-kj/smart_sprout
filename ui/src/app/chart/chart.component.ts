import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChartDef } from '../def';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent {

  @Input("chartData") chartData!: ChartDef;
  chart!: Chart;
  @ViewChild('chartCanvas') chartRef!: ElementRef;
  ngAfterViewInit(): void {
    if (this.chartData) {
      this.createMap(this.chartData);
    }
  }
  createMap(data: ChartDef) {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: data.label,
            data: data.data,
            backgroundColor: 'rgb(26, 67, 150)',
            borderColor: 'rgb(26, 67, 150)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: data.beginAtZero
          }
        }
      }
    });
  }


}
