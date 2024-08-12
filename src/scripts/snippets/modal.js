import { trapFocus, removeTrapFocus } from '@shopify/theme-a11y';
import { scrollLockOpen, scrollLockClose } from '@/scripts/core/scroll-lock';

let isModalOpen = false;

function initModals() {
  const modals = document.querySelectorAll('[data-modal]');
  const openToggles = document.querySelectorAll('[data-open-modal]');
  const closeToggles = document.querySelectorAll('[data-close-modal]');

  modals.forEach((modal) => {
    document.body.append(modal);
  });

  openToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggle.setAttribute('data-active-modal-trigger', '');
      openModal(toggle.getAttribute('data-open-modal'));
    });
  });

  closeToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      closeModals();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    closeModals();
  });
}

export function openModal(targetString) {
  const targetModal = document.querySelector(`[data-modal="${targetString}"]`);
  if (isModalOpen === true || !targetModal) {
    return;
  }
  targetModal.classList.remove('hidden');
  trapFocus(targetModal);
  scrollLockOpen();
  isModalOpen = true;
  checkVideo(targetModal, true);
}

export function closeModals() {
  if (isModalOpen === false) {
    return;
  }
  const modals = document.querySelectorAll('[data-modal]');
  modals.forEach((modal) => {
    modal.classList.add('hidden');
    removeTrapFocus(modal);
    checkVideo(modal, false);
  });
  scrollLockClose();
  isModalOpen = false;

  const activeModalTrigger = document.querySelector('[data-active-modal-trigger]');

  activeModalTrigger.focus();
  activeModalTrigger.removeAttribute('data-active-modal-trigger');
}

function checkVideo(modal, play) {
  if (!modal.hasAttribute('data-autoplay-video')) {
    return;
  }
  const videos = modal.querySelectorAll('video');

  if (play === true) {
    videos.forEach((video, index) => {
      video.currentTime = 0;
      if (index !== 0) {
        return;
      }

      if (video.hasAttribute('data-mobile-video') && window.innerWidth >= 1025) {
        return;
      }

      if (video.hasAttribute('data-desktop-video') && window.innerWidth < 1025) {
        return;
      }

      video.play();
    });
  } else {
    videos.forEach((video) => {
      video.pause();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initModals();
});
