import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExcelUploaderComponent } from './excel-uploader/excel-uploader.component';

const routes: Routes = [
  {
    path:"exceldata",
    component:ExcelUploaderComponent
  },
  { path: '', redirectTo: 'exceldata', pathMatch: 'full' },
  { path: '**', redirectTo: 'exceldata', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
