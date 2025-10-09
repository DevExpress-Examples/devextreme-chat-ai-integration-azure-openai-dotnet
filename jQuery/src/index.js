$(() => {
  const CHAT_DISABLED_CLASS = 'dx-chat-disabled';
  const ALERT_TIMEOUT = 1000 * 60;
  const REGENERATION_TEXT = 'Regeneration...';
  const CHAT_SERVER_URL = 'http://localhost:5005/api/Chat';

  const assistant = {
    id: 'assistant',
    name: 'Virtual Assistant',
  };

  const currentUser = {
    id: 'user',
  };

  DevExpress.localization.loadMessages({
    en: {
      'dxChat-emptyListMessage': 'Chat is Empty',
      'dxChat-emptyListPrompt': 'AI Assistant is ready to answer your questions.',
      'dxChat-textareaPlaceholder': 'Ask AI Assistant...',
    },
  });

  // Initialize Chat component
  $('#chat').dxChat({
    id: 'chat',
    user: currentUser,
    height: 600,
    width: 800,
    reloadOnChange: false,
    showAvatar: false,
    showDayHeaders: false,
    messageTemplate,
    onMessageEntered,
    onInitialized,
  });

  async function onInitialized({ component }) {
    const messages = await getInitialMessages();
    component.option(
      'dataSource',
      new DevExpress.data.DataSource({
        store: new DevExpress.data.ArrayStore({
          key: 'id',
          data: messages,
        }),
        paginate: false,
      }),
    );
  }

  async function getInitialMessages() {
    try {
      const response = await fetch(`${CHAT_SERVER_URL}/GetUserMessages`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        DevExpress.ui.notify('Failed to fetch initial messages', 'error', 1000);
        return [];
      }
      return await response.json();
    } catch (err) {
      DevExpress.ui.notify(`Error fetching initial messages: ${err.message}`, 'error', 1000);
      return [];
    }
  }

  async function getAIResponse(message, shouldRegenerate = false) {
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

  async function onMessageEntered(e) {
    const { component, message, event } = e;
    if (component.option('alerts').length) return;

    message.id = Date.now().toString();
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }

    component.renderMessage(message);
    toggleDisabledState(component, true, event);

    component.option({
      typingUsers: [assistant],
    });

    try {
      // eslint-disable-next-line spellcheck/spell-checker
      const aiMessage = await getAIResponse(message);
      setTimeout(() => {
        component.option({ typingUsers: [] });
        const dataSource = component.getDataSource();
        // eslint-disable-next-line spellcheck/spell-checker
        dataSource.store().push([{ type: 'insert', data: aiMessage }]);
      }, 200);
    } catch (err) {
      component.option({ typingUsers: [] });
      alertLimitReached(component);
    } finally {
      toggleDisabledState(component, false, event);
    }
  }

  function toggleDisabledState(chat, disabled, event) {
    chat.element().toggleClass(CHAT_DISABLED_CLASS, disabled);

    if (disabled) {
      event?.target.blur();
    } else {
      event?.target.focus();
    }
  }

  function alertLimitReached(chat) {
    chat.option({
      alerts: [
        {
          message: 'Request limit reached, try again in a minute.',
        },
      ],
    });

    setTimeout(() => {
      chat.option({ alerts: [] });
    }, ALERT_TIMEOUT);
  }

  function convertToHtml(value) {
    const result = unified()
      .use(remarkParse)
      // eslint-disable-next-line spellcheck/spell-checker
      .use(remarkRehype)
      // eslint-disable-next-line spellcheck/spell-checker
      .use(rehypeStringify)
      .processSync(value)
      .toString();

    return result;
  }

  function onCopyButtonClick(component, text) {
    navigator.clipboard?.writeText(text);

    component.option({ icon: 'check' });

    setTimeout(() => {
      component.option({ icon: 'copy' });
    }, 2500);
  }

  async function regenerate(chat) {
    const dataSource = chat.getDataSource();
    const items = dataSource.items();
    const lastMessage = items.at(-1);
    toggleDisabledState(chat, true);
    try {
      const newAIMessage = await getAIResponse(lastMessage, true);
      updateLastMessage(chat, newAIMessage);
    } catch {
      updateLastMessage(chat, lastMessage);
      alertLimitReached(chat);
    } finally {
      toggleDisabledState(chat, false);
    }
  }

  function onRegenerateButtonClick(chat) {
    if (chat.option('alerts').length) {
      return;
    }

    updateLastMessage(chat);
    regenerate(chat);
  }

  function updateLastMessage(chat, message) {
    const dataSource = chat.getDataSource();
    const items = dataSource.items();
    const lastMessage = items.at(-1);
    const text = message ? message.text : REGENERATION_TEXT;
    dataSource.store().push([
      {
        type: 'update',
        key: lastMessage.id,
        data: {
          text,
        },
      },
    ]);
  }

  function renderMessageContent(chat, message, element) {
    $('<div>')
      .addClass('dx-chat-messagebubble-text')
      .html(convertToHtml(message.text))
      .appendTo(element);

    const $buttonContainer = $('<div>').addClass('dx-bubble-button-container');

    $('<div>')
      .dxButton({
        icon: 'copy',
        stylingMode: 'text',
        hint: 'Copy',
        onClick: ({ component }) => {
          onCopyButtonClick(component, message.text);
        },
      })
      .appendTo($buttonContainer);

    $('<div>')
      .dxButton({
        icon: 'refresh',
        stylingMode: 'text',
        hint: 'Regenerate',
        onClick: () => onRegenerateButtonClick(chat),
      })
      .appendTo($buttonContainer);

    $buttonContainer.appendTo(element);
  }

  function messageTemplate(data, element) {
    const { message, component } = data;

    if (message.text === REGENERATION_TEXT) {
      element.text(REGENERATION_TEXT);
      return;
    }

    renderMessageContent(component, message, element);
  }
});
