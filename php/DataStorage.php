<?php
/*
  =======================================
  General Data Storage manipulation class
  =======================================
*/
require_once('MultiLang.php');
require_once('functions.php');

class DataStorage
{
  /*
    Проверить и если нужно создать каталог для данных
  */
  private static function checkDataDir(): bool {
    $dd=dataDir();
    if (file_exists($dd)) return(true);
    else return(mkdir($dd));
  }

  /*
    Запись данных в файл POST['ed-filename']
  */
  public static function saveData(): array {
    if (!DataStorage::checkDataDir()) {
      return(_rez(-1971, WZ(E_ChkDataDirErr)));
    }

    $pi=pathinfo($_POST['ed-filename']);
    $fn=dataDir().$pi['filename'].'.json';

    file_put_contents(
      $fn,
      json_encode(
        ['code-css'=>$_POST['code-css'],'code-html'=>$_POST['code-html']],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
      )
    );

    return(_rez(0, WZZ(I_FileSaved,['fn'=>$_POST['ed-filename']])));
  }

  /*
    Загрузка данных из файла GET['ed-filename']
  */
  public static function loadData() {
    if (!DataStorage::checkDataDir()) {
      return(_rez(-1971, WZ(E_ChkDataDirErr)));
    }
    $fn=dataDir().$_GET['ed-filename'].'.json';

    if (!file_exists($fn)) {
      return(_rez(-1971,WZZ(E_FileNotExists,['fn'=>$fn])));
    }

    $data=json_decode(file_get_contents($fn),JSON_OBJECT_AS_ARRAY);
    return(array_merge(['err'=>0,'msg'=>WZZ(I_FileLoaded,['fn'=>$fn])],$data));
  }

  /*
    Получение списка фалов данных в каталоге data
  */
  public static function getFileslist() {
    if (!DataStorage::checkDataDir()) {
      return(_rez(-1971, WZ(E_ChkDataDirErr)));
    }

    $ls=glob(dataDir().'*.json');

    foreach($ls as $k=>&$v) {
      $v=basename($v,'.json');
    }

    return(['err'=>0,'msg'=>WZ(I_Ok),'fileslist'=>$ls]);
  }

  /*
    Удаление файла
  */
  public static function deleteDatafile() {
    $fn=dataDir().$_GET['fn'].'.json';

    if (!file_exists($fn)) {
      return(['err'=>-1971,'msg'=>WZZ(E_FileNotExists,['fn'=>$fn])]);
    }

    unlink($fn);

    return(['err'=>0,'msg'=>WZZ(I_FileDeleted,['fn'=>basename($fn)])]);
  }
}
?>
