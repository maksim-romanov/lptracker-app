const URL_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:.+/;

export class ExternalLinkEntity {
  constructor(public readonly url: string) {}

  get isValid(): boolean {
    return URL_PATTERN.test(this.url);
  }

  get isHttp(): boolean {
    return this.url.startsWith("http://") || this.url.startsWith("https://");
  }
}
