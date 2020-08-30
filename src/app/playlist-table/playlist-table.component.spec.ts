import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistTableComponent } from './playlist-table.component';
import { PlaylistService } from '../playlist.service';
import { of } from 'rxjs';

describe('PlaylistTableComponent', () => {
  let component: PlaylistTableComponent;
  let fixture: ComponentFixture<PlaylistTableComponent>;

  const playlistService = jasmine.createSpyObj('PlaylistsService', ['getPlaylists', 'getTotalItems']);
  const mockPlaylistResponse = {};
  playlistService.getPlaylists.and.returnValue(of(mockPlaylistResponse));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistTableComponent],
      providers: [{ provide: PlaylistService, useValue: playlistService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
