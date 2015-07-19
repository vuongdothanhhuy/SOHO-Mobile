/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
(function () {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = querySelector('main');

  function closeMenu() {
    body.classList.remove('open');
    appbarElement.classList.remove('open');
    navdrawerContainer.classList.remove('open');
  }

  function toggleMenu() {
    body.classList.toggle('open');
    appbarElement.classList.toggle('open');
    navdrawerContainer.classList.toggle('open');
    navdrawerContainer.classList.add('opened');
  }

  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' ||
       window.location.hostname === 'localhost' ||
       window.location.hostname.indexOf('127.') === 0)) {
    navigator.serviceWorker.register('/service-worker.js', {
      scope: './'
    }).then(function(registration) {
      // Check to see if there's an updated version of service-worker.js with
      // new files to cache:
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
      if (typeof registration.update === 'function') {
        registration.update();
      }

      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function () {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function () {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');
            }
          };
        }
      };
    }).catch(function (e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  var IMG_NAT_RESOLUTION = '1024',
      IMG_MODE = {
        EIT_171: 'http://sohowww.nascom.nasa.gov/data/realtime/eit_171/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        EIT_195: 'http://sohowww.nascom.nasa.gov/data/realtime/eit_195/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        EIT_284: 'http://sohowww.nascom.nasa.gov/data/realtime/eit_284/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        EIT_304: 'http://sohowww.nascom.nasa.gov/data/realtime/eit_304/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        SDOHMI_CONTINUUM: 'http://sohowww.nascom.nasa.gov/data/realtime/hmi_igr/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        SDOHMI_MAGNETOGRAM: 'http://sohowww.nascom.nasa.gov/data/realtime/hmi_mag/' + IMG_NAT_RESOLUTION + '/latest.jpg',
        LASCO_C2: 'http://sohowww.nascom.nasa.gov/data/realtime/c2/' + IMG_NAT_RESOLUTION + '/latest.gif',
        LASCO_C3: 'http://sohowww.nascom.nasa.gov/data/realtime/c3/' + IMG_NAT_RESOLUTION + '/latest.gif',
      },
      IMG_NAME = {
        EIT_171: 'EIT 171',
        EIT_195: 'EIT 195',
        EIT_284: 'EIT 284',
        EIT_304: 'EIT 304',
        SDOHMI_CONTINUUM: 'SDO/HMI Continuum',
        SDOHMI_MAGNETOGRAM: 'SDO/HMI Magnetogram',
        LASCO_C2: 'LASCO C2',
        LASCO_C3: 'LASCO C3',
      },
      TIME_REFRESH_IN_SECONDS = 60,
      REFRESH_STR = (function () {
        return '?' + new Date().getTime();
      } ()),
      timer;

  function setTimer() {
    setInterval(changeImg, TIME_REFRESH_IN_SECONDS * 1000);
  }

  function resetTimer() {
    cancelTimer();
    setTimer();
  }

  function cancelTimer() {
    if (timer) {
      clearInterval(timer);
    }
  }

  function resetDate() {
    var updatedAt = document.getElementById('updated-at'),
        updatedAtNewValue = new Date(),
        nextUpdated = document.getElementById('next-refresh'),
        nextUpdatedNewValue = new Date(new Date().setSeconds(TIME_REFRESH_IN_SECONDS));
    updatedAt.innerHTML = updatedAtNewValue;
    nextUpdated.innerHTML = nextUpdatedNewValue;
  }

  function changeImg() {
    var imgTag = document.getElementById('soho-image');
    imgTag.src = imgTag.src + REFRESH_STR;
    resetDate();
  }

  function setHeader(mode) {
    var header = document.getElementById('header');
    header.innerHTML = IMG_NAME[mode] || 'UNKNOWN';
  }

  function setImg(mode) {
    var imgTag = document.getElementById('soho-image');
    imgTag.src = IMG_MODE[mode] || '';
  }

  function setMode(mode) {
    setHeader(mode);
    setImg(mode);
    resetDate();
    resetTimer();
  }

  function eventHooker() {
    var menuItems = document.getElementsByClassName('menu-item-click');
    for (var i = 0, len = menuItems.length; i < len; i++) {
      menuItems[i].addEventListener('click', function () {
        setMode(this.getAttribute('data-value'));
      });
    }
  }

  //call
  resetDate();
  setTimer();
  eventHooker();
})();
