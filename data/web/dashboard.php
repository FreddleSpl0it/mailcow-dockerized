<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

if (!isset($_SESSION['mailcow_cc_role']) || $_SESSION['mailcow_cc_role'] != "admin") {
  header('Location: /');
  exit();
}

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/header.inc.php';
$_SESSION['return_to'] = $_SERVER['REQUEST_URI'];


$solr_status = (preg_match("/^([yY][eE][sS]|[yY])+$/", $_ENV["SKIP_SOLR"])) ? false : solr_status();

// vmail df
$exec_fields = array('cmd' => 'system', 'task' => 'df', 'dir' => '/var/vmail');
$vmail_df = explode(',', (string)json_decode(docker('post', 'dovecot-mailcow', 'exec', $exec_fields), true));


$js_minifier->add('/web/js/site/dashboard.js');


$template = 'dashboard.twig';
$template_data = [
  'vmail_df' => $vmail_df,
  'solr_status' => $solr_status,
  'solr_uptime' => round($solr_status['status']['dovecot-fts']['uptime'] / 1000 / 60 / 60),
  'lang_dashboard' => json_encode($lang['dashboard']),
];

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/footer.inc.php';