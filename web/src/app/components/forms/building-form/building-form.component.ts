
import { Component, OnInit } from '@angular/core';

//To use the template syntax @if, @for, ...
import { CommonModule } from '@angular/common';

//To use forms 
//  Import in the imports on the component the following
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";//angular material must be installed before
import { MatTooltip } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';

//To use the controls in the component
//  Import in the imports on the component the following
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';


import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { BuildingModel } from '../../../models/building.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TileJSON } from 'ol/source';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule,
    MatCardModule
  ],
  templateUrl: './building-form.component.html',
  styleUrl: './building-form.component.scss'
})
export class BuildingFormComponent implements OnInit{
  geomInUrl = false;
  l: BuildingModel[]=[]
  serverMessage = '';
  //Form component creation
  id = new FormControl('');

  name = new FormControl('', [Validators.required]);

  description = new FormControl('', [Validators.required]);

  floors = new FormControl('', [Validators.required]);

  height = new FormControl('', [Validators.required]);

  category = new FormControl('', [Validators.required]);

  visitedAt = new FormControl('', [Validators.required]);

  geom = new FormControl('', [Validators.required, Validators.minLength(10)]);

  //Create a form group to eval the data at once
  controlsGroup = new FormGroup({
    id: this.id,
    name: this.name,
    description: this.description,
    floors: this.floors,
    height: this.height,
    category: this.category,
    visitedAt: this.visitedAt,
    geom: this.geom
  })

  //Pay attention to::
  //  - Services must be injected in the constructor
  //  - Services are not imported in the component, in the imports array
  constructor(private apiService:ApiService, private activatedRoute: ActivatedRoute, 
    public router: Router
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      var geom = params.get("geom");
      if (geom){
        this.geom.setValue(geom);
        this.geomInUrl=true
      }
    });
  }

  insert(){
    this.serverMessage='';
    console.log(this.controlsGroup.valid)
    console.log(this.controlsGroup.value)
    this.apiService.post('erasmus_valencia/buildings/insert/',this.controlsGroup.value).subscribe({
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
    this.apiService.get('erasmus_valencia/buildings/selectone/?id=' + this.id.value).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response',response)
        console.log('response.data',response.data)
        if (response.ok){
          var d: BuildingModel = response.data as BuildingModel;
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

  selectAll(){
    this.serverMessage='';
    this.apiService.get('erasmus_valencia/buildings/selectall/').subscribe({

      next: response => {
        console.log('response',response)
        this.l = response.data as BuildingModel[];
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
    this.apiService.post('erasmus_valencia/buildings/delete/', {id: this.id.value}).subscribe({
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
    this.apiService.post('erasmus_valencia/buildings/update/' + this.id.value + '/', this.controlsGroup.value).subscribe({
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
  setDataInForm(data: BuildingModel){
    this.id.setValue(data.id.toString());
    this.name.setValue(data.name);
    this.description.setValue(data.description);
    this.floors.setValue(data.floors.toString());
    this.height.setValue(data.height.toString());
    this.category.setValue(data.category);
    this.visitedAt.setValue(data.visitedAt);
    this.geom.setValue(data.geom);
  }

  useGeomInUrl(){
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.geom.setValue(params.get("geom"));
    });
  }

}
