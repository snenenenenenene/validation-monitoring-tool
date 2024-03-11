/* eslint-disable @typescript-eslint/no-explicit-any */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { UploadFile } from 'ember-file-upload/upload-file';
import { fetchDocument } from 'validation-monitoring-module';
import type DocumentService from 'validation-monitoring-tool/services/document';

export default class DocumentUploadController extends Controller {
  @action reset() {
    this.fileUpload = false;
    this.fileInputDisabled = false;
    this.inputDisabled = false;
    this.buttonDisabled = true;
    this.loading = false;
    this.loadingMessage = '';
    this.publicationURL = '';
    this.uploadedFile = null;
  }
  @tracked resolvedPublication: any = [];
  @tracked amountOfRelevantPublications = 0;

  //toaster
  @service declare toaster: any;
  @service declare document: DocumentService;
  @service declare router: RouterService;
  @tracked currentToast: any = null;

  // input
  @tracked inputDisabled = false;
  @tracked publicationURL = '';
  @action handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.publicationURL = target.value;
    if (this.publicationURL) {
      this.fileInputDisabled = true;
      this.buttonDisabled = false;
    } else {
      this.buttonDisabled = true;
      this.fileInputDisabled = false;
    }
  }
  @action async validateURL({ url }: { url: string }) {
    const validUrl = url.match(/^(ftp|http|https):\/\/[^ "]+$/);
    if (validUrl) {
      const data = await fetchDocument(url, 'https://corsproxy.io/?');
      if (data) {
        this.currentToast = this.toaster.success(
          'Correcte URL',
          'Publicatie wordt geladen',
        );
        await this.document.processDocumentURL(this.publicationURL);
        this.router.transitionTo('document-review');
        return true;
      }
      this.currentToast = this.toaster.error(
        'Geen publicatie gevonden',
        'Geef een correcte URL in',
      );
      return false;
    } else {
      this.currentToast = this.toaster.error(
        'Geen publicatie gevonden',
        'Geef een correcte URL in',
      );
      return false;
    }
  }

  // file upload
  @tracked fileInputDisabled = false;
  @tracked fileUpload = false;
  @tracked uploadedFile: File | null = null;

  @action onFinishUpload(uploadedFile: UploadFile) {
    this.loading = true;
    this.inputDisabled = true;
    this.toaster.close(this.currentToast);
    this.loadingMessage = 'Bestand verwerken...';
    this.uploadedFile = uploadedFile.file;

    this.fileUpload = true;
    this.currentToast = this.toaster.success(
      'Correct bestand',
      'Publicatie wordt geladen',
    );

    this.loading = false;
    this.buttonDisabled = false;
  }

  // button
  @tracked buttonDisabled = true;
  @tracked loading = false;
  @tracked loadingMessage = '';

  @action async handleSubmit(e: Event) {
    e.preventDefault();
    this.toaster.close(this.currentToast);
    this.loadingMessage = 'Publicatie laden...';
    this.loading = true;
    if (this.fileUpload) {
      await this.document.processDocumentFile(this.uploadedFile as File);
      this.router.transitionTo('document-review');
      this.currentToast = this.toaster.success(
        'Correct bestand',
        'Publicatie wordt geladen',
      );
    } else {
      console.log('validating URL...');
      await this.validateURL({ url: this.publicationURL });
    }
    this.reset();
  }
}
