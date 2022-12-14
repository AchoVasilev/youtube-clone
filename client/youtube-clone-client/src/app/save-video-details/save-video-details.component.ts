import { FormControl, FormGroup } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../service/video.service';
import { VideoDto } from '../model/video-dto';

@Component({
  selector: 'app-save-video-details',
  templateUrl: './save-video-details.component.html',
  styleUrls: ['./save-video-details.component.css']
})
export class SaveVideoDetailsComponent {

  savedVideoDetailsForm: FormGroup;
  title: FormControl = new FormControl('');
  description: FormControl = new FormControl('');
  videoStatus: FormControl = new FormControl('');
  tags: string[] = [];
  selectedFile!: File;
  selectedFileName?: string;
  videoId: string;
  fileSelected = false;
  videoUrl: string = '';
  thumbnailUrl: string = '';

  constructor(private activatedRoute: ActivatedRoute, private videoService: VideoService, private snackBar: MatSnackBar) {
    this.videoId = this.activatedRoute.snapshot.params['videoId'];

    this.videoService.getVideo(this.videoId)
      .subscribe(data => {
        this.videoUrl = data.videoUrl;
        this.thumbnailUrl = data.thumbnailUrl;
      });

    this.savedVideoDetailsForm = new FormGroup({
      title: this.title,
      description: this.description,
      videoStatus: this.videoStatus
    });
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onFileSelected(event: Event) {
    // @ts-ignore
    this.selectedFile = event?.target?.files[0];
    this.selectedFileName = this.selectedFile?.name;
    this.fileSelected = true;
  }

  onUpload() {
    this.videoService.uploadThumbnail(this.selectedFile, this.videoId)
      .subscribe(data => {
        this.snackBar.open("Thumbnail upload successful", "OK");
      });
  }

  saveVideo() {
    const videoMetadata: VideoDto = {
      id: this.videoId,
      title: this.savedVideoDetailsForm.get('title')?.value,
      description: this.savedVideoDetailsForm.get('description')?.value,
      videoUrl: this.savedVideoDetailsForm.get('videoUrl')?.value,
      videoStatus: this.savedVideoDetailsForm.get('videoStatus')?.value,
      thumbnailUrl: this.thumbnailUrl,
      tags: this.tags,
      viewsCount: 0,
      dislikesCount: 0,
      likesCount: 0
    };

    this.videoService.saveVideo(videoMetadata)
      .subscribe(data => {
        this.snackBar.open("Video metadata updated successfully", "OK");
      });
  }
}
