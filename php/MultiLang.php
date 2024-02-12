<?php
/*
  ======================
  Multilingual support
  ======================
*/

require_once('msgs-en.php');

function WZ(string $mi): string {
  return(MSGS[$mi]);
}
?>
