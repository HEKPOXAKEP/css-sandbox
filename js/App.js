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
    this.initEvents();
  }

  /*
    Инициализация глобальных данных
  */
  initGlobals() {
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
    Инициализация основных событий
  */
  initEvents() {
    this.bindEvents();

    $('#btn-clear-css').click(this.boundBtnClearClick);
    $('#btn-clear-html').click(this.boundBtnClearClick);

    $('#btn-test').click(this.boundBtnTestClick);
    $('#btn-save').click(this.boundBtnSaveClick);
    $('#btn-load').click(this.boundBtnLoadClick);
    $('#btn-clear-all').click(this.boundBtnClearAllClick);
    $('#btn-about').click(this.boundBtnAboutClick);
  }

  /*
    Привязка событий к App.this
  */
  bindEvents() {
    this.boundBtnClearClick=this.btnClearClick.bind(this);
    this.boundBtnTestClick=this.btnTestClick.bind(this);
    this.boundBtnSaveClick=this.btnSaveClick.bind(this);
    this.boundBtnLoadClick=this.btnLoadClick.bind(this);
    this.boundBtnClearAllClick=this.btnClearAllClick.bind(this);
    this.boundBtnAboutClick=this.btnAboutClick.bind(this);
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
    Кнопки [Clear]
  */
  btnClearClick(ev) {
    ev.preventDefault();
    switch (ev.target.id.split('-').slice(-1)[0]) {
      case 'css':
        this.clearCssCode();
        break;
      case 'html':
        this.clearHtmlCode();
        break;
      default: console.warn('Unknown btn.id = '+ev.target.id);
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

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'post',
      dataType: 'json',
      //data: $('#mainForm').serialize(),
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
      $('#ed-filename-info').text('File name not specified').show().fadeOut(2000);
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
    Проверяем css, html и если chkFilname==true, то и поле ed-filename
  */
  checkFormData(chkFilename=false) {
    const
      s='Field must be filled in';

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

    if ((chkFilename) && ($('#ed-filename').val() =='')) {
      $('#ed-filename').focus();
      $('#ed-filename-info').text(s).show().fadeOut(2000);
      return false;
    }

    return true;
  }
}
