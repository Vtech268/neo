<template>
   <div class="row mt-4">
      <div class="col-12 text-center">
         <h2 class="main-title mb-3">Frequently Asked Questions</h2>
         <p class="section-subtitle">
            Find answers to common questions about our service. If you can't find your answer here, feel free to contact
            us.
         </p>
      </div>

      <div class="col-12 col-md-10 mx-auto">
         <div v-if="faqItems.length === 0" class="alert alert-info">
            No frequently asked questions are available at the moment.
         </div>

         <div v-else class="accordion" id="faqAccordion">
            <div v-for="(item, index) in faqItems" :key="index" class="accordion-item">
               <h2 class="accordion-header" :id="`heading-${index}`">
                  <button class="accordion-button" :class="{ 'collapsed': activeIndex !== index }" type="button"
                     @click="toggleAccordion(index)" :aria-expanded="activeIndex === index"
                     :aria-controls="`collapse-${index}`">
                     {{ item.question }}
                  </button>
               </h2>

               <transition name="accordion-slide" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
                  <div v-show="activeIndex === index" :id="`collapse-${index}`" class="accordion-collapse"
                     :aria-labelledby="`heading-${index}`">

                     <div class="accordion-body" v-html="item.answer"></div>
                  </div>
               </transition>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(null)

const toggleAccordion = (index) => {
   activeIndex.value = activeIndex.value === index ? null : index
}

const onEnter = (el) => {
   el.style.height = '0'
   el.offsetHeight
   el.style.height = el.scrollHeight + 'px'
}

const onAfterEnter = (el) => {
   el.style.height = 'auto'
}

const onLeave = (el) => {
   el.style.height = el.scrollHeight + 'px'
   el.offsetHeight
   el.style.height = '0'
}

const faqItems = ref([
   {
      question: "What is a WhatsApp API Gateway?",
      answer: "A WhatsApp API Gateway is a service that allows you to programmatically send and receive WhatsApp messages through your own number. It acts as a bridge between your application and the WhatsApp network, enabling automated notifications, customer support bots, and much more."
   },
   {
      question: "Is this service official from WhatsApp?",
      answer: "No, this is an unofficial gateway that uses web automation to connect to your WhatsApp account. It is intended for personal projects, small businesses, and developers who need a simple way to integrate WhatsApp messaging without going through the complex setup of the official WhatsApp Business API."
   },
   {
      question: "How do I connect my number?",
      answer: "You can connect your number in two ways from the login or terminal page: <br>1. <strong>Scan QR Code:</strong> A QR code will be displayed, which you can scan using the 'Linked Devices' option in your WhatsApp application. <br>2. <strong>Pairing Code:</strong> An 8-character code will be generated. You need to enter this code in the 'Linked Devices' section of your WhatsApp application by selecting 'Link with phone number'."
   },
   {
      question: "Is it safe to use this service?",
      answer: "The connection is established directly from the server to WhatsApp. We do not store your messages. However, since this is an unofficial service, there is always a minimal risk associated with using it. We recommend using a number that is not your primary personal number for critical applications."
   },
   {
      question: "Can I get banned by WhatsApp?",
      answer: "The risk of being banned is very low if you use the service for normal communication and do not engage in spamming (sending a large number of unsolicited messages). Avoid sending messages to unknown contacts in bulk. The system is designed to mimic normal user behavior to minimize risk."
   },
   {
      question: "Does this support n8n automation?",
      answer: "Yes, absolutely. The gateway is designed for automation platforms like n8n. Integration is straightforward because a form to input your webhook URL has been provided. Simply set up an n8n workflow with a 'Webhook' trigger node, copy its URL, and paste it into the webhook form on our platform to start receiving events."
   }
])
</script>

<style scoped>
.accordion-slide-enter-active,
.accordion-slide-leave-active {
   transition: height 0.35s ease-in-out;
   overflow: hidden;
}
</style>