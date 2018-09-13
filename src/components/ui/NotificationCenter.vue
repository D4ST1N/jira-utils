<template>
  <div class="notification-center">
    <transition-group name="notification">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        v-if="notification.isVisible"
        :notification="notification"
      />
    </transition-group>
  </div>
</template>

<script>
import Notification from './Notification.vue';
import NotificationPrototype from '../../assets/configs/Notification';

export default {
  name: 'NotificationCenter',
  components: {
    Notification,
  },

  data() {
    return {
      notifications: [],
    };
  },

  mounted() {
    this.$root.$on('showNotification', this.showNotification);
  },

  methods: {
    showNotification(opts) {
      this.notifications.push(new NotificationPrototype(opts));
    },
  },
};
</script>

<style lang="scss">
  .notification-center {
    position: fixed;
    bottom: 80px;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 5;
    padding: 10px;
  }
</style>
