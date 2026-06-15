import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import { click } from 'ol/events/condition';
import { WKT } from 'ol/format';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-edit-geometry',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './edit-geometry.html',
  styleUrl: './edit-geometry.scss'
})
export class EditGeometryComponent implements AfterViewInit, OnDestroy {

  editMode = false;
  editSelect?: Select;
  modifyInteraction?: Modify;

  constructor(
  private mapService: MapService,
  private eventService: EventService
  ) {
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      if (event.type !== 'editGeometryActivated') {
        this.editMode = false;
        this.disableEdit();
      }
    });
  }

  enableEdit() {
    this.mapService.disableMapInteractions();

    this.editSelect?.setActive(true);
    this.modifyInteraction?.setActive(true);

    this.eventService.emitEvent(
      new EventModel('editGeometryActivated', {})
    );
  }

  disableEdit() {
    this.editSelect?.setActive(false);
    this.modifyInteraction?.setActive(false);
    this.editSelect?.getFeatures().clear();
  }

  ngAfterViewInit(): void {
    this.editSelect = new Select({
      condition: click
    });

    this.modifyInteraction = new Modify({
      features: this.editSelect.getFeatures()
    });

    this.modifyInteraction.on('modifyend', event => {
      const wktFormat = new WKT();

      event.features.forEach(feature => {
        const geometry = feature.getGeometry();

        if (!geometry) {
          return;
        }

        const newWkt = wktFormat.writeGeometry(geometry);
        feature.set('geom', newWkt);
      });
    });

    this.editSelect.setActive(false);
    this.modifyInteraction.setActive(false);

    this.mapService.map.addInteraction(this.editSelect);
    this.mapService.map.addInteraction(this.modifyInteraction);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;

    if (this.editMode) {
      this.enableEdit();
    } else {
      this.disableEdit();
    }
  }

  ngOnDestroy(): void {
    if (this.editSelect) {
      this.mapService.map.removeInteraction(this.editSelect);
    }

    if (this.modifyInteraction) {
      this.mapService.map.removeInteraction(this.modifyInteraction);
    }
  }
}