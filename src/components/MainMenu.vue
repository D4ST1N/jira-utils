<template>
  <div class="main-menu" :style="{ '--menu-turns-count': `${settings.menuTurnCount}` }">
    <transition-group name="menu">
      <CircleButton
        v-if="show"
        v-for="(button, index) in buttons"
        :key="button.name"
        :color="button.color"
        :icon="button.icon"
        :label="button.label"
        :class="{
          'main-menu__button--menu': true,
          'main-menu__button--hidden': button.name === 'create-branch' && !showBranchButton,
          copyButton: button.name === 'copy-commit'
        }"
        :data-clipboard-text="commitMessage"
        :data-index="index"
        @mouseenter="showTooltip(button, $event)"
        @mouseout="hideTooltip"
        @click="buttonClick(button, $event)"
      />
    </transition-group>
    <CircleButton
      color="grey"
      label="Toggle plugin menu"
      icon="add"
      :class="{ 'main-menu__button--main': true, 'main-menu__button--main--close': show }"
      @click="toggleMenu"
    />
    <CreateBranch />
    <Settings />
    <div class="ju-modal" ref="modal">
      <transition
        name="subwindow"
        @after-enter="afterEnter"
        @after-leave="afterLeave"
      >
        <div v-if="modal.show" class="ju-modal__overlay">
          <div class="ju-modal__wrapper">
            <div class="ju-modal__inner">
              <div class="ju-modal__container">
                <h1 class="ju-modal__title">{{ modal.title }}</h1>
                <div
                  class="ju-modal__list-item"
                  v-for="(input, index) in modal.inputs"
                  :key="index"
                >
                  <span v-if="impactSurvey.multiple" class="impact-marker"></span>
                  <input
                    type="text"
                    class="ju-modal__value"
                    v-model="input.value"
                    @keyup.enter="modal.show = false"
                  >
                </div>
                <Button
                  v-if="impactSurvey.multiple"
                  type="blue"
                  text="Add item"
                  class="add-impact-value"
                  @click="addModalValue"
                />
                <br />
                <Button type="green" text="Ok" @click="modal.show = false" />
                <Button type="red" text="Skip" @click="hideModal" />
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import CircleButton        from './ui/CircleButton.vue';
import CreateBranch        from './CreateBranch.vue';
import Settings            from './Settings.vue';
import createArray         from '../assets/utils/createArray';
import getPointCoordinates from '../assets/utils/getPointCoordinates';
import jira                from '../assets/configs/jira';
import settings            from '../assets/configs/settings';

export default {
  name: 'MainMenu',
  components: {
    CircleButton,
    CreateBranch,
    Settings,
  },
  data() {
    return {
      show: true,
      showBranchButton: true,
      buttons: [
        {
          name: 'settings',
          label: 'Settings',
          icon: 'gear',
          action: 'showSettings',
          color: 'white',
        },
        {
          name: 'add-impact',
          label: 'Add Impact Analysis',
          icon: 'table',
          action: 'addImpact',
          color: 'red',
        },
        {
          name: 'copy-commit',
          label: 'Copy commit message',
          icon: 'pen',
          action: 'copeCommit',
          color: 'violet',
        },
        {
          name: 'create-branch',
          label: 'Create Branch',
          icon: 'branch',
          action: 'toggleBranchShow',
          color: 'green',
        },
      ],
      modal: {
        title: '',
        inputs: [
          {
            value: '',
          },
        ],
        show: false,
      },
      impactValue: {
        version: ' ',
        feature: ' ',
        brands: ' ',
        checkList: ' ',
      },
      impactSurvey: {
        questions: [
          {
            title: 'Version / env',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.version = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'Features modified',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.feature = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'Brands /Features affected',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.brands = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'What\'s need to be checked (recommendations from developer)',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
              component.impactSurvey.multiple = true;
            },
            after(component, inputs) {
              component.impactValue.checkList = inputs.length > 1
                ? inputs.reduce(
                  (str, item, index) => `${str}${index > 0 ? '\n' : ''} * ${item.value}`,
                  '',
                )
                : inputs[0].value || ' ';
              component.impactSurvey.step = 0;
              component.impactSurvey.multiple = false;
              component.addImpact();
            },
          },
        ],
        step: 0,
        multiple: false,
      },
      settings: {
        impactAnalysisModal: settings.get('behaviour.impactAnalysis.showModal'),
        menuTurnCount: settings.get('animation.mainMenu.turnsCount'),
      },
      commitMessage: '',
    };
  },

  mounted() {
    this.buttons.forEach((value, index) => {
      this.createAnimation('showMenuItem', 'hideMenuItem', index, 90 + this.getRotationDegree(index));
    });
    this.$root.$on('branchShow', () => {
      this.showBranchButton = false;
    });
    this.$root.$on('branchHide', () => {
      this.showBranchButton = true;
    });
    this.$root.$on('addImpact', this.showImpactSurvey);
    this.$root.$on('settingsChanges', () => {
      if (this.settings.menuTurnCount !== settings.get('animation.mainMenu.turnsCount')) {
        this.settings.menuTurnCount = settings.get('animation.mainMenu.turnsCount');
        this.updateAnimations();
      }
      if (this.settings.impactAnalysisModal !== settings.get('behaviour.impactAnalysis.showModal')) {
        this.settings.impactAnalysisModal = settings.get('behaviour.impactAnalysis.showModal');
      }
    });
    this.setCommitMessage();
  },

  methods: {
    showTooltip(button, event) {
      this.$root.$emit('showTooltip', event.target, button.label);
    },

    hideTooltip() {
      this.$root.$emit('hideTooltip');
    },

    addModalValue() {
      this.modal.inputs.push({ value: '' });
    },

    showModal(title, value) {
      this.modal.title = title;
      this.modal.inputs.splice(1);
      this.modal.inputs[0].value = value;
      this.modal.show = true;
    },

    hideModal() {
      this.impactSurvey.step = this.impactSurvey.questions.length;
      this.modal.show = false;
    },

    afterEnter() {
      this.$refs.modal.querySelector('.ju-modal__value').focus();
    },

    afterLeave() {
      if (this.impactSurvey.questions.length > this.impactSurvey.step) {
        this.impactSurvey.questions[this.impactSurvey.step].after(this, this.modal.inputs);
      } else {
        this.impactSurvey.step = 0;
        this.addImpact();
      }
    },

    showImpactSurvey() {
      if (this.settings.impactAnalysisModal) {
        this.impactSurvey.questions[this.impactSurvey.step].start(this);
      } else {
        this.addImpact();
      }
    },

    addImpact() {
      document.querySelector(jira.commentButtonSelector).click();
      setTimeout(() => {
        document.querySelector(jira.textTabSelector).click();
        document.querySelector(jira.commentAreaSelector).value = this.enrichTemplate();
        setTimeout(() => {
          document.querySelector(jira.visualTabSelector).click();
        }, 250);
      }, 250);
    },

    enrichTemplate() {
      return jira
        .impactAnalysisTemplate
        .replace('{version}', this.impactValue.version)
        .replace('{feature}', this.impactValue.feature)
        .replace('{brands}', this.impactValue.brands)
        .replace('{checkList}', this.impactValue.checkList);
    },

    setCommitMessage() {
      const ticket = jira.getTicketID();
      const ticketName = jira.getTicketName();
      const ticketNameFormatted = ticketName.replace(/\s\s/ig, ' ').replace(/\[.*?\]/ig, '').trim();
      this.commitMessage = `[${ticket}] ${ticketNameFormatted}`;
    },

    getRotationDegree(index) {
      return index * (90 / (this.buttons.length - 1));
    },

    toggleMenu() {
      this.show = !this.show;
    },

    buttonClick(button, event) {
      this.$root.$emit(button.action, button, event);

      if (button.name === 'copy-commit') {
        this.$root.$emit('showNotification', {
          title: 'Copied :)',
        });
      }
    },

    createAnimation(
      animationNameIn,
      animationNameOut,
      index,
      startTurn = 90,
      frames = 100,
      turnRate = 360 * this.settings.menuTurnCount,
    ) {
      const startRadius = 0;
      const endRadius = ((this.buttons.length * 48) * 4) / Math.PI / 2;
      const scaleFrom = 0.5;
      const center = {
        x: 0,
        y: 0,
      };
      const framesArray = createArray(frames + 1);
      const radiusRate = (endRadius - startRadius) / frames;
      const angleRate = turnRate / frames;
      const scaleRate = (1 - scaleFrom) / 100;
      let animation = `.main-menu__button--menu[data-index="${index}"] {
        animation-name: ${animationNameIn}${index};
        animation-delay: ${0.12 * (this.buttons.length - index)}s;
      }
      .main-menu__button--menu[data-index="${index}"].menu-leave-active {
        animation-name: ${animationNameOut}${index};
        animation-delay: ${0.12 * index}s;
      }
      @keyframes ${animationNameIn}${index} {
      `;

      framesArray.forEach((value, frameIndex) => {
        const radius = radiusRate * frameIndex;
        const angle = (angleRate * frameIndex) - startTurn;
        const scale = scaleFrom + (scaleRate * frameIndex);
        const coordinates = getPointCoordinates(center, radius, angle);
        animation += `${frameIndex}% {
          transform: translate(${coordinates.x - center.x}px, ${coordinates.y - center.y}px) scale(${scale});
        }`;
      });

      animation = `${animation}
      }
      @keyframes ${animationNameOut}${index} {`;

      framesArray.forEach((value, frameIndex) => {
        const inverseIndex = frames - frameIndex;
        const radius = radiusRate * inverseIndex;
        const angle = (angleRate * inverseIndex) - startTurn;
        const scale = 1 - (scaleRate * frameIndex);
        const coordinates = getPointCoordinates(center, radius, angle);
        animation += `${frameIndex}% {
          transform: translate(${coordinates.x - center.x}px, ${coordinates.y - center.y}px) scale(${scale});
        }
        `;
      });

      animation = `${animation}
      }`;
      const styles = document.createElement('style');
      styles.type = 'text/css';
      styles.innerHTML = animation;
      styles.id = `animation${index}`;
      this.$el.appendChild(styles);
    },

    updateAnimations() {
      this.buttons.forEach((value, index) => {
        const style = document.getElementById(`animation${index}`);
        this.$el.removeChild(style);
        this.createAnimation('showMenuItem', 'hideMenuItem', index, 90 + this.getRotationDegree(index));
      });
    },
  },
};
</script>

<style lang="scss">
  .main-menu {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 120px;
    height: 120px;
    transition: all .5s;
    z-index: 3;

    &--hidden {
      width: 24px;
      height: 24px;
      right: 0;
      bottom: 0;

      & .main-menu__button-wrapper {
        opacity: 0;
      }

      & .main-menu__button--main {
        top: -12px;
        left: -12px;
      }
    }

    &__button-wrapper {
      position: absolute;
      width: 200%;
      height: 200%;
      top: 0;
      left: 0;
      transform-origin: 50% 50%;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      transition: all .5s linear;
      pointer-events: none;
      opacity: 1;
    }

    &__button {

      &--menu {
        position: fixed;
        right: 30px;
        bottom: 30px;
        animation-duration: calc(var(--menu-turns-count) * .34s);
        animation-timing-function: ease-in-out;
        animation-fill-mode: both;
        transition: all 0s;
      }

      &--hidden {
        opacity: 0;
      }

      &--main {
        position: fixed;
        right: 30px;
        bottom: 30px;

        &--close {
          transform: rotate(135deg);
        }
      }
    }
  }

  .ju-modal {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    pointer-events: none;

    &__overlay {
      display: flex;
      background: rgba(55, 71, 79, .6);
      align-items: center;
      justify-content: center;
      width: 100%;
      pointer-events: none;
      transition: all .6s;
    }

    &__wrapper {
      position: relative;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    &__inner {
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 1);
      padding: 20px 40px;
      max-width: 400px;
    }

    &__title {
      text-align: center;
      margin-bottom: 16px;
      font-weight: 600;
      font-size: 20px;
    }

    &__value {
      width: 100%;
      box-sizing: border-box;
      font-size: 16px;
      padding: 0 0 2px;
      border: 0 solid transparent;
      border-bottom: 2px solid #ccc;
      transition: border .375s
    }

    &__value:focus {
      outline: none;
      border-bottom: 2px solid #888;
    }

    &__label {
      display: block;
      margin-bottom: 10px;
    }

    &__list-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
  }

  .impact-marker {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #ccc;
    border-radius: 50%;
    margin-right: 15px;
  }
  .add-impact-value {
    margin-bottom: 20px;
  }
  @keyframes inner-in {
    0% {
      transform: translateY(400%);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes inner-out {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(400%);
    }
  }

  @keyframes wrapper-in {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    60% {
      transform: translateX(6%);
      opacity: .9;
    }
    80% {
      transform: translateX(-2%);
      opacity: .95;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes wrapper-out {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    20% {
      transform: translateX(2%);
      opacity: .95;
    }
    40% {
      transform: translateX(-6%);
      opacity: .9;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  .subwindow-enter-active {
    transition-timing-function: ease-out;
    background: rgba(55, 71, 79, 0);
  }
  .subwindow-enter-active .ju-modal__wrapper {
    animation: wrapper-in .5s ease-in forwards;
  }
  .subwindow-enter-active .ju-modal__inner {
    animation: inner-in .3s ease-out forwards;
  }

  .subwindow-enter-to {
    background: rgba(55, 71, 79, .6);
  }

  .subwindow-leave-active {
    transition-timing-function: ease-in;
    background: rgba(55, 71, 79, .6);
  }
  .subwindow-leave-active .ju-modal__wrapper {
    animation: wrapper-out .5s ease-out forwards;
  }
  .subwindow-leave-active .ju-modal__inner {
    animation: inner-out .3s ease-in .2s forwards;
  }

  .subwindow-leave-to {
    background: rgba(55, 71, 79, 0);
  }

  @keyframes showMenu {
    0% {
      transform: rotate(-45deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
</style>
