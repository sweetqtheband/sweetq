import { Component, ViewEncapsulation } from '@angular/core';

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
  public links = [
    {
      type: 'spotify',
      icon: 'icon-spotify',
      text: 'links.spotify',
      button: 'primary',
      link: 'spotify:album:6730lDQr9irWJXAf7lIYhw',
    },
    {
      type: 'appleMusic',
      icon: 'icon-apple-music',
      text: 'links.appleMusic',
      button: 'primary',
      link: 'https://music.apple.com/us/album/atrapado-en-el-tiempo-single/1724197909',
    },
    {
      type: 'youtubeMusic',
      icon: 'icon-youtube-music',
      text: 'links.youtubeMusic',
      button: 'primary',
      link: 'https://music.youtube.com/playlist?list=OLAK5uy_l4h3DFFhC189MnyMQAZ6eHNciv9LronLE',
    },
    {
      type: 'youtube',
      icon: 'icon-youtube',
      text: 'links.youtube',
      button: 'secondary',
      link: 'https://www.youtube.com/watch?v=glVnYUQwPqE',
    },
    {
      type: 'gig',
      icon: 'icon-gigs',
      text: 'links.tickets.20240308',
      button: 'secondary',
      link: 'https://dice.fm/partner/vesta/event/6o8k2-sweet-q-madame-christie-en-madrid-8th-mar-sala-vesta-madrid-tickets',
    },
  ];

  public primaryLinks = this.links.filter((link) => link.button === 'primary');
  public secondaryLinks = this.links.filter(
    (link) => link.button === 'secondary'
  );
}
