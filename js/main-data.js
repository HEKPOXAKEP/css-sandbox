/*
  ---------------------------
  Глобальные данные проекта
  ---------------------------
*/
const
  __dbg__=true;

const
  _INFO='INFORMATION',
  _WARN='WARNING',
  _ERROR='ERROR',
  _CONFIRM='CONFIRMATION';

var
  app=null,
  modCtrl=new ModCtrl(),
  dlgCtrl=new JqUIDlgCtrl('dialogs',modCtrl);
