/*
  Класс App(lication)
*/

class App {
  // global application props
  versionInfo={};

  // the Constructor
  constructor() {
    this.initGlobals();
    this.loadVersionInfo();
    this.initToolbar();
    this.initEvents();
  }

  /*
    Инициализация глобальных данных
  */
  initGlobals() {
    ///
  }

  /*
    Грузим информацию о продукте из VersionInfo.json
  */
  loadVersionInfo() {
    fetch('VersionInfo.json')
      .then((response) => {
        if (response.ok)
          return response.json();

        return Promise.reject(`Ошибка загрузки VersionInfo.json: ${response.status} ${response.statusText}`);
      })
      .then((json) => {
        this.versionInfo=json;
        document.title=json.PID;
      })
      .catch((error) => {
        console.error(error);
        dlgCtrl.showDlg('error',error,_ERROR);
      });
  }

  /*
    Загрузка и инициализация модуля главного талбара
  */
  initToolbar() {
    toolbarCtrl.loadToolbar(
      'mainToolbar',
      {
        oCss: {href: 'css/MainToolbar.css'},
        oHtml: {url: 'html/MainToolbar.html'},
        oJs: {src: 'js/MainToolbar.js'}
      },
      'mainToolbar');
  }

  /*
    Инициализация событий
  */
  initEvents() {
    this.#bindHandler('btn-clear-css','click',this.btnClearClick);
    this.#bindHandler('btn-clear-html','click',this.btnClearClick);
    this.#bindHandler(document,'keydown',this.documentKeydown);
  }

  /*
    Привязывает обработчик evHandler события evType к элементу el
  */
  #bindHandler(el,evType,evHandler) {
    if (typeof el ==='string') el=document.getElementById(el);

    if (typeof el !=='object')
      dlgCtrl.showDlg('error','Couldn\'t bind event handler to '+el,_ERROR);
    else
      el.addEventListener(evType,evHandler.bind(this));
  }

  /*
    Перехват keydown для всего document
  */
  documentKeydown(ev) {
    if ((ev.keyCode ==9 && !ev.shiftKey) && (ev.target.id ==='code-css' || ev.target.id ==='code-html')) {
      ev.preventDefault();
      replaceSelection(ev.target,'  ',false);
      return false;
    }
  }

  /*
    Кнопка [About]
  */
  btnAboutClick(ev) {
    ev.preventDefault();

    dlgCtrl.showDlg(
      'info',
      `<p style='margin: 7px 17px;'><b style='font-size: 18px;'>`+
      `${app.versionInfo.PID}</b><br>${app.versionInfo.DESCR}<br>`+
      `Version ${app.versionInfo.VID}<br>${app.versionInfo.CID}</p>`,
      'About...'
    );
  }

  /*
    Кнопка [Help]
  */
  btnHelpClick(ev) {
    dlgCtrl.showDlg('info','<b>Not implemented yet.</b>',_INFO);
  }

  /*
    Кнопки [Clear] для css и html
  */
  btnClearClick(ev) {
    var
      el=ev.target;

    ev.preventDefault();

    if (ev.target.nodeName =='IMG') el=el.parentNode;

    switch (el.id.split('-').slice(-1)[0]) {
      case 'css':
        this.clearCssCode();
        break;
      case 'html':
        this.clearHtmlCode();
        break;
      default: console.warn('Unknown button clicked!',ev);
    }
  }

  /*
    Кнопка [Clear all]
  */
  btnClearAllClick(ev) {
    ev.preventDefault();

    this.clearCssCode();
    this.clearHtmlCode();
  }

  /*
    Удаляем код из code-css
  */
  clearCssCode() {
    $('#code-css').val('');
  }

  /*
    Удаляем код из code-html
  */
  clearHtmlCode() {
    $('#code-html').val('');
  }

  /*
    Кнопка [Test]
  */
  btnTestClick(ev) {
    ev.preventDefault();

    if (!this.checkFormData(false)) return;

    $('#test-css').text($('#code-css').val());
    $('#test-html').html($('#code-html').val());
  }

  /*
    Кнопка [Save]
  */
  btnSaveClick(ev) {
    ev.preventDefault();

    if (!this.checkFormData(true)) return;

    const
      formData=new FormData(document.forms.mainForm);

    formData.append('op','sv');
    formData.append('ed-filename',$('#ed-filename').val());

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'post',
      dataType: 'json',
      ////data: $('#mainForm').serialize(),
      processData: false,  // this and
      contentType: false,  // this - wtf?
      data: formData,
      error: this.ajaxError,
      success: this.saveSuccess
    });
  }

  /*
    Фатальная ошибка ajax
  */
  ajaxError(xhr,txtStatus,errThrown) {
    var
      s='Fatal error: ';

    switch (xhr.status) {
      case 0: s+='Not connected. Verify Network.';
        break;
      case 404: s+='404 - Requested URL not found.';
        break;
      case 500: s+='500 - Internal server error.';
        break;
      default:
        s+=`${xhr.status} - ${xhr.responseText}`;
    }

    console.error(s);
    dlgCtrl.showDlg('error',s,_ERROR);
  }

  /*
    Обработка ответа ajax после отправке данных на сервер
  */
  saveSuccess(ans) {
    ///console.log(ans); ///dbg
    if (!ans.err)
      dlgCtrl.showDlg('info',ans.msg,_INFO);
    else {
      const
        s=`Saving error: \r\n${ans.msg}`;
      console.error(s);
      dlgCtrl.showDlg('error',s,_ERROR);
    }
  }

  /*
    Обработка ответа ajax после получения данных с сервера
  */
  loadSuccess(ans) {
    if (ans.err) {
      const
        s=`Load error: \r\n${ans.msg}`;
      console.error(s);
      dlgCtrl.showDlg('error',s,_ERROR);
    } else {
      ///console.log(ans); ///dbg
      $('#ed-name-descr').val(ans['ed-name-descr']);
      $('#code-css').val(ans['code-css']);
      $('#code-html').val(ans['code-html']);
    }
  }

  /*
    Кнопка [Load]
  */
  btnLoadClick(ev) {
    ev.preventDefault();

    if ($('#chkbx-select-filename').prop('checked'))
      this.loadFromList();
    else
      this.loadFromFile();
  }

  /*
    Загружаем файл из списка
  */
  loadFromList() {
    dlgCtrl.showCustomDlg(
      'dlg-select-filename',
      {
        oCss: {href: 'css/DlgSelectFilename.css'},
        oHtml: {url: 'html/DlgSelectFilename.html'},
        oJs: {src: 'js/DlgSelectFilename.js'}
      },
      'Select file...',
      null,
      (dlg,opts) => new DlgSelectFilename(dlg,opts)
    );
  }

  /*
    Загружаем файл по имени в ed-filename
  */
  loadFromFile() {
    const
      fn=$('#ed-filename').val().trim();

    if (fn =='') {
      $('#ed-filename').focus();
      $('#ed-filename-info').html('&nbsp- file name not specified').show().fadeOut(2000);
      return;
    }

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'get',
      dataType: 'json',
      data: {'op':'ld','ed-filename':fn},
      error: this.ajaxError,
      success: this.loadSuccess
    });
  }

  /*
    Кнопка [Color]
  */
  btnColorPickerClick(ev) {
    var
      btn=document.getElementById('toolbtn-color_picker'),
      ed=document.getElementById('code-css'),
      clr=getSelection(ed);

    ///console.log('clr.txt=',clr.txt);
    if (clr.len ==7) btn.value=clr.txt;
    ///console.log('color picker click ',btn.value);
  }

  /*
    Изменение цвета в диалоге выбора цвета
  */
  colorPickerChanging(ev) {
    ///console.log('changing to ',ev.target.value);
  }

  /*
    При закрытии диалога выбора цвета
  */
  colorPickerChanged(ev) {
    var
      el=document.getElementById('code-css');

    replaceSelection(el,ev.target.value);
    ///console.log('--done',ev.target.value);
  }

  /*
    Проверяем css, html и если chkFilname==true, то и поле ed-filename
  */
  checkFormData(chkFilename=false) {
    const
      s='&nbsp; - field must be filled in';

    if ((chkFilename) && ($('#ed-filename').val() =='')) {
      $('#ed-filename').focus();
      $('#ed-filename-info').html(s).show().fadeOut(2000);
      return false;
    }

    if (($('#code-css').val() =='') || ($('#code-html').val() =='')) {
      if ($('#code-css').val() =='') {
        $('#code-css').focus();
        $('#code-css-info').text(s).show().fadeOut(2000);
      } else {
        $('#code-html').focus();
        $('#code-html-info').text(s).show().fadeOut(2000);
      }
      return false;
    }

    return true;
  }
}
