/*
  ------------------------
  Класс главного тулбара
  ------------------------
*/
class MainToolbar extends Toolbar
{
  constructor(containerId) {
    super(containerId);
  }

  /*
    Добавляем события
  */
  bindEvents() {
    super.bindEvents();

    var
      el=document.getElementById('toolbtn-color_picker');
    el.addEventListener('input',app.colorPickerChanging.bind(app));
    el.addEventListener('change',app.colorPickerChanged.bind(app));
  }

  /*
    Обрабботчик событий элементов тулбара
  */
  toolbarBtnClick(ev) {
    var btnId=super.toolbarBtnClick(ev);

    ///console.log('btnId = ',btnId);  ///dbg

    switch(btnId) {
      case 'test': app.btnTestClick(ev);
        break;
      case 'save': app.btnSaveClick(ev);
        break;
      case 'load': app.btnLoadClick(ev);
        break;
      case 'color_picker': app.btnColorPickerClick(ev);
        break;
      case 'clear_all': app.btnClearAllClick(ev);
        break;
      case 'help': app.btnHelpClick(ev);
        break;
      case 'about': app.btnAboutClick(ev);
        break;
      default: console.warn('Unrecognized toolbar item id=#toolbtn-'+btnId);
    }
  }
}

/* --- Инициализация тулбара --- */
function initToolbar(containerId) {
  return new MainToolbar(containerId);
}
