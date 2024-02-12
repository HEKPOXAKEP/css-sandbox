<?php
require_once('functions.php');

class DataStorage
{
  /*
    Запись данных в файл POST['ed-filename']
  */
  public static function saveData(): array {
    $pi=pathinfo($_POST['ed-filename']);
    $fn='..'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.$pi['filename'].'.json';

    file_put_contents(
      $fn,
      json_encode(
        ['code-css'=>$_POST['code-css'],'code-html'=>$_POST['code-html']],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
      )
    );

    return(['err'=>0,'msg'=>$_POST['ed-filename'].' saved.']);
  }

  /*
    Загрузка данных из файла GET['ed-filename']
  */
  public static function loadData() {
    /*$pi=pathinfo($_GET['ed-filename']);
    if (mb_strtolower($pi['extension']) !=='json') $ext='.json';
    else $ext='';*/
    $fn='..'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.$_GET['ed-filename'].'.json';

    if (!file_exists($fn)) {
      return(['err'=>-1971,'msg'=>"File {$fn} not exists."]);
    }

    $data=json_decode(file_get_contents($fn),JSON_OBJECT_AS_ARRAY);
    return(array_merge(['err'=>0,'msg'=>"{$fn} loaded."],$data));
  }

  /*
    Получение списка фалов данных в каталоге data
  */
  public static function getFileslist() {
    $ls=glob('..'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.'*.json');

    foreach($ls as $k=>&$v) {
      $v=basename($v,'.json');
    }

    return(['err'=>0,'msg'=>'ok','fileslist'=>$ls]);
  }

  /*
    Удаление файла
  */
  public static function deleteDatafile() {
    $fn='..'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR.$_GET['fn'].'.json';
    unlink($fn);

    return(['err'=>0,'msg'=>"File {$fn} deleted.",'fn'=>$fn]);
  }
}
?>
