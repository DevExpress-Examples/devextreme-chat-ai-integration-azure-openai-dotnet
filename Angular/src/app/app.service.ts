import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { type DxChatTypes } from 'devextreme-angular/ui/chat';
import { DataSource, ArrayStore } from 'devextreme-angular/common/data';
import notify from 'devextreme/ui/notify';
import {
  ALERT_TIMEOUT, assistant, CHAT_SERVER_URL, REGENERATION_TEXT,
} from './data';

interface MessageAuthor {
  id?: string | number | undefined;
  name?: string;
}

interface Message {
  id?: string | number | undefined;
  text?: string;
  timestamp?: string | number | Date | undefined; // или Date если будете парсить
  author?: MessageAuthor;
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  user: DxChatTypes.User = {
    id: 'user',
  };

  alerts: DxChatTypes.Alert[] = [];

  arrayStore: ArrayStore | undefined;

  dataSource: DataSource | undefined;

  typingUsersSubject: BehaviorSubject<DxChatTypes.User[]> = new BehaviorSubject<DxChatTypes.User[]>([]);

  alertsSubject: BehaviorSubject<DxChatTypes.Alert[]> = new BehaviorSubject<DxChatTypes.Alert[]>([]);

  constructor() {
    this.typingUsersSubject.next([]);
    this.alertsSubject.next([]);
  }

  get typingUsers$(): Observable<DxChatTypes.User[]> {
    return this.typingUsersSubject.asObservable();
  }

  get alerts$(): Observable<DxChatTypes.Alert[]> {
    return this.alertsSubject.asObservable();
  }

  getDictionary(): { en: Record<string, string> } {
    return {
      en: {
        'dxChat-emptyListMessage': 'Chat is Empty',
        'dxChat-emptyListPrompt':
          'AI Assistant is ready to answer your questions.',
        'dxChat-textareaPlaceholder': 'Ask AI Assistant...',
      },
    };
  }

  async getInitialMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${CHAT_SERVER_URL}/GetUserMessages`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        notify('Failed to fetch initial messages', 'error', 1000);
        return [];
      }
      return await response.json() as Message[];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      notify(`Error fetching initial messages: ${errorMessage}`, 'error', 1000);
      return [];
    }
  }

  async initDataSource(): Promise<DataSource> {
    let messages = await this.getInitialMessages();
    this.arrayStore = new ArrayStore({
      key: 'id',
      data: messages,
    });

    this.dataSource = new DataSource({
      store: this.arrayStore,
      paginate: false,
    });

    return this.dataSource;
  }

  async getAIResponse(message: Message, shouldRegenerate = false): Promise<any> {
    const response = await fetch(
      `${CHAT_SERVER_URL}/GetAIResponse?regenerate=${shouldRegenerate}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get AI response ${errorText}`);
    }
    return response.json();
  }

  updateLastMessage(message: Message | null = null): void {
    const items = this.dataSource?.items();
    const lastMessage = items?.slice(-1)[0];
    const text = {
      text: message ? message?.text : REGENERATION_TEXT,
    };
    this.dataSource?.store().push([{ type: 'remove', key: lastMessage.id }, {
      type: 'insert',
      data: { ...lastMessage, ...text },
    }]);
  }

  alertLimitReached(error: any): void {
    this.setAlerts([
      {
        message: error.message,
      },
    ]);

    setTimeout(() => {
      this.setAlerts([]);
    }, ALERT_TIMEOUT);
  }

  setAlerts(alerts: DxChatTypes.Alert[]): void {
    this.alerts = alerts;
    this.alertsSubject.next(alerts);
  }

  async regenerate(): Promise<void> {
    let items = this.dataSource?.items();
    let lastMessage = items?.slice(-1)[0];
    try {
      const aiResponse = await this.getAIResponse(lastMessage, true);
      this.updateLastMessage(aiResponse);
    } catch (error) {
      if (lastMessage) {
        this.updateLastMessage(lastMessage);
      }
      this.alertLimitReached(error);
    }
  }

  convertToHtml(value: string): string {
    const result = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(value)
      .toString();

    return result;
  }

  async onMessageEntered(e: DxChatTypes.MessageEnteredEvent): Promise<void> {
    let { message, event } = e;
    (event?.target as HTMLElement).blur();
    if (this.alerts.length) return;

    message.id = Date.now().toString();
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    this.dataSource
      ?.store()
      .push([{ type: 'insert', data: message }]);
    this.typingUsersSubject.next([assistant]);

    try {
      const aiMessage = await this.getAIResponse(message);
      setTimeout(() => {
        this.typingUsersSubject.next([]);
        this.dataSource?.store().push([{ type: 'insert', data: aiMessage }]);
      }, 500);
    } catch (err) {
      (event?.target as HTMLElement).focus();
      this.typingUsersSubject.next([]);
      this.alertLimitReached(err);
    } finally {
      (event?.target as HTMLElement).focus();
    }
  }
}
