/*
  Выбор файла дл загрузки из списка
*/
class DlgSelectFilename
{
  selectedItem=null;  // selected item jq object
  confirmDlg=null;    // confirmation dlg obj

  constructor(dlg,opts) {
    this.dlg=dlg;
    this.prepareDlg();
    this.setupEvents(opts);
  }

  /*
    Загружаем список файлов
  */
  prepareDlg() {
    this.boundLoadSuccess=this.loadSuccess.bind(this);

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'get',
      dataType: 'json',
      data: {'op':'ls'},
      error: app.ajaxError,
      success: this.boundLoadSuccess
    });
  }

  /*
    Связываем события с методами и формируем массив кнопок диалога
  */
  setupEvents(opts) {
    this.boundBtnLoadClick=this.btnLoadClick.bind(this);
    this.boundBtnDeleteClick=this.btnDeleteClick.bind(this);
    this.boundBtnCancelClick=this.btnCancelClick.bind(this);

    this.boundDoDeleteFile=this.doDeleteFile.bind(this);  // вызывается из confirmation delete dlg

    opts.buttons=[
      {text: 'Load', click: this.boundBtnLoadClick},
      {text: 'Delete', click: this.boundBtnDeleteClick, title: 'Delete selected file'},
      {text: 'Cancel', click: this.boundBtnCancelClick}
    ];

    opts.width='50%';
    //opts.height=220;
  }

  /*
    Список файлов загружен, заполняем <select> дилога
  */
  loadSuccess(ans) {
    if (ans.err) {
      const
        s=`Files list load error: \r\n${ans.msg}`;
      console.error(s);
      dlgCtrl.showDlg('error',s,_ERROR);
    } else {
      //console.log(ans); ///dbg
      this.fillFilesList(ans['fileslist']);
    }
  }

  /*
    Заолняем список <select>
  */
  fillFilesList(fls) {
    var
      lst='';

    fls.forEach((v,k) => {
      lst+=`<option value='${k}'>${v}</option>`;
    });

    $('#files-list').html(lst);
  }

  /*
    Выводит предупреждение, что файл не выбран
  */
  fileNotSelected() {
    dlgCtrl.showDlg('warn','Please, select file name from the list.',_WARN);
  }

  /*
    Запрашиваем подтверждение на удаление файла и удаляем, если подтверждено
  */
  deleteFileIfConfirmed() {
    const
      self=this;

    dlgCtrl.showDlg(
      'confirm',
      'File '+this.selectedItem.text()+'.json will be permanently deleted and cannot be recovered. Are you sure?',
      _CONFIRM,
      {
        buttons: [
          {text: 'Yes', click: this.boundDoDeleteFile},
          {text: 'No', click: function() { dlgCtrl.destroyDlg(this); } }
        ]
      }
      ,function(dlg,opts) {
        // beforeOpen callback
        self.confirmDlg=dlg;
        //console.info(dlg,opts); ///dbg
      }
    );
  }

  /*
    Удаляет файл на сервере и из списка в диалоге
  */
  doDeleteFile() {
    const
      self=this;

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'get',
      dataType: 'json',
      data: {'op':'rm','fn':self.selectedItem.text()},
      error: (xhr,txtStatus,errThrown) => {
        app.ajaxError(xhr,txtStatus,errThrown);
        dlgCtrl.destroyDlg(self.confirmDlg);
      },
      success: (ans) => {
        if (ans.err) {
          console.error(ans.msg);
          dlgCtrl.showDlg('error',ans.msg,_ERROR);
        } else {
          self.selectedItem.remove();
          dlgCtrl.destroyDlg(self.confirmDlg);
        }
      }
    });
  }

  /*
    Кнопка [Load]
  */
  btnLoadClick(ev) {
    const
      fn=$('#files-list option:selected').text();

    if (fn !=='') {
      $('#chkbx-select-filename').prop('checked',false);
      $('#ed-filename').val(fn);
      dlgCtrl.destroyDlg(this.dlg);
      
      $('#btn-load').trigger('click');
    } else {
      this.fileNotSelected();
    }
  }

  /*
    Кнопка [Delete]
  */
  btnDeleteClick(ev) {
    this.selectedItem=$('#files-list option:selected');

    if (this.selectedItem.length !==1) {
      this.fileNotSelected();
      return;
    }

    const
      fn=this.selectedItem.text();

    this.deleteFileIfConfirmed();
  }

  /*
    Кнопка [Cancel]
  */
  btnCancelClick(ev) {
    dlgCtrl.destroyDlg(this.dlg);
  }
}
