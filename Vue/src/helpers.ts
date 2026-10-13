import { ref } from 'vue';
import { ArrayStore, DataSource } from 'devextreme-vue/common/data';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { loadMessages } from 'devextreme/localization';
import type { DxChatTypes } from 'devextreme-vue/chat';
import notify from 'devextreme/ui/notify';

const ALERT_TIMEOUT = 10000;
const CHAT_SERVER_URL = 'http://localhost:5005/api/Chat';
const assistant: DxChatTypes.User = { id: 'assistant', name: 'Virtual Assistant' };
const REGENERATION_TEXT = 'Regeneration...';

interface MessageAuthor {
    id?: string | number | undefined;
    name?: string;
}

interface Message {
    id?: string | number | undefined;
    text?: string;
    timestamp?: string | number | Date | undefined;
    author?: MessageAuthor;
}

async function getResponseError(response: Response): Promise<string> {
  const body = await response.text();
  if (body) {
    try {
      const problem = JSON.parse(body) as { detail?: string; title?: string };
      return problem.detail || problem.title || body;
    } catch {
      return body;
    }
  }
  return response.statusText || `Request failed (${response.status})`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

export function useChatLogic() {
  const dataSource = ref<DataSource | null>(null);
  const user = ref({ id: 'user' });
  const typingUsers = ref<Array<DxChatTypes.User>>([]);
  const alerts = ref<Array<DxChatTypes.Alert>>([]);
  const regenerationText = ref(REGENERATION_TEXT);
  const copyButtonIcon = ref('copy');
  const isDisabled = ref(false);

  const loadMessage = () => {
    loadMessages({
      en: {
        'dxChat-emptyListMessage': 'Chat is Empty',
        'dxChat-emptyListPrompt': 'AI Assistant is ready to answer your questions.',
        'dxChat-textareaPlaceholder': 'Ask AI Assistant...'
      }
    });
  };
  async function getInitialMessages() {
    try {
      const response = await fetch(`${CHAT_SERVER_URL}/GetUserMessages`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        notify('Failed to fetch initial messages', 'error', 1000);
        return [];
      }
      return await response.json();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      notify(`Error fetching initial messages: ${errorMessage}`, 'error', 1000);
      return [];
    }
  }
  const initDataSource = async() => {
    let messages = await getInitialMessages();
    let arrayStore = new ArrayStore({
      key: 'id',
      data: messages,
    });

    dataSource.value = new DataSource({
      store: arrayStore,
      paginate: false,
    });
  };

  const getAIResponse = async(message: Message, shouldRegenerate = false) => {
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
      throw new Error(await getResponseError(response));
    }
    return response.json();
  };

  const updateLastMessage = (message?: Message | null) => {
    const items = dataSource.value?.items();
    const lastMessage = items?.slice(-1)[0];
    const text = {
      text: message ? message?.text : REGENERATION_TEXT,
    };

    dataSource.value?.store().push([{ type: 'remove', key: lastMessage.id }, {
      type: 'insert',
      data: { ...lastMessage, ...text },
    }]);
  };

  let alertTimeout: ReturnType<typeof setTimeout> | undefined;

  const alertError = (error: unknown) => {
    clearTimeout(alertTimeout);
    setAlerts([{ message: getErrorMessage(error) }]);
    alertTimeout = setTimeout(() => setAlerts([]), ALERT_TIMEOUT);
  };

  const clearAlerts = () => {
    clearTimeout(alertTimeout);
    setAlerts([]);
  };

  const setAlerts = (newAlerts: DxChatTypes.Alert[]) => {
    alerts.value = newAlerts;
  };

  const regenerate = async() => {
    let items = dataSource.value?.items();
    let lastMessage = items?.slice(-1)[0];
    try {
      const aiResponse = await getAIResponse(lastMessage, true);
      updateLastMessage(aiResponse);
    } catch(error) {
      if (lastMessage) {
        updateLastMessage(lastMessage);
      }
      alertError(error);
    }
  };

  const convertToHtml = (message: {text: string}) => {
    return unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(message.text || '')
      .toString();
  };

  const toggleDisabledState = (disabled: boolean, event?: { target?: EventTarget } | undefined) => {
    const element = event?.target as HTMLElement;
    isDisabled.value = disabled;

    if (element) {
      if (disabled) {
        element.blur();
      } else {
        element.focus();
      }
    }
  };

  const onMessageEntered = async(e: DxChatTypes.MessageEnteredEvent) => {
    let { message, event } = e;
    toggleDisabledState(true);
    (event?.target as HTMLElement).blur();
    clearAlerts();

    message.id = Date.now().toString();
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    dataSource.value?.store().push([{ type: 'insert', data: message }]);
    typingUsers.value = [assistant];

    try {
      const aiMessage = await getAIResponse(message);
      setTimeout(() => {
        typingUsers.value = [];
        dataSource.value?.store().push([{ type: 'insert', data: aiMessage }]);
      }, 500);
    } catch (err) {
      (event?.target as HTMLElement).focus();
      typingUsers.value = [];
      alertError(err);
    } finally {
      (event?.target as HTMLElement).focus();
      toggleDisabledState(false);
    }
  };

  const onCopyButtonClick = (message: {text: string}) => {
    navigator.clipboard?.writeText(message.text ?? '');
    copyButtonIcon.value = 'check';
    setTimeout(() => copyButtonIcon.value = 'copy', 2500);
  };

  const onRegenerateButtonClick = async() => {
    updateLastMessage();
    toggleDisabledState(true);
    try {
      await regenerate();
    } finally {
      toggleDisabledState(false);
    }
  };

  return {
    dataSource,
    user,
    typingUsers,
    alerts,
    regenerationText,
    copyButtonIcon,
    loadMessage,
    initDataSource,
    convertToHtml,
    onMessageEntered,
    onCopyButtonClick,
    onRegenerateButtonClick,
    isDisabled
  };
}
