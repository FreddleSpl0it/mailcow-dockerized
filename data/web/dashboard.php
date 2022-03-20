<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

if (!isset($_SESSION['mailcow_cc_role']) || $_SESSION['mailcow_cc_role'] != "admin") {
  header('Location: /');
  exit();
}

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/header.inc.php';
$_SESSION['return_to'] = $_SERVER['REQUEST_URI'];


$js_minifier->add('/web/js/site/dashboard.js');


// get mailconf data
$hostname = getenv('MAILCOW_HOSTNAME');
$timezone = getenv('TZ');
$skip_xapian_status = (getenv('SKIP_XAPIAN') != 'n' ? 'Disabled' : 'Enabled');

$template = 'dashboard.twig';
$template_data = [
  'lang_dashboard' => json_encode($lang['dashboard']),
  'hostname' => $hostname,
  'timezone' => $timezone,
  'skip_xapian_status' => $skip_xapian_status,
  'xapian_heap' => getenv('XAPIAN_HEAP')
];

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/footer.inc.php';