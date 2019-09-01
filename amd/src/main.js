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
                triggerModal: '#triggerModalIndicator', // Hidden btn for popup initialisation.
                modalContent: '#modalContentIndicator', // Modal block.
                courseContent: '.course-content', // Course content block.
                modalTitle: '.modal-title', // Modal title block.
                modalBody: '.modal-body' // Modal body.
            };

            var TEMPLATE = {
                modalWrapper: 'format_mytopcoll/modalwrapper',
                modalcontent: 'format_mytopcoll/modalcontent',
                modchooser: 'format_mytopcoll/modchooser',
            };

            var KEYCODE = {
                enter: 13,
                escape: 27
            };

            var strings = Str.get_strings([
                {key: 'modchoose', component: 'format_mytopcoll'},
                {key: 'newindicator', component: 'format_mytopcoll'},
            ]);

            var courseContent = document.querySelector(SELECTORS.courseContent),
                indicationWrapper = courseContent.querySelector(SELECTORS.indicator),
                triggerModal = courseContent.querySelector(SELECTORS.triggerModal),
                modalContent = courseContent.querySelector(SELECTORS.modalContent);

            indicationWrapper.addEventListener('click', function(e) {
                var target = e.target;
                while (!target.contains(indicationWrapper)) {
                  if (target.dataset.handler === 'indicator') {
                      cloneNodesToModal(target);
                      return;
                  }

                  if (target.dataset.handler === 'requestremoveindicator') {
                      removeIndicator(target);
                      return;
                  }

                  if (target.dataset.handler === 'geteditindicator') {
                      getIndicatorData(target);
                      return;
                  }

                  if (target.dataset.handler === 'seteditindicator') {
                      setEditIndicator();
                      return;
                  }

                  if (target.dataset.handler === 'addindicator') {
                      addIndicator();
                      return;
                  }

                  target = target.parentNode;
                }
            });

            indicationWrapper.addEventListener('keypress', function(e) {
              var target = e.target;
              if (target.dataset.handler === 'indicatornamedit') {
                  inplaceditable(e);
                  return;
              }
            });

            /**
             * Finding cloning and adding to the modal all the requested activity
             *
             * @param {node} target
             */
            function cloneNodesToModal(target) {
                var types = JSON.parse(target.dataset.indicator),
                    acitivityWrapper = document.createElement('ul');

                var context = {
                        modaltitle: target.dataset.name
                    };

                Templates.render(TEMPLATE.modalcontent, context)
                  .done(function(html, js) {
                      Templates.replaceNodeContents(modalContent, html, js);
                      courseContent.querySelector(SELECTORS.modalBody).innerHTML = '';
                      types.forEach(function(type) {
                          var activities = courseContent.querySelectorAll('li.activity.' + type);
                          activities.forEach(function(activity) {
                              acitivityWrapper.appendChild(activity.cloneNode(true));
                          });
                      });
                      courseContent.querySelector(SELECTORS.modalBody).appendChild(acitivityWrapper);
                      triggerModal.click();
                  })
                  .fail(Notification.exception);
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
            function getIndicatorData(target) {
              target = target.parentNode;
              Ajax.call([{
                  methodname: 'format_mytopcoll_get_edit_indicator',
                  args: {
                      courseid: Number(indicationWrapper.dataset.courseid),
                      indicatorid: Number(target.dataset.id) || 0,
                  },
                  done: function(responce) {
                    var context = JSON.parse(responce);
                    strings.done(function(string) {
                      context.modaltitle = string[0];
                      context.indicatorname = target.dataset.name || string[1];
                      context.addnewindicator = target.dataset.id ? 0 : 1;
                    });
                    Templates.render(TEMPLATE.modchooser, context)
                      .done(function(html, js) {
                          Templates.replaceNodeContents(modalContent, html, js);
                          triggerModal.click();
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
                      courseid: Number(indicationWrapper.dataset.courseid),
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

            /**
             * Update indicator name
             *
             * @param {event} e
             */
            function inplaceditable(e) {

              var indicatorInput = document.querySelector('#indicatornamedit'),
                  indicatorSrcName = document.querySelector('#indicatorname .srcname'),
                  indicatorOldName = document.querySelector('#indicatorname'),
                  indicatorid = document.querySelector('#indchooserform').dataset.indicatorid,
                  indicator = indicationWrapper.querySelector('div[data-id="' + indicatorid + '"] .indicator_name');

              if (e.type === 'keypress' && e.keyCode === KEYCODE.enter) {

                  Ajax.call([{
                      methodname: 'format_mytopcoll_update_indicator_name',
                      args: {
                          indicatorid: Number(indicatorid),
                          indicatorname: indicatorInput.value
                      },
                      done: function(responce) {
                          if (responce) {
                              indicatorSrcName.innerHTML = indicatorInput.value;
                              indicator.innerHTML = indicatorInput.value;
                              indicatorOldName.classList.remove('d-none');
                              indicatorInput.classList.add('d-none');
                          } else {
                              Notification.exception();
                          }
                      },
                      fail: Notification.exception
                  }]);

              } else if (e.type === 'keypress' && e.keyCode === KEYCODE.escape) {
                  indicatorOldName.classList.remove('d-none');
                  indicatorInput.classList.add('d-none');
                  return;
              }
            }

            /**
             * Add new indicator
             *
             */
            function addIndicator() {
                var form = courseContent.querySelector('#indchooserform'),
                    addIndicator = document.querySelector('.addIndicator'),
                    activityTypes = [],
                    checkedBoxes = Array.from(form.querySelectorAll('input[type=checkbox]:checked')),
                    name = indicationWrapper.querySelector('#indicatornamedit').value;

                checkedBoxes.forEach(function(item) {
                    activityTypes.push(item.dataset.type);
                });
                var data = {
                  types: activityTypes,
                  name: name
                };

                Ajax.call([{
                    methodname: 'format_mytopcoll_set_edit_indicator',
                    args: {
                        courseid: Number(indicationWrapper.dataset.courseid),
                        indicatorid: Number(0),
                        data: JSON.stringify(data)
                    },
                    done: function(responce) {
                        if (responce) {
                            var indicator = document.querySelector('.ind_item'),
                                newIndicator = indicator.cloneNode(true);
                            newIndicator.querySelector('.indicator_name').innerHTML = name;
                            newIndicator.dataset.id = responce;
                            newIndicator.dataset.name = name;
                            newIndicator.dataset.indicator = data;
                            indicationWrapper.insertBefore(newIndicator, addIndicator);
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
