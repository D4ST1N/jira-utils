export default {
  ticketNameSelector: '#summary-val',
  ticketIDSelector: '#key-val',
  ticketTypeSelector: '#type-val',
  containerSelector: '.ops-menus.aui-toolbar',
  mainColumnSelector: '.issue-main-column',
  commentButtonSelector: '#footer-comment-button',
  commentAreaSelector: '#comment',
  textTabSelector: '#aui-uid-2',
  visualTabSelector: '#aui-uid-1',
  impactAnalysisTemplate: `||Summary||Description||
|*Version / env*|{version}|
|*Features modified*|{feature}|
|*Brands /Features affected*|{brands}|
|*What's need to be checked (recommendations from developer)*|{checkList}|`,
  ticketTypes: {
    task: 'task',
    story: 'story',
    techTask: 'tech task',
    defect: 'defect',
    productionDefect: 'production defect',
  },

  getTicketName() {
    return document.querySelector(this.ticketNameSelector).innerText;
  },

  getTicketID() {
    return document.querySelector(this.ticketIDSelector).innerText;
  },

  getTicketType() {
    return document.querySelector(this.ticketTypeSelector).innerText;
  },

  getContainer() {
    return document.body;
  },

  getMainColumn() {
    return document.querySelector(this.mainColumnSelector);
  },
};
