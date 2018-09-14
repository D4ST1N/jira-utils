export default [
  {
    key: 'animation.mainMenu.turnsCount',
    text: 'Number of turns of menu showing',
    type: 'range',
    min: 1,
    max: 3,
    value: 1,
    step: 1,
    hidden: false,
  },
  {
    key: 'behaviour.impactAnalysis.showModal',
    text: 'Show modal for collect data for Impact Analysis',
    type: 'checkbox',
    value: true,
    hidden: false,
  },
  {
    key: 'ui.fontFamily',
    hidden: true,
    value: 'Arial',
  },
];
