import pluginSettings from './pluginSettings';

export default {
  cache: {},
  save(settings) {
    localStorage.setItem('JiraUtilsSettings', JSON.stringify(settings));
    this.cache = settings;
  },
  get(key) {
    if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return this.cache[key];
    }

    const settingsData = localStorage.getItem('JiraUtilsSettings');

    if (!settingsData) {
      return this.getDefault(key);
    }

    this.cache = JSON.parse(settingsData);

    return this.cache[key];
  },
  getDefault(key) {
    return pluginSettings.find(setting => setting.key === key).value;
  },
};
