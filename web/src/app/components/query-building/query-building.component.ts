import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import Point from 'ol/geom/Point';

import {Draw} from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import {WKT} from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { HttpClient } from '@angular/common/http';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';

import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

@Component({
  selector: 'app-query-building',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './query-building.component.html',
  styleUrl: './query-building.component.scss'
})
export class QueryBuildingComponent implements AfterViewInit, OnDestroy {

  queryMode = false;
  queryPoint?: Draw;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService, private http: HttpClient) {

    this.eventService.eventActivated$.subscribe((event: EventModel) => {

      if (event.type !== 'queryBuildingActivated') {
        this.queryMode = false;
        this.disableQuery();
      }
    });

  }

  ngAfterViewInit(): void {
    this.addQueryInteraction();
    this.disableQuery();
  }

  toggleQueryMode() {

    this.queryMode = !this.queryMode;

    if (this.queryMode) {
      this.enableQuery();
    } 
    else {
      this.disableQuery();
    }
  }

  addQueryInteraction() {
    const source = this.mapService
        .getLayerByTitle('POI vector')
        ?.getSource();

    if (!source) {
      return;
    }

    this.queryPoint = new Draw({
      source: source,
      type: 'Point'
    });

    this.queryPoint.on('drawend', this.manageDrawEnd);
    this.mapService.map?.addInteraction(this.queryPoint);
  }

  enableQuery() {
    this.mapService.disableMapInteractions();
    this.queryPoint?.setActive(true);
    this.eventService.emitEvent(
      new EventModel('queryBuildingActivated', {})
    );
  }

  disableQuery() {
    this.queryPoint?.setActive(false);
  }

  manageDrawEnd = (e: DrawEvent) => {

    const geometry = e.feature.getGeometry();

    if (!(geometry instanceof Point)) {
      return;
    }

    this.queryBuildings(geometry);

  }

  queryBuildings(point: Point) {

    const [x, y] = point.getCoordinates();

    const buffer = 1; // Meter

    const bbox = [
      x - buffer,
      y - buffer,
      x + buffer,
      y + buffer
    ].join(',');

    const url =
      'http://ovc.catastro.meh.es/INSPIRE/wfsBU.aspx'
      + '?service=WFS'
      + '&version=2.0.0'
      + '&request=GetFeature'
      + '&typeNames=BU.BUILDING'
      + '&bbox=' + bbox
      + '&srsname=EPSG::25830' // check for double :
      + '&outputFormat=application/json';

    console.log(url);

    this.http.get(url, {
      responseType: 'text'
    })
    .subscribe({
      next: (response) => {
        console.log(response);
        const parser = new DOMParser();
        const xml = parser.parseFromString(
          response,
          'text/xml'
        );
        const posLists = xml.getElementsByTagNameNS(
          'http://www.opengis.net/gml/3.2',
          'posList'
        );
        console.log(posLists.length);
        const posList = posLists[0];
        const values = posList.textContent!.trim().split(/\s+/).map(Number);
        const ring = [];

        for(let i = 0; i < values.length; i += 2){
          ring.push([
            values[i],
            values[i + 1]
          ]);
        }
        const polygon = new Polygon([ring]);

        const feature = new Feature({geometry: polygon});

        console.log(polygon.getExtent());

        console.log(feature);

        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'red',
              width: 5
            }),
            fill: new Fill({
              color: 'rgba(255,0,0,0.4)'
            })
          })
        );

        this.mapService.getLayerByTitle('Buildings vector')?.getSource().addFeature(feature);

        const source = this.mapService
          .getLayerByTitle('Buildings vector')
          ?.getSource() as VectorSource;

        console.log(
          feature.getGeometry()?.getType()
        );

        console.log(polygon.getExtent());

        this.mapService.map.getView().fit(
          polygon.getExtent(),
          {
            duration: 1000,
            maxZoom: 20
          }
        );


        this.mapService.map.render();

        setTimeout(() => {

          const confirmed = confirm('Insert this building?');

          if (confirmed) {
            const wkt = new WKT().writeGeometry(polygon);
            this.router.navigate(
              ['/building-form'],
              {
                queryParams: {
                  geom: wkt
                }
              }
            );
          }

        }, 2000);

        },
        error: (err) => {console.error(err);}
    });

  }


  ngOnDestroy(): void {
    if (this.queryPoint) {
      this.mapService.map?.removeInteraction(this.queryPoint);
    }
  }

}
