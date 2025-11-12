import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { type DxChatTypes } from 'devextreme-angular/ui/chat';
import { DataSource } from 'devextreme-angular/common/data';
import { loadMessages } from 'devextreme/localization';
import { AppService } from './app.service';
import {
  ALERT_TIMEOUT, assistant, CHAT_SERVER_URL, REGENERATION_TEXT,
} from './data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  dataSource: DataSource | [];

  regenerationText: string = REGENERATION_TEXT;

  user: DxChatTypes.User;

  typingUsers$: Observable<DxChatTypes.User[]>;

  alerts$: Observable<DxChatTypes.Alert[]>;

  copyButtonIcon: string;

  isDisabled = false;

  constructor(private readonly appService: AppService) {
    loadMessages(this.appService.getDictionary());
    this.user = this.appService.user;
    this.alerts$ = this.appService.alerts$;
    this.typingUsers$ = this.appService.typingUsers$;
    this.copyButtonIcon = 'copy';
    this.dataSource = [];
  }

  async ngOnInit(): Promise<void> {
    this.dataSource = await this.appService.initDataSource() ?? [];
  }

  convertToHtml(message: DxChatTypes.Message): string {
    return this.appService.convertToHtml(message.text || '');
  }

  async onMessageEntered(e: DxChatTypes.MessageEnteredEvent): Promise<void> {
    this.isDisabled = true;
    try {
      await this.appService.onMessageEntered(e);
    } finally {
      this.isDisabled = false;
    }
  }

  onCopyButtonClick(message: DxChatTypes.Message): void {
    navigator.clipboard?.writeText(message.text ?? '').catch(() => {});

    this.copyButtonIcon = 'check';

    setTimeout(() => {
      this.copyButtonIcon = 'copy';
    }, 2500);
  }

  async onRegenerateButtonClick(): Promise<void> {
    this.appService.updateLastMessage();
    this.isDisabled = true;

    try {
      await this.appService.regenerate();
    } finally {
      this.isDisabled = false;
    }
  }
}
