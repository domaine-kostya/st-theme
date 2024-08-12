/* eslint-disable no-undef */
const initGorgiasChatPromise = window.GorgiasChat
  ? window.GorgiasChat.init()
  : new Promise((resolve) => {
      window.addEventListener('gorgias-widget-loaded', () => {
        resolve();
      });
    });

initGorgiasChatPromise
  .then(() => {
    GorgiasChat.updateTexts({
      requireEmailCaptureIntro: `Hey there! ${window.introMessage}`,
      contactFormIntro: `Hey there! ${window.introMessage}`,
      contactFormSSPUnsuccessfulAskAdditionalMessage: `Hey there! ${window.introMessage}`,
      waitTimeLongNoEmail: `Thank you for your patience. ${window.introMessage}`,
      waitTimeMediumNoEmail: `Thanks for reaching out! Leave us your email and an agent will get back to you in about {waitTime} minutes. ${introMessage}`,
      waitTimeShortNoEmail: `Thanks for reaching out! ${window.introMessage}`,
    });
    GorgiasChat.updateSSPTexts({
      sorryToHearThatEmailRequired: window.introMessage,
    });
  })
  .catch((error) => console.log(error));
