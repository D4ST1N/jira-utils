import pluginSettings from './pluginSettings';

export default {
  cache: {},

  save(settings) {
    localStorage.setItem('JiraUtilsSettings', JSON.stringify(settings));
    this.cache = settings;
  },

  set(key, value) {
    const settings = this.get(null, true);
    settings[key] = value;
    this.save(settings);
  },

  get(key, full = false) {
    if (full && Object.keys(this.cache).length) {
      return this.cache;
    }

    if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return this.cache[key];
    }

    const settingsData = localStorage.getItem('JiraUtilsSettings');

    if (!settingsData) {
      return this.getDefault(key, full);
    }

    this.cache = JSON.parse(settingsData);

    if (full) {
      return this.cache;
    }

    return this.cache[key];
  },

  getDefault(key, full) {
    if (full) {
      const settings = {};

      pluginSettings.forEach((setting) => {
        settings[setting.key] = setting.value;
      });

      return settings;
    }
    return pluginSettings.find(setting => setting.key === key).value;
  },
};
