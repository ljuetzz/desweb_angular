import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { WKT } from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';

@Component({
  selector: 'app-draw-poi',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-poi.component.html',
  styleUrl: './draw-poi.component.scss'
})
export class DrawPoiComponent implements AfterViewInit, OnDestroy {
  drawMode: boolean = false;
  drawPoi: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    this.eventService.eventActivated$.subscribe((event:EventModel) => {
      console.log("Event received in DrawPoiComponent:", event.type);
      if (event.type != 'drawPoiActivated') {
        this.drawMode = false; // Reset draw mode if a different event is received
      }
    });
  }

  ngAfterViewInit(): void {
    console.log("DrawPoiComponent initialized");
    this.addDrawPoiInteraction();
    this.disableDrawPois();
    this.reloadPoisWmsLayer();
  }
  
  toggleDrawMode() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      // Start drawing mode
      this.enableDrawPois();
      console.log("Drawing mode activated");
    } else {
      // Stop drawing mode
      this.disableDrawPois();
      this.clearVectorLayer();
      this.reloadPoisWmsLayer();
      console.log("Drawing mode deactivated");
    }
  }

  addDrawPoiInteraction() {
    // Add the draw interaction when the component is initialized
    var sourcePois: VectorSource = this.mapService.getLayerByTitle('POI vector')?.getSource();
    if(sourcePois){
      this.drawPoi = new Draw({
        source: sourcePois, // source of the layer where the points will be drawn
        type: ('Point') // geometry type
      });
      this.drawPoi.on('drawend', this.manageDrawEnd);

      // adds the interaction to the map. This must be done only once
      this.mapService.map!.addInteraction(this.drawPoi);
    }else{
      console.error("Error: POI layer not found");
    }
  }

  // Enables the point draw
  enableDrawPois(){
    this.mapService.disableMapInteractions(); // Disable other interactions
    this.drawPoi!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawPoiActivated', {}));
  }

  // Disables the point draw
  disableDrawPois(){
    this.drawPoi!.setActive(false);
  }

  // Clear the vector layer
  clearVectorLayer(){
    this.mapService.getLayerByTitle('POI vector')?.getSource().clear();
  }

  // Reload POI WMS Layer
  reloadPoisWmsLayer(){
    this.mapService.getLayerByTitle('POI WMS')?.getSource().updateParams({"time": Date.now()})
  }

  /**
   * Function which is executed each time that a point is finished of draw
   * Inside the e object is the geometry drawed.
   * 
   * IMPORTANT
   * It is an arow fuction in order to 'this' refer to the component class
   * and to have access to the router
   * */
  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;//this is the feature that fired the event
    var wktFormat = new WKT();//an object to get the WKT format of the geometry
    var wktRepresentation = wktFormat.writeGeometry(feature.getGeometry()!);//geometry in wkt
    console.log(wktRepresentation);//logs a message
    this.router.navigate(['/poi-form'], { queryParams: {geom: wktRepresentation }});
  }

  ngOnDestroy(): void {
    // Remove the draw interaction when the component is destroyed
    if (this.drawPoi) {
      this.mapService.map?.removeInteraction(this.drawPoi);
      console.log("Draw interaction removed");
    }
  }

}
