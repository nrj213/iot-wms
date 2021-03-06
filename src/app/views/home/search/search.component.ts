import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Bin } from '@app/views/common/models/bin.model';
import { Constants } from '@app/utils';
import { HttpService, DataService } from '@app/core';
import { isNullOrUndefined } from 'util';
import { HttpErrorResponse } from '@angular/common/http';
import { getCenter } from 'geolib';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { CollectionHistoryModalComponent } from '../collection-history-modal/collection-history-modal.component';
import { StaffDetailModalComponent } from '../staff-detail-modal/staff-detail-modal.component';

@Component({
  selector: 'app-search-table',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  binData: Bin[] = [];
  selectedData: Bin[] = [];
  zoom: number;
  centralLatitude: number;
  centralLongitude: number;

  roleId: number;
  staffId: number;

  areaSelection: number;
  municipalitySelection: number;

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Bin>(this.binData);
  selection = new SelectionModel<Bin>(true, []);

  showTableView: boolean;
  showMapView: boolean;

  selectedTab: number;

  constructor(private httpService: HttpService, private dataService: DataService, private dialog: MatDialog) {
    this.showTableView = true;
    this.showMapView = false;
  }

  ngOnInit() {
    this.roleId = this.dataService.currentUserDetailsSubject.getValue().roleId;
    this.staffId = this.dataService.currentUserDetailsSubject.getValue().staffId;

    let municipalityId = this.dataService.currentUserDetailsSubject.getValue().municipalityId;
    let areaId = this.dataService.currentUserDetailsSubject.getValue().areaId;

    if (municipalityId) {
      this.municipalitySelection = municipalityId;
    }

    if (areaId) {
      this.areaSelection = areaId;
    }

    this.getBinData(this.roleId, this.municipalitySelection, this.areaSelection);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Bin): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  getBinData(roleId: number, municipalityId: number, areaId: number) {
    let url;
    switch (roleId) {
      case 1: {
        url = Constants.BIN_ENDPOINT;
        this.displayedColumns = ['select', 'id', 'municipality', 'area', 'latitude', 'longitude', 'level', 'staffName', 'staffMobileNo'];
        this.zoom = 8;
      } break;
      case 2: {
        url = Constants.BIN_ENDPOINT + "/" + municipalityId;
        this.displayedColumns = ['select', 'id', 'area', 'latitude', 'longitude', 'level', 'staffName', 'staffMobileNo'];
        this.zoom = 12;
      } break;
      case 3: {
        url = Constants.BIN_ENDPOINT + "/" + municipalityId + "/" + areaId;
        this.displayedColumns = ['select', 'id', 'latitude', 'longitude', 'level'];
        this.zoom = 15;
      } break;
    }

    this.httpService.get(url).subscribe((response: any) => {
      if (!isNullOrUndefined(response.code) && response.code == 0) {
        if (response.data.length) {
          this.binData = response.data;
          this.dataSource = new MatTableDataSource<Bin>(this.binData);
        } else {
          alert("No data available!")
        }
      } else {
        alert(response.code + " : " + response.message);
      }
    }, (error: HttpErrorResponse) => {
      console.log(error);
    })
  }

  showInMap() {
    let selectedBins = this.selection["_selected"];

    if (selectedBins.length) {
      this.toggleView();

      this.selectedData = selectedBins;

      let centralCoordinates = getCenter(selectedBins);

      this.centralLatitude = centralCoordinates['latitude'];
      this.centralLongitude = centralCoordinates['longitude'];
    } else {
      alert("Select atleast one bin!")
    }
  }

  toggleView() {
    this.showMapView = !this.showMapView;
    this.showTableView = !this.showTableView;
  }

  markAsCollected() {
    let selectedBins = this.selection["_selected"];

    if (selectedBins.length) {
      if (selectedBins.length == 1) {
        let binId = selectedBins[0].id;
        let level = selectedBins[0].level;

        if (level !== 0) {
          if (confirm("Are you sure you want to proceed?")) {
            let url = Constants.BIN_ENDPOINT + "/collected";
            let body = {
              "bin-id": binId,
              "staff-id": this.staffId
            };

            this.httpService.put(url, body).subscribe((response: any) => {
              if (!isNullOrUndefined(response.code) && response.code == 0) {
                if (response.data > 0) {
                  this.binData.map((bin) => {
                    if (bin.id == binId) {
                      bin.level = 0;
                    }
                  });
                  alert("Update successful");
                  this.switchTab(this.selectedTab);
                } else {
                  alert("Update failed!");
                }
              } else {
                alert(response.code + " : " + response.message);
              }
            }, (error: HttpErrorResponse) => {
              console.log(error);
            })
          }
        } else {
          alert("Bin already empty!");
        }
      } else {
        alert("Select only one bin at a time!");
      }
    } else {
      alert("Select bin first!")
    }
  }

  switchTab(tabNumber: number) {
    this.selectedTab = tabNumber;
    this.selection.clear();

    switch (tabNumber) {
      case 0: {
        this.dataSource = new MatTableDataSource<Bin>(this.binData);
      } break;

      case 1: {
        let filteredBinData = this.binData.filter((bin) => {
          return bin.level > Constants.MEDIUM_THRESHOLD;
        });
        this.dataSource = new MatTableDataSource<Bin>(filteredBinData);
      } break;

      case 2: {
        let filteredBinData = this.binData.filter((bin) => {
          return bin.level < Constants.MEDIUM_THRESHOLD && bin.level > Constants.LOW_THRESHOLD;
        });
        this.dataSource = new MatTableDataSource<Bin>(filteredBinData);
      } break;

      case 3: {
        let filteredBinData = this.binData.filter((bin) => {
          return bin.level < Constants.LOW_THRESHOLD;
        });
        this.dataSource = new MatTableDataSource<Bin>(filteredBinData);
      } break;
    }
  }

  showCollectionHistory() {
    let selectedBins = this.selection["_selected"];

    if (selectedBins.length) {
      if (selectedBins.length == 1) {
        let binId = selectedBins[0].id;

        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = binId;
        dialogConfig.width = '500px';

        this.dialog.open(CollectionHistoryModalComponent, dialogConfig);
      } else {
        alert("Select only one bin at a time!");
      }
    } else {
      alert("Select bin first!")
    }
  }

  showStaffDetails(staffId: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      staffId,
      modalTitle: "Staff Details"
    }
    dialogConfig.width = '350px';

    this.dialog.open(StaffDetailModalComponent, dialogConfig);
  }

}
