import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapService } from '../../services/map.service';

import {Draw} from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import {WKT} from 'ol/format';
import VectorSource from 'ol/source/Vector';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-draw-street',
  standalone: true,
  imports: [MatIconModule, MatTooltip],
  templateUrl: './draw-street.component.html',
  styleUrl: './draw-street.component.scss'
})
export class DrawStreetComponent implements AfterViewInit, OnDestroy{
  drawMode: boolean = false;
  drawStreet: Draw | undefined;

  constructor(public mapService: MapService, public router: Router, public eventService: EventService) {
    // Subscribe to events if needed
    this.eventService.eventActivated$.subscribe((event: EventModel) => {
      console.log("Event received in DrawStreetComponent:", event.type);
      if (event.type != 'drawStreetActivated') {
        this.drawMode = false; // Reset draw mode if a different event is received
      }
      // Handle the event as needed
    });
  }

  ngAfterViewInit(): void {
    console.log("DrawStreetComponent initialized");
    this.addDrawStreetInteraction();
    this.disableDrawStreets();
    this.reloadStreetsWmsLayer();
  }

  toggleDrawMode(){
    this.drawMode = !this.drawMode;
    if(this.drawMode){
      // Start drawing mode
      this.enableDrawStreets();
      console.log("Drawing mode activated");
    } else {
      // Stop drawing mode
      this.disableDrawStreets();
      this.clearVectorLayer();
      this.reloadStreetsWmsLayer();
      console.log("Drawing mode deactivated");
    }
  }
  addDrawStreetInteraction() {
    //Add the draw interaction when the component is initialized
    var sourceStreets: VectorSource = this.mapService.getLayerByTitle('Streets vector')?.getSource();
    if(sourceStreets){
	    this.drawStreet = new Draw({
         source: sourceStreets, //source of the layer where the poligons will be drawn
        type: ('LineString') //geometry type
      });
      this.drawStreet.on('drawend', this.manageDrawEnd);
	
	    //adds the interaction to the map. This must be done only once
      this.mapService.map!.addInteraction(this.drawStreet);
    }else{
      console.error("Error: Streets layer not found");
    }
  }

  //Enables the polygons draw
  enableDrawStreets(){
    this.mapService.disableMapInteractions(); // Disable other interactions
    this.drawStreet!.setActive(true);
    this.eventService.emitEvent(new EventModel('drawStreetActivated', {}));
  }

  //Disables the polygons draw
  disableDrawStreets(){
    this.drawStreet!.setActive(false);
  }

  //Enables clear the vector layer
  clearVectorLayer(){
    this.mapService.getLayerByTitle('Streets vector')?.getSource().clear();
  }
  //Reload Streets WMS Layer
  reloadStreetsWmsLayer(){
    this.mapService.getLayerByTitle('Street WMS')?.getSource().updateParams({"time": Date.now()})
  }

  /**
   * Function which is executed each time that a polygon is finished of draw
   * Inside the e object is the geometry drawed.
   * 
   * IMPORTANT
   * It is an arow fuction in order to 'this' refer to the component class
   * and to have access to the router
   * */
  manageDrawEnd = (e: DrawEvent) => {
    var feature = e.feature;//this is the feature that fired the event
    var wktFormat = new WKT();//an object to get the WKT format of the geometry
    var wktRepresentation  = wktFormat.writeGeometry(feature.getGeometry()!);//geomertry in wkt
    console.log(wktRepresentation);//logs a message
    this.router.navigate(['/street-form'], { queryParams: {geom: wktRepresentation }});

  }

  ngOnDestroy(): void {
    // Remove the draw interaction when the component is destroyed
    if (this.drawStreet) {
      this.mapService.map?.removeInteraction(this.drawStreet);
      console.log("Draw interaction removed");
    }
  }
}
