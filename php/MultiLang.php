<?php
/*
  ======================
  Multilingual support
  ======================
*/

require_once('msgs-def.php');
require_once('msgs-en.php');

function WZ(int $mi): string {
  return(MSGS[$mi]);
}

/*
  Работает, как vsprintf, но вместо индекса аргументов $args принимает ключи.

  Директива '%s' без имени аргумента тоже работает нормально. Поддерживается всё,
  что может сделать vsprintf().

  Пример: vskprintf('y = %y$d, x = %x$1.1f', array('x' => 1, 'y' => 2))
  Результат: 'y = 2, x = 1.0'

  Автор оригинала: Josef Kufner <jkufner(at)gmail.com>
*/
function WZZ(int $mi, array $args): string {
  $frms=MSGS[$mi];
  $map=array_flip(array_keys($args));

  $new_str=preg_replace_callback('/(^|[^%])%([a-zA-Z0-9_-]+)\$/',
    function($m) use ($map) { return $m[1].'%'.($map[$m[2]] + 1).'$'; },
    $frms);

  return vsprintf($new_str,$args);
}
?>
