import { useState, useEffect, useCallback } from 'react';
import { loadMessages } from 'devextreme/localization';
import Chat, { type ChatTypes } from 'devextreme-react/chat';
import { appService } from '../ChatService.tsx';
import MessageTemplate from './MessageTemplate.tsx';
import { CHAT_DISABLED_CLASS, user as chatUser } from '../data';

export default function ChatApp(): JSX.Element {
  const user = chatUser;
  const [isDisabled, setDisabled] = useState(false);
  const [typingUsers, setTypingUsers] = useState<ChatTypes.User[]>([]);
  const [alerts, setAlerts] = useState<ChatTypes.Alert[]>([]);
  const [chatDS, setChatDS] = useState<any>(appService.dataSource);

  useEffect(() => {
    const typingSubscription = appService.typingUsers$.subscribe(setTypingUsers);
    const alertsSubscription = appService.alerts$.subscribe(setAlerts);
    appService.initDataSource().then((r) => setChatDS(r));
    return (): void => {
      typingSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, []);

  const onMessageEntered = useCallback((e: ChatTypes.MessageEnteredEvent) => {
    setDisabled(true);
    appService.onMessageEntered(e, setDisabled);
  }, []);

  const onRegenerateButtonClick = useCallback(async (): Promise<void> => {
    setDisabled(true);
    appService.updateLastMessage();

    try {
      await appService.regenerate();
    } finally {
      setDisabled(false);
    }
  }, []);

  const messageRender = useCallback(
    ({ message }: { message: ChatTypes.Message }) => <MessageTemplate text={message.text ?? ''} onRegenerateButtonClick={onRegenerateButtonClick} />,
    [onRegenerateButtonClick],
  );

  return (
    <div className="demo-container">
      <Chat
        className={isDisabled ? CHAT_DISABLED_CLASS : ''}
        dataSource={chatDS}
        reloadOnChange={false}
        showAvatar={false}
        height={600}
        showDayHeaders={false}
        user={user}
        typingUsers={typingUsers}
        alerts={alerts}
        onMessageEntered={onMessageEntered}
        messageRender={messageRender}
      />
    </div>
  );
}

loadMessages(appService.getDictionary());
