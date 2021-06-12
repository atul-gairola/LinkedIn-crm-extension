import React, { useState, useEffect } from 'react';
import {
  Dialog,
  TextareaField,
  Text,
  toaster,
  Select,
  Button,
} from 'evergreen-ui';
import { getProfileIdFromUrn, capitalizeFirstLetter } from '../../utils';

function SendMessage({ showSendMessage, setShowSendMessage }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [placeholderTypes, setPlaceholderTypes] = useState([
    { id: 'firstName', label: 'First Name' },
    { id: 'lastName', label: 'Last Name' },
    { id: 'company', label: 'Company' },
    { id: 'companyTitle', label: 'Company Title' },
    { id: 'industry', label: 'Industry' },
    { id: 'location', label: 'Location' },
  ]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('firstName');

  const handleSendMessage = () => {
    if (message === '') {
      setError(true);
      return;
    }

    setLoading(true);

    const messagePayload = {
      keyVersion: 'LEGACY_INBOX',
      conversationCreate: {
        recipients: [
          showSendMessage.profileId ||
            getProfileIdFromUrn(showSendMessage.entityUrn),
        ],
        eventCreate: {
          value: {
            'com.linkedin.voyager.messaging.create.MessageCreate': {
              attachments: [],
              body: message,
              attributedBody: {
                text: message,
                attributes: [],
              },
              mediaAttachments: [],
            },
          },
        },
        subtype: 'MEMBER_TO_MEMBER',
      },
    };

    chrome.runtime.sendMessage(
      {
        action: 'sendMessage',
        messagePayload,
      },
      (resp) => {
        console.log(resp);
        if (resp.status === 'success') {
          toaster.success('Message sent successfully', {
            description: `Your message has been successfully sent to ${showSendMessage.fullName}`,
            duration: 6,
          });

          setLoading(false);
          setShowSendMessage(false);
        } else {
          setLoading(false);
          toaster.error('Some error occured while sending your message.', {
            description:
              "Please try after somtime or inform us about the bug and we'll fix it asap.",
          });
        }
      }
    );
  };

  const handleClose = () => {
    setError(false);
    setLoading(false);
    setMessage('');
    setShowSendMessage(false);
  };

  const applyPlaceholder = () => {
    if (currentPlaceholder) {
      setMessage((prev) => (prev += `{{${currentPlaceholder}}} `));
    }
  };

  console.log(showSendMessage);

  return (
    <>
      <Dialog
        isShown={showSendMessage ? true : false}
        title="Send Message"
        onCloseComplete={handleClose}
        confirmLabel="Send Message"
        hasCancel={false}
        isConfirmLoading={loading}
        isConfirmDisabled={loading}
        onConfirm={handleSendMessage}
      >
        <Text color="muted">
          Write a message to{' '}
          {showSendMessage.firstName && showSendMessage.firstName.toUpperCase()}{' '}
          directly from the dashboard. Choose and add required placeholders in
          the chat to send personalized messages to your connections.
        </Text>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignItems: 'center',
            margin: '20px 0px 10px 0px',
            gridGap: 30,
          }}
        >
          <Select
            onChange={(e) => setCurrentPlaceholder(e.target.value)}
            value={currentPlaceholder.id}
            width={240}
          >
            {placeholderTypes.map((cur) => (
              <option value={cur.id}>{capitalizeFirstLetter(cur.label)}</option>
            ))}
          </Select>
          <Button
            onClick={applyPlaceholder}
            marginBottom={2}
            appearance="primary"
          >
            Add Placeholder
          </Button>
        </div>
        <TextareaField
          value={message}
          autoFocus
          onChange={(e) => setMessage(e.target.value)}
          isInvalid={error}
          inputHeight={200}
          hint={
            error
              ? `Please write a message to send it to ${showSendMessage.firstName}`
              : ''
          }
          label=""
          placeholder="Write your message here"
        />
      </Dialog>
    </>
  );
}

export default SendMessage;
