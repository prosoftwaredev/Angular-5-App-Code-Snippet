import { SingleMessageResponse } from 'selvera-api/dist/lib/selvera-api/providers/message/responses';

export class MessageContainer implements SingleMessageResponse {
  public readonly id: number;
  public readonly subject: string;
  public readonly content: string;
  public readonly created: string;
  public readonly account: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public timestamp: string | null;

  public constructor(singleMessageResponse: SingleMessageResponse) {
    this.timestamp = null;
    Object.assign(this, singleMessageResponse);
    this.content = this.content.replace(/\n/g, '<br />');
  }

  get author(): string {
    return `${this.account}`;
  }
}
