<?php
function dataDir(): string {
  return('..'.DIRECTORY_SEPARATOR.'data'.DIRECTORY_SEPARATOR);
}

function _rez(int $err, string $msg): array {
  return(['err'=>$err, 'msg'=>$msg]);
}

?>
