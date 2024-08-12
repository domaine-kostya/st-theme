import '@/styles/sections/article.scss';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [].slice.call(scope.querySelectorAll(selector));
const shareButtons = $$('[data-article-sharing-button]');
const HIDDEN_CLASS = 'hide';

shareButtons.forEach(button => {
  button.addEventListener('click', e => {
    const { target } = e;
    const { dataset, parentElement } = target;
    const { type, link } = dataset;
    if (type === 'link') {
      const shareLink = $('[data-article-sharing-link]', parentElement);
      const successMessage = $('[data-article-sharing-success]', parentElement);
      shareLink.classList.remove(HIDDEN_CLASS);
      shareLink.select();
      shareLink.setSelectionRange(0, 99999);
      shareLink.classList.add(HIDDEN_CLASS);
      navigator.clipboard.writeText(shareLink.value);
      successMessage.classList.remove(HIDDEN_CLASS);
      setTimeout(() => successMessage.classList.add(HIDDEN_CLASS), 2000);
    } else {
      const { innerWidth, innerHeight } = window;
      const width = (innerWidth >= 1000 ? 0.5 : 0.8) * innerWidth;
      const height = width * innerHeight / innerWidth;
      window.open(link, '_blank', `width=${width},height=${height},top=${(innerHeight - height) / 2},left=${(innerWidth - width) / 2}`);
    }
  });
});
