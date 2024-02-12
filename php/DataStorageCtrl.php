<?php
require_once('MultiLang.php');
require_once('functions.php');
require_once('DataStorage.php');

$op='';

if (!empty($_GET['op'])) {
  $op=$_GET['op'];
} elseif (!empty($_POST['op'])) {
  $op=$_POST['op'];
}

if (empty($op)) {
  $rez=['err'=>-1971,'msg'=>'Operation code not specified.'];
} else {
  $rez=match($op) {
    'sv' => DataStorage::saveData(),
    'ld' => DataStorage::loadData(),
    'ls' => DataStorage::getFileslist(),
    'rm' => DataStorage::deleteDatafile(),
    default => ['err'=>-1971,'msg'=>"Unrecognized opcode \"{$op}\""],
  };
}

exit(json_encode($rez));
?>
