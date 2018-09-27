<template>
  <div
    class="wrapper"
    :style="{
      '--right-coordinate': `${position.right - 6}px`,
      '--bottom-coordinate': `${position.bottom - 6}px`
    }"
  >
    <transition name="branch" @before-enter="beforeEnter" @after-leave="afterLeave">
      <div v-if="show" class="create-branch">
        <CircleButton
          color="green"
          icon="branch"
          class="create-branch__button"
        />
        <div class="create-branch__switchers">
          <Switcher
            :options="issueTypes"
            :selected="selected.issueType"
            @switch="switchOption('issueType', ...arguments)"
          />
          <div class="create-branch__delimiter"></div>
          <Switcher
            :options="brands"
            :selected="selected.brand"
            @switch="switchOption('brand', ...arguments)"
          />
          <div class="create-branch__delimiter"></div>
          <Switcher
            :options="branches"
            :selected="selected.branch"
            @switch="switchOption('branch', ...arguments)"
          />
        </div>
        <div class="create-branch__branch-wrapper">
          <input
            type="text"
            class="
              create-branch__input
              create-branch__input--constant-part
              ajs-dirty-warning-exempt
            "
            title="Constant part"
            v-model="constantPart"
          >
          <div class="create-branch__delimiter create-branch__delimiter--clear"></div>
          <input
            type="text"
            class="
              create-branch__input
              create-branch__input--editable-part
              ajs-dirty-warning-exempt
            "
            title="Editable part"
            v-model="editablePart"
            @input="formatBranchName"
          >
        </div>
        <div class="create-branch__buttons">
          <Button
            type="green"
            text="Copy"
            class="copyButton"
            :data-clipboard-text="newBranchName"
            @click="copy"
          />
          <Button
            :type="branchExists ? 'white' : 'blue'"
            :text="branchExists ? 'View' : 'Fork'"
            @click="createBranch"
          />
          <Button type="red" text="Close" @click="toggle(false)" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios              from 'axios';
import Clipboard          from 'clipboard';
import Switcher           from './ui/Switcher.vue';
import jira               from '../assets/configs/jira';
import gitLab             from '../assets/configs/gitLab';
import CircleButton       from './ui/CircleButton.vue';
import getElementPosition from '../assets/utils/getElementPosition';

export default {
  name: 'CreateBranch',
  components: {
    Switcher,
    CircleButton,
  },

  data() {
    return {
      show: false,
      brands: [
        {
          text: gitLab.projects.desktop.name,
          name: gitLab.projects.desktop.key,
          selected: false,
        },
        {
          text: gitLab.projects.mobile.name,
          name: gitLab.projects.mobile.key,
          selected: false,
        },
      ],
      initialBranchLabel: '',
      selectedBranchKey: '',
      initialPlatform: '',
      initialIssueType: '',
      constantPart: '',
      editablePart: '',
      selected: {
        issueType: '',
        brand: '',
        branch: '',
      },
      branchExists: false,
      existedBranch: null,
      issueTypes: [
        {
          text: 'Feature',
          name: 'feature',
          selected: false,
          filter: gitLab.brandsBranchesFilter,
        },
        {
          text: 'Bugfix',
          name: 'bugfix',
          selected: false,
          filter: gitLab.brandsBranchesFilter,
        },
        {
          text: 'Hotfix',
          name: 'hotfix',
          selected: false,
          filter: gitLab.hotfixBranchesFilter,
        },
      ],
      branches: [],
      position: {
        bottom: 0,
        right: 0,
      },
    };
  },

  mounted() {
    this.$root.$on('toggleBranchShow', this.toggle);

    const clipboard = new Clipboard('.copyButton');
    this.setInitialValues();
  },

  computed: {
    newBranchName() {
      return `${this.constantPart}${this.editablePart}`;
    },
  },

  methods: {
    copy() {
      this.$root.$emit('showNotification', {
        title: 'Copied :)',
      });
    },

    toggle(button, event) {
      if (event && event.target) {
        const position = getElementPosition(event.target);
        this.position.right = window.innerWidth - position.right;
        this.position.bottom = window.innerHeight - position.bottom;
      }
      this.show = !this.show;
    },

    beforeEnter() {
      this.$root.$emit('branchShow');
    },

    afterLeave() {
      this.$root.$emit('branchHide');
    },

    switchOption(type, option) {
      this.selected[type] = option.name;

      if (type === 'brand') {
        this.getBranches(
          this.selected.brand,
          this.getSelected(this.issueTypes, 'issueType').filter,
        );
      }

      this.setConstantPart();
    },

    setInitialValues() {
      this.selected.brand = this.getInitialPlatforms();
      this.selected.issueType = this.getInitialIssueType();
      this.selected.branch = this.getInitialBrand();
      this.issueTypes.filter(issueType => (
        issueType.name === this.selected.issueType
      ))[0].selected = true;
      this.selectType(
        this.brands,
        this.brands.filter(platform => platform.name === this.selected.brand)[0],
      );
      this.editablePart = this.getEditablePart();
    },

    formatToValidBranchName(string, limit = 5) {
      let formattedString = string
        .replace(/["'`]/g, '') /* remove quotes */
        .replace(/\s-\s/g, '') /* remove dashes */
        .replace(/\s\s/ig, ' ') /* Replace double spaces with single space */
        .replace(/\[.*?]/ig, '') /* Strip tags in square brackets e.g.: [tag] */
        .trim() /* After removing square brackets - there might be leading white space left */
        .replace(/\s/ig, '-') /* Replace all spaces with dashes */
        .replace(/^[./]|\.\.|@{|[\/.]$|^@$|[~^:\x00-\x20\x7F\s?*[\]\\]/ig, '');
      /* Strip all forbidden chars */
      return limit ? formattedString.split('-').slice(0, limit).join('-') : formattedString;
    },

    getInitialPlatforms() {
      const ticketName = jira.getTicketName();

      if (ticketName.toLowerCase().indexOf(gitLab.projects.mobile.type) !== -1) {
        return gitLab.projects.mobile.key;
      }

      return gitLab.projects.desktop.key;
    },

    getInitialIssueType() {
      const issueType = jira.getTicketType().toLowerCase().trim();
      const issueTypesMapping = {
        feature: [
          jira.ticketTypes.task,
          jira.ticketTypes.story,
          jira.ticketTypes.techTask,
        ],
        bugfix: [
          jira.ticketTypes.defect,
        ],
        hotfix: [
          jira.ticketTypes.productionDefect,
        ],
      };
      let initialIssueType;

      Object.entries(issueTypesMapping).forEach(([key, value]) => {
        if (value.includes(issueType)) {
          initialIssueType = key;
        }
      });

      return initialIssueType;
    },

    getInitialBrand() {
      // TODO remove hardcoded brands
      const ticketName = jira.getTicketName();

      if (ticketName.toLowerCase().indexOf('[cy]') !== -1) {
        return 'cy';
      } else if (ticketName.toLowerCase().indexOf('[ge]') !== -1) {
        return 'ge';
      } else if (ticketName.toLowerCase().indexOf('[ru]') !== -1) {
        return 'ru';
      } else if (ticketName.toLowerCase().indexOf('[mt]') !== -1) {
        return 'mt';
      } else if (ticketName.toLowerCase().indexOf('[tz]') !== -1) {
        return 'tz';
      }

      return 'com';
    },

    getSelected(array, type) {
      return array.filter(item => item.name === this.selected[type])[0];
    },

    getBranches(type, search) {
      const params = [
        {
          key: gitLab.access.param,
          value: gitLab.access.value,
        },
        {
          key: gitLab.filter.param,
          value: search,
        },
        {
          key: gitLab.pageSize.param,
          value: gitLab.pageSize.value,
        },
      ];

      axios
        .get(gitLab.getGitLabUrl(type, this.processParams(params)))
        .then((response) => {
          this.filterBranches(response.data, type, search);
          this.setConstantPart();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    checkBranchExists() {
      const selectedPlatform = this.getSelected(this.brands, 'brand');
      const params = [
        {
          key: gitLab.access.param,
          value: gitLab.access.value,
        },
        {
          key: gitLab.filter.param,
          value: this.constantPart,
        },
      ];
      axios
        .get(gitLab.getGitLabUrl(selectedPlatform.name, this.processParams(params)))
        .then((response) => {
          this.branchExists = response.data.length > 0;
          [this.existedBranch] = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    filterBranches(branches, type, search) {
      const selectedBranch = this.getSelected(this.branches, 'brand');

      if (selectedBranch) {
        this.selectedBranchKey = selectedBranch.key;
      }

      if (type === gitLab.projects.desktop.key && search !== gitLab.hotfixBranchesFilter) {
        this.branches = [
          {
            text: gitLab.projects.desktop.mainBrand,
            name: gitLab.projects.desktop.mainBranch,
            value: gitLab.projects.desktop.mainBranch,
            selected: this.initialBranchLabel === gitLab.projects.desktop.mainBrand
              || this.selectedBranchKey === gitLab.projects.desktop.mainBranch
              || false,
          },
        ];
      } else if (type === gitLab.projects.mobile.key && search !== gitLab.hotfixBranchesFilter) {
        this.branches = [
          {
            text: gitLab.projects.mobile.mainBrand,
            name: gitLab.projects.mobile.mainBranch,
            value: gitLab.projects.mobile.mainBranch,
            selected: this.initialBranchLabel === gitLab.projects.mobile.mainBrand
              || this.selectedBranchKey === gitLab.projects.mobile.mainBranch
              || false,
          },
        ];
      } else {
        this.branches = [];
      }

      branches.forEach((branch) => {
        if (search === gitLab.brandsBranchesFilter) {
          const branchNameParts = branch.name.split('-');

          if (branchNameParts.length > 1) {
            this.branches.push({
              name: branchNameParts[1],
              text: branchNameParts[1],
              value: branch.name,
              selected: this.initialBranchLabel === branchNameParts[1]
                || this.selectedBranchKey === branch.name || false,
            });
          }
        } else if (search === gitLab.hotfixBranchesFilter) {
          const branchNameParts = branch.name.split('/');

          if (branchNameParts.length > 1 && branch.name.indexOf(new Date().getFullYear()) !== -1) {
            let branchBrand = this.getBranchBrand(branchNameParts[0]);

            if (branchBrand === gitLab.hotfixBranchesFilter
              || branchBrand === gitLab.projects.mobile.type
              || branchBrand === gitLab.projects.desktop.type
            ) {
              branchBrand = gitLab.projects.desktop.mainBrand;
            }

            const branchIndex = this.getBranchIndexByBrand(branchBrand);
            const branchObject = {
              name: branchNameParts[1],
              text: branchBrand,
              value: branchNameParts[1],
              selected: this.initialBranchLabel === branchBrand
                || this.selectedBranchKey === branch.name || false,
            };

            if (branchIndex !== undefined) {
              const existDate = new Date(this.branches[branchIndex].value);
              const currentDate = new Date(branchNameParts[1]);

              if (currentDate > existDate) {
                this.branches[branchIndex] = branchObject;
              }
            } else {
              this.branches.push(branchObject);
            }
          }
        }
      });

      if (search === gitLab.hotfixBranchesFilter) {
        this.branches.sort((branch1, branch2) => new Date(branch2.value) - new Date(branch1.value));
      }

      this.branches = this.removeDuplicates(x => x.text, this.branches);
      const selected = this.branches.find(branch => branch.selected);
      this.selected.branch = selected ? selected.name : this.branches[0].name;
      this.initialBranchLabel = undefined;
    },

    getBranchBrand(branch) {
      const branchParts = branch.split('-');
      return branchParts[branchParts.length - 1];
    },

    getBranchIndexByBrand(brand) {
      let branchIndex;
      this.branches.forEach((branch, index) => {
        if (branch.text === brand) {
          branchIndex = index;
        }
      });

      return branchIndex;
    },

    selectType(types, selectedType, getBranches = true) {
      let previousSelected;

      types.forEach((type) => {
        if (type.selected) {
          previousSelected = type;
        }

        type.selected = false;
      });

      selectedType.selected = true;
      this.setConstantPart();

      if (getBranches && previousSelected !== selectedType) {
        const selectedPlatform = this.getSelected(this.brands, 'brand');
        const selectedIssueType = this.getSelected(this.issueTypes, 'issueType');

        if (selectedPlatform && selectedIssueType) {
          this.getBranches(selectedPlatform.name, selectedIssueType.filter);
        }
      }
    },

    removeDuplicates(keyFn, array) {
      const set = new Set();

      return array.filter((x) => {
        const key = keyFn(x);
        const isNew = !set.has(key);

        if (isNew) {
          set.add(key);
        }

        return isNew;
      });
    },

    setConstantPart() {
      const ticket = jira.getTicketID();
      const issueType = this.issueTypes.filter(issue => issue.name === this.selected.issueType)[0];
      const brand = this.branches.filter(branch => branch.name === this.selected.branch)[0];

      if (!brand || !issueType) {
        this.showBranchName = false;
        return;
      }

      this.showBranchName = true;
      this.constantPart = `${issueType.name}/${brand.text}/${ticket}-`;
      this.checkBranchExists();
    },

    getEditablePart() {
      if (this.editablePart) {
        return this.editablePart;
      }

      const ticketName = jira.getTicketName();
      return this.formatToValidBranchName(ticketName);
    },

    formatBranchName() {
      this.editablePart = this.formatToValidBranchName(this.editablePart.replace(/\s/ig, '-'), false);
    },

    processParams(params) {
      return params.map(param => `${param.key}=${param.value}`).join('&');
    },

    createBranch() {
      const selectedPlatform = this.getSelected(this.brands, 'brand');

      if (this.branchExists) {
        const win = window.open(gitLab.getGitLabBranchUrl(selectedPlatform.name, this.existedBranch.name), '_blank');
        win.focus();
      } else {
        const selectedBranch = this.getSelected(this.branches, 'branch');
        const params = [
          {
            key: gitLab.access.param,
            value: gitLab.access.value,
          },
          {
            key: 'branch',
            value: this.newBranchName,
          },
          {
            key: 'ref',
            value: selectedBranch.value,
          },
        ];
        axios
          .post(gitLab.getGitLabUrl(selectedPlatform.name, this.processParams(params)))
          .then(() => {
            this.checkBranchExists();
            this.$root.$emit('showNotification', {
              title: 'Branch created successfully',
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
  },
};
</script>

<style lang="scss">
  .create-branch {
    position: fixed;
    bottom: 0;
    right: 190px;
    padding: 10px;
    height: 130px;
    width: 700px;
    border-radius: 4px;
    background: rgba(84,110,122 ,1);
    display: flex;
    flex-direction: column;
    transition: all .375s;
    box-sizing: border-box;
    overflow: hidden;

    &__button {
      opacity: 0;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(84,110,122 ,1);
      border-radius: 24px;
      justify-content: center;
      pointer-events: none;
    }

    &__switchers {
      display: flex;
      margin-bottom: 10px;
    }

    &__delimiter {
      width: 1px;
      background: #fff;
      margin: 0 10px;

      &--clear {
        margin: 0;
      }
    }

    &__branch-wrapper {
      display: flex;
      margin-bottom: 10px;
    }

    &__input {
      background: transparent;
      border: 0;
      border-bottom: 2px solid #ccc;
      transition: all .375s;
      color: #fff;
      font-size: 16px;

      &--constant-part {
        width: 30%;
        text-align: right;
      }

      &--editable-part {
        width: 70%;
      }

      &:focus {
        outline: none;
        border-bottom: 2px solid #fff;
      }
    }

    &__buttons {
      text-align: left;
    }
  }

  .branch {

    &-enter-active *,
    &-leave-active * {
      opacity: 0;
    }

    &-enter,
    &-leave-to {
      background: #4CAF50;
      height: 48px;
      width: 48px;
      padding: 48px 0 0;
      border-radius: 50%;
      right: var(--right-coordinate);
      bottom: var(--bottom-coordinate);
      z-index: -1;

      .create-branch__button {
        opacity: 1;
      }
    }
  }
</style>
