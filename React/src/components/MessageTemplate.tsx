import React, { useCallback, useState, useMemo } from 'react';
import Button from 'devextreme-react/button';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import HTMLReactParser from 'html-react-parser';
import { type ButtonTypes } from 'devextreme-react/button';

function convertToHtml(value: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(value)
    .toString();

  return result;
}

interface MessageProps {
  text: string;
  onRegenerateButtonClick: ButtonTypes.Properties['onClick'];
}

function MessageTemplate({ text, onRegenerateButtonClick }: MessageProps): JSX.Element {
  const [icon, setIcon] = useState('copy');
  const parsedHtml = useMemo(() => HTMLReactParser(convertToHtml(text)), [text]);
  const onCopyButtonClick = useCallback(() => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setIcon('check');

    setTimeout(() => {
      setIcon('copy');
    }, 2500);
  }, [text]);

  return (
    <React.Fragment>
      <div className='dx-chat-messagebubble-text'>
        {parsedHtml}
      </div>
      {text !== 'Regeneration...' && (
        <div className='dx-bubble-button-container'>
          <Button
            icon={icon}
            stylingMode='text'
            hint='Copy'
            onClick={onCopyButtonClick}
          />
          <Button
            icon='refresh'
            stylingMode='text'
            hint='Regenerate'
            onClick={onRegenerateButtonClick}
          />
        </div>)
      }
    </React.Fragment>
  );
}

export default MessageTemplate;
