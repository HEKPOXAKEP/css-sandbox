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

  setupEvents(opts) {
    this.boundBtnLoadClick=this.btnLoadClick.bind(this);
    this.boundBtnDeleteClick=this.btnDeleteClick.bind(this);
    this.boundBtnCancelClick=this.btnCancelClick.bind(this);

    this.boundDoDeleteFile=this.doDeleteFile.bind(this);

    opts.buttons=[
      {text: 'Load', click: this.boundBtnLoadClick},
      {text: 'Delete', click: this.boundBtnDeleteClick, title: 'Delete selected file'},
      {text: 'Cancel', click: this.boundBtnCancelClick}
    ];

    /*opts.width=300;
    opts.height=220;*/
  }

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

  fillFilesList(fls) {
    var
      lst='';

    fls.forEach((v,k) => {
      lst+=`<option value='${k}'>${v}</option>`;
    });

    $('#files-list').html(lst);
  }

  fileNotSelected() {
    dlgCtrl.showDlg('warn','Please, select file name from the list.',_WARN);
  }

  deleteFileIfConfirmed() {
    dlgCtrl.showDlg(
      'confirm',
      `The file ${this.selectedItem}.json will be permanently deleted and cannot be recovered. Are you sure?`,
      _CONFIRM,
      {
        buttons: [
          {text: 'Yes', click: this.boundDoDeleteFile},
          {text: 'No', click: () => {dlgCtrl.destroyDlg(this)}}
        ]
      },
      function(dlg,opts) {
        this.confirmationDlg=dlg;
        console.info(dlg,opts); ///dbg
      }
    );
  }

  doDeleteFile() {
    const
      self=this;

    $.ajax({
      url: 'php/DataStorageCtrl.php',
      type: 'get',
      dataType: 'json',
      data: {'op':'rm','fn':self.selectedItem.text()},
      error: app.ajaxError,
      success: (ans) => {
        if (ans.err) {
          console.error(ans.msg);
          dlgCtrl.showDlg('error',ans.msg,_ERROR);
        } else {
          self.selectedItem.remove();
        }
      }
    });
  }

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

  btnCancelClick(ev) {
    dlgCtrl.destroyDlg(this.dlg);
  }
}
