<template>
  <button :class="buttonClass" @click="buttonClick">
    <slot name="before"></slot>
    <span v-if="label" class="button__text">{{ label }}</span>
    <slot name="after"></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
    },
    text: {
      type: [String, Number],
    },
    button: {
      type: Object,
    },
    stop: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    label() {
      if (this.text === undefined) {
        return false;
      }

      if (typeof this.text === 'number') {
        return String(this.text);
      }

      return this.text;
    },

    buttonClass() {
      return {
        button: true,
        [`button--${this.type}`]: !!this.type,
      };
    },
  },

  methods: {
    buttonClick(event) {
      if (this.stop) {
        event.stopPropagation();
      }

      this.$emit('click', this.button, event);
    },
  },
};
</script>

<style lang="scss">
  .button {
    display: inline-flex;
    align-items: center;
    border: 0;
    line-height: 1;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'Neucha', cursive;
    color: #fff;
    cursor: pointer;
    margin-right: 8px;
    font-size: 14px;
    background: linear-gradient(to bottom, rgba(30,136,229 ,1), rgba(25,118,210 ,1));

    &:hover,
    &:focus {
      outline: none;
      background: linear-gradient(to bottom, rgba(25,118,210 ,1), rgba(21,101,192 ,1));
    }

    &:last-child {
      margin-right: 0;
    }

    &--red {
      background: linear-gradient(to bottom, rgba(244,81,30 ,1), rgba(230,74,25 ,1));

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, rgba(230,74,25 ,1), rgba(216,67,21 ,1));
      }
    }

    &--green {
      background: linear-gradient(to bottom, rgba(76,175,80 ,1), rgba(67,160,71 ,1));

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, rgba(67,160,71 ,1), rgba(56,142,60 ,1));
      }
    }

    &--blue {
      background: linear-gradient(to bottom, rgba(79,195,247 ,1), rgba(41,182,246 ,1));

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, rgba(41,182,246 ,1), rgba(3,169,244 ,1));
      }
    }

    &--white {
      background: #fff;
      color: rgba(84,110,122 ,1);

      &:hover,
      &:focus {
        background: linear-gradient(to bottom, #fff, #eee);
      }
    }

    &--transparent {
      background: transparent;
      color: #fff;

      &:hover,
      &:focus {
        background: rgba(255, 255, 255, .2);
      }
    }

    &__text {

      &:not(:first-child) {
        margin-left: 8px;
      }

      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
</style>
