/* eslint-disable max-len */
import { ComponentLoader } from 'adminjs';

export const componentLoader = new ComponentLoader();

export const Components = {
  JsonProperties: componentLoader.add('JsonProperties', './components/JsonProperties'),
  MixedPropertiesEdit: componentLoader.add('MixedPropertiesEdit', './components/MixedPropertiesEdit'),
  JsonDocument: componentLoader.add('JsonDocument', './components/JsonDocument'),
  ChatLink: componentLoader.add('ChatLink', './components/ChatLink'),
  Dashboard: componentLoader.add('Dashboard', './components/dashboard/Dashboard'),
  MessagesList: componentLoader.add('MessagesList', './resourceConversation/MessagesList'),
  ConversationList: componentLoader.add('ConversationList', './resourceUser/ConversationList'),
  SemanticCacheNearest: componentLoader.add('SemanticCacheNearest', './resourceSemanticCache/SemanticCacheNearest'),
  SemanticCacheListResponseExample: componentLoader.add('SemanticCacheListResponseExample', './resourceSemanticCache/SemanticCacheListResponseExample'),
};
