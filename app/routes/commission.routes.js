const controller = require('../controller/commission.controller');

module.exports = (app) => {
  app.post('/api/commissions', controller.commission_calculate);
  app.get('/api/commissions/history', controller.getHistory);
}