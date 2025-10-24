import { type ChatTypes } from 'devextreme-react/chat';
import { DataSource, ArrayStore } from 'devextreme-react/common/data';
import { BehaviorSubject, Observable } from 'rxjs';
import notify from 'devextreme/ui/notify';
import {
  ALERT_TIMEOUT, assistant, CHAT_SERVER_URL, REGENERATION_TEXT,
} from './data.ts';

interface MessageAuthor {
  id: string;
  name: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: string; // или Date если будете парсить
  author: MessageAuthor;
}

class AppService {
  alerts: ChatTypes.Alert[] = [];

  arrayStore?: ArrayStore;

  dataSource?: DataSource;

  private readonly typingUsersSubject: BehaviorSubject<ChatTypes.User[]> = new BehaviorSubject<ChatTypes.User[]>([]);

  private readonly alertsSubject: BehaviorSubject<ChatTypes.Alert[]> = new BehaviorSubject<ChatTypes.Alert[]>([]);

  constructor() {
    this.typingUsersSubject.next([]);
    this.alertsSubject.next([]);
  }

  get typingUsers$(): Observable<ChatTypes.User[]> {
    return this.typingUsersSubject.asObservable();
  }

  get alerts$(): Observable<ChatTypes.Alert[]> {
    return this.alertsSubject.asObservable();
  }

  getDictionary(): object {
    return {
      en: {
        'dxChat-emptyListMessage': 'Chat is Empty',
        'dxChat-emptyListPrompt': 'AI Assistant is ready to answer your questions.',
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
    } catch (err: Error) {
      notify(`Error fetching initial messages: ${err.message}`, 'error', 1000);
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

    setTimeout((): void => {
      this.setAlerts([]);
    }, ALERT_TIMEOUT);
  }

  setAlerts(alerts: ChatTypes.Alert[]): void {
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

  async onMessageEntered(e: ChatTypes.MessageEnteredEvent, setDisabled: Function): Promise<void> {
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
      setDisabled(false);
    }
  }
}

export const appService = new AppService();
