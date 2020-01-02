import { ConnectableObservable, Observable, Subject } from 'rxjs';
import { publishLast, takeUntil } from 'rxjs/operators';

import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';

import { mockNav, NavPath, mockNavs } from '../interface';

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'aiao-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {
  navAry = mockNavs;
  $subject = new Subject();
  private _transformer = (node: NavPath, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      path: node.path
    };
  };
  // tslint:disable-next-line: member-ordering
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );
  // tslint:disable-next-line: member-ordering
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  // tslint:disable-next-line: member-ordering
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private router: Router, private http: HttpClient) {
    this.dataSource.data = mockNav;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  onClick(path: string) {
    if (path) {
      this.router.navigateByUrl(path);
    }
  }

  // private fetchNavigationInfo(): Observable<any> {
  //   const navigationInfo = this.http.get<any>('/navigation.json').pipe(publishLast());
  //   (navigationInfo as ConnectableObservable<any>).connect();
  //   return navigationInfo;
  // }

  ngOnInit() {
    // this.fetchNavigationInfo()
    //   .pipe(takeUntil(this.$subject))
    //   .subscribe(data => {
    //     console.log('navigationInfo', data);
    //   });

    const filterAry = this.navigationFilter(this.navAry);
    console.log('filterAry', filterAry);
  }

  navigationFilter(navAry: any[]) {
    let filterAry = [];
    const navObj: any = {};
    if (navAry.some(nav => nav.type === 'md')) {
      navObj.name = 'Introduction';
      navObj.path = '/';
      navObj.children = [];
      filterAry.push(navObj);
    }
    navAry = navAry.filter(d => d.type === 'dir');
    navAry.map(data => {
      if (data.children.length > 0 && data.children.every(d => d.type === 'md')) {
        data.children = [];
      }
      if (data.children.length > 0 && data.children.every(d => d.type === 'dir')) {
        data.path = '';
      }
      return data;
    });
    filterAry = [...filterAry, ...navAry];
    return filterAry;
  }

  ngOnDestroy() {
    this.$subject.next();
  }
}