import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-select-geometry',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './select-geometry.html',
  styleUrl: './select-geometry.scss'
})
export class SelectGeometryComponent implements AfterViewInit, OnDestroy {

  selectMode = false;
  selectInteraction?: Select;

  constructor(
    private mapService: MapService,
    private router: Router,
    private eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type !== 'selectGeometryActivated') {
        this.selectMode = false;
        this.disableSelect();
      }
    });
  }

  enableSelect() {
    this.mapService.disableMapInteractions();
    this.selectInteraction?.setActive(true);
    this.eventService.emitEvent(
      new EventModel('selectGeometryActivated', {})
    );
  }

  disableSelect() {
    this.selectInteraction?.setActive(false);
    this.selectInteraction?.getFeatures().clear();
  }

  

  ngAfterViewInit(): void {
    this.selectInteraction = new Select({
      condition: click
    });

    this.selectInteraction.on('select', event => {
      const feature = event.selected[0];

      if (!feature) {
        return;
      }

      const featureType = feature.get('featureType');

      if (featureType === 'building') {
        this.router.navigate(['/building-form'], {
          queryParams: {
            id: feature.get('id'),
            name: feature.get('name'),
            description: feature.get('description'),
            floors: feature.get('floors'),
            height: feature.get('height'),
            category: feature.get('category'),
            visitedAt: feature.get('visitedAt'),
            geom: feature.get('geom')
          }
        });
      }

      if (featureType === 'street') {
        this.router.navigate(['/street-form'], {
          queryParams: {
            id: feature.get('id'),
            name: feature.get('name'),
            description: feature.get('description'),
            length: feature.get('length'),
            lanes: feature.get('lanes'),
            category: feature.get('category'),
            visitedAt: feature.get('visitedAt'),
            geom: feature.get('geom'),
            allow_intersections: feature.get('allow_intersections')
          }
        });
      }

      if (featureType === 'poi') {
        this.router.navigate(['/poi-form'], {
          queryParams: {
            id: feature.get('id'),
            name: feature.get('name'),
            description: feature.get('description'),
            category: feature.get('category'),
            visitedAt: feature.get('visitedAt'),
            geom: feature.get('geom'),
            rating: feature.get('rating')
          }
        });
      }
    });

    this.selectInteraction.setActive(false);
    this.mapService.map.addInteraction(this.selectInteraction);
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;

    if (this.selectMode) {
      this.enableSelect();
    } else {
      this.disableSelect();
    }
  }

  ngOnDestroy(): void {
    if (this.selectInteraction) {
      this.mapService.map.removeInteraction(this.selectInteraction);
    }
  }
}