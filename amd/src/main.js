/* jshint ignore:start */
define([
  'core/log',
  'core/ajax',
  'core/notification',
  'core/templates',
  'core/str'
], function(log, Ajax, Notification, Templates, Str) {

    return {
        init: function() {
            // Debugger;
            log.debug('Indicator AMD load src/main');

            var SELECTORS = {
                indicator: '.indicator_wrap', // Indicator block.
                initBtn: '#initBtnIndicator', // Hidden btn for popup initialisation.
                modalContent: '#modalContentIndicator', // Modal block.
                courseContent: '.course-content', // Course content block.
                modalTitle: '.modal-title' // Modal title block.
            };

            var strings = Str.get_strings([
              {key: 'modchoose', component: 'format_mytopcoll'},
            ]);

            var courseContent = document.querySelector(SELECTORS.courseContent),
                indicationWrapper = courseContent.querySelector(SELECTORS.indicator),
                initBtn = courseContent.querySelector(SELECTORS.initBtn),
                modalContent = courseContent.querySelector(SELECTORS.modalContent),
                modalTitle = courseContent.querySelector(SELECTORS.modalTitle);

            indicationWrapper.addEventListener('click', function(e) {
                var target = e.target;
                while (!target.contains(indicationWrapper)) {
                  if (target.dataset.handler === 'indicator') {
                      cloneNodesToPopup(target);
                      return;
                  }

                  if (target.dataset.handler === 'requestremoveindicator') {
                      removeIndicator(target);
                      return;
                  }

                  if (target.dataset.handler === 'geteditindicator') {
                      getEditIndicator(target);
                      return;
                  }

                  if (target.dataset.handler === 'seteditindicator') {
                      setEditIndicator();
                      return;
                  }
                  target = target.parentNode;
                }
            });


            /**
             * Finding cloning and adding to the modal all the requested activity
             *
             * @param {node} target
             */
            function cloneNodesToPopup(target) {
                var types = JSON.parse(target.dataset.indicator);
                modalContent.innerHTML = '';

                types.forEach(function(type) {
                    modalTitle.innerHTML = target.innerHTML;
                    var activities = courseContent.querySelectorAll('li.activity.' + type);
                    activities.forEach(function(activity) {
                        modalContent.appendChild(activity.cloneNode(true));
                    });
                });

                initBtn.click();
            }

            /**
             * Remove current indicator
             *
             * @param {node} target
             */
            function removeIndicator(target) {
              while (!target.classList.contains('ind_item')) {
                target = target.parentNode;
              }
              Ajax.call([{
                  methodname: 'format_mytopcoll_delete_indicator',
                  args: {
                      indicatorid: Number(target.dataset.id),
                  },
                  done: function(result) {
                      if (result) {
                          var indicator = document.querySelector(".ind_item[data-id='" + target.dataset.id + "']");
                          indicator.remove();
                      } else {
                          Notification.exception();
                      }
                  },
                  fail: Notification.exception
              }]);
            }

            /**
             * Edit current indicator
             *
             * @param {node} target
             */
            function getEditIndicator(target) {
              while (!target.classList.contains('ind_item')) {
                target = target.parentNode;
              }
              Ajax.call([{
                  methodname: 'format_mytopcoll_get_edit_indicator',
                  args: {
                      courseid: Number(indicationWrapper.dataset.courseid),
                      indicatorid: Number(target.dataset.id),
                  },
                  done: function(responce) {
                    var templateName = 'format_mytopcoll/modchooser',
                        context = JSON.parse(responce),
                        element = modalContent;
                    Templates.render(templateName, context)
                      .done(function(html, js) {
                          Templates.replaceNodeContents(element, html, js);
                          strings.done(function(string) {
                            modalTitle.innerHTML = string[0];
                          });
                          initBtn.click();
                      })
                      .fail(Notification.exception);
                  },
                  fail: Notification.exception
              }]);
            }

            /**
             * Edit current indicator
             *
             * @param {node} target
             */
            function setEditIndicator() {
              var form = courseContent.querySelector('#indchooserform'),
                  data = [],
                  indicatorid = form.dataset.indicatorid,
                  checkedBoxes = Array.from(form.querySelectorAll('input[type=checkbox]:checked'));
              checkedBoxes.forEach(function(item) {
                  data.push(item.dataset.type);
              });
              Ajax.call([{
                  methodname: 'format_mytopcoll_set_edit_indicator',
                  args: {
                      indicatorid: Number(indicatorid),
                      data: JSON.stringify(data)
                  },
                  done: function(responce) {
                      if (responce) {
                          var indicator = indicationWrapper.querySelector('div[data-id="' + indicatorid + '"]');
                          indicator.dataset.indicator = JSON.stringify(data);
                      } else {
                          Notification.exception();
                      }
                  },
                  fail: Notification.exception
              }]);
            }

        }
    };
});
