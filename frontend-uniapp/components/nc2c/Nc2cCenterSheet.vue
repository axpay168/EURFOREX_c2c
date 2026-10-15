<template>
  <transition name="eur-center-dialog" appear>
    <div
      v-show="visible"
      class="eur-center-dialog fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="close"
    >
      <div
        class="eur-center-dialog__panel w-full max-w-md rounded-[24px] border border-outline-variant/20 bg-surface-bright p-5 shadow-[0_24px_48px_rgba(22,41,63,0.2)]"
        @click.stop
      >
        <div class="flex items-center justify-between gap-3">
          <h2 :id="titleId" class="font-headline text-lg font-bold text-on-surface">{{ title }}</h2>
          <button
            type="button"
            class="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-low"
            :aria-label="localizedText('關閉', 'Close')"
            @click="close"
          >
            <span class="material-symbols-outlined text-[22px] leading-none">close</span>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Nc2cCenterSheet",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    titleId: {
      type: String,
      required: true
    }
  },
  watch: {
    visible: function (v) {
      try {
        document.body.style.overflow = v ? "hidden" : "";
      } catch (e) {}
    }
  },
  beforeDestroy: function () {
    try {
      document.body.style.overflow = "";
    } catch (e) {}
  },
  methods: {
    close: function () {
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style>
.eur-center-dialog {
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
}

.eur-center-dialog-enter-active,
.eur-center-dialog-leave-active {
  transition: opacity 0.24s ease;
}

.eur-center-dialog-enter-active .eur-center-dialog__panel,
.eur-center-dialog-leave-active .eur-center-dialog__panel {
  transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.eur-center-dialog-enter,
.eur-center-dialog-leave-to {
  opacity: 0;
}

.eur-center-dialog-enter .eur-center-dialog__panel,
.eur-center-dialog-leave-to .eur-center-dialog__panel {
  opacity: 0;
  transform: translate3d(0, 16px, 0) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .eur-center-dialog-enter-active,
  .eur-center-dialog-leave-active,
  .eur-center-dialog-enter-active .eur-center-dialog__panel,
  .eur-center-dialog-leave-active .eur-center-dialog__panel {
    transition-duration: 0.01ms !important;
  }

  .eur-center-dialog-enter .eur-center-dialog__panel,
  .eur-center-dialog-leave-to .eur-center-dialog__panel {
    transform: none;
  }
}
</style>
