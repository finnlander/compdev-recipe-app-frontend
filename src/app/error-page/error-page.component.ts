import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface ErrorPageData {
  errorMessage: string;
}

const GENERIC_ERROR_MSG = 'Error occurred :(';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  errorMessage?: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.errorMessage = data['errorMessage'] || GENERIC_ERROR_MSG;
    });
  }
}
