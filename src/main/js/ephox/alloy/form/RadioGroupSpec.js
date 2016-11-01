define(
  'ephox.alloy.form.RadioGroupSpec',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Checked',
    'ephox.sugar.api.SelectorFind'
  ],

  function (SystemEvents, EventHandler, Tagger, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Id, Merger, Option, Attr, Checked, SelectorFind) {
    /*
     <fieldset>
       <legend>Border</legend>
       <input type="radio" id="tableborder1_6461071156781477979401488" value="1" name="_6461071156781477979401488">
       <label for="tableborder1_6461071156781477979401488">On</label>
       <input type="radio" id="tableborder0_6461071156781477979401488" value="0" name="_6461071156781477979401488">
       <label for="tableborder0_6461071156781477979401488">Off</label>
     </fieldset>
     */

    var schema = [
      FieldSchema.option('uid'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.strict('label'),
      FieldSchema.strict('candidates'),
      FieldSchema.option('selectedValue'),
  
      FieldSchema.strict('name'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'legend'
      ])
    );


    // '<alloy.form.field-input>': UiSubstitutes.single(
    //       info.parts().field()
    //     ),
    //     '<alloy.form.field-label>': UiSubstitutes.single(
    //       Merger.deepMerge(

    var builder = function (info) {
      var name = info.name();

      var placeholders = {
        '<alloy.form.radio-fields>': UiSubstitutes.multiple(
          Arr.bind(info.candidates(), function (candidate, i) {
            return [
              {
                uiType: 'custom',
                dom: {
                  tag: 'input',
                  attributes: {
                    name: name,
                    type: 'radio',
                    value: candidate.value
                  }
                },
                focusing: true,
                events: Objects.wrap(
                  SystemEvents.execute(),
                  EventHandler.nu({
                    run: function (radio) {
                      Checked.set(radio.element(), true);
                    }
                  })
                ) 
              },
              {
                uiType: 'custom',
                dom: {
                  tag: 'label',
                  innerHtml: candidate.text
                }
              }
            ];
          })
        ),
        '<alloy.form.field-legend>': UiSubstitutes.single(
          {
            uiType: 'custom',
            dom: {
              tag: 'legend',
              innerHtml: info.label()
            }
          }
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('radio-group'),
        info,
        info.components(),
        placeholders,
        { }
      );

      return {
        uiType: 'custom',
        keying: {
          mode: 'flow',
          selector: 'input[type="radio"]',
          executeOnMove: true,
          getInitial: function (comp) {
            return Checked.find(comp.element());
          }
        },
        representing: {
          query: function (comp) {

            // Don't really want to return an Option. Hmm.
            return Checked.find(comp.element()).map(function (radio) {
              return Attr.get(radio, 'value');
            });
          },
          set: function (group, value) {
            SelectorFind.descendant(group.element(), '[value="' + value + '"]').each(function (item) {
              Checked.set(item, true);
            });
          }
        },
        events: Objects.wrap(
          SystemEvents.systemInit(),
          EventHandler.nu({
            run: function (group) {
              info.selectedValue().orThunk(function () {
                return SelectorFind.descendant(group.element(), 'input[value]').map(function (first) {
                  return Attr.get(first, 'value');
                });
              }).each(function (val) {
                group.apis().setValue(val);
              });
            }
          })
        ),
        tabstopping: true,
        uid: info.uid().getOr(Tagger.generate('')),
        dom: info.dom(),
        components: components
      };
    };

    return schema;
  }
);