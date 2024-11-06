// Imports the Dialogflow library
import dialogflow from '@google-cloud/dialogflow';
import intent from '../resources/NLU/question.hobbies.json' with { type: "json" };

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient();
const agentClient = new dialogflow.AgentsClient();

const projectId = 'resume-assistant-399211';

function parseTrainingPhrase(phrase) {
  // phrase exemple "Change the language to ${french[language]}."
  let result = phrase.split(/(\$\{.*?\})/g);
  result = result.map((part) => {
    if (!part.startsWith('${')) {
      return {
        text: part,
      };
    }
    // "${text[entity](variable)}" (variable is optional)
    const res = part.match(/\$\{(?<sentence>.*)\[(?<entity>.*)\](\((?<alias>\w*)\))?\}/);
    if (!res.groups.sentence || !res.groups.entity) {
      throw new Error(`Invalid training phrase: ${phrase}`);
    }

    return {
      text: res.groups.sentence,
      entityType: `@${res.groups.entity}`,
      alias: res.groups?.alias || res.groups.entity,
      userDefined: true,
    };
  });
  return result;
}

async function createIntent() {
  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

  const englishTrainingPhrases = intent.en.map((trainingPhrase) => ({
    type: 'EXAMPLE',
    parts: parseTrainingPhrase(trainingPhrase),
  }));

  const frenchTrainingPhrases = intent.fr.map((trainingPhrase) => ({
    type: 'EXAMPLE',
    parts: parseTrainingPhrase(trainingPhrase),
  }));

  console.info(`Start create intent: ${intent.intentName}`);

  const [createdIntent] = await intentsClient.createIntent({
    parent: agentPath,
    languageCode: 'en',
    intent: {
      displayName: intent.intentName,
      trainingPhrases: englishTrainingPhrases,
    },
  });
  console.info(`Intent ${createdIntent.name} created, with english training phrases`);

  const [updatedIntent] = await intentsClient.updateIntent({
    languageCode: 'fr',
    intent: {
      ...createdIntent,
      trainingPhrases: frenchTrainingPhrases,
    },
  });
  console.info(`Intent ${updatedIntent.name} updated, with french training phrases`);

  await agentClient.trainAgent({
    parent: `projects/${projectId}/locations/global`,
  });
  console.info('Start agent training');
}

createIntent();

// const util = require('util');
// console.log(util.inspect(exempleObject, { showHidden: false, depth: null, colors: true }));
