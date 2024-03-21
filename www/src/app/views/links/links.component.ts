import { Component, OnInit } from '@angular/core';
import { Links } from '@interfaces/links';
import { LinksService } from '@services/links.service';

@Component({
  selector: 'links-view',
  templateUrl: './links.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './links.component.scss',
  ],
  host: { class: 'linktree black' },
})
export class LinksComponent {
  public links: Links[] = [];
  public get primaryLinks() {
    return this.links.filter((link:Links) => link.button === 'primary');
  }
  public get secondaryLinks() {
    return this.links.filter(
      (link:Links) => link.button === 'secondary'
    );
  }
  constructor(private linksSvc: LinksService) {
    this.setData();
  }

  async setData() {
    this.links = await this.linksSvc.getLinks();
  }
}
