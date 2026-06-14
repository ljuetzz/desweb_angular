import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { WKT } from 'ol/format';
import VectorSource from 'ol/source/Vector';

import { ApiService } from '../../services/api.service';
import { MapService } from '../../services/map.service';
import { BuildingModel } from '../../models/building.model';
import { StreetModel } from '../../models/street.model';
import { POIModel } from '../../models/poi.model';

@Component({
  selector: 'app-load-layers-wkt',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltip],
  templateUrl: './load-layers-wkt.html',
  styleUrl: './load-layers-wkt.scss'
})
export class LoadLayersWktComponent {

  constructor(
    private apiService: ApiService,
    private mapService: MapService
  ) {}

  loadBuildings() {
    this.loadWktLayer<BuildingModel>(
      'erasmus_valencia/buildings/selectall/',
      'Buildings vector',
      'building'
    );
  }

  loadStreets() {
    this.loadWktLayer<StreetModel>(
      'erasmus_valencia/streets/selectall/',
      'Streets vector',
      'street'
    );
  }

  loadPois() {
    this.loadWktLayer<POIModel>(
      'erasmus_valencia/pois/selectall/',
      'POI vector',
      'poi'
    );
  }

private loadWktLayer<T extends { geom: string }>(
  endpoint: string,
  layerTitle: string,
  featureType: 'building' | 'street' | 'poi'
) {
  const source = this.mapService
    .getLayerByTitle(layerTitle)
    ?.getSource() as VectorSource;

  if (!source) {
    console.error('Layer not found:', layerTitle);
    return;
  }

  source.clear();

  this.apiService.get(endpoint).subscribe({
    next: response => {
      const wktFormat = new WKT();
      const items = response.data as T[];

      items.forEach(item => {
        if (!item.geom) {
          return;
        }

        const feature = wktFormat.readFeature(item.geom, {
          dataProjection: 'EPSG:25830',
          featureProjection: 'EPSG:25830'
        });

        feature.setProperties({
          ...item,
          featureType: featureType
        });

        source.addFeature(feature);
      });

      this.mapService.map.render();
    },
    error: error => {
      console.error(error);
    }
  });
  }
}