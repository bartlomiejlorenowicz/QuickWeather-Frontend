import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-air-quality',
  templateUrl: './air-quality.component.html',
  styleUrls: ['./air-quality.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule]
})
export class AirQualityComponent implements OnChanges {
  @Input() airQualityData: any;
  @Input() city: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    console.log('AirQualityComponent - input changes:', changes);
  }

  capitalizeCity(city: string): string {
    if (!city) return city;
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }
}
