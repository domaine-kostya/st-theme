(function () {
  const checkouts = document.getElementsByClassName('order-summary__section--discount')
  const checkout = checkouts[checkouts.length - 1]

  const idme = `<div class="idme">
    <div class="idme-shopify">
      <p class='idme-btn-affinity'>Medical Providers, Military, Nurses, First Responders, and Teachers receive a discount</p>
      <a class="idme-btn-unify" href="https://discountify.id.me/oauth/checkpoint/southerntidellc" >
        <img src="https://s3.amazonaws.com/idme/developer/idme-buttons/assets/img/verify.svg" alt="ID.me" style="height:42px"/>
      </a>
    </div>
  </div>`

  checkout && checkout.insertAdjacentHTML('afterend', idme)
})()
