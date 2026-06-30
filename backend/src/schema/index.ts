import fs from 'fs';
import path from 'path';

const files = [
  'common.graphql',
  'auth.graphql',
  'space.graphql',
  'testimonial.graphql',
  'campaign.graphql',
  'analytics.graphql',
  'reward.graphql',
  'staticPage.graphql',
  'widget.graphql',
  'collection.graphql',
  'showcase.graphql'
];

export const typeDefs = files.map(file => {
  const filePath = path.join(__dirname, file);
  return fs.readFileSync(filePath, 'utf-8');
}).join('\n');
