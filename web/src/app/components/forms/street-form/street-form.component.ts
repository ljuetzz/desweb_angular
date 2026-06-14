import { Component, OnInit } from '@angular/core';

//To use the template syntax @if, @for, ...
import { CommonModule } from '@angular/common';

//To use forms 
//  Import in the imports on the component the following
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";//angular material must be installed before
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';

//To use the controls in the component
//  Import in the imports on the component the following
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';


import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { StreetModel } from '../../../models/street.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TileJSON } from 'ol/source';

@Component({
  selector: 'app-street-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatTooltip,
    MatCheckboxModule
  ],
  templateUrl: './street-form.component.html',
  styleUrl: './street-form.component.scss'
})
export class StreetFormComponent {
  geomInUrl = false;
  l: StreetModel[]=[]
  serverMessage = '';
  
  //Form component creation
  id = new FormControl('');
  name = new FormControl('', [Validators.required]);
  length = new FormControl<number | null>(null);
  lanes = new FormControl(1, [Validators.required]);
  description = new FormControl('', [Validators.required]);
  category = new FormControl('', [Validators.required]);
  visitedAt = new FormControl('', [Validators.required]);
  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);
  allow_intersections = new FormControl(false);

  //Create a form group to eval the data at once
  controlsGroup = new FormGroup({
      id: this.id,
      name: this.name,
      length: this.length,
      lanes: this.lanes,
      description: this.description,
      category: this.category,
      visitedAt: this.visitedAt,
      geom: this.geom,
      allow_intersections: this.allow_intersections
  });

  //Pay attention to::
  //  - Services must be injected in the constructor
  //  - Services are not imported in the component, in the imports array
  constructor(private apiService:ApiService, private activatedRoute: ActivatedRoute, 
    public router: Router
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id.setValue(params.get('id') ?? '');
      this.name.setValue(params.get('name') ?? '');
      this.description.setValue(params.get('description') ?? '');

      const length = params.get('length');
      this.length.setValue(length === null ? null : Number(length));

      const lanes = params.get('lanes');
      this.lanes.setValue(lanes === null ? 1 : Number(lanes));

      this.category.setValue(params.get('category') ?? '');
      this.visitedAt.setValue(params.get('visitedAt') ?? '');
      this.geom.setValue(params.get('geom') ?? '');
      this.allow_intersections.setValue(params.get('allow_intersections') === 'true');

      if (params.get('geom')) {
        this.geomInUrl = true;
      }
    });
  }
  insert(){
    this.serverMessage='';
    console.log(this.controlsGroup.valid)
    console.log(this.controlsGroup.value)
    this.apiService.post('erasmus_valencia/streets/insert/',this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        this.selectAll();
      },
      error:error=>{
        console.log(error.description)
      }
    })//subscribe
  }
  select(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.get('erasmus_valencia/streets/selectone/?id=' + this.id.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          var d: StreetModel = response.data as StreetModel;
          this.setDataInForm(d);
          this.clearList();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  fillFormwithExample() {

    this.name.setValue('Example street');
    this.description.setValue('Description of the example street');
    this.category.setValue('Example category');
    this.visitedAt.setValue(new Date().toISOString());



    function randomIntFromInterval(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    this.length.setValue(randomIntFromInterval(10, 1000));
    this.lanes.setValue(randomIntFromInterval(1, 5));
    const coordinates = [];

    for (let i = 0; i < 4; i++) {
      const x = randomIntFromInterval(0, 100);
      const y = randomIntFromInterval(0, 100);

      coordinates.push(`${x} ${y}`);
    }

    this.geom.setValue(
      'LINESTRING(' + coordinates.join(',') + ')'
    );
  }


  selectAll(){
    this.serverMessage='';
    this.apiService.get('erasmus_valencia/streets/selectall/').subscribe({

      next: response => {
        console.log('response',response)
        this.l = response.data as StreetModel[];
        this.serverMessage=response.message;
      },
      error:error=>{
        console.log(error.description)
      }
    })//subscribe
  }

  deleteRow(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    // id is in the body not
    this.apiService.post('erasmus_valencia/streets/delete/', {id: this.id.value}).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          this.clearForm();
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  update(){
    this.serverMessage='';
    console.log(this.controlsGroup.value)
    if (!this.id.value){
      console.log('Put an id');
      this.serverMessage='Put an id';
      return;
    }
    this.apiService.post('erasmus_valencia/streets/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          this.selectAll();
        }
        this.serverMessage=response.message;
      },
      error: (error:any)=>{
        console.log(error.description)
      }
    })//subscribe
  }

  clearForm(){
    this.controlsGroup.reset();
  }
  clearList(){
    this.l = [];
  }
  setDataInForm(data: StreetModel){
    this.id.setValue(data.id.toString());
    this.name.setValue(data.name);
    this.description.setValue(data.description);
    this.length.setValue(data.length);
    this.lanes.setValue(data.lanes);
    this.category.setValue(data.category);
    this.visitedAt.setValue(data.visitedAt);
    this.geom.setValue(data.geom);
    this.allow_intersections.setValue(false);
  }

  useGeomInUrl(){
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.geom.setValue(params.get("geom"));
    });
  }

}