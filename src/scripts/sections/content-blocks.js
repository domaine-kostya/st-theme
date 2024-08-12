import '@/styles/sections/content-blocks.scss';

import { isScriptLoaded, markScriptLoaded } from '@/scripts/core/loaded';

const SECTION_NAME = 'content-blocks';

const contentBlocksInit = () => {
  const contentBlockVideos = document.querySelectorAll('[data-content-block-video]');
  const contentBlockIframes = document.querySelectorAll('[data-content-block-iframe]');

  if (!contentBlockVideos.length && !contentBlockIframes.length) {
    return;
  }

  contentBlockVideos.forEach((contentBlockVideo) => {
    const videoPlayButton = contentBlockVideo
      .closest('[data-content-block]')
      .querySelector('[data-content-block-video-play]');
    const videoTopPosition = contentBlockVideo.getBoundingClientRect().top;
    let videoHasBeenPlayedOnce = false;

    window.addEventListener('scroll', () => {
      if (window.scrollY < videoTopPosition - 500 || videoHasBeenPlayedOnce === true) {
        return;
      }

      contentBlockVideo.play();
      videoHasBeenPlayedOnce = true;

      setTimeout(() => {
        contentBlockVideo.pause();
        contentBlockVideo.classList.add('d-none');
        videoPlayButton.classList.add('active');
      }, 5000);
    });
  });

  contentBlockIframes.forEach((contentBlockIframe) => {
    const videoPlayButton = contentBlockIframe
      .closest('[data-content-block]')
      .querySelector('[data-content-block-video-play]');
    const iframeTopPosition = contentBlockIframe.getBoundingClientRect().top;
    let iframeHasBeenPlayedOnce = false;

    window.addEventListener('scroll', () => {
      if (window.scrollY < iframeTopPosition - 500 || iframeHasBeenPlayedOnce === true) {
        return;
      }

      const autoPlaySrc = contentBlockIframe.getAttribute('data-autoplay-src');
      const originalSrc = contentBlockIframe.getAttribute('data-original-src');

      contentBlockIframe.setAttribute('src', autoPlaySrc);
      iframeHasBeenPlayedOnce = true;

      setTimeout(() => {
        contentBlockIframe.setAttribute('src', originalSrc);
        contentBlockIframe.classList.add('d-none');
        videoPlayButton.classList.add('active');
      }, 10000);
    });
  });
};

const run = () => {
  contentBlocksInit();
};

// Ensure section JS only runs once
if (!isScriptLoaded(SECTION_NAME)) {
  document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);

  markScriptLoaded(SECTION_NAME);
}
