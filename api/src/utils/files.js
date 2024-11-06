import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { API_URL, IS_DEBUG, NODE_APP_PATH } from '../config.js';

export function getImageUrl(imageName) {
  // avoid double slash
  const imagePath = imageName.startsWith('/') ? imageName.slice(1) : imageName;

  if (IS_DEBUG) {
    // check if image exist, and get warning if not
    if (!fs.existsSync(`resources/images/${imagePath}`)) {
      console.warn(`File: ${imagePath}, does not exist !`);
    }
  }

  return `${API_URL}/images/${imagePath}`;
}

// futurdo: Generate optimized images https://dev.to/brainiacneit/generating-optimized-image-formats-with-nodejs-hj3

export function getDocumentUrl(imageName) {
  // avoid double slash
  const imagePath = imageName.startsWith('/') ? imageName.slice(1) : imageName;

  if (IS_DEBUG) {
    // check if image exist, and get warning if not
    if (!fs.existsSync(`resources/documents/${imagePath}`)) {
      console.warn(`File: ${imagePath}, does not exist !`);
    }
  }

  return `${API_URL}/documents/${imagePath}`;
}

export function readRelativeFile(relativeFilePath, encoding = 'utf-8') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, relativeFilePath);
  return fs.readFileSync(filePath, encoding);
}

export function readRelativeJson(relativeFilePath) {
  return JSON.parse(readRelativeFile(relativeFilePath));
}

export function readFile(filePath, encoding = 'utf-8') {
  return fs.readFileSync(path.join(NODE_APP_PATH, filePath), encoding);
}

export function readJson(filePath) {
  return JSON.parse(readFile(filePath));
}
