
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
import { MatCheckboxModule } from '@angular/material/checkbox';


//To use the controls in the component
//  Import in the imports on the component the following
import {FormControl} from '@angular/forms';
import {FormGroup, Validators} from '@angular/forms';


import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { POIModel } from '../../../models/poi.model';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-area-form',
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
  templateUrl: './area-form.component.html',
  styleUrl: './area-form.component.scss'
})

export class AreaFormComponent {
  geomInUrl = false;
  l: POIModel[]=[]
  serverMessage = '';

  //Form component creation
  base = new FormControl<number | null>(1, [Validators.required, Validators.min(1)]);
  height = new FormControl<number>(1, [Validators.required, Validators.min(1)]);

  //Create a form group to eval the data at once
controlsGroup = new FormGroup({
    base: this.base,
    height:  this.height,
});


  calculate_area(){
    const base = this.base.value;
    const height = this.height.value;
    if (base && height) {
      const area = base * height / 2; // Assuming it's a triangle
      this.serverMessage = `The area of the triangle is: ${area} m²`;
    } else {
      this.serverMessage = 'Please enter valid base and height values.';
    }
  }

  clearForm(){
    this.controlsGroup.reset();
    this.serverMessage = '';
  }
}
