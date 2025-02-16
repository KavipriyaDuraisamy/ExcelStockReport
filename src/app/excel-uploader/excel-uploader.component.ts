import { Component, HostListener, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { ExcelUploadService } from '../services/excel-upload.service';
import { ClientSideRowModelModule, ColDef, ExcelData, GridApi, GridOptions, IGetRowsParams, RowModelType } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ApiDataServiceService } from '../../Common-service/api-data-service.service';

interface FileUpload {
  name: string;
  size: string;
  progress: number;
}
@Component({
  selector: 'app-excel-uploader',
  templateUrl: './excel-uploader.component.html',
  styleUrl: './excel-uploader.component.scss'
})
export class ExcelUploaderComponent {

  jsonData: any[] = [];
  fileName: any = '';
  rowData: any[] = [];
  private gridApi!: GridApi;
  public rowModelType: RowModelType = 'infinite'; // Make sure this is set to 'infinite'
  public cacheBlockSize = 100;
  public infiniteInitialRowCount = 0; // Start with 0, load on file change
  public maxBlocksInCache = 10;
  searchTerm: string = ''; // Holds the search term from the UI
  fileUploads: FileUpload[] = [];
  isUploading: boolean = false;
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  @ViewChild('fileInput') fileInput: any;
  constructor(private excelUploadService: ExcelUploadService, private apiDataService: ApiDataServiceService) {
  }
  gridOptions: GridOptions = {
    localeText: {
      noRowsToShow: "No records available",
    },
  };

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length !== 1) {
      return;
    }

    this.isUploading = true; // Disable new uploads during processing

    const file = target.files[0];
    const fileSize = file.size < 1024 * 1024
      ? (file.size / 1024).toFixed(2) + ' KB'
      : (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const fileUpload: FileUpload = { name: file.name, size: fileSize, progress: 0 };
    this.fileUploads.push(fileUpload);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log('Converted JSON:', jsonData);

      this.simulateUploadProgress(this.fileUploads.length - 1, jsonData);
    };

    reader.readAsBinaryString(file);
  }

  simulateUploadProgress(index: number, jsonData: any[]) {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        
        setTimeout(() => {
          this.rowData = jsonData;
          this.removeCompletedFiles();
          this.fileInput.nativeElement.value = "";
          this.setDataSource();
          this.gridApi?.refreshCells({ force: true });

          this.isUploading = false; // Re-enable file uploads
        }, 1000); // Auto-close after 1s
      } else {
        progress += 10;
        this.fileUploads[index].progress = progress;
      }
    }, 50);
  }
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  trackByIndex(index: number, item: any) {
    return index;
  }


  removeCompletedFiles() {
    this.fileUploads = this.fileUploads.filter(file => file.progress < 100);
  }

  setDataSource() {
    if (!this.gridApi) {
      console.warn('Grid API is not ready yet!');
      return;
    }
    const dataSource: any = {
      rowCount: null, 
      getRows: (params: IGetRowsParams) => {
        const rowsThisPage = this.rowData.slice(params.startRow, params.endRow);
        const lastRow = this.rowData.length <= params.endRow ? this.rowData.length : undefined;
        params.successCallback(rowsThisPage, lastRow);
      }
    };
    this.gridApi.setDatasource(dataSource);
    this.loadData();
  }

  uploadData() {
    if (this.rowData.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Available',
        text: 'There are no records to Save. Please add data before proceeding.',
        confirmButtonText: 'OK'
      });
      return;
    }
    if (this.rowData.length > 0) {
      const formattedData = this.rowData.map(item => ({
        ...item,
        CreatedDate: this.convertExcelDate(item.CreatedDate),
        LastModifiedDate: this.convertExcelDate(item.LastModifiedDate)
      }));
      this.excelUploadService.uploadJsonData(formattedData);
    }
  }

  convertExcelDate(excelDate: any): string | null {
    if (!excelDate) return null;
    let date: Date | null = null;
    if (typeof excelDate == 'string') {
      date = new Date(excelDate);
    }
    if (date && !isNaN(date.getTime())) {
      return date.toISOString();
    }
    return null;
  }

  defaultColDef: ColDef = {
    sortable: true, 
    filter: true,    
    resizable: true, 
  };

  columnDefs: ColDef[] = [

    { field: 'Id', headerName: 'ID', hide: false, width: 80 },
    { field: 'Name', headerName: ' Name', hide: false, width: 120 },
    { field: 'Chg', headerName: 'Price Change', hide: false, width: 140 },
    { field: 'ChgPrcnt', headerName: 'Price Change (%)', hide: false, width: 150 },
    { field: 'VolM', headerName: 'Volume (M)', hide: false, width: 120 },
    { field: 'AverageVol3mM', headerName: 'Avg Volume (3M)', hide: false, width: 180 },
    { field: 'MarketCapM', headerName: 'Market Cap (M)', hide: false, width: 150 },
    { field: 'RevenueM', headerName: 'Revenue (M)', hide: false, width: 140 },
    { field: 'PERatio', headerName: 'P/E Ratio', hide: false, width: 120 },
    { field: 'Beta', headerName: 'Beta', hide: false, width: 120 },
    { field: 'LastTradePrice', headerName: 'Last Trade Price', hide: false, width: 160 },
    { field: 'MovingAvg50DayPrice', headerName: '50-Day MA', hide: false, width: 120 },
    { field: 'MovingAvg200DayPrice', headerName: '200-Day MA', hide: false, width: 140 },
    { field: 'ADX14d', headerName: 'ADX (14d)', hide: false, width: 120 },
    { field: 'ATR14d', headerName: 'ATR (14d)', hide: false, width: 120 },
    { field: 'BullBear13d', headerName: 'Bull/Bear (13d)', hide: false, width: 140 },
    { field: 'CCI14d', headerName: 'CCI (14d)', hide: false, width: 120 },
    { field: 'HighsLows14d', headerName: 'Highs & Lows', hide: false, width: 140 },
    { field: 'MACD12d26d', headerName: 'MACD (12d)', hide: false, width: 140 },
    { field: 'ROC1dPrcnt', headerName: 'ROC (1d %)', hide: false, width: 120 },
    { field: 'RSI14d', headerName: 'RSI (14d)', hide: false, width: 120 },
    { field: 'StochasticOscillator14d', headerName: 'StochasticOscillator14d', hide: false, width: 140 },
    { field: 'StochasticRSI14d', headerName: 'StochasticRSI14d', hide: false },
    { field: 'UltimateOscillator14d', headerName: 'Ultimate Oscillator', hide: false, width: 140 },
    { field: 'WilliamsPercentRange', headerName: 'Williams %R', hide: false, width: 140 },
    { field: 'ChangeFrom52WkHighPrcnt', headerName: 'Change From High', hide: false, width: 160 },
    { field: 'ChangeFrom52WkLowPrcnt', headerName: 'Change From Low', hide: false, width: 160 },
    { field: 'NseName', headerName: 'NseName', hide: false, width: 120 },
    { field: 'MargineRate', headerName: 'Margine Rate', hide: false, width: 140 },
    { field: 'PreviousClose', headerName: 'Previous Close', hide: false, width: 140 },
    { field: 'Open', headerName: 'Open Price', hide: false, width: 120 },
    { field: 'Close', headerName: 'Close Price', hide: false, width: 120 },
    { field: 'High', headerName: 'High Price', hide: false, width: 120 },
    { field: 'Low', headerName: 'Low Price', hide: false, width: 120 },
    { field: 'CreatedDate', headerName: 'Created Date', hide: false, width: 140 },
    { field: 'LastModifiedDate', headerName: 'Last Modified', hide: false, width: 140 },
    { field: 'Range', headerName: 'Range', hide: false, width: 120 }
  ];


  confirmExport() {
    if (this.rowData.length == 0) {
      Swal.fire('Warning!', 'Please add data before proceeding', 'warning');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to export the data to Excel?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, export it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exportToExcel();
        this.searchTerm = "";
        Swal.fire('Exported!', 'Your data has been exported.', 'success');
      }
    });
  }

  exportToExcel() {
    const rowData: any[] = [];
    this.agGrid.api.forEachNode((node) => rowData.push(node.data)); 
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rowData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AgGridData');
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = `Stock_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(excelBlob, fileName);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.setDataSource();
    this.loadData();

  }

  loadData() {
    if (this.rowData && this.rowData.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }
  loadFilteredData(): void {
    if (this.rowData.length == 0) {
      Swal.fire('Warning!', 'Please import a file before filtering records.', 'warning');
      return;
    }
    var searchtext = this.searchTerm == "" ? null : this.searchTerm;
    this.apiDataService.GET(`GetFilterdata?fiteredvalue=${searchtext}`).subscribe({
      next: (response: any) => {

        if (response && response.statuscode == "200" && response.data && response.data.length > 0) {
          this.rowData = response.data; 
          if (this.gridApi) {
            console.log("Refreshing AG Grid with new data...");
            this.setDataSource();  
          }
        } else {
          Swal.fire('No Data', 'No matching records found.', 'info');
          this.rowData = [];
          if (this.gridApi) {
            this.gridApi.purgeInfiniteCache(); 
          }
        }
      },
      error: (error: any) => {
        console.error("Error fetching data:", error);
        Swal.fire('Error!', 'Something went wrong while fetching data.', 'error');
      }
    });
  }

  ResetTable() {
    if (this.rowData.length == 0) {
      Swal.fire('Warning!', 'No records available to reset.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will clear the table and reset all data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.searchTerm = "";
        this.fileName = "";
        this.rowData = [];
        if (this.fileInput) {
          this.fileInput.nativeElement.value = "";
        }
        if (this.gridApi) {
          this.gridApi.purgeInfiniteCache(); 
        }
      }
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toLowerCase();

    if (event.ctrlKey) {
      event.preventDefault();
      switch (key) {
        case 'u':
          if (this.fileInput) {
           this.triggerFileInput();
          }
          break;
        case 'e':
          this.confirmExport();
          break;
        case 's':
          this.uploadData();
          break;
        case 'r':
          this.ResetTable();
          break;
      }
    }
  }



}
