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
                var modtypes = JSON.parse(target.dataset.indicator),
                    acitivityWrapper = document.createElement('ul');

                var context = {
                        modaltitle: target.dataset.name
                    };

                Templates.render(TEMPLATE.modalcontent, context)
                  .done(function(html, js) {
                      Templates.replaceNodeContents(modalContent, html, js);
                      courseContent.querySelector(SELECTORS.modalBody).innerHTML = '';
                      modtypes.forEach(function(modtype) {
                          var activities = courseContent.querySelectorAll('li.activity.' + modtype);
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
                  modTypes = [],
                  indicatorid = form.dataset.indicatorid,
                  checkedBoxes = Array.from(form.querySelectorAll('input[type=checkbox]:checked'));

              checkedBoxes.forEach(function(item) {
                  modTypes.push(item.dataset.type);
              });

              Ajax.call([{
                  methodname: 'format_mytopcoll_set_edit_indicator',
                  args: {
                      courseid: Number(indicationWrapper.dataset.courseid),
                      indicatorid: Number(indicatorid),
                      data: JSON.stringify({modtypes: modTypes})
                  },
                  done: function(responce) {
                      if (responce) {
                          var data = JSON.parse(responce);
                          var indicator = indicationWrapper.querySelector('div[data-id="' + indicatorid + '"]');
                          indicator.dataset.indicator = data.types;
                          indicator.dataset.count = data.count;
                          indicator.querySelector('.indicator_counter').innerHTML = data.count;
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
                    modTypes = [],
                    checkedBoxes = Array.from(form.querySelectorAll('input[type=checkbox]:checked')),
                    name = indicationWrapper.querySelector('#indicatornamedit').value;

                checkedBoxes.forEach(function(item) {
                    modTypes.push(item.dataset.type);
                });
                var data = {
                  modtypes: modTypes,
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
                            var data = JSON.parse(responce);
                            makeNewIndicator(data);
                        } else {
                            Notification.exception();
                        }
                    },
                    fail: Notification.exception
                }]);
            }

            /**
             * Add new node indicator with updated data
             * @param {object} data
             */
            function makeNewIndicator(data) {
                var indicator = document.querySelector('.ind_item'),
                    addIndicator = document.querySelector('.addIndicator'),
                    newIndicator = indicator.cloneNode(true);
                newIndicator.querySelector('.indicator_name').innerHTML = data.name;
                newIndicator.querySelector('.indicator_counter').innerHTML = data.count;
                newIndicator.querySelector('.indicator_new').innerHTML = data.hasnewactivity;
                newIndicator.dataset.id = data.id;
                newIndicator.dataset.name = data.name;
                newIndicator.dataset.indicator = data.types;
                newIndicator.dataset.count = data.count;
                indicationWrapper.insertBefore(newIndicator, addIndicator);
            }

            /**
             * Update count indicator
             * @param {string} count
             */
            function updateCount(count) {
              var counter = 0;
              types.forEach(function(type) {
                  counter += Array.from(courseContent.querySelectorAll('li.activity.' + type));
              });
              return counter;
            }

        }
      };
});
