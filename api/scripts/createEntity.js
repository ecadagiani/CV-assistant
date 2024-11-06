// Imports the Dialogflow library
import dialogflow from '@google-cloud/dialogflow';
import entity from '../resources/NLU/entity.company.js';

// Instantiates the Intent Client
const entityClient = new dialogflow.EntityTypesClient();
const agentClient = new dialogflow.AgentsClient();

const projectId = 'resume-assistant-399211';

async function createEntityType() {
  // The path to identify the agent that owns the created intent.
  const agentPath = entityClient.projectAgentPath(projectId);
  const frenchEntities = entity.entries.map(({ value, synonyms }) => ({
    value,
    synonyms: synonyms.fr,
  }));
  const englishEntities = entity.entries.map(({ value, synonyms }) => ({
    value,
    synonyms: synonyms.en,
  }));

  const [createdEntity] = await entityClient.createEntityType({
    parent: agentPath,
    languageCode: 'en',
    entityType: {
      displayName: entity.name,
      kind: 'KIND_MAP',
      entities: englishEntities,
    },
  });
  console.info(`Entity ${createdEntity.name} created, with english synonyms`);

  const [updatedEntity] = await entityClient.updateEntityType({
    languageCode: 'fr',
    entityType: {
      ...createdEntity,
      entities: frenchEntities,
    },
  });
  console.info(`Entity ${updatedEntity.name} updated, with french synonyms`);

  await agentClient.trainAgent({
    parent: `projects/${projectId}/locations/global`,
  });
  console.info('Start agent training');
}

createEntityType();
