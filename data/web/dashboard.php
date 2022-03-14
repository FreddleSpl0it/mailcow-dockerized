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
$skip_clamd_status = (getenv('SKIP_CLAMD') != 'n' ? 'Disabled' : 'Enabled');
$skip_sogo_status = (getenv('SKIP_SOGO') != 'n' ? 'Disabled' : 'Enabled');
$skip_xapian_status = (getenv('SKIP_XAPIAN') != 'n' ? 'Disabled' : 'Enabled');
$allow_admin_email_login_status = (getenv('ALLOW_ADMIN_EMAIL_LOGIN') != 'n' ? 'Disabled' : 'Enabled');

$template = 'dashboard.twig';
$template_data = [
  'lang_dashboard' => json_encode($lang['dashboard']),
  'hostname' => $hostname,
  'timezone' => $timezone,
  'skip_clamd_status' => $skip_clamd_status,
  'skip_sogo_status' => $skip_sogo_status,
  'skip_xapian_status' => $skip_xapian_status,
  'xapian_heap' => getenv('XAPIAN_HEAP'),
  'allow_admin_email_login_status' => $allow_admin_email_login_status,
];

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/footer.inc.php';