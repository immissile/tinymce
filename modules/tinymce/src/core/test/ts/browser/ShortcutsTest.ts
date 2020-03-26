import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.ShortcutsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('Shortcuts formats', function (editor) {
    const assertShortcut = function (shortcut: string, args, assertState: boolean) {
      let called = false;

      editor.shortcuts.add(shortcut, '', function () {
        called = true;
      });

      args = Tools.extend({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false
      }, args);

      editor.fire('keydown', args);

      if (assertState) {
        LegacyUnit.equal(called, true, 'Shortcut wasn\'t called: ' + shortcut);
      } else {
        LegacyUnit.equal(called, false, 'Shortcut was called when it shouldn\'t have been: ' + shortcut);
      }
    };

    assertShortcut('ctrl+d', { ctrlKey: true, keyCode: 68 }, true);
    assertShortcut('ctrl+d', { altKey: true, keyCode: 68 }, false);

    if (Env.mac) {
      assertShortcut('meta+d', { metaKey: true, keyCode: 68 }, true);
      assertShortcut('access+d', { ctrlKey: true, altKey: true, keyCode: 68 }, true);
      assertShortcut('meta+d', { ctrlKey: true, keyCode: 68 }, false);
      assertShortcut('access+d', { shiftKey: true, altKey: true, keyCode: 68 }, false);
    } else {
      assertShortcut('meta+d', { ctrlKey: true, keyCode: 68 }, true);
      assertShortcut('access+d', { shiftKey: true, altKey: true, keyCode: 68 }, true);
      assertShortcut('meta+d', { metaKey: true, keyCode: 68 }, false);
      assertShortcut('access+d', { ctrlKey: true, altKey: true, keyCode: 68 }, false);
    }

    assertShortcut('ctrl+shift+d', { ctrlKey: true, shiftKey: true, keyCode: 68 }, true);
    assertShortcut('ctrl+shift+alt+d', { ctrlKey: true, shiftKey: true, altKey: true, keyCode: 68 }, true);
    assertShortcut('ctrl+221', { ctrlKey: true, keyCode: 221 }, true);

    assertShortcut('f1', { keyCode: 112 }, true);
    assertShortcut('f2', { keyCode: 113 }, true);
    assertShortcut('f3', { keyCode: 114 }, true);
    assertShortcut('f4', { keyCode: 115 }, true);
    assertShortcut('f5', { keyCode: 116 }, true);
    assertShortcut('f6', { keyCode: 117 }, true);
    assertShortcut('f7', { keyCode: 118 }, true);
    assertShortcut('f8', { keyCode: 119 }, true);
    assertShortcut('f9', { keyCode: 120 }, true);
    assertShortcut('f10', { keyCode: 121 }, true);
    assertShortcut('f11', { keyCode: 122 }, true);
    assertShortcut('f12', { keyCode: 123 }, true);
  });

  suite.test('Remove', function (editor) {
    const testPattern = (pattern: string, keyCode: number, ctrlKey = false) => {
      let called = false;

      const eventArgs = () => ({
        ctrlKey,
        keyCode,
        altKey: false,
        shiftKey: false,
        metaKey: false
      });

      editor.shortcuts.add(pattern, '', function () {
        called = true;
      });

      editor.fire('keydown', eventArgs());
      LegacyUnit.equal(called, true, 'Shortcut wasn\'t called when it should have been.');

      called = false;
      editor.shortcuts.remove(pattern);
      editor.fire('keydown', eventArgs());
      LegacyUnit.equal(called, false, 'Shortcut was called when it shouldn\'t.');
    };

    testPattern('ctrl+d', 68, true);
    testPattern('ctrl+F2', 113, true);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
