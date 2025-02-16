import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDataServiceService } from '../../Common-service/api-data-service.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ExcelUploadService {


  constructor(private apiDataService: ApiDataServiceService) {}

  uploadJsonData(data: any[]) {

    this.apiDataService.POST("UploadData", data).subscribe({
      next: (response: any) => {
        if (response) {
          if (response.statuscode == 200) {
            Swal.fire('Success!', response.message, 'success');
          } else {
            Swal.fire('Error!', response.message, 'error');
          }
        }
      },
      error: (error:any) => {
        console.error("Error uploading data:", error);
        Swal.fire('Error!', 'Something went wrong while uploading data.', 'error');
      }
    });
    return;
}


}
