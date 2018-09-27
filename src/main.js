import Vue from 'vue';
import App from './App.vue';
import Button from './components/ui/Button.vue';

Vue.config.productionTip = true;
Vue.config.devtools = true;
Vue.component('Button', Button);

new Vue({
  render: h => h(App),
}).$mount('#app');
