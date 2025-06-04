const setupModels = require('gws365-models/models');

let models;

const getModels = async () => {
  if (!models) {
    console.log('🔃 Loading models...');
    models = await setupModels();
  } else {
    console.log('✅ Using cached models...');
  }
  return models;
};

module.exports = getModels;
