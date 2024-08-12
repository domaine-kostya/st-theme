// Import CSS
import '@/styles/sections/login.scss';

function onShowHidePasswordForm(event) {
  event.preventDefault();
  toggleRecoverPasswordForm();
}

function checkUrlHash() {
  const { hash } = window.location;

  if (hash === '#recover') {
    toggleRecoverPasswordForm();
  }
}

function toggleRecoverPasswordForm() {
  document.querySelector('[data-recover-password-form]').classList.toggle('hide');
  document.querySelector('[data-customer-login-form]').classList.toggle('hide');
}

function recoverPasswordSuccess() {
  const formState = document.querySelector('[data-recover-password-success]');

  if (!formState) {
    return;
  }

  document.querySelector('[data-recover-password-success-message]').classList.remove('hide');
}

export function togglePasswordText() {
  const passwordTextToggle = document.querySelector('[data-account-form-password-toggle]');

  if (!passwordTextToggle) {
    return;
  }

  passwordTextToggle.addEventListener('click', () => {
    passwordTextToggle.classList.toggle('active');

    const parentWrapper = passwordTextToggle.closest('[data-account-form-password-wrapper]');

    if (!parentWrapper) {
      return;
    }

    const passwordInput = parentWrapper.querySelector('input');

    if (!passwordInput) {
      return;
    }

    if (passwordTextToggle.classList.contains('active')) {
      passwordInput.setAttribute('type', 'text');
    } else {
      passwordInput.setAttribute('type', 'password');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const recoverPassword = document.querySelector('[data-show-recover-password]');
  const hideRecoverPasswordLink = document.querySelector('[data-hide-recover-password]');

  togglePasswordText();

  if (!recoverPassword) {
    return;
  }

  checkUrlHash();
  recoverPasswordSuccess();

  recoverPassword.addEventListener('click', (event) => {
    onShowHidePasswordForm(event);
  });

  hideRecoverPasswordLink.addEventListener('click', (event) => {
    onShowHidePasswordForm(event);
  });
});
