/* jshint ignore:start */
define([
  'jquery',
  'core/log',
  'core/ajax',
  'core/notification',
  'core/templates',
  'core/str'
], function($, log, Ajax, Notification, Templates, Str) {

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
                {key: 'new', component: 'format_mytopcoll'},
            ]);

            var courseContent = document.querySelector(SELECTORS.courseContent),
                indicationWrapper = courseContent.querySelector(SELECTORS.indicator),
                triggerModal = courseContent.querySelector(SELECTORS.triggerModal),
                modalContent = courseContent.querySelector(SELECTORS.modalContent);

            indicationWrapper.addEventListener('click', function(e) {
                var target = e.target;
                while (indicationWrapper.contains(target)) {
                  switch (target.dataset.handler) {
                    case 'indicator':
                        cloneNodesToModal(target);
                        break;
                    case 'requestremoveindicator':
                        removeIndicator(target);
                        break;
                    case 'geteditindicator':
                        getIndicatorData(target);
                        break;
                    case 'seteditindicator':
                        setEditIndicator(target);
                        break;
                    case 'addindicator':
                        addIndicator(target);
                        break;
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
              var indicatorid = target.parentNode.dataset.id;
              Ajax.call([{
                  methodname: 'format_mytopcoll_delete_indicator',
                  args: {
                      indicatorid: Number(indicatorid),
                  },
                  done: function(result) {
                      if (result) {
                          var indicator = $(".ind_item[data-id='" + indicatorid + "']");
                          indicator.parent().remove();
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
              target = target.previousSibling.previousSibling.previousSibling;
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
                          indicator.querySelector('.indicator_new').innerHTML = data.hasnewactivity;
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
                var indicator = document.querySelector('.indicator'),
                    addIndicator = document.querySelector('.addIndicator'),
                    newIndicator = indicator.cloneNode(true);
                newIndicator.querySelector('.indicator_name').innerHTML = data.name;
                newIndicator.querySelector('.indicator_counter').innerHTML = data.count;
                newIndicator.querySelector('.indicator_new').innerHTML = data.hasnewactivity;
                newIndicator.querySelector('.dropdown-menu').dataset.id = data.id;
                var inditem = newIndicator.querySelector('.ind_item');
                inditem.dataset.id = data.id;
                inditem.dataset.name = data.name;
                inditem.dataset.indicator = data.types;
                inditem.dataset.count = data.count;
                indicationWrapper.insertBefore(newIndicator, addIndicator);
            }

        }
      };
});
