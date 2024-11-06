/* eslint-disable max-len */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text
} from '@react-email/components';
import he from 'he';
import PropTypes from 'prop-types';

import React from 'react';

import { FRONT_URL } from '../../config.js';

const main = {
  backgroundColor: '#ffffff',
};

const container = {
  paddingLeft: '6px',
  paddingRight: '6px',
  margin: '0 auto',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '0',
};

const h1 = {
  ...text,
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: '20px 0',
  padding: '0',
};

const h2 = {
  ...text,
  fontWeight: '500',
  fontSize: '20px',
  margin: '10px 0',
  padding: '0',
};

const link = {
  ...text,
  color: '#2754C5',
  textDecoration: 'underline',
};

export function NewContactSimple({
  email, name, body, userId, messages,
}) {
  const conversationsLink = `${FRONT_URL}?userId="${userId}"&allConversations=true&incognito=true`;
  return (
    <Html>
      <Head />
      <Preview>{body.slice(0, 256)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading as="h1" style={h1}>CV Webchat</Heading>
          <Heading as="h2" style={h2}>
            <strong>{name}</strong>
            {' '}
            vous a envoyé un message
          </Heading>
          <Text style={text}>
            Allez voir la conversation:
            {' '}
            <Link
              href={conversationsLink}
              target="_blank"
              style={link}
            >
              {conversationsLink}
            </Link>
          </Text>
          <Text style={text}>
            Répondre:
            {' '}
            <Link
              href={`mailto:${email}`}
              target="_blank"
              style={link}
            >
              {email}
            </Link>
          </Text>
          <Hr />
          <Text style={{ ...text, text: 'justify' }}>
            {he.decode(body)}
          </Text>
          <Text style={{
            ...text,
            textAlign: 'right',
            marginTop: '20px',
          }}
          >
            {name}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

NewContactSimple.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

NewContactSimple.PreviewProps = {
  email: 'test@test.com',
  name: 'John Doe',
  body: 'On vous met une dague sous le cou et on traverse le camp en gueulant &quot;bougez-pas, bougez-pas ou un bute le roi&quot;. S&#39;il y a un autre qui groupe qui arrive par là on est marron des deux côtés. Faut faire un feu en forme de cercle autour d&#39;eux, comme ça ils se suicident, pendant que nous on fait le tour, et on lance de la caillasse de l&#39;autre côté pour brouiller.',
  userId: '123456',
  messages: [
    {
      _id: '65de3948cbffc4c9123dd765',
      language: 'fr',
      userMessage: null,
      responses: [
        {
          type: 'TEXT_RESPONSE',
          content: 'Bonjour ! 👋 Je suis l\'assistant virtuel de Eden CADAGIANI, je suis là pour voir avec vous comment Eden pourrais vous accompagner dans votre projet. Alors, intéressé à en savoir plus sur ses compétences, ses expériences ou peut-être une question particulière ? Il suffit de me demander!',
          _id: '65de3948cbffc4c9123dd766',
        },
        {
          type: 'TEXT_RESPONSE',
          content: 'Attention ! 🍪 En continuant notre discussion, vous acceptez que j\'enregistre cette conversation et que j\'utilise un cookie pour me rappeler de vous la prochaine fois. Vous voulez en savoir plus ? Consultez ma :intent-link[Politique de Confidentialité]{input="Politique de Confidentialité" payload=privacy_policy autoSend=true} ou les :intent-link[Conditions d\'utilisations]{input="Conditions d\'utilisations" payload=term_of_use autoSend=true}',
          _id: '65de3948cbffc4c9123dd767',
        },
        {
          type: 'TEXT_RESPONSE',
          content: 'Je tiens également à vous prevenir que je suis toujours en développement, il se peut donc que je ne puisse pas répondre à toutes vos questions. Mais ne vous inquiétez pas, Eden y travaille.',
          _id: '65de3948cbffc4c9123dd768',
        },
      ],
      buttons: [
        {
          text: 'Qui est Eden ?',
          payload: 'who_is_eden',
          _id: '65de3948cbffc4c9123dd769',
        },
        {
          text: 'Quelles sont ses experiences ?',
          payload: 'experience',
          _id: '65de3948cbffc4c9123dd76a',
        },
        {
          text: 'Donne moi ses compétences',
          payload: 'skills',
          _id: '65de3948cbffc4c9123dd76b',
        },
      ],
      input: {
        type: 'DEFAULT',
      },
      createdAt: '2024-02-27T19:34:32.966Z',
      updatedAt: '2024-02-27T19:34:32.966Z',
    },
    {
      _id: '65de394acbffc4c9123dd76d',
      language: 'fr',
      responses: [
        {
          type: 'TEXT_WITH_IMAGE',
          content: {
            text: 'Eden CADAGIANI est un ingénieur fullstack, passionné par le **développement d\'application**, son premier programme remonte à ses 12ans. Il aime particulièrement construire des solutions propres, efficientes et évolutives.\n\nSes langages de prédilections sont plutôt orientés vers le web : `python`, `javascript`, et le `typescript`, avec notamment des technos tel que `React`, `Vue`, `Next`, `Nest`, `Django`, etc. Mais ses competences vont plus loin, :intent-link[n\'hésitez pas à me le demander]{input="Quelles sont ses compétences ?" payload=skills}. Ses experiences en tant qu\'enseignant lui permettent aussi d\'accompagner sereinement des collègues sur une nouvelle technologie ou un nouveau projet.\n\nIl travaille essentiellement en télétravail depuis la région d\'Orléans, mais il peut se déplacer si besoin.\n\nEden est le developpeur qu\'il vous faut pour votre projet, contactez le !',
            picture: 'http://localhost:3001/images/profil.jpg',
            pictureAlt: 'Photo de Eden CADAGIANI',
          },
          _id: '65de394bcbffc4c9123dd772',
        },
        {
          type: 'TEXT_RESPONSE',
          content: 'Si vous avez d\'autres questions, ou si vous souhaitez :intent-link[le contacter]{input="Contacter Eden" payload=contact_simple autoSend=true}, n\'hésitez pas à me le demander ! 🚀',
          _id: '65de394bcbffc4c9123dd773',
        },
      ],
      buttons: [
        {
          text: 'Quelles sont ses experiences ?',
          payload: 'experience',
          _id: '65de394bcbffc4c9123dd774',
        },
        {
          text: 'Quelles sont ses diplômes ?',
          payload: 'degree',
          _id: '65de394bcbffc4c9123dd775',
        },
        {
          text: 'Donne moi ses compétences',
          payload: 'skills',
          _id: '65de394bcbffc4c9123dd776',
        },
      ],
      createdAt: '2024-02-27T19:34:34.830Z',
      updatedAt: '2024-02-27T19:34:35.960Z',
      userMessage: {
        type: 'DEFAULT',
        content: {
          text: 'Qui est Eden ?',
          payload: 'who_is_eden',
        },
        intent: {
          inputContextNames: [],
          events: [],
          trainingPhrases: [],
          outputContexts: [],
          parameters: [],
          messages: [],
          defaultResponsePlatforms: [],
          followupIntentInfo: [],
          name: 'projects/resume-assistant-399211/agent/intents/0cace6e7-ae1f-481b-a360-de0219a71bfb',
          displayName: 'question.who-is-eden',
          priority: 0,
          isFallback: false,
          webhookState: 'WEBHOOK_STATE_UNSPECIFIED',
          action: '',
          resetContexts: false,
          rootFollowupIntentName: '',
          parentFollowupIntentName: '',
          mlDisabled: false,
          liveAgentHandoff: false,
          endInteraction: false,
        },
      },
      input: {
        type: 'DEFAULT',
        data: {},
      },
    },
  ],
};

export default NewContactSimple;
