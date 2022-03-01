<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

if (!isset($_SESSION['mailcow_cc_role']) || $_SESSION['mailcow_cc_role'] != "admin") {
  header('Location: /');
  exit();
}

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/header.inc.php';
$_SESSION['return_to'] = $_SERVER['REQUEST_URI'];
$clamd_status = (preg_match("/^([yY][eE][sS]|[yY])+$/", $_ENV["SKIP_CLAMD"])) ? false : true;

$js_minifier->add('/web/js/site/debug.js');

// containers
$containers = (array) docker('info');
if ($clamd_status === false) unset($containers['clamd-mailcow']);
if ($solr_status === false) unset($containers['solr-mailcow']);
ksort($containers);
foreach ($containers as $container => $container_info) {
  date_default_timezone_set('UTC');
  $StartedAt = date_parse($container_info['State']['StartedAt']);
  if ($StartedAt['hour'] !== false) {
    $date = new \DateTime();
    $date->setTimestamp(mktime(
      $StartedAt['hour'],
      $StartedAt['minute'],
      $StartedAt['second'],
      $StartedAt['month'],
      $StartedAt['day'],
      $StartedAt['year']));
    $user_tz = new DateTimeZone(getenv('TZ'));
    $date->setTimezone($user_tz);
    $started = $date->format('r');
  }
  else {
    $started = '?';
  }
  $containers[$container]['State']['StartedAtHR'] = $started;
}

$template = 'debug.twig';
$template_data = [
  'log_lines' => getenv('LOG_LINES'),
  'clamd_status' => $clamd_status,
  'containers' => $containers,
  'lang_admin' => json_encode($lang['admin']),
];

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/footer.inc.php';


